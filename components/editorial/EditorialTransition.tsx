"use client";

import { useEffect, useRef } from "react";
import { motionEngine, prefersReducedMotion } from "@/lib/motion/engine";
import { NeuralPathway } from "./NeuralPathway";

/**
 * Section 02 - Editorial Transition.
 *
 * A deliberate pause between the Hero and About Me: a four-line staggered
 * statement, one line of monospace micro-copy anchored bottom-left, and a
 * scroll-drawn neural pathway on the right rail. No eyebrow, no section
 * number, no cards, no CTAs - the section index lives in the file name.
 */

/**
 * Each line is clipped by its own wrapper so the reveal reads as a mask.
 *
 * `pt-[0.14em] -mt-[0.14em]` is the part that matters: at leading-[0.93] the
 * font's ascent sits marginally above the line box, so a bare overflow-hidden
 * wrapper can shave the tops of the capitals. The padding grows the clip box
 * upward and the equal negative margin pulls the box back by the same amount,
 * so the glyphs land in exactly the same place while gaining headroom. The
 * <h2> is a flex column specifically so these margins cannot collapse into
 * each other or out of the parent, which is what would otherwise shift the
 * whole headline.
 */
const LINE_WRAP = "block overflow-hidden pt-[0.14em] -mt-[0.14em]";
const INDENT = "pl-[8%] sm:pl-[10%]";

export function EditorialTransition() {
  const section = useRef<HTMLElement>(null);

  useEffect(() => {
    const node = section.current;
    if (!node || prefersReducedMotion()) return;

    const gsap = motionEngine();
    const lines = node.querySelectorAll<HTMLElement>("[data-editorial-line]");
    const meta = node.querySelector<HTMLElement>("[data-editorial-meta]");
    if (!lines.length) return;

    const ctx = gsap.context(() => {
      // Hidden state is set here, never in the markup or a stylesheet. If this
      // effect never runs the statement renders as plain static text.
      gsap.set(lines, { yPercent: 100, force3D: true });
      if (meta) gsap.set(meta, { opacity: 0, y: 14, force3D: true });

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: node,
          start: "top 72%",
          toggleActions: "play none none reverse",
          invalidateOnRefresh: true,
        },
      });
      tl.to(lines, {
        yPercent: 0,
        duration: 0.95,
        ease: "power3.out",
        stagger: 0.085,
        force3D: true,
        overwrite: "auto",
      });
      if (meta) {
        tl.to(meta, { opacity: 1, y: 0, duration: 0.6, ease: "power2.out" }, "<0.35");
      }
    }, node);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={section}
      id="editorial-transition"
      aria-labelledby="editorial-transition-title"
      className="relative isolate flex w-full min-h-[92vh] flex-col justify-between overflow-hidden px-6 py-16 sm:px-12 lg:min-h-screen lg:px-20 lg:py-24"
    >
      {/*
        Atmospheric tint only. Every layer is translucent so the shared cyber
        rain still reads through; it darkens the field just enough to hold
        contrast under the headline and the glowing stroke.
      */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_78%_62%_at_28%_42%,rgba(2,6,23,0.62),transparent_70%),radial-gradient(ellipse_52%_46%_at_88%_30%,rgba(34,211,238,0.07),transparent_72%),linear-gradient(180deg,rgba(2,6,23,0.42),rgba(2,6,23,0.08)_42%,rgba(2,6,23,0.46))]"
      />

      {/*
        Right rail. Hidden below sm on purpose: at 390px there is not enough
        width for both the rail and a 2.5rem cap-height headline, and the
        four-line composition is the harder requirement. Reserving the rail
        width with padding on the content column is what guarantees the text
        can never run underneath the drawing.
      */}
      <div className="relative sm:pr-[210px] lg:pr-[320px]">
        <h2
          id="editorial-transition-title"
          className="flex flex-col text-[clamp(2.5rem,6.4vw,6rem)] font-extrabold uppercase leading-[0.93] tracking-[-0.04em] text-white"
        >
          {/*
            Literal capitals rather than lowercase styled by `uppercase`:
            text-transform only changes rendering, so a lowercase source would
            copy to the clipboard in the wrong case. The explicit space nodes
            keep the four block lines from concatenating into "WHATPEOPLE" in
            textContent and in the computed accessible name.
          */}
          <span className={LINE_WRAP}>
            <span data-editorial-line className="block">
              FROM WHAT
            </span>
          </span>{" "}
          <span className={`${LINE_WRAP} ${INDENT}`}>
            <span data-editorial-line className="block">
              PEOPLE NEED
            </span>
          </span>{" "}
          <span className={LINE_WRAP}>
            <span data-editorial-line className="block">
              TO WHAT
            </span>
          </span>{" "}
          <span className={`${LINE_WRAP} ${INDENT}`}>
            <span data-editorial-line className="block text-cyan-300">
              FEELS RIGHT.
            </span>
          </span>
        </h2>
      </div>

      <p
        data-editorial-meta
        className="relative mt-16 max-w-[260px] font-mono text-[11px] leading-[1.55] tracking-wide text-white/55 sm:text-xs"
      >
        I connect human intent, product behavior and the systems underneath.
      </p>

      {/*
        Rendered last so the reading order is headline -> micro-copy ->
        keywords. It is absolutely positioned, so this costs nothing visually.

        Hidden below sm on purpose: at 390px there is not enough width for both
        the rail and a 2.5rem cap-height headline, and holding the four-line
        composition matters more than showing the drawing on a phone. From sm
        up, the matching pr-* on the content column reserves the rail's width
        so text can never run underneath it.
      */}
      <NeuralPathway
        sectionRef={section}
        className="pointer-events-none absolute right-6 top-0 hidden sm:right-12 sm:block lg:right-20"
      />
    </section>
  );
}
