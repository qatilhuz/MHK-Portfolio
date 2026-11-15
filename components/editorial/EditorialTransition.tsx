"use client";

import { useEffect, useRef } from "react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { motionEngine, prefersReducedMotion } from "@/lib/motion/engine";

/**
 * Section 02 - Editorial Transition.
 *
 * A deliberate pause in the narrative between the Hero and About Me. It holds
 * one statement and nothing else: no eyebrow, no section number, no subtext,
 * no cards or CTAs. The section index lives in this comment and the file name,
 * never on screen.
 *
 * Legibility is fail-safe by construction, following the same contract as
 * <InView />: the hidden state is applied by GSAP *inside* the effect rather
 * than in the markup or a stylesheet. If JavaScript never runs, GSAP fails to
 * load, or the visitor prefers reduced motion, nothing is ever set to
 * opacity 0 and the statement simply renders as static, selectable text.
 *
 * The reveal is a translate + fade rather than an overflow-hidden mask. A mask
 * clips to the line box, and at leading-[1.08] the font's ascent overflows
 * that box, so uppercase glyph tops would risk being shaved. Compensating with
 * padding plus negative margins would in turn collapse the gap between the two
 * lines and alter the type setting. Transform and opacity are both
 * compositor-only properties, so this stays on the GPU either way.
 */
export function EditorialTransition() {
  const root = useRef<HTMLElement>(null);

  useEffect(() => {
    const node = root.current;
    if (!node || prefersReducedMotion()) return;

    const gsap = motionEngine();
    const lines = node.querySelectorAll<HTMLElement>("[data-editorial-line]");
    const rule = node.querySelector<HTMLElement>("[data-editorial-rule]");
    if (!lines.length) return;

    const ctx = gsap.context(() => {
      gsap.set(lines, { opacity: 0, y: 30, force3D: true });
      if (rule) gsap.set(rule, { scaleX: 0, transformOrigin: "left center", force3D: true });

      const tl = gsap.timeline({ paused: true });
      tl.to(lines, {
        opacity: 1,
        y: 0,
        duration: 0.9,
        ease: "power3.out",
        stagger: 0.12,
        force3D: true,
        overwrite: "auto",
      });
      if (rule) {
        tl.to(rule, { scaleX: 1, duration: 1.1, ease: "power2.out", force3D: true }, "<0.2");
      }

      ScrollTrigger.create({
        trigger: node,
        start: "top 72%",
        animation: tl,
        toggleActions: "play none none reverse",
        invalidateOnRefresh: true,
      });
    }, node);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={root}
      id="editorial-transition"
      aria-labelledby="editorial-transition-title"
      className="relative isolate flex min-h-[60vh] items-center justify-center px-6 md:min-h-[75vh]"
    >
      {/*
        Surface shift only - the cyber rain stays continuous behind it. Every
        layer here is translucent, so the rain reads through the tint; it is a
        change of atmosphere, not a background of its own.
      */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_72%_58%_at_50%_50%,rgba(34,211,238,0.06),transparent_68%),linear-gradient(180deg,rgba(2,6,23,0.34),rgba(2,6,23,0.06)_38%,rgba(2,6,23,0.34))]"
      />

      <div className="relative w-full max-w-5xl">
        <h2
          id="editorial-transition-title"
          className="text-balance text-4xl font-semibold uppercase leading-[1.08] tracking-tight text-white sm:text-6xl md:text-7xl"
        >
          {/*
            Written in literal capitals, not lowercase styled by the
            `uppercase` utility. text-transform only changes rendering, so a
            lowercase source would copy to the clipboard in the wrong case and
            the DOM text would not match the specified statement.
          */}
          <span data-editorial-line className="block">
            FROM WHAT PEOPLE NEED
          </span>
          {/*
            Explicit space between the two block lines. Without it the DOM
            text content reads "NEEDTO" - the line break is purely visual, so
            the accessible name computed from this heading and any
            textContent-based copy would run the words together. Whitespace
            between block boxes is not rendered, so this costs nothing
            visually.
          */}
          {" "}
          <span data-editorial-line className="block">
            TO <span className="text-cyan-200">WHAT FEELS RIGHT.</span>
          </span>
        </h2>

        <div
          aria-hidden="true"
          data-editorial-rule
          className="mt-10 h-px w-full bg-gradient-to-r from-cyan-200/45 via-white/12 to-transparent"
        />
      </div>
    </section>
  );
}
