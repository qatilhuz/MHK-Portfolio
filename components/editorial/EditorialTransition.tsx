"use client";

import { useEffect, useRef } from "react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { motionEngine, prefersReducedMotion } from "@/lib/motion/engine";
import { NeuralPathway } from "./NeuralPathway";

/**
 * Section 02 - Editorial Transition.
 *
 * A deliberate pause between the Hero and About Me: a four-line staggered
 * statement and one line of monospace micro-copy in a 60% column, the
 * scroll-drawn monoline brain in a 40% column. No eyebrow, no section
 * number, no cards, no CTAs - the section index lives in the file name.
 *
 * Typography stays site-consistent: the <h2> inherits the global rule in
 * app/globals.css (clamp(1.5rem, 2.4vw, 2rem) / 600 / -0.025em / 1.2) and
 * `text-foreground`, exactly as components/ui/Section.tsx renders every other
 * section heading. Only the composition and the reveal are local.
 */

/**
 * Why the heading looked static before: it was rendered through the shared
 * <TextReveal variant="words" />, whose reveal is a 14px rise over 0.5s with
 * a 0.04s stagger. On a heading capped at 2rem that displacement is roughly
 * half a cap height, so it reads as a plain fade and is easy to miss
 * entirely. It also animates per word, not per line. The line-by-line mask
 * below moves each line a full 115% of its own height, which scales with the
 * type rather than being a fixed pixel nudge.
 */
const MASK = "block overflow-hidden py-[0.04em]";
const LINE = "editorial-heading-line block will-change-transform";
const INDENT = "pl-[7%] sm:pl-[9%]";

export function EditorialTransition() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const node = sectionRef.current;
    if (!node) return;

    // Registers the ScrollTrigger plugin before any trigger is created.
    const gsap = motionEngine();

    // Reduced motion: leave every element in its natural, visible state. The
    // hidden state below is only ever applied by GSAP, never by the markup or
    // a stylesheet, so bailing out here cannot strand the heading invisible.
    if (prefersReducedMotion()) return;

    const ctx = gsap.context(() => {
      const lines = gsap.utils.toArray<HTMLElement>(".editorial-heading-line");
      if (lines.length) {
        gsap.fromTo(
          lines,
          { yPercent: 115, opacity: 0 },
          {
            yPercent: 0,
            opacity: 1,
            duration: 0.9,
            stagger: 0.12,
            ease: "power3.out",
            force3D: true,
            overwrite: "auto",
            scrollTrigger: {
              trigger: node,
              start: "top 78%",
              toggleActions: "play none none reverse",
              invalidateOnRefresh: true,
            },
          },
        );
      }

      const rule = node.querySelector<HTMLElement>("[data-editorial-rule]");
      if (rule) {
        gsap.fromTo(
          rule,
          { scaleX: 0 },
          {
            scaleX: 1,
            duration: 0.9,
            ease: "power3.out",
            delay: 0.35,
            transformOrigin: "left center",
            force3D: true,
            scrollTrigger: {
              trigger: node,
              start: "top 78%",
              toggleActions: "play none none reverse",
              invalidateOnRefresh: true,
            },
          },
        );
      }

      const meta = node.querySelector<HTMLElement>("[data-editorial-meta]");
      if (meta) {
        gsap.fromTo(
          meta,
          { opacity: 0, y: 16 },
          {
            opacity: 1,
            y: 0,
            duration: 0.7,
            ease: "power2.out",
            force3D: true,
            scrollTrigger: {
              trigger: meta,
              start: "top 92%",
              toggleActions: "play none none reverse",
              invalidateOnRefresh: true,
            },
          },
        );
      }
    }, node);

    /**
     * The section is min-h-screen and sits behind a hero whose video and
     * braille canvas both settle asynchronously, so trigger positions
     * measured at mount can be stale by the time the user scrolls here - a
     * stale start that already reads as "passed" fires the tween off-screen
     * and the heading is simply there when you arrive. Re-measuring on the
     * next frame, once layout has settled, is what keeps the reveal reliable.
     */
    const raf = requestAnimationFrame(() => ScrollTrigger.refresh());

    return () => {
      cancelAnimationFrame(raf);
      ctx.revert();
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      id="editorial-transition"
      className="relative isolate w-full overflow-hidden"
    >
      {/*
        Atmospheric tint only. Every layer is translucent so the shared cyber
        rain still reads through; it darkens the field just enough to hold
        contrast under the statement and the glowing stroke.
      */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_70%_60%_at_26%_44%,rgba(2,6,23,0.64),transparent_70%),radial-gradient(ellipse_46%_52%_at_82%_44%,rgba(56,189,248,0.08),transparent_72%),linear-gradient(180deg,rgba(2,6,23,0.44),rgba(2,6,23,0.06)_42%,rgba(2,6,23,0.48))]"
      />

      <div className="mx-auto flex w-full max-w-[1440px] flex-col px-6 sm:px-12 lg:flex-row lg:items-stretch lg:px-16">
        {/* ---- 60% : typography ---- */}
        <div className="flex min-h-[90vh] w-full flex-col justify-between py-16 lg:min-h-screen lg:w-[60%] lg:py-24">
          <div className="max-w-2xl">
            <h2 className="text-foreground">
              {/*
                Literal capitals rather than lowercase styled by `uppercase`:
                text-transform only changes rendering, so a lowercase source
                would copy to the clipboard in the wrong case. The explicit
                space nodes stop the four block lines concatenating into
                "WHATPEOPLE" in textContent and in the accessible name.
              */}
              <span className={MASK}>
                <span className={LINE}>FROM WHAT</span>
              </span>{" "}
              <span className={`${MASK} ${INDENT}`}>
                <span className={LINE}>PEOPLE NEED</span>
              </span>{" "}
              <span className={MASK}>
                <span className={LINE}>TO WHAT</span>
              </span>{" "}
              <span className={`${MASK} ${INDENT}`}>
                <span className={LINE}>FEELS RIGHT.</span>
              </span>
            </h2>

            <span
              aria-hidden="true"
              data-editorial-rule
              className="mt-6 block h-px w-full max-w-[420px] origin-left bg-gradient-to-r from-cyan-300/50 via-white/10 to-transparent"
            />
          </div>

          <p
            data-editorial-meta
            className="mt-16 max-w-[260px] font-mono text-[11px] leading-[1.55] tracking-wide text-white/55 sm:text-xs"
          >
            I connect human intent, product behavior and the systems underneath.
          </p>
        </div>

        {/* ---- 40% : the drawing ----
          Stacks below the typography under lg, which is what guarantees it can
          never overlap the text; no width reservation or hiding needed. */}
        <div className="flex w-full items-center justify-center pb-16 lg:w-[40%] lg:pb-0 lg:pl-8">
          <NeuralPathway className="pointer-events-none flex w-full items-center justify-center" />
        </div>
      </div>
    </section>
  );
}
