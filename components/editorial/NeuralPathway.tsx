"use client";

import { useEffect, useRef } from "react";
import { motionEngine, prefersReducedMotion } from "@/lib/motion/engine";

/**
 * One continuous monoline stroke: start node -> scalloped brain crown with
 * inward loops -> inner cortical arch -> brainstem neck oval -> two wide
 * horizontal S-curves -> concentric target node.
 *
 * Geometry is the caller-supplied artwork, used verbatim. Verified before
 * shipping by flattening and rasterising it: a single M with no Z, starting
 * exactly on the start node at (126,104), ending exactly on the target at
 * (162,695), total arc length 2458.6 units, bounds x 94..343 y 46..695
 * inside the 420x740 viewBox.
 */
const PATH_D =
  "M 126 104 C 138 74, 162 56, 178 62 C 186 65, 177 77, 172 69 C 168 62, 186 46, 218 46 " +
  "C 248 46, 268 58, 270 68 C 272 76, 260 76, 262 66 C 264 57, 292 64, 310 86 " +
  "C 324 103, 330 120, 328 130 C 326 138, 315 133, 321 125 C 327 117, 346 128, 342 156 " +
  "C 338 178, 314 190, 298 182 C 290 178, 296 167, 303 174 C 310 181, 292 196, 256 196 " +
  "C 214 196, 162 198, 146 184 C 142 175, 153 175, 151 186 C 149 198, 116 202, 102 180 " +
  "C 88 158, 96 120, 124 114 C 144 110, 158 118, 164 128 C 172 104, 206 102, 218 126 " +
  "C 223 136, 212 140, 213 128 C 215 106, 252 98, 272 118 C 290 136, 278 168, 252 172 " +
  "C 226 176, 184 176, 176 198 C 168 220, 212 248, 246 244 C 268 241, 272 222, 252 214 " +
  "C 228 205, 198 224, 206 254 C 214 282, 244 294, 232 316 C 218 340, 96 312, 94 352 " +
  "C 92 392, 286 358, 286 396 C 286 434, 114 406, 114 446 C 114 486, 274 456, 274 494 " +
  "C 274 528, 162 512, 162 548 L 162 695 ";

/**
 * Checkpoints measured on that geometry rather than chosen by feel, so a
 * label lights exactly as the stroke reaches the feature it names. Each
 * `at` is the arc-length fraction of the nearest path point to the anchor;
 * `left`/`top` are the specified label coordinates as percentages of the
 * 420x740 viewBox, so they track the drawing at every breakpoint.
 *
 *   INTENT      t=0.515  beside the brainstem neck oval   (253,242)
 *   INTERACTION t=0.737  beside the upper S-curve bend    (286,396)
 *   SYSTEM      t=0.886  beside the lower S-curve bend    (274,494)
 */
const MARKERS = [
  { label: "INTENT", at: 0.515, left: 66.19, top: 32.43 },
  { label: "INTERACTION", at: 0.737, left: 72.38, top: 53.51 },
  { label: "SYSTEM", at: 0.886, left: 69.52, top: 66.76 },
] as const;

const NODE_AT = 0.985;

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

    // Paced by the section it sits in. Deriving the trigger from the DOM
    // rather than taking a ref prop keeps this component self-contained.
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
          scrub: 0.5,
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
        The right margin reserves the label gutter. The labels are positioned
        in viewBox percentages, so they sit beside the line itself and track
        it as the drawing scales between breakpoints.
      */}
      <div className="relative mr-[52px] w-[232px] sm:mr-[60px] sm:w-[300px] lg:w-[340px]">
        <svg
          viewBox="0 0 420 740"
          fill="none"
          aria-hidden="true"
          className="block h-auto w-full overflow-visible"
        >
          {/* Guide track: the route reads as planned before it is drawn. */}
          <path d={PATH_D} {...LINE} stroke="rgba(56,189,248,0.14)" strokeWidth={2.5} />
          <path
            ref={pathRef}
            d={PATH_D}
            {...LINE}
            stroke="#38bdf8"
            strokeWidth={3}
            style={{ filter: "drop-shadow(0 0 10px rgba(56,189,248,0.75))" }}
          />
          {/* Origin node, lit from the outset: the signal's source. */}
          <circle
            cx="126"
            cy="104"
            r="3.5"
            fill="#38bdf8"
            style={{ filter: "drop-shadow(0 0 6px rgba(56,189,248,0.85))" }}
          />
          <g
            ref={nodeRef}
            data-lit="true"
            className="opacity-25 transition-opacity duration-500 data-[lit=true]:animate-pulse data-[lit=true]:opacity-100"
            style={{ filter: "drop-shadow(0 0 10px rgba(56,189,248,0.75))" }}
          >
            <circle cx="162" cy="695" r="8" {...LINE} stroke="#38bdf8" strokeWidth={1.5} />
            <circle cx="162" cy="695" r="3" fill="#38bdf8" stroke="none" />
          </g>
        </svg>

        {MARKERS.map((m) => (
          <span
            key={m.label}
            data-marker
            data-at={m.at}
            data-lit="true"
            style={{ left: `${m.left}%`, top: `${m.top}%` }}
            className={[
              // The rail is pointer-events-none so it can never intercept a
              // click; the labels opt back in so they stay selectable text.
              "pointer-events-auto absolute -translate-y-1/2 whitespace-nowrap",
              "font-mono text-[10px] font-semibold uppercase tracking-[0.22em] sm:text-xs",
              "translate-x-2 text-white/30 opacity-15",
              "transition-all duration-500 ease-out",
              "data-[lit=true]:translate-x-0 data-[lit=true]:text-cyan-300 data-[lit=true]:opacity-100",
              "data-[lit=true]:drop-shadow-[0_0_6px_rgba(56,189,248,0.7)]",
            ].join(" ")}
          >
            {m.label}
          </span>
        ))}
      </div>
    </div>
  );
}
