"use client";

import { useCallback, useEffect, useRef, useState, type MouseEvent, type ReactNode } from "react";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { cn } from "@/lib/utils";

/**
 * Flashlight reveal: a greyscale video with a colour copy stacked on top,
 * masked to a soft circle that follows the pointer.
 *
 * Both layers share LAYER_CLASS verbatim. That is deliberate - the one thing
 * that ruins this effect is a sub-pixel offset between the two copies, and a
 * shared constant makes it impossible for the class lists to drift apart.
 * The remaining alignment risk is the media itself: if the two files have
 * different intrinsic aspect ratios, object-contain letterboxes them
 * differently and they will not line up. Encode them from the same source.
 *
 * Performance notes, in rough order of how much they matter:
 *
 *  1. The mask gradient is built ONCE. Only `mask-position` moves. Rewriting
 *     `mask-image` every frame made the engine re-generate and re-rasterise
 *     a 500px gradient on each pointer event; shifting a cached one is a far
 *     cheaper operation.
 *  2. Pointer events are coalesced into one write per animation frame. A
 *     120Hz mouse on a 60Hz screen otherwise does twice the work it can
 *     possibly display.
 *  3. getBoundingClientRect is cached. Calling it per event forces a
 *     synchronous layout, and this page has backdrop-filter ancestors that
 *     make each one expensive. It is recomputed only after a resize or
 *     scroll actually invalidates it.
 *  4. currentTime is only touched on a real desync (see MAX_DRIFT_SECONDS).
 */
const LAYER_CLASS =
  "pointer-events-none absolute inset-0 h-full w-full scale-125 transform-gpu object-contain " +
  "will-change-[mask-image,transform,opacity] [backface-visibility:hidden]";

const MASK_RADIUS = 250;
const MASK_TILE = MASK_RADIUS * 2;

/**
 * Two <video> elements are two independent decoders, so they drift. Seeking
 * is the expensive cure: setting currentTime flushes the decode buffer and
 * stalls playback, so a tight threshold makes the component stutter far
 * worse than the drift ever would.
 *
 * Drift is measured circularly (modulo duration). Without that, the instant
 * the base clip loops the naive difference jumps to nearly a full duration
 * and triggers a pointless seek on every single loop, which is exactly the
 * buffer-flushing behaviour this is meant to avoid.
 */
const MAX_DRIFT_SECONDS = 0.4;

/**
 * `decoding` is an <img> attribute. The HTML spec does not define it for
 * <video> and React's VideoHTMLAttributes rejects it, so it is spread
 * through an index-signature type. It is emitted because the brief asks for
 * it, but it is inert: video decode scheduling is driven by `preload` and
 * the media pipeline, not by this hint.
 */
const DECODE_HINTS: Record<string, string> = { decoding: "async" };

