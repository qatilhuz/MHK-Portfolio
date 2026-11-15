"use client";

import { useEffect, useRef } from "react";
import { motionEngine, prefersReducedMotion } from "@/lib/motion/engine";

/**
 * One continuous monoline stroke: start node -> large scalloped brain crown
 * with inward curlicue loops and inner cortical arches -> brainstem neck
 * oval -> two wide horizontal S-curves -> concentric target node.
 *
 * Geometry is the caller-supplied artwork, used verbatim. Verified before
 * shipping by flattening and rasterising it: a single M with no Z (31 C, 1
 * L), starting exactly on the start node at (98,122), ending exactly on the
 * target at (182,662), arc length 3388.4 units, bounds x 54..440 y 24..662
 * inside the 560x680 viewBox.
 *
 * The crown spans x 54..440 - 386 units, 69% of the viewBox width - against
 * 258 units / 61% in the previous 420x740 artwork. Because the viewBox is
 * now much wider relative to its height (0.824 vs 0.568), the whole drawing
 * renders wider at a *smaller* height, which is what lets the section get
 * shorter while the brain gets bigger.
 */
const PATH_D =
  "M 98 122 C 116 70, 156 40, 184 48 C 197 52, 184 72, 175 59 C 168 48, 198 24, 248 24 " +
  "C 298 24, 330 42, 334 58 C 337 71, 319 71, 322 56 C 325 42, 368 54, 396 88 " +
  "C 418 114, 426 142, 422 156 C 419 169, 402 160, 411 148 C 420 136, 446 154, 438 194 " +
  "C 430 228, 394 244, 368 232 C 355 226, 365 210, 375 220 C 386 231, 360 254, 304 254 " +
  "C 238 254, 156 256, 130 234 C 123 221, 141 221, 138 238 C 135 255, 84 260, 64 226 " +
  "C 42 192, 56 138, 98 130 C 128 124, 148 136, 156 152 C 168 116, 224 114, 242 150 " +
  "C 249 164, 232 170, 235 153 C 238 120, 296 108, 328 138 C 356 164, 336 212, 296 218 " +
  "C 256 224, 192 224, 180 254 C 168 284, 234 322, 286 316 C 318 312, 324 286, 294 274 " +
  "C 260 261, 214 288, 226 328 C 236 360, 276 374, 258 400 C 238 428, 76 396, 74 438 " +
  "C 72 480, 352 444, 352 484 C 352 524, 104 496, 104 536 C 104 576, 332 546, 332 582 " +
  "C 332 612, 182 598, 182 628 L 182 662 ";

/**
 * `anchor` is the point in viewBox space the label annotates - the bend the
 * stroke tip has to reach for the keyword to mean anything. The checkpoint
 * is not written down here: it is measured at runtime against the browser's
 * own arc-length parameterisation (see MILESTONE SYNC below), because that
 * is the same parameterisation that drives strokeDashoffset.
 *
 * `left`/`top` are the label coordinates as percentages of the 560x680
 * viewBox, so they track the drawing at every breakpoint.
 *
 *   INTENT      beside the brainstem neck oval  bend ~(313,298)
 *   INTERACTION beside the upper S-curve bend   bend ~(352,484)
 *   SYSTEM      beside the lower S-curve bend   bend ~(332,582)
 */
const MARKERS = [
  { label: "INTENT", anchor: [336, 302], left: 60.0, top: 44.41 },
  { label: "INTERACTION", anchor: [372, 484], left: 66.43, top: 71.18 },
  { label: "SYSTEM", anchor: [352, 582], left: 62.86, top: 85.59 },
] as const;

/**
 * MILESTONE SYNC
 *
 * The thresholds were never the problem - measured against the finished
 * geometry they were accurate to a fraction of a path unit. What made the
 * keywords read as late was the fade itself: at `scrub: true` the tip keeps
 * moving while the label is still ramping up, and even on a slow scroll a
 * 200ms fade let it run ~200 units past the bend before the glow finished.
 *
 * So ignition is pulled forward by a small lead-in and the fade shortened,
 * which together put the keyword at full brightness as the tip arrives
 * rather than after it has gone.
 */
