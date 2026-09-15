"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import { siteConfig } from "@/data/site";
import { isPageRevealed, onPageRevealed } from "@/lib/boot/reveal";
import { motionEngine, prefersReducedMotion } from "@/lib/motion/engine";

const linkClass = "text-foreground underline-offset-4 hover:underline";

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
      {chars(
        `Full-stack developer in ${siteConfig.location}, focused on ${siteConfig.specialization}. Browse `,
        "a",
      )}
      <Link href="/about" className={linkClass}>
        {chars("about", "about")}
      </Link>
      {chars(", ", "b")}
      <Link href="/projects" className={linkClass}>
        {chars("projects", "projects")}
      </Link>
      {chars(", or try the ", "c")}
      <Link href="/#arcade" className={linkClass}>
        {chars("Dev Arcade", "arcade")}
      </Link>
      {chars(" and ", "d")}
      <Link href="/#qa" className={linkClass}>
        {chars("QA Bug Hunt", "qa")}
      </Link>
      {chars(", or the ", "e")}
      <Link href="/#terminal" className={linkClass}>
        {chars("terminal", "term")}
      </Link>
      {chars(". Ask the ", "f")}
      <Link href="/#avatar" className={linkClass}>
        {chars("portfolio assistant", "assist")}
      </Link>
      {chars(".", "g")}
    </p>
  );
}
