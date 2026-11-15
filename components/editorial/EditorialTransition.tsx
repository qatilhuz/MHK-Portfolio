"use client";

import { useEffect, useRef } from "react";
import { motionEngine, prefersReducedMotion } from "@/lib/motion/engine";
import { NeuralPathway } from "./NeuralPathway";

/**
 * Section 02 - Editorial Transition.
 *
 * A deliberate pause between the Hero and About Me: a four-line staggered
 * statement and one line of monospace micro-copy in a 60% column, the
 * scroll-drawn anatomical brain in a 40% column. No eyebrow, no section
 * number, no cards, no CTAs - the section index lives in the file name.
 */

/**
 * Each line is clipped by its own wrapper so the reveal reads as a mask.
 *
 * `pt-[0.16em] -mt-[0.16em]` is the part that matters: at leading-[0.91] the
 * font's ascent sits above the line box, so a bare overflow-hidden wrapper
 * shaves the tops of the capitals. The padding grows the clip box upward and
 * the equal negative margin pulls the box back by the same amount, so glyphs
 * land in exactly the same place while gaining headroom. The <h2> is a flex
 * column specifically so these margins cannot collapse into each other or out
 * of the parent.
 *
 * The glow lives on the wrapper rather than the inner line. A filter is
 * applied to an element's rendered output *after* its own overflow clipping,
 * so the halo escapes the mask; on the inner line it would be sliced off at
 * the clip edge.
 */
const MASK = "block overflow-hidden pt-[0.16em] -mt-[0.16em]";
const GLOW_WHITE = "drop-shadow-[0_2px_24px_rgba(255,255,255,0.08)]";
const GLOW_CYAN = "drop-shadow-[0_0_28px_rgba(34,211,238,0.32)]";
const INDENT = "pl-[7%] sm:pl-[9%]";

export function EditorialTransition() {
  const section = useRef<HTMLElement>(null);

  useEffect(() => {
    const node = section.current;
    if (!node || prefersReducedMotion()) return;

    const gsap = motionEngine();
    const lines = node.querySelectorAll<HTMLElement>("[data-editorial-line]");
    const rule = node.querySelector<HTMLElement>("[data-editorial-rule]");
    const meta = node.querySelector<HTMLElement>("[data-editorial-meta]");
    const drift = node.querySelector<HTMLElement>("[data-editorial-drift]");
    if (!lines.length) return;

    const ctx = gsap.context(() => {
      // Hidden state is set here, never in the markup or a stylesheet. If this
      // effect never runs, the statement renders as plain static text.
      gsap.set(lines, { yPercent: 115, opacity: 0, skewY: 3, force3D: true });
      if (rule) gsap.set(rule, { scaleX: 0, transformOrigin: "left center", force3D: true });
      if (meta) gsap.set(meta, { opacity: 0, y: 16, force3D: true });

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
        opacity: 1,
        skewY: 0,
        duration: 0.95,
        ease: "power4.out",
        stagger: 0.11,
        force3D: true,
        overwrite: "auto",
      });
      if (rule) {
        tl.to(rule, { scaleX: 1, duration: 0.9, ease: "power3.out" }, "<0.45");
      }
      if (meta) {
        tl.to(meta, { opacity: 1, y: 0, duration: 0.65, ease: "power2.out" }, "<0.2");
      }

      /**
       * Scroll-linked parallax drift. Deliberately applied to the wrapper and
       * not to the lines: the reveal already owns the lines' transforms, and
       * two tweens writing `y` and `yPercent` to the same element would fight
       * each other. Parent and child transforms simply compose.
       */
      if (drift) {
        gsap.to(drift, {
          y: -18,
          ease: "none",
          force3D: true,
          scrollTrigger: {
            trigger: node,
            start: "top bottom",
            end: "bottom top",
            scrub: 0.8,
            invalidateOnRefresh: true,
          },
        });
      }
    }, node);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={section}
      id="editorial-transition"
      aria-labelledby="editorial-transition-title"
      className="relative isolate w-full overflow-hidden"
    >
      {/*
        Atmospheric tint only. Every layer is translucent so the shared cyber
        rain still reads through; it darkens the field just enough to hold
        contrast under the headline and the glowing stroke.
      */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_70%_60%_at_26%_44%,rgba(2,6,23,0.64),transparent_70%),radial-gradient(ellipse_46%_52%_at_82%_44%,rgba(34,211,238,0.08),transparent_72%),linear-gradient(180deg,rgba(2,6,23,0.44),rgba(2,6,23,0.06)_42%,rgba(2,6,23,0.48))]"
      />

      <div className="mx-auto flex w-full max-w-[1440px] flex-col px-6 sm:px-12 lg:flex-row lg:items-stretch lg:px-16">
        {/* ---- 60% : typography ---- */}
        <div className="flex min-h-[90vh] w-full flex-col justify-between py-16 lg:min-h-screen lg:w-[60%] lg:py-24">
          <div data-editorial-drift>
            <h2
              id="editorial-transition-title"
              className="flex flex-col text-[clamp(2.8rem,6.6vw,6.8rem)] font-black uppercase leading-[0.91] tracking-[-0.04em]"
            >
              {/*
                Literal capitals rather than lowercase styled by `uppercase`:
                text-transform only changes rendering, so a lowercase source
                would copy to the clipboard in the wrong case. The explicit
                space nodes stop the four block lines concatenating into
                "WHATPEOPLE" in textContent and in the accessible name.
              */}
              <span className={`${MASK} ${GLOW_WHITE}`}>
                <span data-editorial-line className="block text-white">
                  FROM WHAT
                </span>
              </span>{" "}
              <span className={`${MASK} ${GLOW_WHITE} ${INDENT}`}>
                <span data-editorial-line className="block text-white">
                  PEOPLE NEED
                </span>
              </span>{" "}
              <span className={`${MASK} ${GLOW_WHITE}`}>
                <span data-editorial-line className="block text-white">
                  TO WHAT
                </span>
              </span>{" "}
              <span className={`${MASK} ${GLOW_CYAN} ${INDENT}`}>
                {/*
                  The gradient sits on the element that holds the text
                  directly. background-clip: text only masks glyphs painted in
                  the same layer, so putting it on an ancestor of these masked,
                  transformed spans would render the line invisible - the exact
                  failure the hero heading hit.
                */}
                <span
                  data-editorial-line
                  className="block bg-gradient-to-r from-cyan-300 via-cyan-400 to-white bg-clip-text text-transparent"
                >
                  FEELS RIGHT.
                </span>
              </span>
            </h2>

            <div className={`mt-6 ${INDENT}`}>
              <span
                aria-hidden="true"
                data-editorial-rule
                className="block h-[2px] w-full max-w-[520px] origin-left rounded-full bg-gradient-to-r from-cyan-300 via-cyan-400/70 to-transparent"
              />
            </div>
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
          <NeuralPathway
            sectionRef={section}
            className="pointer-events-none flex w-full items-center justify-center"
          />
        </div>
      </div>
    </section>
  );
}
