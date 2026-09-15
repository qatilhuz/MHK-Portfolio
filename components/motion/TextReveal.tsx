"use client";

import { createElement, useEffect, useRef } from "react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { cn } from "@/lib/utils";
import {
  isCompactViewport,
  isPastTrigger,
  motionEngine,
  prefersReducedMotion,
} from "@/lib/motion/engine";

export type TextRevealVariant = "assemble" | "words" | "mask" | "scan";

type Props = {
  as?: "h1" | "h2" | "h3" | "p" | "span";
  text: string;
  className?: string;
  variant?: TextRevealVariant;
  delay?: number;
  once?: boolean;
};

function splitWords(source: string) {
  return source.split(/(\s+)/);
}

export function TextReveal({
  as = "span",
  text,
  className,
  variant = "words",
  delay = 0,
  once = true,
}: Props) {
  const root = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const node = root.current;
    if (!node) return;
    if (prefersReducedMotion()) return;

    const gsap = motionEngine();
    const compact = isCompactViewport();
    const chars = node.querySelectorAll<HTMLElement>("[data-char]");
    const words = node.querySelectorAll<HTMLElement>("[data-word]");
    const mask = node.querySelectorAll<HTMLElement>("[data-mask]");

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ delay, paused: true, defaults: { ease: "power3.out" } });

      if (variant === "assemble" && chars.length && !compact) {
        tl.fromTo(
          chars,
          { yPercent: 112, opacity: 0.2 },
          { yPercent: 0, opacity: 1, duration: 0.72, stagger: 0.028 },
        );
      } else if ((variant === "assemble" || variant === "words") && words.length) {
        tl.fromTo(
          words,
          { y: compact ? 8 : 14, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.5, stagger: 0.04 },
        );
      } else if (variant === "mask" && mask.length) {
        tl.fromTo(
          mask,
          { clipPath: "inset(0 100% 0 0)" },
          { clipPath: "inset(0 0% 0 0)", duration: 0.75, ease: "power2.inOut" },
        );
      } else if (variant === "scan") {
        tl.fromTo(
          node,
          { opacity: 0.35, letterSpacing: "0.22em" },
          { opacity: 1, letterSpacing: "0.14em", duration: 0.45 },
        );
      }

      const play = () => {
        if (tl.progress() === 0) tl.play();
      };

      if (once) {
        ScrollTrigger.create({
          trigger: node,
          start: "top 80%",
          once: true,
          invalidateOnRefresh: true,
          onEnter: play,
        });
        if (isPastTrigger(node, 0.8)) play();
      } else {
        play();
      }
    }, node);

    return () => ctx.revert();
  }, [delay, once, text, variant]);

  const words = splitWords(text);
  const useChars = variant === "assemble";

  const inner =
    variant === "mask"
      ? createElement("span", { "data-mask": true, className: "inline-block" }, text)
      : words.map((word, index) =>
          /^\s+$/.test(word)
            ? createElement("span", { key: `s-${index}` }, word)
            : createElement(
                "span",
                {
                  key: `w-${index}`,
                  "data-word": true,
                  className: "inline-block overflow-hidden align-baseline",
                },
                useChars
                  ? word.split("").map((char, cIndex) =>
                      createElement(
                        "span",
                        {
                          key: cIndex,
                          "data-char": true,
                          className: "inline-block will-change-transform",
                        },
                        char,
                      ),
                    )
                  : word,
              ),
        );

  return createElement(as, { ref: root, className: cn("motion-text", className) }, inner);
}
