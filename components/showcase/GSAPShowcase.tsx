"use client";

import { useEffect, useRef } from "react";
import { motionEngine } from "@/lib/motion/engine";

const PILL_LABELS = ["INTERFACE", "ANIMATION", "TECHNIQUES"] as const;
const PILL_ROTATIONS = [-6, -5, -6] as const;
const PILL_OFFSET_X = [-36, 28, -24] as const;
const PILL_REPEAT_Y = [36, 28, 44] as const;
const CURVED_PATH =
  "M 42 448 C 188 238 336 516 500 322 C 662 132 748 394 918 116";

function CirclePattern() {
  return (
    <svg
      viewBox="0 0 720 360"
      preserveAspectRatio="xMidYMin slice"
      className="absolute right-[-9rem] top-[-11rem] h-[28rem] w-[52rem] opacity-55 md:right-[-5rem] md:top-[-10rem]"
      aria-hidden="true"
    >
      {Array.from({ length: 9 }, (_, index) => (
        <circle
          key={index}
          cx="480"
          cy="140"
          r={38 + index * 34}
          fill="none"
          stroke="#D4DFEA"
          strokeOpacity={Math.max(0.07, 0.38 - index * 0.038)}
          strokeWidth="1.15"
        />
      ))}
      <circle cx="480" cy="140" r="7" fill="#D4DFEA" fillOpacity="0.78" />
    </svg>
  );
}

function CloudEdge() {
  return (
    <>
      <svg
        viewBox="0 0 1440 220"
        preserveAspectRatio="none"
        className="absolute inset-x-0 top-0 h-[13.5rem] w-full overflow-visible"
        aria-hidden="true"
      >
        <path
          fill="#000000"
          d="M0,220 L0,134 C104,82 178,150 284,94 C404,32 496,132 622,70 C750,10 820,146 956,78 C1078,18 1170,116 1282,62 C1362,25 1418,44 1440,38 L1440,220 Z"
        />
      </svg>
      <div className="absolute inset-x-0 top-[13.4rem] bottom-0 bg-black" aria-hidden="true" />
    </>
  );
}

