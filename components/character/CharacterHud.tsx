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
  if (!text && !guide.guided) return null;

  const vw = typeof window !== "undefined" ? window.innerWidth : 360;
  const vh = typeof window !== "undefined" ? window.innerHeight : 640;
  const bubbleW = Math.min(272, Math.max(160, vw - 24));
  const placed = x > 1 && y > 1;
  const preferRight = placed && x < vw * 0.45;
  let left = 12;
  if (placed) {
    left = preferRight ? x + 12 : x - bubbleW - 12;
    left = Math.min(vw - bubbleW - 12, Math.max(12, left));
  }
  const top = placed ? Math.min(vh - 140, Math.max(8, y - 96)) : undefined;

  return (
    <div
      className="pointer-events-none fixed z-[56] max-w-[calc(100vw-24px)]"
      style={placed ? { left, top, width: bubbleW } : { left: 12, right: 12, bottom: 16 }}
      aria-label="Portfolio host"
    >
      <div className="pointer-events-auto w-full max-w-[calc(100vw-24px)] overflow-hidden rounded-[var(--radius-md)] border border-border bg-surface/95 px-3 py-2 shadow-[var(--shadow)]">
        {text ? (
          <p className="break-words text-sm leading-relaxed text-foreground" aria-live="polite">
            {text}
          </p>
        ) : null}
        {guide.guided ? (
          <div className={text ? "mt-2 flex flex-wrap gap-2" : "flex flex-wrap gap-2"}>
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
