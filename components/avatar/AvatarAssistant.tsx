"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useState } from "react";
import { trackEvent } from "@/lib/analytics/client";
import { useAssistant } from "@/hooks/useAssistant";
import { useSpeechRecognition } from "@/hooks/useSpeechRecognition";
import { useSpeechSynthesis } from "@/hooks/useSpeechSynthesis";
import { useWebGLSupport } from "@/hooks/useWebGLSupport";
import { DEFAULT_EMOTION, type AvatarEmotion } from "@/lib/assistant/emotion";
import { SceneErrorBoundary } from "@/components/three/SceneErrorBoundary";
import { AdvancedVisualizer } from "./AdvancedVisualizer";
import { AvatarChat } from "./AvatarChat";
import { AvatarFallback } from "./AvatarFallback";
import { AvatarStatus } from "./AvatarStatus";
import { AvatarVoice } from "./AvatarVoice";

const AvatarScene = dynamic(
  () => import("./AvatarScene").then((mod) => mod.AvatarScene),
  {
    ssr: false,
    loading: () => (
      <p className="p-6 text-sm text-muted" role="status">
        Loading assistant…
      </p>
    ),
  },
);

export function AvatarAssistant() {
  const webgl = useWebGLSupport();
  const { messages, status, setStatus, error, ask, reset } = useAssistant();
  const [input, setInput] = useState("");
  // Drives the 3D face. Set from each assistant reply; falls back to neutral.
  const [emotion, setEmotion] = useState<AvatarEmotion>(DEFAULT_EMOTION);

  useEffect(() => {
    trackEvent("assistant_open", undefined, { onceKey: "assistant_open" });
  }, []);
  const speech = useSpeechSynthesis();

  const handleAnswer = useCallback(
    async (question: string) => {
      speech.cancel();
      const reply = await ask(question);
      setInput("");
      if (!reply) return;
      setEmotion(reply.emotion ?? DEFAULT_EMOTION);
      if (speech.supported && !speech.muted) {
        setStatus("speaking");
        speech.speak(reply.text, () => setStatus("idle"));
      }
    },
    [ask, setStatus, speech],
  );

  const recognition = useSpeechRecognition((transcript) => {
    setStatus("idle");
    void handleAnswer(transcript);
  });

  const onListen = () => {
    setStatus("listening");
    recognition.start();
  };

  const onStopListen = () => {
    recognition.stop();
    setStatus("idle");
  };

  const visualStatus =
    recognition.listening ? "listening" : speech.speaking ? "speaking" : status;

  return (
    /*
      The height has to be definite here. Previously this grid was sized by
      its content, so `h-full` on the chat column resolved against a row that
      the messages themselves were growing - every new message made the row
      taller, which made the "scroll" container taller, so it never scrolled.
      A fixed 90vh gives the whole chain something real to resolve against.
      Every descendant down to the log also needs min-h-0, because grid and
      flex items default to min-height:auto and refuse to shrink below their
      content no matter what overflow is set.
    */
    <div className="grid h-[90vh] max-h-[90dvh] grid-rows-[minmax(0,0.8fr)_minmax(0,1.2fr)] items-stretch gap-5 overflow-hidden lg:grid-cols-[minmax(0,0.88fr)_minmax(0,1.32fr)] lg:grid-rows-[minmax(0,1fr)]">
      {/* The stage. Given equal billing with the chat and a lot more height
          than before, so the bot is the thing you look at first. */}
      <div className="relative flex min-h-0 flex-col overflow-hidden rounded-3xl border border-white/10 bg-black/40 shadow-[inset_0_1px_0_rgba(255,255,255,0.07),0_30px_90px_-20px_rgba(0,0,0,0.85)] backdrop-blur-2xl">
        {/* Layered blooms so the head sits in light rather than on a flat
            panel: a broad cyan wash, a tighter core, and a floor glow. */}
        <div
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_70%_55%_at_50%_38%,rgba(34,211,238,0.16),rgba(9,9,11,0)_72%)]"
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_32%_26%_at_50%_44%,rgba(125,211,252,0.13),rgba(9,9,11,0)_70%)]"
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute inset-x-0 bottom-0 h-40 bg-[radial-gradient(ellipse_55%_100%_at_50%_100%,rgba(59,130,246,0.14),rgba(9,9,11,0)_75%)]"
          aria-hidden="true"
        />

        <div className="relative flex items-center justify-between border-b border-white/[0.07] px-5 py-3.5">
          <p className="font-mono text-[11px] uppercase tracking-[0.24em] text-cyan-200/80">
            Portfolio Assistant
          </p>
          <AvatarStatus status={visualStatus} />
        </div>

        {/* Flex column owning both the square stage and the diagnostics,
            so each takes its own share of the locked height budget. */}
        <div className="relative flex min-h-0 flex-1 flex-col gap-3 p-3">
          <div className="flex min-h-0 flex-1 items-center justify-center">
            {/*
              aspect-square sizes the height from the width, but this column
              lives inside a 90vh lock, so on a wide-and-short viewport a
              width-driven square would overflow the budget. Capping the
              width by the height left over after the header, padding, gap
              and the diagnostics panel keeps it a true square at every size
              instead of letting it clip or go rectangular.
            */}
            <div className="relative aspect-square w-full max-w-[min(100%,calc(90vh-15rem))] overflow-hidden rounded-2xl border border-white/10 bg-black/50 backdrop-blur-md">
              {webgl === false ? (
                <AvatarFallback status={visualStatus} />
              ) : (
                <SceneErrorBoundary>
                  <AvatarScene status={visualStatus} emotion={emotion} />
                </SceneErrorBoundary>
              )}
            </div>
          </div>

          <AdvancedVisualizer
            isThinking={status === "thinking"}
            status={visualStatus}
          />
        </div>
      </div>

      <div className="flex h-full min-h-0 flex-col rounded-3xl border border-white/10 bg-black/40 p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.07),0_30px_90px_-20px_rgba(0,0,0,0.85)] backdrop-blur-2xl">
        <AvatarVoice
          recognitionSupported={recognition.supported}
          synthesisSupported={speech.supported}
          listening={recognition.listening}
          muted={speech.muted}
          onListen={onListen}
          onStopListen={onStopListen}
          onToggleMute={() => {
            speech.setMuted((value) => !value);
            speech.cancel();
          }}
        />
        {recognition.error || error ? (
          <p className="mt-3 text-sm text-muted" role="alert">
            {recognition.error ?? error}
          </p>
        ) : null}
        <div className="mt-4 flex min-h-0 flex-1 flex-col">
          <AvatarChat
            messages={messages}
            input={input}
            onInput={setInput}
            onSend={(value) => void handleAnswer(value)}
            onReset={() => {
              speech.cancel();
              reset();
              setInput("");
              setEmotion(DEFAULT_EMOTION);
            }}
            busy={status === "thinking"}
          />
        </div>
      </div>
    </div>
  );
}
