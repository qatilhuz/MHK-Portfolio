"use client";

import { useEffect, useRef } from "react";
import { motionEngine, prefersReducedMotion } from "@/lib/motion/engine";

/**
 * One continuous monoline stroke: top edge -> scalloped looped brain ->
 * serpentine switchbacks -> terminal node.
 *
 * The brain is the caller-supplied monoline artwork: a scalloped dome whose
 * folds each resolve into a tight self-intersecting curlicue, base loops at
 * the lower left and lower right, and an inner cortical arch carrying a
 * downward-hanging loop at its centre. Eight self-intersections in total.
 *
 * Two deliberate departures from the supplied `d`, both structural:
 *
 * 1. The supplied dome is a closed cycle - it returns to the crown it starts
 *    from. A cycle always ends where it began, so it cannot offer a separate
 *    exit for the pathway: covering every arc of a cycle and finishing
 *    somewhere else is impossible without either omitting an arc or adding
 *    one. Omitting would have deleted the entire right side of the dome, so
 *    one chord is added instead, from the crown down to the lower-right base.
 *    It is given its own curlicue so it reads as a parieto-occipital fold in
 *    the same visual language rather than as a connector.
 *
 * 2. The supplied inner arch terminated with two segments that reversed
 *    direction along the same horizontal (`... 250 206, 234 206` then
 *    `254 206, ...`). That is a 180-degree cusp, which renders as a flat
 *    spike rather than a curve. It is rewritten as a small curl matching the
 *    other folds.
 *
 * Verified on the final geometry: one M, no Z, starts exactly at y=0, ends
 * exactly on the node at (150,640), 8 self-intersections.
 */
const PATH_D =
  "M205 0L205 46C182 40 152 46 138 64C131 73 143 79 147 69C150 61 136 56 118 64" +
  "C94 74 76 94 72 114C70 125 83 127 84 117C85 107 68 106 52 122C26 148 26 202 56 228" +
  "C74 244 98 246 110 238C118 232 108 222 102 232C96 242 114 250 120 234" +
  "C126 216 116 184 134 162C152 140 184 142 196 158C203 167 191 175 188 165" +
  "C185 155 202 144 226 144C254 144 274 162 272 184C262 198 240 202 232 210" +
  "C226 218 238 222 242 212C246 202 262 212 282 224C287 234 274 240 271 230" +
  "C268 220 286 218 304 226C326 236 344 214 342 186C340 168 324 162 318 172" +
  "C313 180 326 186 334 174C344 158 338 122 314 98C296 80 272 74 258 82C250 87 258 97 264 89" +
  "C270 81 254 62 228 52C216 48 208 46 205 46C236 64 258 92 268 124C272 138 262 146 256 138" +
  "C250 130 264 120 276 132C292 149 300 196 304 226L304 314C304 328.36 292.36 340 278 340" +
  "L96 340C81.6402 340 70 351.64 70 366L70 404C70 418.36 81.6402 430 96 430L304 430" +
  "C318.36 430 330 441.64 330 456L330 494C330 508.36 318.36 520 304 520L176 520" +
  "C161.64 520 150 531.64 150 546L150 640";

/**
 * Checkpoints measured on that geometry rather than chosen by feel, so each
 * label illuminates exactly as the stroke arrives beside it. `top` is the
 * path's y at `at`, as a percentage of the 672-unit viewBox height.
 *
 *   INTENT      t=0.551  the dome is complete and the stroke leaves the crown
 *   INTERACTION t=0.740  the upper serpentine bend at x=70
 *   SYSTEM      t=0.893  the lower serpentine bend at x=330
 */
const MARKERS = [
  { label: "INTENT", at: 0.551, top: 16.35 },
  { label: "INTERACTION", at: 0.74, top: 51.73 },
  { label: "SYSTEM", at: 0.893, top: 76.25 },
] as const;

const NODE_AT = 0.96;

const LINE = {
  strokeLinecap: "round",
  strokeLinejoin: "round",
  fill: "none",
  vectorEffect: "non-scaling-stroke",
} as const;

export function NeuralPathway({ className }: { className?: string }) {
  const root = useRef<HTMLDivElement>(null);
  const pathRef = useRef<SVGPathElement>(null);
  const nodeRef = useRef<SVGGElement>(null);

  useEffect(() => {
    const path = pathRef.current;
    const host = root.current;
    if (!path || !host) return;

    // The drawing is paced by the section it sits in. Deriving the trigger
    // from the DOM instead of taking a ref prop keeps the parent free of
    // client-side state, so it can stay a server component like the rest of
    // the page's sections.
    const trigger = host.closest("section") ?? host;
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
          trigger,
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
  }, []);

  return (
    <div ref={root} className={className}>
      {/*
        The right margin reserves the label gutter, so centring this block in
        the 40% track centres the drawing *and* its labels rather than pushing
        the labels past the edge.
      */}
      <div className="relative mr-[96px] w-[188px] sm:mr-[104px] sm:w-[228px] lg:mr-[112px] lg:w-[248px]">
        <svg
          viewBox="22 0 334 672"
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
            style={{ filter: "drop-shadow(0 0 10px rgba(34,211,238,0.6))" }}
          />
          <g
            ref={nodeRef}
            data-lit="true"
            className="opacity-25 transition-opacity duration-500 data-[lit=true]:animate-pulse data-[lit=true]:opacity-100"
          >
            <circle cx="150" cy="640" r="8" {...LINE} stroke="#22d3ee" strokeWidth={1.5} />
            <circle cx="150" cy="640" r="3" fill="#22d3ee" stroke="none" />
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
