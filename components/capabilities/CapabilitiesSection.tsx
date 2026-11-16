"use client";

import { useEffect, useRef } from "react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { motionEngine, prefersReducedMotion } from "@/lib/motion/engine";

/**
 * Section 03 - Capabilities.
 *
 * On desktop the whole viewport locks in place when this section reaches the
 * top of the screen. The left column never moves; the right column is a fixed
 * stage where cards 01 -> 05 fly up one at a time and stack on each other.
 * When the deck is complete the pin releases and the page continues into
 * Section 04.
 *
 * WHY THIS SECTION USED TO VANISH THE INSTANT IT PINNED, AND WHY IT NO LONGER
 * DOES. This is the whole reason for `pinType: "transform"` below, so it is
 * worth writing down properly.
 *
 * GSAP's default pin (`pinType: "fixed"`) switches the element to
 * `position: fixed` and gives it a `top` measured against the viewport. That
 * only works if the viewport is actually the element's containing block. The
 * real ancestor chain here is:
 *
 *   html / body  (overflow-x: clip)
 *     div[data-arcade-spatial-root].relative.isolate   <- SiteChrome
 *       div.relative.z-[1].flex
 *         main#main-content.flex-1
 *           div.relative.isolate.overflow-hidden       <- cyber rain wrapper
 *             div.relative.z-10
 *               section#capabilities
 *
 * and app/globals.css carries, unconditionally and on every page:
 *
 *   [data-arcade-spatial-root] {
 *     transform-origin: 50% 50%;
 *     backface-visibility: hidden;
 *     transform-style: preserve-3d;    <- the culprit
 *   }
 *
 * `transform-style: preserve-3d` establishes a 3D rendering context, and in
 * Blink/WebKit that makes the element a containing block for fixed-position
 * descendants - exactly like `transform`, `perspective` or `contain: paint`.
 * So the moment the pin engaged, the section's `top: 0` stopped meaning "the
 * top of the viewport" and started meaning "the top of the spatial root",
 * which is the top of the document. The section was duly teleported a couple
 * of viewports above the scroll position and disappeared. `position: sticky`,
 * used by the previous build of this section, is immune to that - which is
 * why the bug only appeared when the pin was introduced.
 *
 * The fix is `pinType: "transform"`: GSAP leaves the element in normal flow
 * and translates it to hold it still instead of taking it out of flow. No
 * containing block can interfere, so this is immune to that CSS rule and to
 * any future transform/filter/contain added anywhere up the chain. It is the
 * same mechanism GSAP uses by default on touch devices. The alternative -
 * deleting `preserve-3d` from globals.css - would reach outside this section
 * into the arcade's zoom transition for no extra benefit.
 *
 * Lenis drives the real window scroll and SmoothScroll already wires
 * `lenis.on("scroll", ScrollTrigger.update)`, so the pin tracks the smoothed
 * position instead of fighting it.
 *
 * RAIN COVERAGE. `pinSpacing: true` leaves a spacer the height of the pinned
 * runway inside the rain wrapper, so the wrapper grows by the full 320% and
 * the rain canvas - `absolute inset-0` of that wrapper - stretches over the
 * entire runway on its own, then stops exactly where Section 04 begins. With
 * transform pinning the section also stays inside that spacer at all times,
 * so the wrapper's `overflow-hidden` has nothing to clip.
 */

type Capability = {
  number: string;
  /** Verbatim, including the wide spacing around the slashes. */
  label: string;
  title: string;
  body: string;
  /** Stacking order: later cards land on top of earlier ones. */
  z: string;
  /** Resting tilt, applied by GSAP - see the note on transform ownership. */
  rotation: number;
};

