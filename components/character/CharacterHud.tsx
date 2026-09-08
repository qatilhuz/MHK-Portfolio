"use client";

import { Button } from "@/components/ui/Button";
import { useGuide } from "@/lib/guide/context";

export function CharacterHud({
  x,
  y,
  line,
}: {
  x: number;
  y: number;
  line: string | null;
}) {
  const guide = useGuide();
  if (!guide?.visible) return null;

  const text = line ?? (guide.guided ? guide.message : null);
  const placed = x > 1 && y > 1;
  const left = placed ? Math.min(typeof window !== "undefined" ? window.innerWidth - 280 : x, Math.max(12, x - 220)) : undefined;
  const top = placed ? Math.max(72, y - 24) : undefined;

  return (
    <div
      className="pointer-events-none fixed z-[56]"
      style={
        placed
          ? { left, top }
          : { right: 16, bottom: 24 }
      }
      aria-label="Portfolio host"
    >
      <div className="pointer-events-auto max-w-[16rem] rounded-[var(--radius-md)] border border-border bg-surface/95 px-3 py-2 shadow-[var(--shadow)]">
        {text ? (
          <p className="text-sm leading-relaxed text-foreground" aria-live="polite">
            {text}
          </p>
        ) : (
          <p className="text-xs text-muted">Host</p>
        )}
        {guide.guided ? (
          <div className="mt-2 flex flex-wrap gap-2">
            <Button type="button" size="sm" variant="secondary" onClick={guide.skip}>
              Skip Intro
            </Button>
            {guide.voiceSupported && guide.voiceBlocked && !guide.muted ? (
              <Button type="button" size="sm" onClick={guide.enableVoice}>
                Enable Voice
              </Button>
            ) : (
              <Button
                type="button"
                size="sm"
                variant="ghost"
                onClick={() => guide.setMuted(!guide.muted)}
                aria-pressed={guide.muted}
              >
                {guide.muted ? "Unmute" : "Mute"}
              </Button>
            )}
          </div>
        ) : null}
      </div>
    </div>
  );
}
