"use client";

import { createElement, useEffect, useMemo, useRef } from "react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { cn } from "@/lib/utils";
import { motionEngine, prefersReducedMotion } from "@/lib/motion/engine";

type Props = {
  text: string;
  as?: "p" | "span";
  className?: string;
};

function pauseFor(char: string) {
  if (/[.!?]/.test(char)) return 0.11;
  if (/[,;:]/.test(char)) return 0.055;
  if (char === " ") return 0.008;
  return 0;
}

export function TypeIn({ text, as = "p", className }: Props) {
  const root = useRef<HTMLElement | null>(null);
  const chars = useMemo(() => Array.from(text), [text]);

  useEffect(() => {
    const node = root.current;
    if (!node || prefersReducedMotion()) return;

    const marks = node.querySelectorAll<HTMLElement>("[data-ch]");
    if (!marks.length) return;

    const gsap = motionEngine();
    const ctx = gsap.context(() => {
      gsap.set(marks, { opacity: 0 });
      const tl = gsap.timeline({ paused: true });
      const step = Math.min(0.02, 2.2 / Math.max(marks.length, 1));
      let time = 0;
      marks.forEach((mark) => {
        tl.set(mark, { opacity: 1 }, time);
        time += step + pauseFor(mark.textContent ?? "");
      });

      ScrollTrigger.create({
        trigger: node,
        start: "top 72%",
        animation: tl,
        toggleActions: "play reverse play reverse",
        invalidateOnRefresh: true,
      });
    }, node);

    return () => ctx.revert();
  }, [text]);

  const inner = chars.map((char, index) =>
    createElement(
      "span",
      {
        key: index,
        "data-ch": true,
        className: "type-ch",
      },
      char,
    ),
  );

  return createElement(
    as,
    { ref: root, className: cn("type-in", className) },
    inner,
  );
}
