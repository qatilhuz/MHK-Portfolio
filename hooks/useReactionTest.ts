"use client";

import { useCallback, useRef, useState } from "react";
import { minScore } from "@/lib/arcade/storage";

type Phase = "idle" | "waiting" | "ready" | "result" | "false-start";

export function useReactionTest() {
  const [phase, setPhase] = useState<Phase>("idle");
  const [ms, setMs] = useState<number | null>(null);
  const [best, setBest] = useState(0);
  const startAt = useRef(0);
  const timer = useRef<number | null>(null);

  const clearTimer = () => {
    if (timer.current) window.clearTimeout(timer.current);
    timer.current = null;
  };

  const start = useCallback(() => {
    clearTimer();
    setPhase("waiting");
    setMs(null);
    const delay = 1200 + Math.random() * 2800;
    timer.current = window.setTimeout(() => {
      startAt.current = performance.now();
      setPhase("ready");
    }, delay);
  }, []);

  const tap = useCallback(() => {
    if (phase === "waiting") {
      clearTimer();
      setPhase("false-start");
      return;
    }
    if (phase !== "ready") return;
    const value = Math.round(performance.now() - startAt.current);
    setMs(value);
    setBest(minScore("reaction-best", value));
    setPhase("result");
  }, [phase]);

  const reset = useCallback(() => {
    clearTimer();
    setPhase("idle");
    setMs(null);
  }, []);

  return { phase, ms, best, start, tap, reset };
}