const CAPABILITIES: readonly Capability[] = [
  {
    number: "01",
    label: "PRODUCTS  /  WEB APPLICATIONS",
    title: "Digital products & web applications",
    body: "Turn an idea into a useful digital experience. Build responsive web applications that make important tasks clear, accessible, and easy to complete.",
    z: "z-10",
    rotation: -1.4,
  },
  {
    number: "02",
    label: "PLATFORMS  /  DASHBOARDS",
    title: "Business platforms & dashboards",
    body: "Bring information, everyday actions, and operational workflows into a clearer space. Make complex processes easier to understand and manage.",
    z: "z-20",
    rotation: 1.5,
  },
  {
    number: "03",
    label: "BACKEND  /  APIS  /  DATA",
    title: "Backend systems & API integration",
    body: "Connect the experience to the logic behind it. Build and integrate application functionality, APIs, and data flows that help software work as one system.",
    z: "z-30",
    rotation: -1.7,
  },
  {
    number: "04",
    label: "WORKFLOWS  /  INTEGRATIONS",
    title: "Workflow automation & integrations",
    body: "Reduce avoidable repetition by connecting tools and simplifying routine steps. Focus on practical improvements that make work flow more smoothly.",
    z: "z-40",
    rotation: 1.3,
  },
  {
    number: "05",
    label: "TESTING  /  QUALITY  /  RELIABILITY",
    title: "Software quality & testing",
    body: "Look beyond whether a feature works once. Check user flows, investigate unexpected behaviour, and improve the reliability of the overall experience.",
    z: "z-50",
    rotation: -0.9,
  },
];

/**
 * The frosted dark-cyan glass, unchanged in character but taken to >=0.90
 * alpha. Every card in a stack is read against another card rather than
 * against the rain, and the card underneath is still lit at 0.35 opacity, so
 * anything lighter would let its headline ghost through the top card. At 0.90
 * over a 2xl backdrop blur the residual bleed is a fraction of a percent.
 */
const CARD_SURFACE = [
  "relative flex flex-col rounded-2xl p-6 sm:p-7",
  "bg-[linear-gradient(145deg,rgba(8,20,34,0.90),rgba(4,11,20,0.94))] backdrop-blur-2xl",
  "border border-cyan-300/30",
  "shadow-[inset_0_1px_0_0_rgba(165,243,252,0.28),0_20px_50px_-12px_rgba(0,0,0,0.8),0_0_28px_-6px_rgba(34,211,238,0.18)]",
].join(" ");

/**
 * Desktop card geometry. `inset-0 + m-auto + h-fit` centres an absolutely
 * positioned card in the stage using nothing but the box model. The obvious
 * alternative - `top-1/2 -translate-y-1/2` - would put a CSS transform on the
 * exact element GSAP animates, and in Tailwind v4 `-translate-y-1/2` compiles
 * to the standalone `translate:` property, which COMPOUNDS with GSAP's
 * `transform` instead of being overridden by it. The card would sit half its
 * height off target for the entire animation.
 */
const CARD_STAGE_POSITION =
  "motion-safe:lg:absolute motion-safe:lg:inset-0 motion-safe:lg:m-auto motion-safe:lg:h-fit motion-safe:lg:max-w-[540px]";