export function GSAPShowcase() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const node = containerRef.current;
    if (!node) return;

    const gsap = motionEngine();
    const ctx = gsap.context(() => {
      const pills = gsap.utils.toArray<HTMLElement>("[data-showcase-pill]");
      const pattern = node.querySelector<HTMLElement>("[data-showcase-pattern]");
      const cloudLayer = node.querySelector<HTMLElement>("[data-cloud-layer]");
      const cloudCopy = node.querySelector<HTMLElement>("[data-cloud-copy]");
      const blueLayer = node.querySelector<HTMLElement>("[data-blue-layer]");
      const blueTitle = node.querySelector<HTMLElement>("[data-blue-title]");
      const blueCopy = node.querySelector<HTMLElement>("[data-blue-copy]");
      const path = node.querySelector<SVGPathElement>("[data-showcase-path]");
      const dot = node.querySelector<SVGCircleElement>("[data-showcase-dot]");

      if (
        !pills.length ||
        !pattern ||
        !cloudLayer ||
        !cloudCopy ||
        !blueLayer ||
        !blueTitle ||
        !blueCopy ||
        !path ||
        !dot
      ) {
        return;
      }

      const cloudElement = cloudLayer;
      const blueElement = blueLayer;
      const pathLength = path.getTotalLength();
      const travel = { progress: 0 };
      const setDot = () => {
        const point = path.getPointAtLength(pathLength * travel.progress);
        gsap.set(dot, { x: point.x, y: point.y });
      };

      gsap.set(pattern, { y: 0, opacity: 0.55 });
      pills.forEach((pill, index) => {
        gsap.set(pill, {
          x: PILL_OFFSET_X[index] ?? 0,
          y: 0,
          rotation: PILL_ROTATIONS[index] ?? -6,
          transformOrigin: "50% 50%",
        });
      });
      gsap.set(cloudElement, { yPercent: 100 });
      gsap.set(cloudCopy, { y: 38, opacity: 0 });
      gsap.set(blueElement, { yPercent: 100 });
      gsap.set([blueTitle, blueCopy], { y: 52, opacity: 0 });
      gsap.set(path, {
        strokeDasharray: pathLength,
        strokeDashoffset: pathLength,
      });
      setDot();

      const timeline = gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: {
          trigger: node,
          start: "top top",
          end: "+=4000",
          pin: true,
          pinSpacing: true,
          anticipatePin: 1,
          scrub: 0.65,
          invalidateOnRefresh: true,
        },
      });

      // Step 1 — the pinned scene keeps its viewport while the pills drift upward.
      pills.forEach((pill, index) => {
        timeline.to(
          pill,
          {
            y: PILL_REPEAT_Y[index] ?? 32,
            rotation: PILL_ROTATIONS[index] ?? -6,
            duration: 0.75,
          },
          index * 0.06,
        );
      });
      timeline.to(pattern, { y: -28, opacity: 0.38, duration: 0.7 }, 0);
      timeline.to({}, { duration: 0.1 });

      // Step 2 — the bubbly SVG cap and solid body rise from below the viewport.
      timeline.to(cloudElement, {
        yPercent: 0,
        duration: 1.6,
        ease: "power2.inOut",
      });

      // Step 3 — the centered statement appears only once black covers the frame.
      timeline.to(cloudCopy, {
        y: 0,
        opacity: 1,
        duration: 0.5,
        ease: "power2.out",
      });

      // Step 4 — the pastel canvas cuts over the held frame like a curtain.
      timeline.to(blueElement, {
        yPercent: 0,
        duration: 1.1,
        ease: "power3.inOut",
      });

      // Step 5 — draw the path, move the dot along it, then reveal its labels.
      timeline.to(path, {
        strokeDashoffset: 0,
        duration: 1.1,
        ease: "none",
      });
      timeline.to(
        travel,
        {
          progress: 1,
          duration: 1.1,
          ease: "none",
          onUpdate: setDot,
        },
        "<",
      );
      timeline.to(blueTitle, {
        y: 0,
        opacity: 1,
        duration: 0.5,
        ease: "power2.out",
      });
      timeline.to(blueCopy, {
        y: 0,
        opacity: 1,
        duration: 0.5,
        ease: "power2.out",
      });
      timeline.to({}, { duration: 0.25 });
    }, node);

    return () => ctx.revert();
  }, []);

  return (
    <section
      aria-label="GSAP cinematic scroll showcase"
      className="relative w-full bg-black"
    >
      <div
        ref={containerRef}
        className="relative h-screen w-full overflow-hidden bg-black text-white"
      >
        <div className="absolute inset-0 bg-[#050505]">
          <div
            data-showcase-pattern
            className="pointer-events-none absolute inset-0 z-0 will-change-transform"
            aria-hidden="true"
          >
            <CirclePattern />
          </div>

          <div className="absolute inset-0 z-10 flex items-center justify-center overflow-hidden px-4">
            <div className="relative flex w-full flex-col items-center justify-center">
              {PILL_LABELS.map((label, index) => (
                <div
                  key={label}
                  data-showcase-pill
                  className="flex h-[clamp(6.35rem,18vw,13.5rem)] w-[min(92vw,68rem)] items-center justify-center rounded-full bg-white text-black shadow-[0_0_90px_rgba(212,223,234,0.12)] will-change-transform"
                  style={{ marginTop: index === 0 ? 0 : "-3.15rem" }}
                >
                  <span className="select-none whitespace-nowrap font-sans text-[clamp(3.1rem,9vw,9.4rem)] font-black uppercase leading-none tracking-[-0.08em]">
                    {label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div
          data-cloud-layer
          className="absolute inset-0 z-50 translate-y-full overflow-hidden will-change-transform"
          aria-hidden="true"
        >
          <CloudEdge />
        </div>

        <div
          data-cloud-copy
          className="absolute inset-0 z-[60] grid place-items-center px-6 py-20 text-center opacity-0 will-change-transform"
        >
          <div className="max-w-2xl">
            <p className="font-mono text-[0.68rem] uppercase tracking-[0.34em] text-white/58">
              Transition · 02
            </p>
            <p className="mt-7 text-balance text-lg font-medium leading-relaxed text-white md:text-2xl">
              The frame stays locked while the interface changes beneath it: first
              the pills settle, then the cloud rises, and only then the message lands.
            </p>
          </div>
        </div>

        <div
          data-blue-layer
          className="absolute inset-0 z-[70] translate-y-full overflow-hidden bg-[#D4DFEA] text-black will-change-transform"
        >
          <div className="absolute inset-0 overflow-hidden px-6 py-8 md:px-10 lg:px-14">
            <svg
              viewBox="0 0 960 560"
              preserveAspectRatio="none"
              className="absolute inset-x-0 top-[2svh] h-[68svh] w-full overflow-visible"
              aria-hidden="true"
            >
              <path
                data-showcase-path
                d={CURVED_PATH}
                fill="none"
                stroke="#000000"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="5"
                vectorEffect="non-scaling-stroke"
              />
              <circle
                data-showcase-dot
                cx="0"
                cy="0"
                r="14"
                fill="#000000"
                stroke="#D4DFEA"
                strokeWidth="4"
                vectorEffect="non-scaling-stroke"
              />
            </svg>

            <h2
              data-blue-title
              className="absolute bottom-[clamp(5.25rem,14svh,9.5rem)] left-6 max-w-[9ch] font-sans text-[clamp(2.45rem,9vw,10.5rem)] font-black uppercase leading-[0.85] tracking-[-0.075em] opacity-0 will-change-transform md:left-10 lg:left-14"
            >
              1 THE BASICS
            </h2>
            <p
              data-blue-copy
              className="absolute bottom-[clamp(11.5rem,25svh,15rem)] right-6 max-w-sm text-sm font-medium leading-relaxed text-black/70 opacity-0 will-change-transform md:bottom-[clamp(5.75rem,14svh,9.5rem)] md:right-10 md:text-base lg:right-14"
            >
              Lock the frame, slow the cut, give each object a directional reason,
              and reveal the next canvas only after the previous one has resolved.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
