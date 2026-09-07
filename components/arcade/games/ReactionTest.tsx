"use client";

import { useEffect, useState } from "react";
import { ArcadeShell } from "../ArcadeShell";
import { trackEvent } from "@/lib/analytics/client";
import { useReactionTest } from "@/hooks/useReactionTest";
import { cn } from "@/lib/utils";

export function ReactionTest({ onBack }: { onBack: () => void }) {
  const test = useReactionTest();
  const [best, setBest] = useState(0);

  useEffect(() => {
    setBest(test.best);
  }, [test.best]);

  useEffect(() => {
    if (test.phase === "result") {
      trackEvent("arcade_game_complete", { game: "reaction" });
    }
  }, [test.phase]);

  const label =
    test.phase === "idle"
      ? "Press the pad to start, then wait for the go signal."
      : test.phase === "waiting"
        ? "Wait…"
        : test.phase === "ready"
          ? "Go — tap now"
          : test.phase === "false-start"
            ? "False start. Wait for the signal."
            : `Reaction ${test.ms} ms. Best ${best || test.ms} ms.`;

  return (
    <ArcadeShell
      title="Reaction Speed Test"
      instructions="Timing uses performance.now(). Do not tap while waiting."
      status={label}
      onBack={onBack}
      onRestart={test.reset}
    >
      <button
        type="button"
        className={cn(
          "flex min-h-40 w-full items-center justify-center rounded-[var(--radius-lg)] border text-lg",
          test.phase === "ready"
            ? "border-accent bg-accent-soft"
            : test.phase === "false-start"
              ? "border-border bg-surface-secondary"
              : "border-border bg-surface",
        )}
        onClick={() => {
          if (test.phase === "idle" || test.phase === "result" || test.phase === "false-start") {
            test.start();
            return;
          }
          test.tap();
        }}
      >
        {test.phase === "idle"
          ? "Start"
          : test.phase === "waiting"
            ? "Wait"
            : test.phase === "ready"
              ? "Tap"
              : test.phase === "false-start"
                ? "Too soon — retry"
                : `${test.ms} ms`}
      </button>
    </ArcadeShell>
  );
}
