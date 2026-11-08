"use client";

import { useReducedMotion } from "@/hooks/useReducedMotion";
import type { AssistantStatus } from "@/types";

/**
 * Audio-style equaliser for the assistant.
 *
 * The bars are driven entirely by one CSS keyframe (`assistant-wave`, which
 * already exists in globals.css and animates only transform and opacity, so
 * every bar stays on the compositor). Nothing here runs on the main thread:
 * no rAF loop, no state, no refs.
 *
 * Two details do the work of making it read as audio rather than as a row of
 * blinking lights:
 *
 *   - each bar has its own *resting height* as well as its own duration, so
 *     even at full scale the row is uneven the way a spectrum is;
 *   - the stagger uses a NEGATIVE animation-delay. A positive delay would
 *     leave each bar sitting still until its turn came round, so the row
 *     would visibly fill in from the left on every activation. A negative
 *     delay starts each bar already part-way through its cycle, so the whole
 *     equaliser is alive on the first frame.
 */

/** height = share of the well, duration = own tempo, delay = phase offset. */
const BARS = [
  { height: "58%", duration: "0.82s", delay: "-0.56s" },
  { height: "84%", duration: "1.04s", delay: "-0.19s" },
  { height: "100%", duration: "0.73s", delay: "-0.91s" },
  { height: "70%", duration: "1.17s", delay: "-0.42s" },
  { height: "94%", duration: "0.88s", delay: "-0.75s" },
  { height: "64%", duration: "0.97s", delay: "-0.28s" },
  { height: "80%", duration: "1.11s", delay: "-0.63s" },
];

const STATUS_LABEL: Record<AssistantStatus, string> = {
  idle: "STANDBY",
  listening: "LISTENING",
  thinking: "GENERATING",
  speaking: "SPEAKING",
  error: "FAULT",
  unavailable: "OFFLINE",
};

export function AdvancedVisualizer({
  isThinking,
  status = "idle",
}: {
  isThinking: boolean;
  status?: AssistantStatus;
}) {
  const reducedMotion = useReducedMotion();
  const active = isThinking && !reducedMotion;

  return (
    <section
      aria-label="Assistant diagnostics"
      className="relative shrink-0 overflow-hidden rounded-2xl border border-white/10 bg-black/40 backdrop-blur-md"
    >
      {/* Corner ticks - cheap, and they do the "instrument panel" work. */}
      <span className="pointer-events-none absolute left-0 top-0 h-2.5 w-2.5 border-l border-t border-cyan-300/50" aria-hidden="true" />
      <span className="pointer-events-none absolute right-0 top-0 h-2.5 w-2.5 border-r border-t border-cyan-300/50" aria-hidden="true" />
      <span className="pointer-events-none absolute bottom-0 left-0 h-2.5 w-2.5 border-b border-l border-cyan-300/50" aria-hidden="true" />
      <span className="pointer-events-none absolute bottom-0 right-0 h-2.5 w-2.5 border-b border-r border-cyan-300/50" aria-hidden="true" />

      <div className="flex items-center justify-between border-b border-white/[0.07] px-3.5 py-2">
        <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-cyan-200/75">
          Diagnostics
        </p>
        <p className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.22em] text-cyan-200/75">
          <span
            className={
              active
                ? "h-1.5 w-1.5 rounded-full bg-cyan-400 shadow-[0_0_8px_#22d3ee]"
                : "h-1.5 w-1.5 rounded-full bg-white/25"
            }
            aria-hidden="true"
          />
          {STATUS_LABEL[status]}
        </p>
      </div>

      <div className="px-3.5 py-3">
        {/* The equaliser itself: a flex row of bars anchored to a baseline. */}
        <div className="flex h-16 items-end justify-center gap-[5px]" aria-hidden="true">
          {BARS.map((bar, i) => (
            <span
              key={i}
              className={`w-full max-w-[14px] flex-1 rounded-full bg-cyan-400 shadow-[0_0_8px_#22d3ee] ${
                active ? "assistant-wave-bar" : "origin-bottom transition-transform duration-500 ease-out"
              }`}
              style={
                active
                  ? {
                      height: bar.height,
                      animationDuration: bar.duration,
                      animationDelay: bar.delay,
                    }
                  : {
                      height: bar.height,
                      // Idle: collapsed to small dots on the baseline. Scaling
                      // rather than resizing keeps it on the compositor and
                      // lets it settle smoothly out of the animation.
                      transform: `scaleY(${(0.085 / (parseInt(bar.height, 10) / 100)).toFixed(3)})`,
                    }
              }
            />
          ))}
        </div>

        <div className="mt-2.5 flex items-center justify-between font-mono text-[9px] uppercase tracking-[0.18em] text-muted/70">
          <span>WAVE / {BARS.length}CH</span>
          <span className={active ? "text-cyan-200/80" : undefined}>
            {active ? "SIGNAL ACTIVE" : "SIGNAL IDLE"}
          </span>
        </div>
      </div>
    </section>
  );
}
