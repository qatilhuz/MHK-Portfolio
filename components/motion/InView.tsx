"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { cn } from "@/lib/utils";
import { motionEngine, prefersReducedMotion } from "@/lib/motion/engine";

type Props = {
  children: ReactNode;
  className?: string;
  stagger?: string;
  y?: number;
  delay?: number;
};

export function InView({ children, className, stagger = "[data-in]", y = 16, delay = 0 }: Props) {
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const node = root.current;
    if (!node || prefersReducedMotion()) return;
    const gsap = motionEngine();
    const items = node.querySelectorAll<HTMLElement>(stagger);
    if (!items.length) return;

    const ctx = gsap.context(() => {
      gsap.set(items, { opacity: 0, y });
      ScrollTrigger.create({
        trigger: node,
        start: "top 86%",
        once: true,
        onEnter: () => {
          gsap.to(items, {
            opacity: 1,
            y: 0,
            duration: 0.55,
            ease: "power3.out",
            stagger: 0.06,
            delay,
          });
        },
      });
      if (node.getBoundingClientRect().top < window.innerHeight * 0.9) {
        gsap.to(items, {
          opacity: 1,
          y: 0,
          duration: 0.55,
          ease: "power3.out",
          stagger: 0.06,
          delay,
        });
      }
    }, node);

    return () => ctx.revert();
  }, [delay, stagger, y]);

  return (
    <div ref={root} className={cn(className)}>
      {children}
    </div>
  );
}
