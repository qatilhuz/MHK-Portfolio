"use client";

import { useEffect, useRef } from "react";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import type { AssistantStatus } from "@/types";

/**
 * Diagnostic and wave visualisation HUD.
 *
 * The bars are driven by a single requestAnimationFrame loop writing
 * transforms straight to the DOM. Holding seven bar heights in React state
 * would re-render this subtree sixty times a second for a purely decorative
 * effect; a transform on a ref costs nothing and never touches the vdom.
 *
 * `activity` is damped rather than switched, so the waveform ramps up when a
 * reply starts generating and settles back down afterwards instead of
 * snapping between two states.
 */

const BARS = 7;

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
  const barRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const sweepRef = useRef<HTMLDivElement>(null);
  const readoutRef = useRef<HTMLSpanElement>(null);

  // Read inside the loop without restarting it on every status change.
  const activeRef = useRef(isThinking);
  activeRef.current = isThinking;

  useEffect(() => {
    if (reducedMotion) {
      // A single static frame: legible, no motion.
      barRefs.current.forEach((bar, i) => {
        if (bar) bar.style.transform = `scaleY(${0.18 + (i % 3) * 0.06})`;
      });
      if (readoutRef.current) readoutRef.current.textContent = "0.00";
      return;
    }

    let raf = 0;
    let activity = 0;
    const start = performance.now();

    const tick = (now: number) => {
      const t = (now - start) / 1000;

      // Damped so the ramp in and out is smooth rather than a hard switch.
      const target = activeRef.current ? 1 : 0;
      activity += (target - activity) * 0.06;

      let peak = 0;
      for (let i = 0; i < BARS; i += 1) {
        const bar = barRefs.current[i];
        if (!bar) continue;

        // Idle: slow, shallow, offset per bar so it breathes.
        const idle = 0.14 + 0.07 * Math.sin(t * 1.3 + i * 0.8);

        // Active: faster, taller, and layered so it reads as spiky rather
        // than as a tidy sine.
        const spike =
          0.42 +
          0.34 * Math.abs(Math.sin(t * 7.5 + i * 1.15)) +
          0.22 * Math.sin(t * 13.7 + i * 2.3);

        const value = idle + (spike - idle) * activity;
        const clamped = Math.max(0.06, Math.min(1, value));
        peak = Math.max(peak, clamped);
        bar.style.transform = `scaleY(${clamped.toFixed(3)})`;
      }

      if (sweepRef.current) {
        const sweep = ((t * (0.18 + activity * 0.5)) % 1) * 100;
        sweepRef.current.style.transform = `translateX(${sweep.toFixed(2)}%)`;
        sweepRef.current.style.opacity = (0.25 + activity * 0.55).toFixed(2);
      }

      // The readout reports the actual peak the loop just drew, not a
      // decorative random number.
      if (readoutRef.current) readoutRef.current.textContent = peak.toFixed(2);

      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [reducedMotion]);

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
              isThinking
                ? "h-1.5 w-1.5 rounded-full bg-cyan-300 shadow-[0_0_8px_rgba(103,232,249,0.9)]"
                : "h-1.5 w-1.5 rounded-full bg-white/25"
            }
            aria-hidden="true"
          />
          {STATUS_LABEL[status]}
        </p>
      </div>

      <div className="relative px-3.5 py-3">
        {/* Scanning sweep across the well. */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
          <div
            ref={sweepRef}
            className="h-full w-16 bg-gradient-to-r from-transparent via-cyan-300/20 to-transparent"
            style={{ transform: "translateX(0%)" }}
          />
        </div>

        <div className="relative flex h-14 items-end justify-between gap-1.5" aria-hidden="true">
          {Array.from({ length: BARS }, (_, i) => (
            <span
              key={i}
              ref={(node) => {
                barRefs.current[i] = node;
              }}
              className="block h-full flex-1 origin-bottom rounded-full bg-gradient-to-t from-cyan-500/70 via-cyan-300 to-sky-200 shadow-[0_0_12px_rgba(34,211,238,0.45)]"
              style={{ transform: "scaleY(0.14)" }}
            />
          ))}
        </div>

        <div className="relative mt-2.5 flex items-center justify-between font-mono text-[9px] uppercase tracking-[0.18em] text-muted/70">
          <span>WAVE / 7CH</span>
          <span>
            PEAK <span ref={readoutRef} className="text-cyan-200/80">0.00</span>
          </span>
        </div>
      </div>
    </section>
  );
}
