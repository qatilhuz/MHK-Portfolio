"use client";

import { useEffect, useRef, useState } from "react";
import { motionEngine, prefersReducedMotion } from "@/lib/motion/engine";
import { markPageRevealed, waitCriticalBoot } from "@/lib/boot/reveal";

export function LoadingGate() {
  const overlay = useRef<HTMLDivElement>(null);
  const word = useRef<HTMLParagraphElement>(null);
  const [gone, setGone] = useState(false);

  useEffect(() => {
    const node = overlay.current;
    const mark = word.current;
    if (!node || !mark) return;

    let finished = false;
    const finish = () => {
      if (finished) return;
      finished = true;
      markPageRevealed();
      setGone(true);
    };

    if (prefersReducedMotion()) {
      const id = window.setTimeout(finish, 180);
      return () => window.clearTimeout(id);
    }

    const gsap = motionEngine();
    const ctx = gsap.context(() => {
      gsap.set(mark, {
        clipPath: "inset(0 100% 0 0)",
        webkitClipPath: "inset(0 100% 0 0)",
      });

      const write = gsap.timeline({ defaults: { ease: "none" } });
      write.to(mark, {
        clipPath: "inset(0 58% 0 0)",
        duration: 0.85,
        ease: "power1.out",
      });
      write.to(mark, {
        clipPath: "inset(0 28% 0 0)",
        duration: 0.8,
        ease: "power1.inOut",
      });
      write.to(mark, {
        clipPath: "inset(0 0% 0 0)",
        duration: 0.95,
        ease: "power2.out",
      });
      write.to(mark, {
        textShadow: "0 0 0 rgba(59,130,246,0)",
        duration: 0.2,
      });
      write.to(mark, {
        textShadow: "0 0 22px rgba(59,130,246,0.38), 0 0 48px rgba(59,130,246,0.16)",
        duration: 0.7,
        ease: "power2.out",
      });

      const hole = { p: 0 };
      const open = () => {
        gsap.to(hole, {
          p: 140,
          duration: 0.95,
          ease: "power3.inOut",
          onUpdate: () => {
            const value = `radial-gradient(circle at 50% 48%, transparent ${hole.p}%, #09090b ${hole.p + 1}%)`;
            node.style.maskImage = value;
            node.style.webkitMaskImage = value;
          },
          onComplete: finish,
        });
      };

      void waitCriticalBoot().then(() => {
        if (write.isActive() || write.progress() < 1) {
          write.eventCallback("onComplete", open);
        } else {
          open();
        }
      });
    }, node);

    const failsafe = window.setTimeout(finish, 8000);
    return () => {
      window.clearTimeout(failsafe);
      ctx.revert();
    };
  }, []);

  if (gone) return null;

  return (
    <div
      ref={overlay}
      className="fixed inset-0 z-[80] flex items-center justify-center bg-background"
      role="status"
      aria-live="polite"
      aria-label="huz"
    >
      <p
        ref={word}
        className="font-huz select-none text-[clamp(2.5rem,8vw,4rem)] font-normal leading-none text-foreground"
      >
        huz
      </p>
    </div>
  );
}
