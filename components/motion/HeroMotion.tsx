"use client";

import { useEffect, useState } from "react";
import { HeroStackLoop } from "@/components/hero/HeroStackLoop";
import { requestEmote } from "@/lib/character/emoteBus";
import { isPageRevealed, onPageRevealed } from "@/lib/boot/reveal";
import { prefersReducedMotion } from "@/lib/motion/engine";

/**
 * The heading is a plain <h1> holding its text directly, and that is load
 * bearing rather than a simplification.
 *
 * It previously rendered through <TextReveal variant="assemble" />, which
 * wraps every word in an `inline-block overflow-hidden` span and every
 * character in a `will-change: transform` span. Both of those make a
 * descendant self-painting in Blink, and `background-clip: text` can only
 * mask glyphs painted in the same layer - so every character fell outside
 * the gradient mask and painted as -webkit-text-fill-color: transparent
 * against nothing. The heading was not faded or mispositioned; it was
 * genuinely drawing nothing at all.
 *
 * Any future reveal effect here has to animate the <h1> as a whole (opacity,
 * transform, clip-path on the element itself). Splitting the text into
 * wrapper spans will silently delete the heading again.
 */
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
      <HeroStackLoop />
      <h1 className="hero-heading-shimmer display mt-5">{name}</h1>
      <span className="hero-scan mt-2 block h-px w-24 bg-accent/50" aria-hidden="true" />
    </div>
  );
}
