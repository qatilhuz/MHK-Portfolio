"use client";

import { useEffect, useRef } from "react";
import { motionEngine } from "@/lib/motion/engine";

const PILL_ROTATIONS = [-7, -9, -5] as const;
const PILL_DISTANCES = [0.7, 0.88, 1.05] as const;
const PATH =
  "M 34 452 C 188 258 318 504 486 326 C 642 160 728 386 926 112";

function CirclePattern() {
  return (
    <svg
      viewBox="0 0 640 280"
      preserveAspectRatio="xMidYMin slice"
      className="absolute right-[-8rem] top-[-9rem] h-[24rem] w-[46rem] opacity-55 md:right-[-4rem] md:top-[-7rem]"
      aria-hidden="true"
    >
      {Array.from({ length: 8 }, (_, index) => (
        <circle
          key={index}
          cx="414"
          cy="116"
          r={36 + index * 31}
          fill="none"
          stroke="#D4DFEA"
          strokeOpacity={Math.max(0.08, 0.34 - index * 0.034)}
          strokeWidth="1.25"
        />
      ))}
      <circle cx="414" cy="116" r="8" fill="#D4DFEA" fillOpacity="0.72" />
    </svg>
  );
}

function CloudShape() {
  return (
    <svg
      viewBox="0 0 1440 900"
      preserveAspectRatio="none"
      className="absolute inset-0 h-full w-full"
      aria-hidden="true"
    >
      <path
        fill="#000000"
        d="M0,900 L0,190 C134,106 234,214 382,140 C520,72 634,172 776,116 C944,50 1056,196 1216,126 C1340,73 1394,112 1440,62 L1440,900 Z"
      />
    </svg>
  );
}

