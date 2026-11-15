"use client";

import { useEffect, useRef, type RefObject } from "react";
import { motionEngine, prefersReducedMotion } from "@/lib/motion/engine";

/**
 * One continuous, unbroken stroke: top edge -> cerebral cortex -> corpus
 * callosum -> brainstem -> serpentine switchbacks -> terminal node.
 *
 * A midsagittal (medial) brain, facing left toward the headline. That view was
 * chosen for a structural reason, not an aesthetic one: in a medial section
 * the brainstem already descends from the centre of the base, so the drawing
 * can leave the skull and become the neural pathway without the line ever
 * lifting or doubling back. A lateral profile has no such exit.
 *
 * Built from named anatomical landmarks smoothed with Catmull-Rom, then the
 * superior arc is perturbed by a sine envelope (amplitude 8.5, 5 cycles,
 * faded to zero at both ends) to raise gyri as rounded folds rather than
 * notches. Traversal: crown -> frontal dome -> frontal pole -> orbital base
 * -> brainstem notch -> cerebellum -> occipital -> parietal -> back to the
 * crown, then inward for the corpus callosum C-arc, down through the midbrain
 * and out as the brainstem.
 *
 * Verified on the generated geometry: one M, no Z, starts exactly at y=0,
 * ends exactly on the node at (150,516), 7 cortical folds along the crown,
 * and every region populated - frontal pole, orbital base, cerebellum,
 * occipital, parietal dome and the corpus callosum arc.
 */
