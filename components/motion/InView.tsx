"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { cn } from "@/lib/utils";
import { isPastTrigger, motionEngine, prefersReducedMotion } from "@/lib/motion/engine";

type Props = {
  children: ReactNode;
  className?: string;
  stagger?: string;
  y?: number;
  delay?: number;
};

export function InView({ children, className, stagger = "[data-in]", y = 14, delay = 0 }: Props) {
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const node = root.current;
    if (!node || prefersReducedMotion()) return;
    const gsap = motionEngine();
    const items = node.querySelectorAll<HTMLElement>(stagger);
    if (!items.length) return;

    const ctx = gsap.context(() => {
      gsap.set(items, { opacity: 0, y });
      items.forEach((item, index) => {
        const play = () => {
          gsap.to(item, {
            opacity: 1,
            y: 0,
            duration: 0.48,
            ease: "power3.out",
            delay: delay + Math.min(index * 0.045, 0.18),
            overwrite: "auto",
          });
        };
        ScrollTrigger.create({
          trigger: item,
          start: "top 76%",
          once: true,
          invalidateOnRefresh: true,
          onEnter: play,
        });
        if (isPastTrigger(item, 0.76)) play();
      });
    }, node);

    return () => ctx.revert();
  }, [delay, stagger, y]);

  return (
    <div ref={root} className={cn(className)}>
      {children}
    </div>
  );
}
