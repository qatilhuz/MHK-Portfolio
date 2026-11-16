"use client";

import { useEffect, useRef } from "react";
import { motionEngine, prefersReducedMotion } from "@/lib/motion/engine";

/**
 * Section 03 - Capabilities.
 *
 * Sticky statement on the left, a deck of frosted glass cards on the right
 * that stacks on itself as you scroll. Nothing is painted behind the cards:
 * the shared cyber rain is the only backdrop, which is the point of glass.
 *
 * THE STACKING MECHANIC IS LIFTED FROM components/showcase/Showcase.tsx -
 * the INTERFACE / ANIMATION / TECHNIQUES deck - so this section shares its
 * motion DNA rather than inventing a second dialect:
 *
 *   - a tall outer track, and a CSS `position: sticky` frame inside it.
 *     Showcase uses sticky, never ScrollTrigger's pin, and so does this.
 *   - the cards sit in normal flow inside that frame and are pulled up by
 *     `y: () => -(el.offsetTop)`, so each one lands exactly on the frame's
 *     top edge - which is where the card before it already is. That is what
 *     makes them converge into a deck instead of merely sliding.
 *   - each tween starts at "<0.3", 30% into the one before it, so the deck
 *     cascades rather than stepping.
 *   - ease "none", force3D, overwrite "auto", scrub 2.5, fastScrollEnd.
 *     anticipatePin is the one setting not carried over: it only affects
 *     ScrollTrigger's own pinning, and there is none here.
 *
 * Card 01 is the anchor. Its offsetTop is 0, so it never moves and the rest
 * of the deck arrives on top of it.
 */

type Capability = {
  number: string;
  /** Verbatim, including the wide spacing around the slashes. */
  label: string;
  title: string;
  body: string;
  /** Stacking order: later cards land on top of earlier ones. */
  z: string;
  /** Resting tilt and drift, so the settled deck reads as hand-placed. */
  rest: string;
};

const CAPABILITIES: readonly Capability[] = [
  {
    number: "01",
    label: "PRODUCTS  /  WEB APPLICATIONS",
    title: "Digital products & web applications",
    body: "Turn an idea into a useful digital experience. Build responsive web applications that make important tasks clear, accessible, and easy to complete.",
    z: "z-10",
    rest: "motion-safe:lg:-rotate-[1.4deg]",
  },
  {
    number: "02",
    label: "PLATFORMS  /  DASHBOARDS",
    title: "Business platforms & dashboards",
    body: "Bring information, everyday actions, and operational workflows into a clearer space. Make complex processes easier to understand and manage.",
    z: "z-20",
    rest: "motion-safe:lg:rotate-[1.6deg] motion-safe:lg:translate-x-[10px]",
  },
  {
    number: "03",
    label: "BACKEND  /  APIS  /  DATA",
    title: "Backend systems & API integration",
    body: "Connect the experience to the logic behind it. Build and integrate application functionality, APIs, and data flows that help software work as one system.",
    z: "z-30",
    rest: "motion-safe:lg:-rotate-[1.8deg] motion-safe:lg:-translate-x-[12px]",
  },
  {
    number: "04",
    label: "WORKFLOWS  /  INTEGRATIONS",
    title: "Workflow automation & integrations",
    body: "Reduce avoidable repetition by connecting tools and simplifying routine steps. Focus on practical improvements that make work flow more smoothly.",
    z: "z-40",
    rest: "motion-safe:lg:rotate-[1.3deg] motion-safe:lg:translate-x-[6px]",
  },
  {
    number: "05",
    label: "TESTING  /  QUALITY  /  RELIABILITY",
    title: "Software quality & testing",
    body: "Look beyond whether a feature works once. Check user flows, investigate unexpected behaviour, and improve the reliability of the overall experience.",
    z: "z-50",
    rest: "motion-safe:lg:-rotate-[0.8deg] motion-safe:lg:-translate-x-[4px]",
  },
];

/**
 * The glass itself. Deliberately opaque - 0.78 to 0.88 alpha over a 2xl
 * backdrop blur - because once the deck stacks, every card is reading
 * against another card rather than against the rain, and a lighter surface
 * would let the text underneath bleed through the one on top.
 */
const CARD_SURFACE = [
  "relative flex flex-col rounded-2xl p-6 sm:p-7",
  "bg-[linear-gradient(145deg,rgba(12,28,44,0.78),rgba(5,12,22,0.88))] backdrop-blur-2xl",
  "border border-cyan-300/30",
  "shadow-[inset_0_1px_0_0_rgba(165,243,252,0.28),0_20px_50px_-12px_rgba(0,0,0,0.8),0_0_28px_-6px_rgba(34,211,238,0.18)]",
].join(" ");