const PATH_D =
  "M161.04 0L161.04 8.2C159.12 8.04 157.1 9.96 155.1 11.95" +
  "C153.1 13.93 151.09 17.96 149.03 20.11C146.97 22.27 145.05 24.49 142.76 24.87" +
  "C140.46 25.25 138.06 23.78 135.27 22.4C132.47 21.02 129.16 17.86 125.98 16.57" +
  "C122.8 15.27 119.11 14.03 116.19 14.64C113.28 15.24 110.59 17.61 108.47 20.18" +
  "C106.36 22.76 105.17 27.04 103.5 30.1C101.84 33.16 100.64 36.41 98.49 38.55" +
  "C96.34 40.69 93.62 41.75 90.62 42.95C87.63 44.16 83.73 44.45 80.54 45.78" +
  "C77.34 47.11 73.88 48.67 71.44 50.95C69 53.23 67.27 56.41 65.88 59.48" +
  "C64.5 62.56 64.08 66.13 63.12 69.39C62.17 72.66 61.34 75.91 60.16 79.07" +
  "C58.98 82.23 57.26 85.24 56.02 88.32C54.77 91.41 53.48 94.45 52.7 97.56" +
  "C51.93 100.67 51.63 103.85 51.38 106.98C51.13 110.12 51.05 113.28 51.2 116.37" +
  "C51.35 119.45 51.7 122.45 52.27 125.51C52.84 128.57 53.64 131.71 54.63 134.72" +
  "C55.62 137.73 56.82 140.82 58.19 143.56C59.56 146.3 61.08 148.85 62.86 151.15" +
  "C64.64 153.44 66.7 155.44 68.87 157.32C71.04 159.2 73.48 160.86 75.88 162.41" +
  "C78.27 163.97 80.69 165.41 83.24 166.65C85.78 167.88 88.45 168.9 91.14 169.83" +
  "C93.82 170.76 96.68 171.46 99.37 172.22C102.06 172.97 104.72 173.68 107.27 174.36" +
  "C109.83 175.03 112.26 175.67 114.7 176.25C117.15 176.84 119.52 177.35 121.94 177.84" +
  "C124.37 178.33 126.71 178.89 129.24 179.2C131.77 179.51 134.52 179.53 137.11 179.71" +
  "C139.7 179.89 142.47 179.8 144.76 180.28C147.05 180.76 149.24 181.36 150.84 182.58" +
  "C152.45 183.8 153.37 185.75 154.39 187.6C155.41 189.46 155.91 191.85 156.98 193.7" +
  "C158.05 195.55 159.24 197.24 160.8 198.69C162.36 200.13 164.35 201.28 166.33 202.38" +
  "C168.3 203.48 170.51 204.46 172.63 205.27C174.76 206.09 176.86 206.73 179.07 207.27" +
  "C181.27 207.81 183.58 208.27 185.86 208.52C188.14 208.78 190.57 208.95 192.75 208.81" +
  "C194.93 208.68 197.01 208.35 198.97 207.7C200.93 207.05 202.77 206.05 204.52 204.92" +
  "C206.27 203.78 207.96 202.35 209.48 200.9C210.99 199.44 212.46 197.85 213.61 196.19" +
  "C214.76 194.52 215.56 192.81 216.39 190.92C217.22 189.03 217.74 187.05 218.61 184.85" +
  "C219.48 182.65 220.41 180.31 221.6 177.73C222.8 175.15 224.32 172.32 225.78 169.38" +
  "C227.25 166.45 228.91 163.29 230.39 160.11C231.88 156.94 233.24 153.72 234.68 150.34" +
  "C236.13 146.96 237.68 143.4 239.07 139.83C240.46 136.25 241.99 132.47 243.01 128.88" +
  "C244.04 125.29 244.81 121.76 245.19 118.28C245.58 114.8 245.52 111.39 245.31 108" +
  "C245.11 104.62 244.45 101.29 243.97 97.98C243.49 94.68 243.19 91.39 242.41 88.19" +
  "C241.63 85 240.84 81.7 239.3 78.8C237.76 75.89 235.44 73.19 233.17 70.79" +
  "C230.9 68.39 227.92 66.55 225.68 64.37C223.44 62.19 221.3 60.3 219.72 57.7" +
  "C218.13 55.1 217.35 51.96 216.16 48.76C214.97 45.56 214.36 41.51 212.58 38.51" +
  "C210.8 35.51 208.4 32.4 205.48 30.74C202.57 29.08 198.51 28.68 195.09 28.56" +
  "C191.66 28.44 187.9 29.92 184.95 30.01C181.99 30.11 179.54 30.42 177.37 29.14" +
  "C175.19 27.86 173.67 25.05 171.88 22.34C170.1 19.63 168.47 15.26 166.66 12.9" +
  "C164.86 10.54 162.97 8.36 161.04 8.2C158.7 16.17 153.17 46.03 147 56" +
  "C140.83 65.97 130.5 62.33 124 68C117.5 73.67 109.67 82 108 90C106.33 98 109 109.17 114 116" +
  "C119 122.83 129.67 128.33 138 131C146.33 133.67 156.83 133.17 164 132" +
  "C171.17 130.83 177 123.33 181 124C185 124.67 188.17 131 188 136" +
  "C187.83 141 183.33 148.67 180 154C176.67 159.33 171.83 164.17 168 168" +
  "C164.17 171.83 160 174.67 157 177C154 179.33 151.17 181.17 150 182L150 278" +
  "C150 290.15 159.85 300 172 300L224 300C236.15 300 246 309.85 246 322L246 334" +
  "C246 346.15 236.15 356 224 356L86 356C73.85 356 64 365.85 64 378L64 390" +
  "C64 402.15 73.85 412 86 412L224 412C236.15 412 246 421.85 246 434L246 440" +
  "C246 452.15 236.15 462 224 462L172 462C159.85 462 150 471.85 150 484L150 516";

/**
 * Checkpoints measured on that geometry rather than chosen by feel, so each
 * label illuminates exactly as the stroke arrives at it. `top` is the path's
 * y at `at`, as a percentage of the 560-unit viewBox height.
 *
 *   INTENT      t=0.416  the stroke's last pass through the upper cortex
 *   INTERACTION t=0.657  the first (upper) serpentine bend at x=246
 *   SYSTEM      t=0.783  the lower serpentine bend at x=64
 */
const MARKERS = [
  { label: "INTENT", at: 0.416, top: 12.44 },
  { label: "INTERACTION", at: 0.657, top: 57.5 },
  { label: "SYSTEM", at: 0.783, top: 67.5 },
] as const;

const NODE_AT = 0.95;

const LINE = {
  strokeLinecap: "round",
  strokeLinejoin: "round",
  fill: "none",
  vectorEffect: "non-scaling-stroke",
} as const;

