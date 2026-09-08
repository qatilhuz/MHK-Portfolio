"use client";

import dynamic from "next/dynamic";
import { Button } from "@/components/ui/Button";
import { useWebGLSupport } from "@/hooks/useWebGLSupport";
import { useGuide } from "@/lib/guide/context";
import { cn } from "@/lib/utils";
import { GuideErrorBoundary } from "./GuideErrorBoundary";
import { GuideFallback } from "./GuideFallback";

const GuideCanvas = dynamic(
  () => import("./GuideCanvas").then((mod) => mod.GuideCanvas),
  {
    ssr: false,
    loading: () => (
      <p className="p-4 text-xs text-muted" role="status">
        Loading host…
      </p>
    ),
  },
);

export function GuideDock() {
  const guide = useGuide();
  const webgl = useWebGLSupport();

  if (!guide?.visible) return null;

  const status = guide.guided
    ? guide.muted || !guide.voiceSupported || guide.voiceBlocked
      ? "Text guide"
      : guide.phase === "waiting"
        ? "Scroll when you are ready"
        : guide.phase === "transitioning"
          ? "Moving on"
          : "Speaking"
    : "Interactive host";

  const shift = Math.min(guide.index, 8) * 10;

  return (
    <aside
      className={cn(
        "pointer-events-none fixed z-[55] w-[min(100%-1.5rem,22rem)] transition-transform duration-700 ease-out",
        "bottom-4 right-4",
      )}
      style={{ transform: `translate3d(0, ${guide.guided ? -shift : 0}px, 0)` }}
      aria-label="Portfolio host"
    >
      <div className="pointer-events-auto overflow-hidden rounded-[var(--radius-lg)] border border-border bg-surface/95 shadow-[var(--shadow)]">
        <div className="flex items-stretch gap-3 p-3">
          <div
            className={cn(
              "shrink-0 overflow-hidden rounded-[var(--radius-md)] border border-border",
              guide.guided ? "h-40 w-28 sm:h-52 sm:w-36" : "h-32 w-24 sm:h-40 sm:w-28",
            )}
            tabIndex={0}
            role="img"
            aria-label="Interactive portfolio host. Enter to wave."
            onKeyDown={(event) => {
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                guide.react("hand");
              }
            }}
          >
            {webgl === false ? (
              <GuideFallback pose={guide.pose} />
            ) : (
              <GuideErrorBoundary>
                <GuideCanvas />
              </GuideErrorBoundary>
            )}
          </div>
          <div className="min-w-0 flex-1 py-1">
            <p className="label">Host</p>
            <p className="mt-2 text-sm leading-relaxed text-foreground" aria-live="polite">
              {guide.reaction ?? (guide.guided ? guide.message : "Hover or tap to say hello.")}
            </p>
            <p className="mt-2 text-xs text-muted" role="status">
              {status}
            </p>
          </div>
        </div>
        {guide.guided ? (
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
        ) : null}
      </div>
    </aside>
  );
}
