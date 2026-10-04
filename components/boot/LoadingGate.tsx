"use client";

import { useEffect, useRef, useState } from "react";
import { bootConfig } from "@/data/bootConfig";
import { markPageRevealed } from "@/lib/boot/reveal";

export function LoadingGate() {
  const overlay = useRef<HTMLDivElement>(null);
  const [gone, setGone] = useState(!bootConfig.ENABLE_INITIAL_LOADER);

  useEffect(() => {
    if (!bootConfig.ENABLE_INITIAL_LOADER) {
      markPageRevealed();
      return;
    }

    const node = overlay.current;
    if (!node) return;

    let finished = false;
    const finish = () => {
      if (finished) return;
      finished = true;
      markPageRevealed();
      setGone(true);
    };

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) {
      const id = window.setTimeout(finish, 160);
      return () => window.clearTimeout(id);
    }

    const word = node.querySelector(".boot-huz");
    let opened = false;
    const open = () => {
      if (opened) return;
      opened = true;
      node.classList.add("is-open");
      window.setTimeout(finish, 680);
    };

    const fonts = document.fonts?.ready ?? Promise.resolve();
    const painted = new Promise<void>((resolve) => {
      requestAnimationFrame(() => requestAnimationFrame(() => resolve()));
    });
    const cap = new Promise<void>((resolve) => window.setTimeout(resolve, 800));

    void Promise.race([Promise.all([fonts, painted]), cap]).then(() => {
      if (word) {
        word.addEventListener("animationend", open, { once: true });
        window.setTimeout(open, 2000);
      } else {
        open();
      }
    });

    const failsafe = window.setTimeout(finish, 4000);
    return () => window.clearTimeout(failsafe);
  }, []);

  if (!bootConfig.ENABLE_INITIAL_LOADER || gone) return null;

  return (
    <div
      ref={overlay}
      className="boot-overlay"
      role="status"
      aria-live="polite"
      aria-label="huz"
    >
      <p className="boot-huz font-huz select-none text-[clamp(2.5rem,8vw,4rem)] font-normal leading-none text-foreground">
        huz
      </p>
    </div>
  );
}
