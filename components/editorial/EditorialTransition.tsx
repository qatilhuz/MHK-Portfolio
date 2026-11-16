"use client";

import { useEffect, useRef } from "react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { motionEngine, prefersReducedMotion } from "@/lib/motion/engine";
import { NeuralPathway } from "./NeuralPathway";

/**
 * Section 02 - Editorial Transition.
 *
 * A deliberate pause between the Hero and About Me: a four-line staggered
 * statement and one line of monospace micro-copy in the type column, the
 * scroll-drawn monoline brain beside it. No eyebrow, no section
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
/**
 * The display scale lives on the MASK spans, not on the <h2>.
 *
 * app/globals.css sets `h2 { font-size: clamp(1.5rem, 2.4vw, 2rem); ... }`
 * OUTSIDE any cascade layer, while Tailwind v4 emits every utility inside
 * `@layer utilities`. Unlayered declarations beat layered ones regardless of
 * specificity, so `text-[...]` / `font-black` / `leading-[...]` placed on the
 * <h2> are silently discarded and the heading stays at 32px. The mask spans
 * are plain <span>s that no element rule targets, so the utilities apply -
 * and because the em-based padding below resolves against the element's own
 * font-size, it has to live on the same element as the type scale anyway.
 *
 * Sizing is in `cqw`, not `vw`: the column is a percentage of a capped
 * container, so above the cap `vw` keeps growing while the column does not,
 * and the line overflows. `cqw` tracks the column itself, which is the box
 * the text actually has to fit inside.
 *
 * The 12cqw coefficient is solved, not guessed - see the width budget in the
 * commit message. It keeps the longest line ("PEOPLE NEED") inside the column
 * *including* the 88px forward glide, measured with a deliberately wide font
 * proxy so a wider-than-expected system face still cannot overflow.
 */
const MASK =
  "block overflow-hidden pt-[0.12em] pb-[0.04em] text-[clamp(2.5rem,12cqw,9.5rem)] font-black leading-[0.86] tracking-[-0.045em]";
const LINE = "editorial-heading-line block will-change-transform";

/** Lines 2 and 4: the site's signature heading cyan, #22d3ee. */
const ACCENT = "text-[#22d3ee] [text-shadow:0_0_0.1em_rgba(34,211,238,0.45)]";
/** Lines 1 and 3. */
const INK = "text-white";

/**
 * Applied to the masked WRAPPER of each line, never to
 * .editorial-heading-line itself: the entrance tween already animates
 * yPercent on that element, and two tweens writing different components of
 * one transform matrix fight each other. Shifting the parent keeps the two
 * animations on separate elements and separate matrices.
 */
