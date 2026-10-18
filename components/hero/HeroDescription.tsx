"use client";

import { useEffect, useRef } from "react";
import { siteConfig } from "@/data/site";
import { isPageRevealed, onPageRevealed } from "@/lib/boot/reveal";
import { motionEngine, prefersReducedMotion } from "@/lib/motion/engine";

function pauseFor(char: string) {
  if (/[.!?]/.test(char)) return 0.09;
  if (/[,;:]/.test(char)) return 0.045;
  if (char === " ") return 0.006;
  return 0;
}

function chars(text: string, key: string) {
  return Array.from(text).map((char, index) => (
    <span key={`${key}-${index}`} data-hero-ch="" className="type-ch">
      {char}
    </span>
  ));
}

export function HeroDescription() {
  const root = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    const node = root.current;
    if (!node || prefersReducedMotion()) return;

    const gsap = motionEngine();
    const marks = node.querySelectorAll<HTMLElement>("[data-hero-ch]");
    if (!marks.length) return;

    let ctx: ReturnType<typeof gsap.context> | undefined;
    let stopReveal: (() => void) | undefined;

    const start = () => {
      ctx?.revert();
      ctx = gsap.context(() => {
        gsap.set(marks, { opacity: 0 });
        const tl = gsap.timeline({ delay: 0.42 });
        const step = Math.min(0.018, 2.4 / Math.max(marks.length, 1));
        let time = 0;
        marks.forEach((mark) => {
          tl.set(mark, { opacity: 1 }, time);
          time += step + pauseFor(mark.textContent ?? "");
        });
      }, node);
    };

    if (isPageRevealed()) start();
    else stopReveal = onPageRevealed(start);

    return () => {
      stopReveal?.();
      ctx?.revert();
    };
  }, []);

  return (
    <p ref={root} className="type-in mt-5 max-w-xl text-lg leading-relaxed text-muted">
      {chars(siteConfig.heroDescription, "hero-description")}
    </p>
  );
}