export function GSAPShowcase() {
  const root = useRef<HTMLElement>(null);

  useEffect(() => {
    const node = root.current;
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

      const pathLength = path.getTotalLength();
      const travel = { progress: 0 };
      const setDot = () => {
        const point = path.getPointAtLength(pathLength * travel.progress);
        gsap.set(dot, { x: point.x, y: point.y });
      };

      gsap.set(pattern, { y: 0, opacity: 0.55 });
      gsap.set(pills, {
        xPercent: -50,
        y: 0,
        rotation: (index) => PILL_ROTATIONS[index] ?? -6,
      });
      gsap.set(cloudLayer, { yPercent: 112 });
      gsap.set(cloudCopy, { y: 34, opacity: 0 });
      gsap.set(blueLayer, { yPercent: 112 });
      gsap.set([blueTitle, blueCopy], { y: 38, opacity: 0 });
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
          end: "bottom bottom",
          scrub: 0.72,
          invalidateOnRefresh: true,
        },
      });

      pills.forEach((pill, index) => {
        timeline.to(
          pill,
          {
            y: () => -window.innerHeight * (PILL_DISTANCES[index] ?? 0.8),
            duration: 0.48,
          },
          index * 0.045,
        );
      });
      timeline.to(pattern, { y: () => -window.innerHeight * 0.22, opacity: 0.28, duration: 0.48 }, 0);
      timeline.fromTo(cloudLayer, { yPercent: 112 }, { yPercent: 0, duration: 0.42 }, 0.42);
      timeline.fromTo(cloudCopy, { y: 34, opacity: 0 }, { y: 0, opacity: 1, duration: 0.22 }, 0.76);
      timeline.fromTo(blueLayer, { yPercent: 112 }, { yPercent: 0, duration: 0.34 }, 1.05);
      timeline.to(path, { strokeDashoffset: 0, duration: 0.58 }, 1.28);
      timeline.to(
        travel,
        {
          progress: 1,
          duration: 0.58,
          onUpdate: setDot,
        },
        1.28,
      );
      timeline.fromTo(blueTitle, { y: 38, opacity: 0 }, { y: 0, opacity: 1, duration: 0.24 }, 1.48);
      timeline.fromTo(blueCopy, { y: 38, opacity: 0 }, { y: 0, opacity: 1, duration: 0.24 }, 1.55);
    }, node);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={root}
      aria-label="Interactive scroll showcase"
      className="relative z-[1] h-[340svh] overflow-clip bg-[#050505]"
    >
      <div className="sticky top-0 h-[100svh] overflow-hidden bg-[#050505]">
        <div className="absolute inset-0" aria-hidden="true">
          <div data-showcase-pattern className="absolute inset-0 will-change-transform">
            <CirclePattern />
          </div>
        </div>

        <div className="absolute inset-0 overflow-hidden bg-[#050505]">
          {(["INTERFACE", "ANIMATION", "TECHNIQUES"] as const).map((label, index) => (
            <div
              key={label}
              data-showcase-pill
              className="absolute left-1/2 flex h-[clamp(6.5rem,20vw,14rem)] w-[130vw] items-center justify-center rounded-full bg-white will-change-transform"
              style={{
                top: `${15 + index * 14}svh`,
                transform: `translateX(-50%) rotate(${PILL_ROTATIONS[index] ?? -6}deg)`,
              }}
            >
              <span className="translate-y-[-0.04em] select-none font-sans text-[clamp(3.2rem,10vw,11rem)] font-black leading-none tracking-[-0.075em] text-black">
                {label}
              </span>
            </div>
          ))}
        </div>

        <div
          data-cloud-layer
          className="pointer-events-none absolute inset-0 z-20 translate-y-[112%] overflow-hidden will-change-transform"
          aria-hidden="true"
        >
          <CloudShape />
        </div>

        <div
          data-cloud-copy
          className="absolute inset-0 z-30 grid place-items-center px-6 py-20 text-center opacity-0 will-change-transform"
        >
          <div className="max-w-2xl">
            <p className="font-mono text-[0.68rem] uppercase tracking-[0.32em] text-white/58">
              Craft · Motion · Systems
            </p>
            <p className="mt-6 text-balance text-lg leading-relaxed text-white md:text-2xl">
              Motion is treated as structure: every transition, reveal, and path is
              timed against intent so the interface feels precise, legible, and alive.
            </p>
          </div>
        </div>

        <div
          data-blue-layer
          className="absolute inset-0 z-40 translate-y-[112%] overflow-hidden bg-[#D4DFEA] text-black will-change-transform"
        >
          <div className="absolute inset-0 px-6 py-8 md:px-10 lg:px-14">
            <svg
              viewBox="0 0 960 560"
              preserveAspectRatio="none"
              className="absolute inset-x-0 top-[3svh] h-[68svh] w-full overflow-visible"
              aria-hidden="true"
            >
              <path
                data-showcase-path
                d={PATH}
                fill="none"
                stroke="#000000"
                strokeLinecap="round"
                strokeWidth="5"
              />
              <circle
                data-showcase-dot
                cx="0"
                cy="0"
                r="14"
                fill="#000000"
                stroke="#D4DFEA"
                strokeWidth="4"
              />
            </svg>

            <h2
              data-blue-title
              className="absolute bottom-[clamp(5rem,14svh,9rem)] left-6 max-w-[9ch] font-sans text-[clamp(2.5rem,9vw,10.5rem)] font-black uppercase leading-[0.86] tracking-[-0.075em] opacity-0 will-change-transform md:left-10 lg:left-14"
            >
              1 THE BASICS
            </h2>
            <p
              data-blue-copy
              className="absolute bottom-[clamp(11rem,24svh,14rem)] right-6 max-w-sm text-sm leading-relaxed text-black/70 opacity-0 will-change-transform md:bottom-[clamp(5.5rem,13svh,8.5rem)] md:right-10 md:text-base lg:right-14"
            >
              Strong timing, clear hierarchy, and measured interaction give every
              interface a dependable foundation before the spectacle begins.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
