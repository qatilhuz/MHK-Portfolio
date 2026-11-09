"use client";

import { useEffect, useState } from "react";
import { HeroStackLoop } from "@/components/hero/HeroStackLoop";
import { requestEmote } from "@/lib/character/emoteBus";
import { isPageRevealed, onPageRevealed } from "@/lib/boot/reveal";
import { prefersReducedMotion } from "@/lib/motion/engine";
import { TextReveal } from "./TextReveal";

/**
 * One source of truth for the hero heading so the revealed branch and the
 * pre-reveal fallback cannot drift apart - the shimmer has to survive the
 * swap between them or it would blink off for the first paint.
 *
 * The gradient is painted on the heading box and clipped to the glyphs, so
 * the sweep crosses the whole line rather than each letter individually.
 */
const HEADING_CLASS =
  "display mt-5 bg-[linear-gradient(110deg,#ffffff,45%,#22d3ee,55%,#ffffff)] " +
  "bg-[length:200%_auto] bg-clip-text text-transparent animate-shimmer-flash";

export function HeroMotion({
  name,
}: {
  name: string;
}) {
  const [live, setLive] = useState(isPageRevealed());

  useEffect(() => onPageRevealed(() => setLive(true)), []);

  useEffect(() => {
    if (!live) return;
    if (prefersReducedMotion()) return;
    if (window.innerWidth < 1024) return;
    const id = window.setTimeout(() => requestEmote("point"), 1200);
    return () => window.clearTimeout(id);
  }, [live]);

  return (
    <div>
      {live || isPageRevealed() ? (
        <>
          <HeroStackLoop />
          <TextReveal as="h1" className={HEADING_CLASS} text={name} variant="assemble" once={false} delay={0.08} />
          <span className="hero-scan mt-2 block h-px w-24 bg-accent/50" aria-hidden="true" />
        </>
      ) : (
        <>
          <HeroStackLoop />
          <h1 className={HEADING_CLASS}>{name}</h1>
          <span className="hero-scan mt-2 block h-px w-24 bg-accent/50" aria-hidden="true" />
        </>
      )}
    </div>
  );
}