export function HeroInteractiveVideo({
  baseSrc = "/videos/hero-grayscale.webm",
  colorSrc = "/videos/hero-color.webm",
  fallback,
  className,
}: {
  baseSrc?: string;
  colorSrc?: string;
  /** Rendered instead of the videos if either source fails to load. */
  fallback?: ReactNode;
  className?: string;
}) {
  const reducedMotion = useReducedMotion();
  const containerRef = useRef<HTMLDivElement>(null);
  const baseRef = useRef<HTMLVideoElement>(null);
  const colorRef = useRef<HTMLVideoElement>(null);
  const [isHovering, setIsHovering] = useState(false);
  const [failed, setFailed] = useState(false);

  // Hot-path state lives in refs. None of it may trigger a render: the
  // subtree holds two decoding <video> elements.
  const rectRef = useRef<DOMRect | null>(null);
  const rectDirty = useRef(true);
  const pointer = useRef({ x: 0, y: 0 });
  const rafId = useRef(0);
  const resyncRef = useRef<() => void>(() => {});

  /** Move the hole. Runs at most once per frame, writes two lengths. */
  const flush = useCallback(() => {
    rafId.current = 0;

    const container = containerRef.current;
    const video = colorRef.current;
    if (!container || !video) return;

    if (rectDirty.current || !rectRef.current) {
      rectRef.current = container.getBoundingClientRect();
      rectDirty.current = false;
    }

    const rect = rectRef.current;
    const x = pointer.current.x - rect.left - MASK_RADIUS;
    const y = pointer.current.y - rect.top - MASK_RADIUS;
    const position = `${x}px ${y}px`;
    video.style.setProperty("-webkit-mask-position", position);
    video.style.setProperty("mask-position", position);
  }, []);

  /**
   * Coalescing rather than cancel-and-reschedule: the newest coordinates are
   * read when the frame runs, so dropping intermediate events loses nothing
   * and avoids churning the rAF queue on every pointer event.
   */
  const schedule = useCallback(() => {
    if (rafId.current) return;
    rafId.current = requestAnimationFrame(flush);
  }, [flush]);

  const handleMouseMove = useCallback(
    (event: MouseEvent<HTMLDivElement>) => {
      pointer.current.x = event.clientX;
      pointer.current.y = event.clientY;
      schedule();
    },
    [schedule],
  );

  const handleMouseEnter = useCallback(
    (event: MouseEvent<HTMLDivElement>) => {
      // Position the hole BEFORE fading the layer in. Without this the first
      // hover pops a circle at the container's top-left corner, because the
      // mask still holds its initial position for one frame.
      pointer.current.x = event.clientX;
      pointer.current.y = event.clientY;
      rectDirty.current = true;
      flush();
      // Hover is the natural moment to realign the clips: it is rare, and
      // any seek stall is hidden by the 300ms opacity fade.
      resyncRef.current();
      setIsHovering(true);
    },
    [flush],
  );

  const handleMouseLeave = useCallback(() => setIsHovering(false), []);

  // Build the mask once, park it in the centre, and keep the cached rect
  // honest. Everything is written imperatively so React never owns the style
  // attribute and can never clobber the per-frame position.
  useEffect(() => {
    const container = containerRef.current;
    const video = colorRef.current;
    if (!container || !video) return;

    const gradient = `radial-gradient(circle ${MASK_RADIUS}px at ${MASK_RADIUS}px ${MASK_RADIUS}px, black 40%, transparent 100%)`;
    const size = `${MASK_TILE}px ${MASK_TILE}px`;
    for (const prefix of ["-webkit-mask", "mask"]) {
      video.style.setProperty(`${prefix}-image`, gradient);
      video.style.setProperty(`${prefix}-size`, size);
      video.style.setProperty(`${prefix}-repeat`, "no-repeat");
    }

    const rect = container.getBoundingClientRect();
    rectRef.current = rect;
    rectDirty.current = false;
    pointer.current.x = rect.left + rect.width / 2;
    pointer.current.y = rect.top + rect.height / 2;
    flush();

    // Mark dirty instead of measuring in the handler: scroll and resize fire
    // far too often to afford a layout each time, and the value is not
    // needed until the next frame that actually moves the mask.
    const invalidate = () => {
      rectDirty.current = true;
    };
    window.addEventListener("resize", invalidate, { passive: true });
    window.addEventListener("scroll", invalidate, { passive: true });
    return () => {
      window.removeEventListener("resize", invalidate);
      window.removeEventListener("scroll", invalidate);
    };
  }, [failed, flush]);

  // Cancel any frame still queued when the component goes away.
  useEffect(
    () => () => {
      if (rafId.current) cancelAnimationFrame(rafId.current);
      rafId.current = 0;
    },
    [],
  );

  // Keep the colour copy loosely locked to the greyscale one.
  useEffect(() => {
    const base = baseRef.current;
    const color = colorRef.current;
    if (!base || !color) return;

    const resync = () => {
      const duration = base.duration;
      let drift = color.currentTime - base.currentTime;

      // Circular difference, so a loop wrap is not mistaken for a desync.
      if (Number.isFinite(duration) && duration > 0) {
        drift = ((drift % duration) + duration) % duration;
        if (drift > duration / 2) drift -= duration;
      }

      if (Math.abs(drift) > MAX_DRIFT_SECONDS) {
        color.currentTime = base.currentTime;
      }
    };

    resyncRef.current = resync;
    // timeupdate is ~4Hz, and with a circular 400ms threshold it almost
    // never actually seeks - it is a safety net, not a control loop.
    base.addEventListener("timeupdate", resync);
    base.addEventListener("play", resync);
    return () => {
      base.removeEventListener("timeupdate", resync);
      base.removeEventListener("play", resync);
      resyncRef.current = () => {};
    };
  }, [failed]);

  // Honour reduced motion: hold the first frame rather than autoplaying.
  useEffect(() => {
    if (!reducedMotion) return;
    baseRef.current?.pause();
    colorRef.current?.pause();
  }, [reducedMotion, failed]);

  const handleError = useCallback(() => setFailed(true), []);

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      data-hero-video
      aria-label="Showreel: move the pointer to reveal it in colour"
      className={cn(
        // overflow stays visible on purpose - the 125% scale is what gives
        // the layers their pop-out over the surrounding hero content.
        "relative flex w-full items-center justify-center overflow-visible",
        failed ? undefined : "h-[500px]",
        className,
      )}
    >
      {failed ? (
        fallback
      ) : (
        <>
          <video
            ref={baseRef}
            src={baseSrc}
            autoPlay
            loop
            muted
            playsInline
            preload="auto"
            disablePictureInPicture
            disableRemotePlayback
            onError={handleError}
            aria-hidden="true"
            className={LAYER_CLASS}
            {...DECODE_HINTS}
          />

          <video
            ref={colorRef}
            src={colorSrc}
            autoPlay
            loop
            muted
            playsInline
            preload="auto"
            disablePictureInPicture
            disableRemotePlayback
            onError={handleError}
            aria-hidden="true"
            className={cn(
              LAYER_CLASS,
              "transition-opacity duration-300",
              isHovering ? "opacity-100" : "opacity-0",
            )}
            {...DECODE_HINTS}
          />
        </>
      )}
    </div>
  );
}
