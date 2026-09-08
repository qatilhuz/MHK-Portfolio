"use client";

import dynamic from "next/dynamic";
import { Button } from "@/components/ui/Button";
import { useWebGLSupport } from "@/hooks/useWebGLSupport";
import { useGuide } from "@/lib/guide/context";
import { GuideErrorBoundary } from "./GuideErrorBoundary";
import { GuideFallback } from "./GuideFallback";

const GuideCanvas = dynamic(
  () => import("./GuideCanvas").then((mod) => mod.GuideCanvas),
  {
    ssr: false,
    loading: () => (
      <p className="p-4 text-xs text-muted" role="status">
        Loading guide…
      </p>
    ),
  },
);

export function GuideDock() {
  const guide = useGuide();
  const webgl = useWebGLSupport();

  if (!guide?.active) return null;

  const status =
    guide.muted || !guide.voiceSupported || guide.voiceBlocked
      ? "Text guide"
      : guide.phase === "waiting"
        ? "Scroll when you are ready"
        : "Speaking";

  return (
    <aside
      className="pointer-events-none fixed bottom-4 right-4 z-[55] w-[min(100%-2rem,22rem)]"
      aria-label="Portfolio guide"
    >
      <div className="pointer-events-auto overflow-hidden rounded-[var(--radius-lg)] border border-border bg-surface shadow-[var(--shadow)]">
        <div className="flex items-start gap-3 p-3">
          <div className="h-28 w-20 shrink-0 overflow-hidden rounded-[var(--radius-md)] border border-border sm:h-36 sm:w-24">
            {webgl === false ? (
              <GuideFallback pose={guide.pose} />
            ) : (
              <GuideErrorBoundary>
                <GuideCanvas pose={guide.pose} />
              </GuideErrorBoundary>
            )}
          </div>
          <div className="min-w-0 flex-1">
            <p className="label">Guide</p>
            <p
              className="mt-2 text-sm leading-relaxed text-foreground"
              aria-live="polite"
            >
              {guide.message}
            </p>
            <p className="mt-2 text-xs text-muted" role="status">
              {status}
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2 border-t border-border px-3 py-2">
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
              {guide.muted ? "Unmute" : "Mute voice"}
            </Button>
          )}
        </div>
      </div>
    </aside>
  );
}
