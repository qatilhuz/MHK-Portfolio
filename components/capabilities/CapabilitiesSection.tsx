"use client";

import { useEffect, useRef } from "react";
import { motionEngine, prefersReducedMotion } from "@/lib/motion/engine";

/**
 * Section 03 - Capabilities.
 *
 * Five frosted glass cards floating over the shared cyber rain as a
 * staggered collage. Nothing is painted behind them: the rain is the only
 * backdrop, which is the whole point of the glass.
 */

type Capability = {
  number: string;
  /** Kept verbatim, including the wide spacing around the slash. */
  label: string;
  title: string;
  body: string;
  /**
   * Collage placement. Only applies at lg and above - below that every card
   * sits flat and square in a plain stack, because a tilted card is harder
   * to read and there is no room for the offsets to breathe.
   */
  cell: string;
  tilt: string;
};

const CAPABILITIES: readonly Capability[] = [
  {
    number: "01",
    label: "PRODUCTS  /  WEB APPLICATIONS",
    title: "Digital products & web applications",
    body: "Turn an idea into a useful digital experience. Build responsive web applications that make important tasks clear, accessible, and easy to complete.",
    // Upper right, sitting highest in the top tier.
    cell: "lg:order-2 lg:mt-0",
    tilt: "lg:rotate-[1.5deg]",
  },
  {
    number: "02",
    label: "PLATFORMS  /  DASHBOARDS",
    title: "Business platforms & dashboards",
    body: "Bring information, everyday actions, and operational workflows into a clearer space. Make complex processes easier to understand and manage.",
    // Upper left, stepped down from 01.
    cell: "lg:order-1 lg:mt-8",
    tilt: "lg:-rotate-[1.6deg]",
  },
  {
    number: "03",
    label: "BACKEND  /  APIS  /  DATA",
    title: "Backend systems & API integration",
    body: "Connect the experience to the logic behind it. Build and integrate application functionality, APIs, and data flows that help software work as one system.",
    cell: "lg:order-3 lg:-mt-2 lg:ml-6",
    tilt: "lg:-rotate-[1.8deg]",
  },
  {
    number: "04",
    label: "WORKFLOWS  /  INTEGRATIONS",
    title: "Workflow automation & integrations",
    body: "Reduce avoidable repetition by connecting tools and simplifying routine steps. Focus on practical improvements that make work flow more smoothly.",
    cell: "lg:order-4 lg:mt-6 lg:mr-4",
    tilt: "lg:rotate-[1.7deg]",
  },
  {
    number: "05",
    label: "TESTING  /  QUALITY  /  RELIABILITY",
    title: "Software quality & testing",
    body: "Look beyond whether a feature works once. Check user flows, investigate unexpected behaviour, and improve the reliability of the overall experience.",
    // Bridges the pair above it.
    cell: "md:col-span-2 lg:order-5 lg:-mt-2 lg:mx-auto",
    tilt: "lg:-rotate-[1.2deg]",
  },
];

/**
 * The glass surface. Split out so the hover state can live entirely in CSS
 * next to the resting state.
 *
 * The transition is scoped to the three properties that actually change
 * rather than `all`. `all` would also transition backdrop-filter, which
 * forces the browser to re-sample and re-blur the backdrop on every
 * intermediate frame of the hover - the one property on this card that must
 * never be animated.
 */
const CARD_SURFACE = [
  "group relative flex h-full flex-col rounded-2xl p-6 sm:p-7",
  "bg-[linear-gradient(145deg,rgba(14,30,46,0.58),rgba(6,14,24,0.72))] backdrop-blur-xl",
  "border border-cyan-300/25",
  "shadow-[inset_0_1px_0_0_rgba(165,243,252,0.24),0_18px_45px_-12px_rgba(0,0,0,0.65),0_0_24px_-6px_rgba(34,211,238,0.14)]",
  "transform-gpu transition-[transform,border-color,box-shadow] duration-300 ease-out",
  "hover:border-cyan-300/55",
  "hover:shadow-[inset_0_1px_0_0_rgba(165,243,252,0.4),0_22px_50px_-10px_rgba(0,0,0,0.75),0_0_32px_-4px_rgba(34,211,238,0.28)]",
  "lg:hover:-translate-y-1.5 lg:hover:rotate-0",
].join(" ");

