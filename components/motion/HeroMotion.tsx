"use client";

import { useEffect, useState } from "react";
import { HeroStackLoop } from "@/components/hero/HeroStackLoop";
import { requestEmote } from "@/lib/character/emoteBus";
import { isPageRevealed, onPageRevealed } from "@/lib/boot/reveal";
import { prefersReducedMotion } from "@/lib/motion/engine";
import { TextReveal } from "./TextReveal";

export function HeroMotion({
  role,
  name,
}: {
  role: string;
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
          <TextReveal as="p" className="label mt-3" text={role} variant="scan" once={false} />
          <HeroStackLoop />
          <TextReveal as="h1" className="display mt-5" text={name} variant="assemble" once={false} delay={0.08} />
          <span className="hero-scan mt-2 block h-px w-24 bg-accent/50" aria-hidden="true" />
        </>
      ) : (
        <>
          <p className="label mt-3">{role}</p>
          <HeroStackLoop />
          <h1 className="display mt-5">{name}</h1>
        </>
      )}
    </div>
  );
}
