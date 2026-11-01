"use client";

import { useEffect, useState } from "react";

/** Chromium exposes this; the spec does not. Treated as optional everywhere. */
interface PerformanceWithMemory extends Performance {
  memory?: { usedJSHeapSize: number };
}

function clock(seconds: number) {
  const m = Math.floor(seconds / 60)
    .toString()
    .padStart(2, "0");
  const s = Math.floor(seconds % 60)
    .toString()
    .padStart(2, "0");
  return `${m}:${s}`;
}

interface StatProps {
  label: string;
  value: string;
  /** Measured in the visitor's browser rather than written into the data. */
  measured?: boolean;
  tone?: "default" | "good";
}

function Stat({ label, value, measured = false, tone = "default" }: StatProps) {
  return (
    <div className="flex min-w-0 flex-col gap-1 rounded-lg border border-white/[0.07] bg-white/[0.02] px-3 py-2.5">
      <span className="flex items-center gap-1.5 font-mono text-[9px] uppercase tracking-[0.22em] text-white/35">
        {measured ? (
          <span
            className="h-1 w-1 shrink-0 animate-pulse rounded-full bg-green-400"
            aria-hidden="true"
          />
        ) : null}
        <span className="truncate">{label}</span>
      </span>
      <span
        className={`truncate font-mono text-sm tabular-nums ${
          tone === "good" ? "text-green-400" : "text-cyan-300"
        }`}
      >
        {value}
      </span>
    </div>
  );
}

/**
 * The `./status --live` readout.
 *
 * Three of these are genuinely sampled from the page you are reading — frame
 * rate, session length and JS heap — which is the whole point: a terminal
 * printing invented telemetry is a screenshot, not a terminal. The two
 * service-style figures are set dressing and are not marked as measured.
 *
 * The sampling loop only runs while `live` is true, so it costs nothing once
 * the section has scrolled away.
 */
export function LiveStats({ live }: { live: boolean }) {
  const [fps, setFps] = useState<number | null>(null);
  const [heap, setHeap] = useState<number | null>(null);
  const [session, setSession] = useState(0);

  useEffect(() => {
    if (!live) return;

    let frames = 0;
    let last = performance.now();
    let raf = 0;

    const loop = (now: number) => {
      frames += 1;
      const elapsed = now - last;
      // One state update per second, not per frame: a counter that re-renders
      // sixty times a second is its own performance problem.
      if (elapsed >= 1000) {
        setFps(Math.round((frames * 1000) / elapsed));
        setSession((value) => value + 1);
        const { memory } = performance as PerformanceWithMemory;
        if (memory) setHeap(Math.round(memory.usedJSHeapSize / 1048576));
        frames = 0;
        last = now;
      }
      raf = requestAnimationFrame(loop);
    };

    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [live]);

  return (
    <div className="mt-2 space-y-2">
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
        <Stat label="uptime" value="99.98%" tone="good" />
        <Stat
          label="render"
          value={fps === null ? "···" : `${fps} fps`}
          measured
        />
        <Stat
          label="heap"
          value={heap === null ? "n/a" : `${heap} MB`}
          measured
        />
        <Stat label="session" value={clock(session)} measured />
        <Stat label="leaks" value="0" tone="good" />
      </div>
      <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-white/25">
        <span className="text-green-400/70">●</span> sampled live in your
        browser
      </p>
    </div>
  );
}