export function NeuralPathway({
  sectionRef,
  className,
}: {
  sectionRef: RefObject<HTMLElement | null>;
  className?: string;
}) {
  const root = useRef<HTMLDivElement>(null);
  const pathRef = useRef<SVGPathElement>(null);
  const nodeRef = useRef<SVGGElement>(null);

  useEffect(() => {
    const path = pathRef.current;
    const host = root.current;
    const section = sectionRef.current;
    if (!path || !host || !section) return;

    const labels = Array.from(host.querySelectorAll<HTMLElement>("[data-marker]"));
    const node = nodeRef.current;
    const length = path.getTotalLength();

    /**
     * Writes straight to the DOM: one style assignment plus a few dataset
     * flips per frame. No React state is touched while scrolling, so a scrub
     * frame never schedules a render.
     */
    const apply = (progress: number) => {
      path.style.strokeDashoffset = String(length * (1 - progress));
      for (const el of labels) {
        el.dataset.lit = progress >= Number(el.dataset.at) ? "true" : "false";
      }
      if (node) node.dataset.lit = progress >= NODE_AT ? "true" : "false";
    };

    // Reduced motion gets the finished diagram, never a blank frame.
    if (prefersReducedMotion()) {
      apply(1);
      return;
    }

    // The dash is armed here, not in the markup. If this effect never runs the
    // stroke has no dash array and renders complete, so the drawing cannot be
    // stranded invisible by a JS or GSAP failure.
    path.style.strokeDasharray = String(length);
    apply(0);

    const gsap = motionEngine();
    const playhead = { progress: 0 };
    const ctx = gsap.context(() => {
      gsap.to(playhead, {
        progress: 1,
        ease: "none",
        scrollTrigger: {
          trigger: section,
          start: "top 75%",
          end: "bottom 75%",
          scrub: 0.6,
          invalidateOnRefresh: true,
        },
        onUpdate: () => apply(playhead.progress),
      });
    }, host);

    return () => {
      ctx.revert();
      path.style.strokeDasharray = "";
      path.style.strokeDashoffset = "";
    };
  }, [sectionRef]);

  return (
    <div ref={root} className={className}>
      {/*
        The right margin reserves the label gutter, so centring this block
        inside the 40% track centres the drawing *and* its labels rather than
        pushing the labels off the edge.
      */}
      <div className="relative mr-[86px] w-[180px] sm:mr-[96px] sm:w-[220px] lg:mr-[104px] lg:w-[240px]">
        <svg
          viewBox="30 0 240 560"
          fill="none"
          aria-hidden="true"
          className="block h-auto w-full overflow-visible"
        >
          {/* Blueprint base track: the route reads as planned before it is drawn. */}
          <path d={PATH_D} {...LINE} stroke="rgba(34,211,238,0.14)" strokeWidth={1.25} />
          <path
            ref={pathRef}
            d={PATH_D}
            {...LINE}
            stroke="#22d3ee"
            strokeWidth={2}
            style={{ filter: "drop-shadow(0 0 10px rgba(34,211,238,0.65))" }}
          />
          <g
            ref={nodeRef}
            data-lit="true"
            className="opacity-25 transition-opacity duration-500 data-[lit=true]:animate-pulse data-[lit=true]:opacity-100"
          >
            <circle cx="150" cy="516" r="8" {...LINE} stroke="#22d3ee" strokeWidth={1.5} />
            <circle cx="150" cy="516" r="3" fill="#22d3ee" stroke="none" />
          </g>
        </svg>

        {MARKERS.map((m) => (
          <span
            key={m.label}
            data-marker
            data-at={m.at}
            data-lit="true"
            style={{ top: `${m.top}%` }}
            className={[
              // The rail is pointer-events-none so it can never intercept a
              // click; the labels opt back in so they stay selectable text.
              "pointer-events-auto absolute left-full ml-3 -translate-y-1/2 whitespace-nowrap",
              "font-mono text-[9px] uppercase tracking-[0.22em] sm:text-[10px]",
              "translate-x-2 text-white/30 opacity-15",
              "transition-all duration-500 ease-out",
              "data-[lit=true]:translate-x-0 data-[lit=true]:text-cyan-300 data-[lit=true]:opacity-100",
              "data-[lit=true]:drop-shadow-[0_0_6px_rgba(34,211,238,0.6)]",
            ].join(" ")}
          >
            {m.label}
          </span>
        ))}
      </div>
    </div>
  );
}