export function CapabilitiesSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const node = sectionRef.current;
    const track = trackRef.current;
    if (!node || !track) return;

    const gsap = motionEngine();

    /**
     * Bail before anything moves. The deck's resting layout is a plain
     * vertical list, so a reduced-motion visitor simply reads five cards in
     * order - and the sticky frame, the tall track and the tilts are all
     * behind motion-safe: in the markup, so the layout collapses to that
     * list rather than leaving 320vh of empty runway behind.
     */
    if (prefersReducedMotion()) return;

    const mm = gsap.matchMedia();

    /**
     * Desktop only. Below lg the cards are a flat, square, scroll-normally
     * list: stacking five reading-length cards inside a phone viewport
     * leaves nothing legible underneath the one on top.
     */
    mm.add("(min-width: 1024px)", () => {
      const cards = gsap.utils.toArray<HTMLElement>("[data-stack-card]");
      if (cards.length < 2) return;

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: track,
          start: "top top",
          end: "bottom bottom",
          scrub: 2.5,
          fastScrollEnd: true,
          invalidateOnRefresh: true,
        },
      });

      /**
       * Card 01 is skipped on purpose: its offsetTop is 0, so the tween
       * would be a no-op that still burned a full unit of the runway.
       *
       * fromTo rather than to, because invalidateOnRefresh re-reads a plain
       * to tween's start from wherever the element currently sits - a
       * refresh landing mid-stack would re-base it there and the deck would
       * never come apart again on the way back up. An explicit from pins
       * the start at 0 while still letting the function end value re-solve
       * against the new offsetTop after a resize.
       */
      cards.slice(1).forEach((card, index) => {
        tl.fromTo(
          card,
          { y: 0 },
          {
            y: () => -card.offsetTop,
            duration: 1,
            ease: "none",
            force3D: true,
            overwrite: "auto",
          },
          index === 0 ? 0 : "<0.3",
        );
      });

      // Dwell once the deck is complete, so card 05 gets a long unhurried
      // beat on top before the track releases.
      tl.to({}, { duration: 0.5 });
    });

    return () => mm.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      id="capabilities"
      aria-labelledby="capabilities-heading"
      className="relative isolate w-full"
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

      <div className="relative mx-auto w-full max-w-[1380px] px-6 py-24 sm:px-12 lg:px-16 lg:py-32">
        <div className="flex flex-col gap-14 lg:flex-row lg:items-start lg:gap-12">
          {/* ---- 44% : the statement, pinned ---- */}
          <div className="w-full lg:w-[44%] lg:self-start motion-safe:lg:sticky motion-safe:lg:top-28">
            <p className="font-mono text-xs uppercase tracking-[0.26em] text-cyan-400 sm:text-sm">
              WHAT CAN BE BUILT
            </p>

            {/*
              No font-size or font-weight utility on the <h2>. The rule in
              app/globals.css sits outside any cascade layer and Tailwind
              emits utilities inside @layer utilities, so unlayered wins and
              anything set here would be dropped. The element keeps the
              site's standard section-heading scale and the spans carry the
              weight and the white/cyan split.
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

          {/*
            ---- 56% : the deck ----

            SCROLL RUNWAY, derived rather than picked. start "top top" to
            end "bottom bottom" animates over trackHeight - 100vh, so a
            320vh track gives 220vh of travel. The timeline is four tweens
            of duration 1 cascading at 0.3 (card 01 is the anchor and does
            not move), ending at 1.9, plus 0.5 of dwell = 2.4 units. That
            puts a card on the deck every ~28vh with ~46vh of stillness at
            the end.

            The frame MUST be viewport-tall, not content-tall - the same
            h-screen Showcase uses. A frame sized to its five cards would be
            ~156vh, so it would unstick 56vh before the timeline finished
            and the deck would scroll away mid-stack. At calc(100vh-7rem) it
            stays stuck for 232vh against the 220vh the timeline needs.
          */}
          <div
            ref={trackRef}
            className="w-full lg:w-[56%] motion-safe:lg:min-h-[320vh]"
          >
            <ul className="flex list-none flex-col gap-6 p-0 motion-safe:lg:sticky motion-safe:lg:top-28 motion-safe:lg:h-[calc(100vh-7rem)] motion-safe:lg:gap-10">
              {CAPABILITIES.map((item) => (
                <li
                  key={item.number}
                  data-stack-card
                  className={`relative w-full shrink-0 transform-gpu will-change-transform [backface-visibility:hidden] ${item.z}`}
                >
                  {/*
                    The resting tilt lives here, on the inner panel, while
                    GSAP writes y on the <li> above. Two transforms on one
                    element would be one matrix driven from two places.
                  */}
                  <article className={`${CARD_SURFACE} ${item.rest}`}>
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
      </div>
    </section>
  );
}