const GLIDE_LEFT = "editorial-line-left will-change-transform";
const GLIDE_RIGHT = "editorial-line-right will-change-transform";

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
            duration: 0.55,
            stagger: 0.065,
            ease: "power3.out",
            force3D: true,
            overwrite: "auto",
            scrollTrigger: {
              trigger: node,
              start: "top 88%",
              toggleActions: "play none none reverse",
              invalidateOnRefresh: true,
            },
          },
        );
      }

      /**
       * Opposing glide: lines 2 and 4 forward, lines 1 and 3 backward, at
       * one shared distance so the two groups always separate symmetrically.
       *
       * The cap is not simply 4.2vw. Lines 1 and 3 travel LEFT, into the
       * container's own padding, and between 1440px and 1760px that padding
       * is only 64px - a flat 64px shift would set them exactly on the
       * viewport edge. Measuring the heading's real left offset and holding
       * 12px of it back means the shift can never reach the edge at any
       * width, and because the same number drives both directions the motion
       * stays mirror-symmetric while it scales down.
       */
      const heading = node.querySelector<HTMLElement>("h2");
      const getShiftDistance = () => {
        const gutter = heading ? heading.getBoundingClientRect().left : 0;
        return Math.min(window.innerWidth * 0.042, 64, Math.max(0, gutter - 12));
      };

      const headingGlideTl = gsap.timeline({
        scrollTrigger: {
          trigger: node,
          // Later than the entrance (top 88%) so the lines settle in column
          // before they start to separate.
          start: "top 72%",
          end: "bottom 15%",
          // Inertial lag behind the scrollbar - this is the ~0.6-0.8s the
          // drift trails by, on top of the hold below.
          scrub: 1.1,
          invalidateOnRefresh: true,
        },
      });

      // Dead time at the head of the window: the column holds still for the
      // first ~18% of the scroll pass before anything moves.
      headingGlideTl.to({}, { duration: 0.22 });
      headingGlideTl.addLabel("glide");

      /**
       * fromTo, not to, even though only the end value varies. The trigger
       * sets invalidateOnRefresh so the function-based distance re-solves on
       * resize, and invalidate() on a plain `to` re-reads the start from
       * whatever x the element happens to hold at that moment - a refresh
       * landing mid-glide would re-base the tween from there and the lines
       * would never return to the column. An explicit from pins it at 0.
       */
      headingGlideTl.fromTo(
        ".editorial-line-right",
        { x: 0 },
        { x: () => getShiftDistance(), ease: "none", duration: 1, force3D: true },
        "glide",
      );
      headingGlideTl.fromTo(
        ".editorial-line-left",
        { x: 0 },
        { x: () => -getShiftDistance(), ease: "none", duration: 1, force3D: true },
        "glide",
      );

      const rule = node.querySelector<HTMLElement>("[data-editorial-rule]");
      if (rule) {
        gsap.fromTo(
          rule,
          { scaleX: 0 },
          {
            scaleX: 1,
            duration: 0.5,
            ease: "power3.out",
            delay: 0.3,
            transformOrigin: "left center",
            force3D: true,
            scrollTrigger: {
              trigger: node,
              start: "top 88%",
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
            duration: 0.45,
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

      {/*
        The container widens past 1440px only at 2xl. That is what lets the
        heading grow without starving the diagram: at a 1920 viewport the
        heading column gains ~220px while the diagram column still resolves
        to ~446px of drawing, against 461px before - effectively unchanged.
        Holding 1440 here instead would have forced the diagram down to
        ~350px to buy the same type size.
      */}
      <div className="mx-auto flex w-full max-w-[1440px] flex-col px-6 sm:px-12 lg:flex-row lg:items-stretch lg:px-16 2xl:max-w-[1760px]">
        {/* ---- typography: 52% -> 64% (xl) -> 70% (2xl) ----
          The split only rebalances on wide screens, where there is slack to
          take. Below xl it stays 52/48, because at a 1024 viewport a 70%
          column would leave the diagram under 230px.

          container-type makes this column the reference box for the cqw type
          scale above, so the heading is sized by the space it actually has
          rather than by the viewport. */}
        <div className="flex min-h-[85vh] w-full flex-col justify-between py-12 [container-type:inline-size] lg:min-h-[90vh] lg:w-[52%] lg:py-16 xl:w-[64%] 2xl:w-[70%]">
          {/* No max-w: a 672px cap (max-w-2xl) would wrap the display lines. */}
          <div>
            <h2 className="text-foreground">
              {/*
                Literal capitals rather than lowercase styled by `uppercase`:
                text-transform only changes rendering, so a lowercase source
                would copy to the clipboard in the wrong case. The explicit
                space nodes stop the four block lines concatenating into
                "WHATPEOPLE" in textContent and in the accessible name.
              */}
              <span className={`${MASK} ${GLIDE_LEFT}`}>
                <span className={`${LINE} ${INK}`}>FROM WHAT</span>
              </span>{" "}
              <span className={`${MASK} ${GLIDE_RIGHT}`}>
                <span className={`${LINE} ${ACCENT}`}>PEOPLE NEED</span>
              </span>{" "}
              <span className={`${MASK} ${GLIDE_LEFT}`}>
                <span className={`${LINE} ${INK}`}>TO WHAT</span>
              </span>{" "}
              <span className={`${MASK} ${GLIDE_RIGHT}`}>
                <span className={`${LINE} ${ACCENT}`}>FEELS RIGHT.</span>
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
            className="mt-16 max-w-[340px] font-mono text-sm leading-[1.6] tracking-wide text-white/55 sm:text-[15px]"
          >
            I connect human intent, product behavior and the systems underneath.
          </p>
        </div>

        {/* ---- the drawing: 48% -> 36% (xl) -> 30% (2xl) ----
          Stacks below the typography under lg, which is what guarantees it can
          never overlap the text; no width reservation or hiding needed.
          Above lg the percentages are the complement of the heading column,
          and lg:pl-6 keeps a 24px gap that the glided lines cannot cross. */}
        <div className="flex w-full items-center justify-center pb-12 lg:w-[48%] lg:pb-0 lg:pl-6 xl:w-[36%] 2xl:w-[30%]">
          <NeuralPathway className="pointer-events-none flex w-full items-center justify-center" />
        </div>
      </div>
    </section>
  );
}
