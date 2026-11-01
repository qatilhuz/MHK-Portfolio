"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { IntroStep } from "@/data/terminalIntro";

interface Options {
  /** Hold the script until the terminal is actually on screen. */
  enabled: boolean;
  /** Skip straight to the finished state. */
  reduced: boolean;
}

export interface IntroState {
  /** How many steps have finished. Step `done` is the one in flight. */
  done: number;
  /** Characters typed so far for an in-flight command step. */
  typed: string;
  /** The script has played out; the prompt belongs to the visitor now. */
  complete: boolean;
  /** Jump to the end. */
  skip: () => void;
}

/**
 * Walks an intro script one step at a time.
 *
 * A single chained timeout rather than an interval: steps have their own
 * durations, and a chain can never stack up callbacks behind a slow frame the
 * way a fixed interval does. Each scheduled callback checks an abort flag, so
 * unmounting or skipping mid-type stops the whole chain immediately.
 */
export function useTerminalIntro(
  script: readonly IntroStep[],
  { enabled, reduced }: Options,
): IntroState {
  const [done, setDone] = useState(0);
  const [typed, setTyped] = useState("");
  const timer = useRef<number | null>(null);
  const aborted = useRef(false);

  const skip = useCallback(() => {
    aborted.current = true;
    if (timer.current !== null) window.clearTimeout(timer.current);
    setTyped("");
    setDone(script.length);
  }, [script.length]);

  useEffect(() => {
    if (!enabled) return;

    if (reduced) {
      setDone(script.length);
      setTyped("");
      return;
    }

    aborted.current = false;
    let index = 0;

    const run = () => {
      if (aborted.current || index >= script.length) return;
      const step = script[index];

      const settle = (wait: number) => {
        timer.current = window.setTimeout(() => {
          if (aborted.current) return;
          index += 1;
          setDone(index);
          run();
        }, wait);
      };

      if (step.kind !== "command") {
        settle(step.delay);
        return;
      }

      // Type the command out a character at a time, then hold the finished
      // line for a beat so it reads as a deliberate keystroke rather than a
      // paste, before the output drops in underneath it.
      let chars = 0;
      const tick = () => {
        if (aborted.current) return;
        chars += 1;
        setTyped(step.text.slice(0, chars));
        if (chars < step.text.length) {
          timer.current = window.setTimeout(tick, step.speed);
        } else {
          timer.current = window.setTimeout(() => {
            if (aborted.current) return;
            setTyped("");
            index += 1;
            setDone(index);
            run();
          }, step.pause);
        }
      };

      setTyped("");
      timer.current = window.setTimeout(tick, step.speed);
    };

    run();

    return () => {
      aborted.current = true;
      if (timer.current !== null) window.clearTimeout(timer.current);
    };
  }, [enabled, reduced, script]);

  return { done, typed, complete: done >= script.length, skip };
}
