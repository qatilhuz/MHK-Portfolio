"use client";

import dynamic from "next/dynamic";
import { useCallback, useState } from "react";
import { useAssistant } from "@/hooks/useAssistant";
import { useSpeechRecognition } from "@/hooks/useSpeechRecognition";
import { useSpeechSynthesis } from "@/hooks/useSpeechSynthesis";
import { useWebGLSupport } from "@/hooks/useWebGLSupport";
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
  const speech = useSpeechSynthesis();

  const handleAnswer = useCallback(
    async (question: string) => {
      speech.cancel();
      const reply = await ask(question);
      setInput("");
      if (!reply) return;
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
      <div className="overflow-hidden rounded-[var(--radius-lg)] border border-border bg-surface">
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <p className="text-sm">Digital Portfolio Assistant</p>
          <AvatarStatus status={visualStatus} />
        </div>
        <div className="h-[280px] lg:h-[360px]">
          {webgl === false ? (
            <AvatarFallback status={visualStatus} />
          ) : (
            <SceneErrorBoundary>
              <AvatarScene status={visualStatus} />
            </SceneErrorBoundary>
          )}
        </div>
      </div>

      <div className="rounded-[var(--radius-lg)] border border-border bg-surface p-5">
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
            }}
            busy={status === "thinking"}
          />
        </div>
      </div>
    </div>
  );
}