export function CapabilitiesSection() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const gsap = motionEngine();

    // Bail before anything is moved or hidden. Every class that builds the
    // pinned layout is behind `motion-safe:`, so the markup collapses to the
    // same readable column mobile gets - no stranded offscreen cards, no
    // empty runway.
    if (prefersReducedMotion()) return;

    let mm: ReturnType<typeof gsap.matchMedia> | undefined;

    const ctx = gsap.context(() => {
      mm = gsap.matchMedia();

      mm.add("(min-width: 1024px)", () => {
        const cards = gsap.utils.toArray<HTMLElement>("[data-stack-card]");
        if (cards.length !== CAPABILITIES.length) return;
        const [card01, card02, card03, card04, card05] = cards;

        /**
         * Initial states. Card 01 rests on the stage; 02-05 wait one and a
         * bit viewports below it, clipped away by the section's overflow.
         *
         * Both the resting tilt and the travel are written by GSAP rather
         * than by CSS classes. A single element must have a single transform
         * writer: in Tailwind v4 `rotate-*` and `translate-*` emit the
         * standalone `rotate:`/`translate:` properties, which stack on top of
         * GSAP's `transform` matrix rather than yielding to it.
         */
        cards.forEach((card, i) => {
          gsap.set(card, {
            y: i === 0 ? 0 : "115vh",
            scale: 1,
            rotation: CAPABILITIES[i].rotation,
            opacity: 1,
          });
        });

        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: section,
            // The section is exactly h-screen, so "+=320%" - which GSAP
            // resolves against the TRIGGER's height, not the viewport's -
            // is an unambiguous 320vh of runway. Over the 4.6 timeline
            // units below that is ~70vh per overlap: unhurried, and every
            // card gets a long readable beat on top.
            start: "top top",
            end: "+=320%",
            pin: true,
            pinSpacing: true,
            // See the note at the top of this file. An ancestor
            // (`[data-arcade-spatial-root]`) sets `transform-style:
            // preserve-3d`, which makes it the containing block for
            // fixed-position descendants - so the default `pinType: "fixed"`
            // resolved this section's `top` against the document instead of
            // the viewport and threw it off-screen. Transform pinning keeps
            // the element in flow and is immune to that.
            pinType: "transform",
            scrub: 0.5,
            anticipatePin: 1,
          },
        });

        // A beat on lock-up so card 01 is clearly readable before anything
        // starts moving.
        tl.to({}, { duration: 0.25 });

        // 02 over 01.
        tl.to(card01, { scale: 0.95, y: -14, opacity: 0.65, duration: 1, ease: "power2.out" }, "step2")
          .to(card02, { y: 0, duration: 1, ease: "power2.out" }, "step2");

        // 03 over 02.
        tl.to(card01, { scale: 0.91, y: -26, opacity: 0.35, duration: 1, ease: "power2.out" }, "step3")
          .to(card02, { scale: 0.95, y: -14, opacity: 0.65, duration: 1, ease: "power2.out" }, "step3")
          .to(card03, { y: 0, duration: 1, ease: "power2.out" }, "step3");

        // 04 over 03.
        tl.to(card02, { scale: 0.91, y: -26, opacity: 0.35, duration: 1, ease: "power2.out" }, "step4")
          .to(card03, { scale: 0.95, y: -14, opacity: 0.65, duration: 1, ease: "power2.out" }, "step4")
          .to(card04, { y: 0, duration: 1, ease: "power2.out" }, "step4");

        // 05 over 04.
        tl.to(card03, { scale: 0.91, y: -26, opacity: 0.35, duration: 1, ease: "power2.out" }, "step5")
          .to(card04, { scale: 0.95, y: -14, opacity: 0.65, duration: 1, ease: "power2.out" }, "step5")
          .to(card05, { y: 0, duration: 1, ease: "power2.out" }, "step5");

        // Hold on the completed deck before the viewport unlocks.
        tl.to({}, { duration: 0.35 });

        return () => {
          gsap.set(cards, { clearProps: "all" });
        };
      });

      // Below lg nothing is pinned and nothing is stacked - five reading-length
      // cards cannot overlap legibly inside a phone viewport, and trapping the
      // scroll there would be worse. Plain vertical list, transforms cleared.
      mm.add("(max-width: 1023px)", () => {
        gsap.set("[data-stack-card]", { clearProps: "all" });
      });
    }, section);

    /**
     * Re-measure once the section is actually on the page. A pinned trigger
     * caches start/end from getBoundingClientRect() at creation time, and
     * everything above this section settles *after* that: the two lazy R3F
     * canvases in the rain wrapper mount with `ssr: false`, and the hero
     * fonts land later still. Measuring through a layout that is still
     * moving is how a pin ends up starting at the wrong scroll position.
     * One frame later is enough, and it is cancelled on unmount so a fast
     * route change cannot refresh against a torn-down tree.
     */
    const refreshFrame = requestAnimationFrame(() => ScrollTrigger.refresh());

    return () => {
      cancelAnimationFrame(refreshFrame);
      mm?.revert();
      ctx.revert();
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      id="capabilities"
      aria-labelledby="capabilities-heading"
      /*
        `z-20` is explicit rather than auto. The rain canvas sits at z-0 of
        the wrapper and this section's own vignette sits at -z-10; pinning
        rewrites the element's transform and stacking, and an auto z-index
        here is the difference between "above the rain" and "behind it" the
        moment that happens. `w-full` keeps the width from collapsing when
        GSAP measures the element for the pin spacer.
      */
      className="relative isolate z-20 w-full motion-safe:lg:flex motion-safe:lg:h-screen motion-safe:lg:items-center motion-safe:lg:overflow-hidden"
    >
      {/*
        Atmospheric tint only, fully translucent, so the shared cyber rain
        still reads behind the glass. No wireframes, no circuitry, no
        illustration of any kind behind the cards.
      */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_58%_40%_at_50%_18%,rgba(2,6,23,0.5),transparent_72%)]"
      />

      <div className="mx-auto w-full max-w-[1380px] px-6 py-24 sm:px-12 lg:grid lg:grid-cols-12 lg:items-center lg:gap-12 lg:px-16 motion-safe:lg:py-0">
        {/* ---- col-span-5 : locked in place, never moves ---- */}
        <div className="flex flex-col justify-center lg:col-span-5">
          <p className="font-mono text-xs uppercase tracking-[0.26em] text-cyan-400 sm:text-sm">
            WHAT CAN BE BUILT
          </p>

          {/*
            No font-size or font-weight utility on the <h2>. The rule in
            app/globals.css sits outside any cascade layer and Tailwind emits
            utilities inside @layer utilities, so unlayered wins and anything
            set here would be dropped. The element keeps the site's standard
            section-heading scale and the spans carry the weight and the
            white/cyan split.
          */}
          <h2 id="capabilities-heading" className="mt-4 text-balance">
            <span className="font-bold text-white">THE EXPERIENCE PEOPLE SEE.</span>{" "}
            <span className="font-bold text-[#22d3ee] [text-shadow:0_0_0.5em_rgba(34,211,238,0.35)]">
              THE SYSTEMS THAT MAKE IT WORK.
            </span>
          </h2>

          <p className="mt-5 max-w-xl text-sm leading-relaxed text-slate-300/85 sm:text-base">
            Good software brings together a clear experience and dependable
            engineering. From the interface people use to the logic and data
            working behind it, every part should serve a real purpose.
          </p>

          <div className="mt-10 border-t border-cyan-300/15 pt-6">
            <p className="max-w-md font-mono text-sm tracking-tight text-cyan-100/85 sm:font-sans sm:text-base">
              The best solution is not the most complicated one. It is the one
              that makes the right things easier.
            </p>
          </div>
        </div>

        {/* ---- col-span-7 : the card-stacking stage ---- */}
        <div className="mt-14 lg:col-span-7 lg:mt-0">
          <ul className="relative flex list-none flex-col gap-6 p-0 motion-safe:lg:block motion-safe:lg:h-[460px]">
            {CAPABILITIES.map((item) => (
              <li
                key={item.number}
                data-stack-card
                className={`w-full will-change-transform [backface-visibility:hidden] ${CARD_STAGE_POSITION} ${item.z}`}
              >
                <article className={CARD_SURFACE}>
                  <div className="flex items-start justify-between gap-4">
                    <span
                      aria-hidden="true"
                      className="select-none text-4xl font-black leading-none tracking-tighter text-cyan-200/20 sm:text-5xl"
                    >
                      {item.number}
                    </span>
                    <span className="text-right font-mono text-[11px] font-semibold uppercase tracking-[0.18em] text-cyan-300 drop-shadow-[0_0_8px_rgba(34,211,238,0.5)] sm:text-xs">
                      {item.label}
                    </span>
                  </div>

                  <h3 className="mt-3 text-xl font-bold leading-snug tracking-tight text-white sm:text-2xl">
                    {item.title}
                  </h3>

                  <p className="mt-3 text-sm leading-[1.65] text-slate-300/85 sm:text-[15px]">
                    {item.body}
                  </p>
                </article>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
