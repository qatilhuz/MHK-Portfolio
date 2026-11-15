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
 * `bend` is a point ON the stroke, not the label's own position, so the 2D
 * search below resolves to a near-zero distance and lands on the exact
 * contact length rather than merely the closest approach to some text.
 *
 *   INTENT      neck oval loop          bend (312,300)
 *   INTERACTION upper-right S-curve     bend (352,484)
 *   SYSTEM      lower-right S-curve     bend (332,582)
 */
const MARKERS = [
  { label: "INTENT", bend: [312, 300], left: 60.0, top: 44.41 },
  { label: "INTERACTION", bend: [352, 484], left: 66.43, top: 71.18 },
  { label: "SYSTEM", bend: [332, 582], left: 62.86, top: 85.59 },
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
/**
 * How much faster the line draws per pixel scrolled, relative to the
 * original `top 85%` -> `bottom 65%` window. The start moment is unchanged;
 * the travel is divided by this, so 1.25 means the path completes across
 * 80% of the scroll distance it used to need.
 *
 * Expressed as a speed rather than a new `end` keyword because no fixed
 * percentage can hold 1.25x: `end: "bottom e%"` gives a travel of
 * `(0.85 - e)V + H`, which depends on the section height, so the same
 * literal lands anywhere between 1.14x and 1.21x as H moves with the
 * breakpoint and the text. The pixel form below is exact everywhere.
 */
const DRAW_SPEED = 1.55;

/**
 * Start percentage of `start: "top 85%"` below, as a number. Kept in step
 * with it by hand so the completion maths can reason about where the
 * section sits when the draw ends.
 */
const START_PCT = 0.85;

/**
 * Hard floor on the travel: the line may never finish drawing while its own
 * terminal node is still below the fold.
 *
 * On the stacked layout the diagram sits underneath a min-h-[85vh] text
 * column, so the section is ~1.3x the viewport and a short travel completes
 * the path before the bullseye has scrolled into view - the whole animation
 * would be over by the time you could see it. Measured rather than assumed,
 * so it adapts to however the column actually lays out.
 *
 * Side-by-side layouts finish around 85-90% of the viewport and never reach
 * this floor, so they get the full DRAW_SPEED.
 */
const END_VISIBLE = 0.95;

const CONTACT = 6; // px of contact tolerance before the bend
const WALK_STEP = 2; // px between samples along the path
const WALK_FROM = 0.45; // skip the crown; every bend sits below it
const NODE_TAIL = 4; // node lights within 4px of the end
const VIEWBOX_W = 560;

/**
 * `vector-effect: non-scaling-stroke` is deliberately NOT here any more.
 *
 * It was the reason the tip kept running past the keywords. Dash lengths are
 * applied in whatever space the stroke is computed in, and non-scaling-stroke
 * moves that space to the viewport - while getTotalLength(), which is what
 * strokeDasharray is set from, returns user units. The two disagree by
 * exactly the render scale, so the drawn tip sat at `progress / scale`
 * instead of `progress`: 1.21x ahead at desktop and 2.59x on a small phone,
 * with the line reaching full length at ~0.82 of the scroll range and then
 * sitting complete. The 0.035 lead-in added last turn only cancelled a third
 * of that.
 *
 * Dropping it makes the dash unambiguously user-space, which is the same
 * space the checkpoints are measured in. The rendered stroke weight is then
 * restored exactly by syncStrokeWidth() below, so nothing changes visually.
 */
const LINE = {
  strokeLinecap: "round",
  strokeLinejoin: "round",
  fill: "none",
} as const;

/**
 * Authored stroke weights, in rendered pixels. Held in user units at runtime
 * as `weight * (viewBoxWidth / renderedWidth)` so they look identical to the
 * non-scaling-stroke behaviour they replace, at every breakpoint.
 */
const STROKE = { guide: 2.5, active: 3.2, ring: 1.75 } as const;

export function NeuralPathway({ className }: { className?: string }) {
  const root = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const guideRef = useRef<SVGPathElement>(null);
  const pathRef = useRef<SVGPathElement>(null);
  const nodeRef = useRef<SVGGElement>(null);
  const ringRef = useRef<SVGCircleElement>(null);

  useEffect(() => {
    const path = pathRef.current;
    const host = root.current;
    const svg = svgRef.current;
    // Captured now rather than read in cleanup, where they may already be
    // detached.
    const guide = guideRef.current;
    const ring = ringRef.current;
    if (!path || !host || !svg) return;

    // Paced by the section it sits in. Deriving the trigger from the DOM
    // rather than taking a ref prop keeps this component self-contained.
    const trigger = host.closest("section") ?? host;
    const node = nodeRef.current;
    const totalLength = path.getTotalLength();

    /**
     * Restores the weight non-scaling-stroke used to give for free, without
     * its dash-space side effect: hold each stroke in user units scaled by
     * the inverse of the render scale, so it lands on the same number of
     * device pixels it did before. Re-run on resize because the scale moves
     * with the box.
     */
    const syncStrokeWidth = () => {
      const rendered = svg.getBoundingClientRect().width;
      if (!rendered) return;
      const k = VIEWBOX_W / rendered; // user units per rendered pixel
      path.style.strokeWidth = String(STROKE.active * k);
      if (guide) guide.style.strokeWidth = String(STROKE.guide * k);
      if (ring) ring.style.strokeWidth = String(STROKE.ring * k);
    };
    syncStrokeWidth();
    const resize = new ResizeObserver(syncStrokeWidth);
    resize.observe(svg);

    /**
     * Exact contact length for each keyword, by 2D distance rather than a
     * guessed percentage: walk the path in 2px steps from past the crown and
     * keep the sample that minimises hypot(pt - bend). getPointAtLength uses
     * the same arc-length parameterisation strokeDashoffset is driven by, so
     * a checkpoint cannot drift from the tip it tracks, and editing the
     * geometry re-derives the thresholds instead of silently pointing at the
     * wrong bend.
     *
     * One walk serves all three bends: ~930 samples, a few milliseconds once
     * at mount, nothing on the scroll path.
     */
    const best = MARKERS.map(() => ({ len: 0, dist: Infinity }));
    for (let len = totalLength * WALK_FROM; len <= totalLength; len += WALK_STEP) {
      const pt = path.getPointAtLength(len);
      for (let i = 0; i < MARKERS.length; i += 1) {
        const dist = Math.hypot(pt.x - MARKERS[i].bend[0], pt.y - MARKERS[i].bend[1]);
        if (dist < best[i].dist) {
          best[i].dist = dist;
          best[i].len = len;
        }
      }
    }

    // Ignition the instant the tip touches the bend, less a few px of
    // contact tolerance; never let a later keyword resolve to an earlier
    // threshold than the one before it.
    let floor = 0;
    const milestones: { el: HTMLElement; at: number }[] = [];
    MARKERS.forEach((m, i) => {
      const at = Math.max(floor, best[i].len - CONTACT);
      floor = at;
      const el = host.querySelector<HTMLElement>(`[data-marker="${m.label}"]`);
      if (!el) return;
      // Reflected onto the element so the measured value is inspectable.
      el.dataset.at = at.toFixed(1);
      milestones.push({ el, at });
    });

    /**
     * Writes straight to the DOM: one style assignment plus a few dataset
     * flips per frame. No React state is touched while scrolling, so a scrub
     * frame never schedules a render.
     *
     * Every write is guarded against writing a value that is already there.
     * The dash offset only changes once it moves a visible amount, and a
     * data-active attribute is only touched when it actually flips. That
     * matters now the scrub is 1:1: this runs on every scroll tick instead
     * of a smoothed subset, and re-setting an attribute that drives a
     * `data-[active=true]:` selector invalidates style for that element even
     * when the value is identical.
     *
     * The milestones are compared against the length read back off the
     * element itself rather than against `progress`. The two are equivalent
     * arithmetic today, but reading the live value means the keywords are
     * driven by the exact number the renderer is using - they cannot drift
     * from the stroke even if the offset is ever computed differently.
     */
    let lastOffset = -1;
    const apply = (progress: number) => {
      const offset = Math.round(totalLength * (1 - progress) * 100) / 100;
      if (offset !== lastOffset) {
        lastOffset = offset;
        path.style.strokeDashoffset = String(offset);
      }

      const currentOffset = parseFloat(path.style.strokeDashoffset || String(totalLength));
      const drawnLength = totalLength - currentOffset;

      for (const ms of milestones) {
        const active = drawnLength >= ms.at ? "true" : "false";
        if (ms.el.dataset.active !== active) ms.el.dataset.active = active;
      }
      if (node) {
        const active = drawnLength >= totalLength - NODE_TAIL ? "true" : "false";
        if (node.dataset.active !== active) node.dataset.active = active;
      }
    };

    // Reduced motion gets the finished diagram, never a blank frame.
    if (prefersReducedMotion()) {
      apply(1);
      return () => resize.disconnect();
    }

    // The dash is armed here, not in the markup. If this effect never runs the
    // stroke has no dash array and renders complete, so the drawing cannot be
    // stranded invisible by a JS or GSAP failure.
    path.style.strokeDasharray = String(totalLength);
    apply(0);

    const gsap = motionEngine();
    const playhead = { progress: 0 };
    const ctx = gsap.context(() => {
      gsap.to(playhead, {
        progress: 1,
        /**
         * Linear, so the drawn length is exactly proportional to scroll.
         * Anything else would put the tip ahead of the checkpoints again.
         */
        ease: "none",
        scrollTrigger: {
          trigger,
          start: "top 85%",
          /**
           * Same entry point, 20% less travel.
           *
           * `top 85%` starts at `topDoc - 0.85V` and `bottom 65%` ended at
           * `topDoc + H - 0.65V`, so the original window was exactly
           * `H + 0.20V` pixels. Dividing that by DRAW_SPEED keeps the start
           * frame identical and finishes the path sooner, which is the whole
           * ask. Function form so it is re-evaluated on every refresh and
           * stays correct across resizes and breakpoints.
           */
          end: () => {
            const viewport = window.innerHeight;
            const nominal = (trigger.offsetHeight + 0.2 * viewport) / DRAW_SPEED;
            // Distance from the section's top edge to the end of the line.
            const tail = svg.getBoundingClientRect().bottom - trigger.getBoundingClientRect().top;
            const floor = tail - (END_VISIBLE - START_PCT) * viewport;
            return `+=${Math.max(1, Math.round(Math.max(nominal, floor)))}`;
          },
          /**
           * 1:1 with the scrollbar, no catch-up. The previous `scrub: 0.5`
           * was a second smoothing pass stacked on top of Lenis, which
           * already eases the scroll position (lerp 0.07) before
           * ScrollTrigger ever reads it. Two smoothers in series is what the
           * half-second trailing lag actually was. Lenis keeps the motion
           * smooth; GSAP now just follows it exactly.
           */
          scrub: true,
          /**
           * `invalidateOnRefresh` is deliberately absent. It re-reads a
           * tween's start value from the target on every refresh, and the
           * target here is a plain playhead object. A refresh landing while
           * the playhead sat mid-flight - and refresh fires on window load,
           * on fonts.ready and on an rAF after mount - would re-base the
           * tween from that value, so scroll progress p rendered as
           * `mid + (1 - mid) * p` and the tip ran ahead of the checkpoints
           * for the rest of the page's life. Start and end positions are
           * recalculated on refresh regardless of this flag.
           */
        },
        onUpdate: () => apply(playhead.progress),
      });
    }, host);

    return () => {
      resize.disconnect();
      ctx.revert();
      path.style.strokeDasharray = "";
      path.style.strokeDashoffset = "";
      path.style.strokeWidth = "";
      if (guide) guide.style.strokeWidth = "";
      if (ring) ring.style.strokeWidth = "";
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
          ref={svgRef}
          viewBox="0 0 560 680"
          preserveAspectRatio="xMidYMid meet"
          fill="none"
          aria-hidden="true"
          className="block h-auto w-full overflow-visible"
        >
          {/* Guide track: the route reads as planned before it is drawn. */}
          <path
            ref={guideRef}
            d={PATH_D}
            {...LINE}
            stroke="rgba(56,189,248,0.14)"
            strokeWidth={STROKE.guide}
          />
          <path
            ref={pathRef}
            d={PATH_D}
            {...LINE}
            stroke="#38bdf8"
            strokeWidth={STROKE.active}
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
            data-active="true"
            className="opacity-25 transition-opacity duration-150 ease-out data-[active=true]:animate-pulse data-[active=true]:opacity-100"
            style={{ filter: "drop-shadow(0 0 11px rgba(56,189,248,0.78))" }}
          >
            <circle
              ref={ringRef}
              cx="182"
              cy="662"
              r="9"
              {...LINE}
              stroke="#38bdf8"
              strokeWidth={STROKE.ring}
            />
            <circle cx="182" cy="662" r="3.5" fill="#38bdf8" stroke="none" />
          </g>
        </svg>

        {MARKERS.map((m) => (
          <span
            key={m.label}
            data-marker={m.label}
            data-active="true"
            style={{ left: `${m.left}%`, top: `${m.top}%` }}
            className={[
              // The rail is pointer-events-none so it can never intercept a
              // click; the labels opt back in so they stay selectable text.
              "pointer-events-auto absolute -translate-y-1/2 whitespace-nowrap",
              "font-mono text-xs font-bold uppercase tracking-[0.24em] sm:text-sm lg:text-[15px]",
              // Dim blueprint state. origin-left so the scale grows the word
              // rightwards off a fixed left edge, keeping it pinned to the
              // bend it labels instead of drifting as it snaps in.
              "origin-left translate-x-2 scale-95 text-cyan-200/40 opacity-25",
              "transition-all duration-150 ease-out",
              // Cyber snap on contact.
              "data-[active=true]:translate-x-0 data-[active=true]:scale-100",
              "data-[active=true]:text-cyan-300 data-[active=true]:opacity-100",
              "data-[active=true]:drop-shadow-[0_0_10px_rgba(34,211,238,0.85)]",
            ].join(" ")}
          >
            {m.label}
          </span>
        ))}
      </div>
    </div>
  );
}
