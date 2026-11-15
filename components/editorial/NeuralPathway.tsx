"use client";

import { useEffect, useRef, type RefObject } from "react";
import { motionEngine, prefersReducedMotion } from "@/lib/motion/engine";

/**
 * One continuous stroke: top edge -> brain silhouette -> brainstem ->
 * serpentine switchbacks -> terminal node.
 *
 * The geometry is generated rather than hand-drawn. The cortex is a scalloped
 * ellipse (radius modulated by sin(6t) to form gyri) whose horizontal radius
 * is pinched across the lower third by a smoothstep, so the silhouette narrows
 * into a brainstem instead of closing as a plain oval. The vertical line that
 * enters from the top edge continues down through the lobe as the longitudinal
 * fissure before becoming the brainstem, which is what lets the whole figure
 * stay a single subpath with no pen lifts.
 *
 * Verified on the generated geometry: one M command, starts exactly at y=0,
 * ends exactly on the node at (150,452), cortex 154.6 units wide at its widest
 * against 55.7 at the neck, and the only self-crossing is the intended
 * fissure/lobe junction.
 */
const PATH_D =
  "M150 0L150 22C155.64 24.53 159.93 29.73 165.18 31.51C170.42 33.28 175.45 32.29 181.47 32.65" +
  "C187.49 33.02 195.81 31.35 201.28 33.69C206.76 36.03 211.97 41.24 214.31 46.72" +
  "C216.65 52.19 214.98 60.51 215.35 66.53C215.71 72.55 214.72 77.58 216.49 82.82" +
  "C218.27 88.07 223.47 92.36 226 98C228.53 103.64 233.14 110.9 231.7 116.65" +
  "C230.26 122.39 224.38 128.34 217.35 132.48C210.32 136.62 196.98 138.14 189.54 141.49" +
  "C182.11 144.83 176.96 147.84 172.75 152.53C168.54 157.22 166.87 165.07 164.27 169.6" +
  "C161.66 174.13 159.51 178.97 157.13 179.7C154.75 180.43 152.16 176.53 150 174" +
  "C147.84 171.47 146.37 166.27 144.2 164.49C142.03 162.72 140.49 163.71 136.98 163.35" +
  "C133.48 162.98 128.77 164.65 123.17 162.31C117.57 159.97 109.14 154.76 103.37 149.28" +
  "C97.59 143.81 91.84 135.49 88.53 129.47C85.22 123.45 85.93 118.42 83.51 113.18" +
  "C81.09 107.93 76.53 103.64 74 98C71.47 92.36 67.57 85.1 68.3 79.35" +
  "C69.03 73.61 73.87 67.66 78.4 63.52C82.93 59.38 90.78 57.86 95.47 54.51" +
  "C100.16 51.17 103.17 48.16 106.51 43.47C109.86 38.78 111.38 30.93 115.52 26.4" +
  "C119.66 21.87 125.61 17.03 131.35 16.3C137.1 15.57 144.36 19.47 150 22L150 174L150 228" +
  "C150 239.05 158.95 248 170 248L222 248C233.05 248 242 256.95 242 268L242 280" +
  "C242 291.05 233.05 300 222 300L90 300C78.95 300 70 308.95 70 320L70 332" +
  "C70 343.05 78.95 352 90 352L222 352C233.05 352 242 360.95 242 372L242 376" +
  "C242 387.05 233.05 396 222 396L170 396C158.95 396 150 404.95 150 416L150 452";

/**
 * Arc-length checkpoints measured on that geometry rather than guessed, so a
 * label sits at the exact height the stroke reaches at its own threshold.
 * `top` is the path's y at `at`, as a percentage of the 500-unit viewBox.
 */
const MARKERS = [
  { label: "INTENT", at: 0.3, top: 14.42 },
  { label: "INTERACTION", at: 0.62, top: 58.99 },
  { label: "SYSTEM", at: 0.8, top: 70.4 },
] as const;

const NODE_AT = 0.95;

const STROKE = {
  strokeWidth: 1.75,
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
     * Writes straight to the DOM. No React state is touched while scrolling,
     * so a scrub frame costs one style write plus three dataset flips and
     * never schedules a render.
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
    // stroke has no dash array and renders complete, so the figure cannot be
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
      <div className="relative w-[120px] lg:w-[196px]">
        <svg
          viewBox="60 0 190 500"
          fill="none"
          aria-hidden="true"
          className="block h-auto w-full overflow-visible"
        >
          {/* Blueprint base track, so the route reads as planned before it is drawn. */}
          <path d={PATH_D} {...STROKE} stroke="rgba(34,211,238,0.12)" />
          <path
            ref={pathRef}
            d={PATH_D}
            {...STROKE}
            stroke="#22d3ee"
            style={{ filter: "drop-shadow(0 0 8px rgba(34,211,238,0.55))" }}
          />
          <g
            ref={nodeRef}
            data-lit="true"
            className="opacity-25 transition-opacity duration-500 data-[lit=true]:animate-pulse data-[lit=true]:opacity-100"
          >
            <circle cx="150" cy="452" r="8" {...STROKE} stroke="#22d3ee" strokeWidth={1.4} />
            <circle cx="150" cy="452" r="3" fill="#22d3ee" stroke="none" />
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
              "pointer-events-auto absolute left-full ml-2 -translate-y-1/2 whitespace-nowrap lg:ml-3",
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