export function CapabilitiesSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const cardsGridRef = useRef<HTMLUListElement>(null);

  useEffect(() => {
    const node = sectionRef.current;
    const grid = cardsGridRef.current;
    if (!node) return;

    const gsap = motionEngine();

    /**
     * Bail before anything is hidden. The hidden state only ever exists as
     * the `from` half of a GSAP tween - never in the markup and never in a
     * stylesheet - so returning here leaves every card and every line of
     * copy fully visible rather than stranding the section blank.
     */
    if (prefersReducedMotion()) return;

    const ctx = gsap.context(() => {
      const header = gsap.utils.toArray<HTMLElement>("[data-capability-head]");
      if (header.length) {
        gsap.fromTo(
          header,
          { y: 28, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.7,
            stagger: 0.1,
            ease: "power3.out",
            force3D: true,
            scrollTrigger: { trigger: node, start: "top 80%", once: true },
          },
        );
      }

      /**
       * The reveal targets the grid item, not the glass panel inside it.
       * The panel carries its collage tilt as a CSS rotation and picks up
       * more transform on hover; a tween writing y and scale onto that same
       * element would be writing the same matrix from two places at once.
       * Animating the wrapper keeps the two completely independent.
       */
      const cards = gsap.utils.toArray<HTMLElement>("[data-capability-card]");
      if (cards.length && grid) {
        gsap.fromTo(
          cards,
          { y: 36, opacity: 0, scale: 0.97 },
          {
            y: 0,
            opacity: 1,
            scale: 1,
            duration: 0.75,
            stagger: 0.1,
            ease: "power3.out",
            force3D: true,
            scrollTrigger: { trigger: grid, start: "top 82%", once: true },
          },
        );
      }

      const closing = node.querySelector<HTMLElement>("[data-capability-closing]");
      if (closing) {
        gsap.fromTo(
          closing,
          { y: 20, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.7,
            ease: "power3.out",
            force3D: true,
            scrollTrigger: { trigger: closing, start: "top 92%", once: true },
          },
        );
      }
    }, node);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      id="capabilities"
      aria-labelledby="capabilities-heading"
      className="relative isolate w-full"
    >
      {/*
        Atmospheric tint only - translucent throughout, so the shared cyber
        rain still reads behind the glass. No wireframes, no circuitry, no
        illustration: the cards have nothing behind them but the rain.
      */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_62%_52%_at_50%_30%,rgba(2,6,23,0.52),transparent_72%)]"
      />

      <div className="relative mx-auto w-full max-w-[1380px] px-6 py-24 sm:px-12 lg:px-16 lg:py-32">
        <header className="max-w-3xl">
          <p
            data-capability-head
            className="font-mono text-xs uppercase tracking-[0.26em] text-cyan-400 sm:text-sm"
          >
            WHAT CAN BE BUILT
          </p>

          {/*
            No font-size or font-weight utility on the <h2> itself: the rule
            in app/globals.css sits outside any cascade layer and Tailwind
            emits utilities inside @layer utilities, so unlayered wins and
            anything set here would be dropped. The element therefore keeps
            the site's standard section-heading scale, which is what every
            other section renders, and the spans carry weight and colour.
          */}
          <h2
            id="capabilities-heading"
            data-capability-head
            className="mt-4 text-balance"
          >
            <span className="font-bold text-white">THE EXPERIENCE PEOPLE SEE.</span>{" "}
            <span className="font-bold text-[#22d3ee] [text-shadow:0_0_0.5em_rgba(34,211,238,0.35)]">
              THE SYSTEMS THAT MAKE IT WORK.
            </span>
          </h2>

          <p
            data-capability-head
            className="mt-5 max-w-2xl text-sm leading-relaxed text-slate-300/85 sm:text-base"
          >
            Good software brings together a clear experience and dependable
            engineering. From the interface people use to the logic and data
            working behind it, every part should serve a real purpose.
          </p>
        </header>

        {/*
          The collage is capped well under the container width. Two 440px
          cards plus the gap come to 904px, so a wider track would strand
          them at opposite edges and the tiers would stop reading as one
          group. Centring the cap keeps the cascade tight.

          gap-6 holds for the flat stack, but the desktop tiers get gap-8. A
          tilted card still occupies an unrotated layout box, so the grid
          reserves no room for the corners the rotation throws outside it: a
          1.8deg tilt on a 440px card pushes its corners ~7px past the box
          top and bottom. Two facing corners plus the -mt-2 overlap eat 13 of
          the 16px gap-6 leaves, which is inside the margin of error on card
          height. gap-8 restores 11px of real clearance at the tightest seam.
        */}
        <ul
          ref={cardsGridRef}
          className="mx-auto mt-14 grid w-full max-w-[940px] list-none grid-cols-1 items-start gap-6 p-0 md:grid-cols-2 lg:mt-20 lg:gap-8"
        >
          {CAPABILITIES.map((item) => (
            <li
              key={item.number}
              data-capability-card
              className={`flex w-full max-w-[440px] justify-self-center ${item.cell}`}
            >
              <article className={`${CARD_SURFACE} ${item.tilt}`}>
                <div className="flex items-start justify-between gap-4">
                  <span
                    aria-hidden="true"
                    className="select-none text-3xl font-black leading-none tracking-tighter text-cyan-200/20 sm:text-4xl"
                  >
                    {item.number}
                  </span>
                  <span className="text-right font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-cyan-300 drop-shadow-[0_0_8px_rgba(34,211,238,0.45)] sm:text-[11px]">
                    {item.label}
                  </span>
                </div>

                <h3 className="mt-2 text-lg font-bold leading-snug tracking-tight text-white sm:text-xl">
                  {item.title}
                </h3>

                <p className="mt-3 text-xs leading-[1.65] text-slate-300/80 sm:text-sm">
                  {item.body}
                </p>
              </article>
            </li>
          ))}
        </ul>

        <div
          data-capability-closing
          className="mt-16 border-t border-cyan-300/15 pt-8 lg:mt-24"
        >
          <p className="mx-auto max-w-2xl text-center font-mono text-sm tracking-tight text-cyan-100/85 sm:font-sans sm:text-base lg:text-lg">
            The best solution is not the most complicated one. It is the one
            that makes the right things easier.
          </p>
        </div>
      </div>
    </section>
  );
}
