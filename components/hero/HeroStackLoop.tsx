"use client";

import { useEffect, useRef } from "react";
import { isPageRevealed, onPageRevealed } from "@/lib/boot/reveal";
import { motionEngine, prefersReducedMotion } from "@/lib/motion/engine";

const WORDS = ["Next.js", "React", ".NET"] as const;
const LONGEST = "Next.js";

export function HeroStackLoop() {
  const live = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const node = live.current;
    if (!node) return;

    if (prefersReducedMotion()) {
      node.textContent = WORDS[0];
      return;
    }

    const gsap = motionEngine();
    let tl: { kill: () => void } | undefined;
    let stopReveal: (() => void) | undefined;

    const run = () => {
      tl?.kill();
      node.textContent = "";
      const timeline = gsap.timeline({ repeat: -1, delay: 0.18 });
      tl = timeline;

      WORDS.forEach((word) => {
        const typeStep = word.length > 5 ? 0.08 : 0.1;
        const deleteStep = 0.055;
        for (let i = 1; i <= word.length; i += 1) {
          const slice = word.slice(0, i);
          timeline.call(() => {
            node.textContent = slice;
          });
          timeline.to({}, { duration: typeStep });
        }
        timeline.to({}, { duration: 1.15 });
        for (let i = word.length - 1; i >= 0; i -= 1) {
          const slice = word.slice(0, i);
          timeline.call(() => {
            node.textContent = slice;
          });
          timeline.to({}, { duration: deleteStep });
        }
        timeline.to({}, { duration: 0.22 });
      });
    };

    if (isPageRevealed()) run();
    else stopReveal = onPageRevealed(run);

    return () => {
      stopReveal?.();
      tl?.kill();
    };
  }, []);

  return (
    <p className="mt-3 flex h-[1.4em] items-center" aria-label="Next.js, React, and .NET">
      <span className="relative inline-flex min-w-[7.5ch] items-center font-mono text-[0.8rem] tracking-[0.08em] text-accent">
        <span className="invisible select-none" aria-hidden="true">
          {LONGEST}
        </span>
        <span className="absolute inset-y-0 left-0 flex items-center whitespace-nowrap">
          <span ref={live}>{WORDS[0]}</span>
          <span className="hero-stack-caret ml-0.5 inline-block h-[0.9em] w-px bg-accent" aria-hidden="true" />
        </span>
      </span>
    </p>
  );
}