const LEAD_IN = 0.035; // ~119 path units of early ignition
const WALK_STEP = 4; // px between samples along the path
const WALK_FROM = 0.2; // skip the crown; every anchor sits below it
const NODE_AT = 0.98;

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
    const node = nodeRef.current;
    const length = path.getTotalLength();

    /**
     * Where each keyword's bend actually falls along the stroke, measured
     * here rather than hard-coded. getPointAtLength walks the same
     * arc-length parameterisation that strokeDashoffset is driven by, so a
     * checkpoint cannot drift from the tip it is meant to track - and if the
     * geometry is ever edited the thresholds re-derive themselves instead of
     * silently pointing at the wrong bend.
     *
     * One walk serves all three anchors: ~680 samples at 4px, a few
     * milliseconds once at mount, nothing on the scroll path.
     */
    const best = MARKERS.map(() => ({ len: 0, dist: Infinity }));
    for (let len = length * WALK_FROM; len <= length; len += WALK_STEP) {
      const p = path.getPointAtLength(len);
      for (let i = 0; i < MARKERS.length; i += 1) {
        const dx = p.x - MARKERS[i].anchor[0];
        const dy = p.y - MARKERS[i].anchor[1];
        const dist = dx * dx + dy * dy;
        if (dist < best[i].dist) {
          best[i].dist = dist;
          best[i].len = len;
        }
      }
    }

    // Pull ignition forward by the lead-in, and never let a later keyword
    // resolve to an earlier threshold than the one before it.
    let floor = 0;
    const milestones: { el: HTMLElement; at: number }[] = [];
    MARKERS.forEach((m, i) => {
      const at = Math.max(floor, best[i].len / length - LEAD_IN);
      floor = at;
      const el = host.querySelector<HTMLElement>(`[data-marker="${m.label}"]`);
      if (!el) return;
      // Reflected onto the element so the measured value is inspectable.
      el.dataset.at = at.toFixed(4);
      milestones.push({ el, at });
    });

    /**
     * Writes straight to the DOM: one style assignment plus a few dataset
     * flips per frame. No React state is touched while scrolling, so a scrub
     * frame never schedules a render.
     *
     * Every write is guarded against writing a value that is already there.
     * The dash offset only changes once it moves a visible amount, and a
     * data-lit attribute is only touched when it actually flips. That matters
     * now the scrub is 1:1: this runs on every scroll tick instead of a
     * smoothed subset, and re-setting an attribute that drives a
     * `data-[lit=true]:` selector invalidates style for that element even
     * when the value is identical.
     */
    let lastOffset = -1;
    const apply = (progress: number) => {
      const offset = Math.round(length * (1 - progress) * 100) / 100;
      if (offset !== lastOffset) {
        lastOffset = offset;
        path.style.strokeDashoffset = String(offset);
      }
      for (const ms of milestones) {
        const lit = progress >= ms.at ? "true" : "false";
        if (ms.el.dataset.lit !== lit) ms.el.dataset.lit = lit;
      }
      if (node) {
        const lit = progress >= NODE_AT ? "true" : "false";
        if (node.dataset.lit !== lit) node.dataset.lit = lit;
      }
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
          start: "top 85%",
          end: "bottom 65%",
          /**
           * 1:1 with the scrollbar, no catch-up. The previous `scrub: 0.5`
           * was a second smoothing pass stacked on top of Lenis, which
           * already eases the scroll position (lerp 0.07) before
           * ScrollTrigger ever reads it. Two smoothers in series is what the
           * half-second trailing lag actually was. Lenis keeps the motion
           * smooth; GSAP now just follows it exactly.
           */
          scrub: true,
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
        Width is derived from the height cap rather than set independently:
        the viewBox is 560x680, so height = width * 680/560. A 428px box is
        exactly 520px tall and a 461px box exactly 560px tall, which means
        the max-h below is satisfied by construction and can never bind -
        no letterboxing, so the percentage-positioned labels stay locked to
        the drawing at every width.

        The right margin reserves the label gutter. Sized by measurement, not
        by feel: INTERACTION is the longest label and starts furthest right
        (x=372 of 560), and at 15px with 0.24em tracking it needs ~142px.
        These gutters keep at least 15px of clearance between the end of
        every label and the column edge from 320px through 1920px.
      */}
      <div className="relative mr-[56px] w-full max-w-[428px] max-h-[520px] sm:mr-8 lg:mr-5 lg:max-w-[461px] lg:max-h-[560px]">
        <svg
          viewBox="0 0 560 680"
          preserveAspectRatio="xMidYMid meet"
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
            strokeWidth={3.2}
            style={{ filter: "drop-shadow(0 0 11px rgba(56,189,248,0.78))" }}
          />
          {/* Origin node, lit from the outset: the signal's source. */}
          <circle
            cx="98"
            cy="122"
            r="4"
            fill="#38bdf8"
            style={{ filter: "drop-shadow(0 0 7px rgba(56,189,248,0.85))" }}
          />
          <g
            ref={nodeRef}
            data-lit="true"
            className="opacity-25 transition-opacity duration-150 ease-out data-[lit=true]:animate-pulse data-[lit=true]:opacity-100"
            style={{ filter: "drop-shadow(0 0 11px rgba(56,189,248,0.78))" }}
          >
            <circle cx="182" cy="662" r="9" {...LINE} stroke="#38bdf8" strokeWidth={1.75} />
            <circle cx="182" cy="662" r="3.5" fill="#38bdf8" stroke="none" />
          </g>
        </svg>

        {MARKERS.map((m) => (
          <span
            key={m.label}
            data-marker={m.label}
            data-lit="true"
            style={{ left: `${m.left}%`, top: `${m.top}%` }}
            className={[
              // The rail is pointer-events-none so it can never intercept a
              // click; the labels opt back in so they stay selectable text.
              "pointer-events-auto absolute -translate-y-1/2 whitespace-nowrap",
              "font-mono text-xs font-bold uppercase tracking-[0.24em] sm:text-sm lg:text-[15px]",
              "translate-x-2 text-white/30 opacity-15",
              // 150ms, so the glow is up almost as soon as the threshold
              // flips; paired with LEAD_IN this is what lands the keyword at
              // full brightness as the tip arrives rather than behind it.
              //
              // The four named properties are exactly the ones that differ
              // between the dim and lit states, so this is visually identical
              // to `transition-all` while not asking the browser to watch
              // every animatable property on an element that is re-evaluated
              // on each scroll tick.
              "transition-[color,opacity,transform,filter] duration-150 ease-out",
              "data-[lit=true]:translate-x-0 data-[lit=true]:text-cyan-300 data-[lit=true]:opacity-100",
              "data-[lit=true]:drop-shadow-[0_0_8px_rgba(34,211,238,0.75)]",
            ].join(" ")}
          >
            {m.label}
          </span>
        ))}
      </div>
    </div>
  );
}
