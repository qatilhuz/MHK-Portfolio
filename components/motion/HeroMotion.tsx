"use client";

import { useEffect } from "react";
import { siteConfig } from "@/data/site";
import { requestEmote } from "@/lib/character/emoteBus";
import { prefersReducedMotion } from "@/lib/motion/engine";
import { TextReveal } from "./TextReveal";

export function HeroMotion({
  role,
  name,
}: {
  role: string;
  name: string;
}) {
  useEffect(() => {
    if (prefersReducedMotion()) return;
    if (window.innerWidth < 1024) return;
    const id = window.setTimeout(() => requestEmote("point"), 1700);
    return () => window.clearTimeout(id);
  }, []);

  return (
    <div>
      <p className="font-mono text-[0.65rem] uppercase tracking-[0.18em] text-muted">
        {siteConfig.location} · {siteConfig.specialization}
      </p>
      <TextReveal as="p" className="label mt-3" text={role} variant="scan" once={false} />
      <TextReveal as="h1" className="display mt-5" text={name} variant="assemble" once={false} delay={0.08} />
      <span className="hero-scan mt-2 block h-px w-24 bg-accent/50" aria-hidden="true" />
    </div>
  );
}
