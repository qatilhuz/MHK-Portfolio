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
    <div className="grid gap-6 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)]">
      <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-black/40 shadow-[0_24px_70px_rgba(3,5,10,0.6)] backdrop-blur-xl">
        {/* Soft cyan bloom behind the canvas so the head sits in a glow. */}
        <div
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_42%,rgba(34,211,238,0.13),rgba(9,9,11,0)_72%)]"
          aria-hidden="true"
        />
        <div className="relative flex items-center justify-between border-b border-white/10 px-4 py-3">
          <p className="font-mono text-[11px] uppercase tracking-[0.24em] text-cyan-200/80">
            Portfolio Assistant
          </p>
          <AvatarStatus status={visualStatus} />
        </div>
        <div className="relative h-[280px] lg:h-[360px]">
          {webgl === false ? (
            <AvatarFallback status={visualStatus} />
          ) : (
            <SceneErrorBoundary>
              <AvatarScene status={visualStatus} emotion={emotion} />
            </SceneErrorBoundary>
          )}
        </div>
      </div>

      <div className="rounded-2xl border border-white/10 bg-black/40 p-5 shadow-[0_24px_70px_rgba(3,5,10,0.6)] backdrop-blur-xl">
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
        <div className="mt-4">
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
