"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type MouseEvent,
  type ReactNode,
} from "react";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { cn } from "@/lib/utils";

/**
 * Flashlight reveal: a greyscale video with a colour copy stacked on top,
 * masked to a soft circle that follows the pointer.
 *
 * Pointer tracking never touches React. The handler writes two CSS custom
 * properties onto the container and nothing else; the mask on the colour
 * layer reads them. The only state left in the component is `failed`, which
 * changes at most once in its lifetime.
 *
 * Both layers share LAYER_CLASS verbatim, so the two copies cannot drift
 * apart by a pixel. The remaining alignment risk is the media itself: if the
 * files have different intrinsic aspect ratios, object-contain letterboxes
 * them differently. Encode both from one master.
 */
const LAYER_CLASS =
  "pointer-events-none absolute inset-0 h-full w-full scale-125 translate-z-0 transform-gpu object-contain " +
  "will-change-transform [backface-visibility:hidden] [contain:layout_paint]";

const MASK_RADIUS = 250;
const MASK_TILE = MASK_RADIUS * 2;
const MASK_GRADIENT = `radial-gradient(circle ${MASK_RADIUS}px at ${MASK_RADIUS}px ${MASK_RADIUS}px, black 40%, transparent 100%)`;
const MASK_SIZE = `${MASK_TILE}px ${MASK_TILE}px`;

/**
 * Module scope on purpose: the object identity never changes, so React has
 * nothing to diff and never rewrites the style attribute. Every frame of
 * movement is handled by the browser substituting --mouse-x / --mouse-y.
 *
 * The gradient is static and only the mask POSITION reads the variables.
 * Putting the variables inside the gradient instead - `circle 250px at
 * var(--mouse-x) var(--mouse-y)` - forces the engine to regenerate and
 * re-rasterise a 500px gradient on every move; offsetting an already
 * rasterised one does not. Same pixels either way: the tile is exactly the
 * circle's diameter, so shifting it by (x - r, y - r) puts the centre on
 * the pointer.
 *
 * The -1000px default parks the mask off-screen, so before the first move
 * the colour layer is simply masked out - there is no corner flash to guard
 * against.
 */
const MASK_POSITION = `calc(var(--mouse-x, -1000px) - ${MASK_RADIUS}px) calc(var(--mouse-y, -1000px) - ${MASK_RADIUS}px)`;

const COLOR_LAYER_STYLE: CSSProperties = {
  WebkitMaskImage: MASK_GRADIENT,
  maskImage: MASK_GRADIENT,
  WebkitMaskSize: MASK_SIZE,
  maskSize: MASK_SIZE,
  WebkitMaskRepeat: "no-repeat",
  maskRepeat: "no-repeat",
  WebkitMaskPosition: MASK_POSITION,
  maskPosition: MASK_POSITION,
};

/**
 * `decoding` is an <img> attribute. The HTML spec does not define it for
 * <video> and React's VideoHTMLAttributes rejects it, so it is spread
 * through an index-signature type. Emitted because the brief asks for it,
 * but inert: video decode scheduling comes from `preload` and the media
 * pipeline, not from this hint.
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
  const [failed, setFailed] = useState(false);

  const rafId = useRef(0);
  const point = useRef({ x: 0, y: 0 });

  const flush = useCallback(() => {
    rafId.current = 0;
    const container = containerRef.current;
    if (!container) return;
    container.style.setProperty("--mouse-x", `${point.current.x}px`);
    container.style.setProperty("--mouse-y", `${point.current.y}px`);
  }, []);

  const handleMouseMove = useCallback(
    (event: MouseEvent<HTMLDivElement>) => {
      // Both layers are pointer-events-none, so this container is always the
      // event target and offsetX/offsetY are already relative to it. That
      // removes getBoundingClientRect from the hot path entirely - no forced
      // layout per move, and no rect cache to invalidate on scroll.
      point.current.x = event.nativeEvent.offsetX;
      point.current.y = event.nativeEvent.offsetY;

      // Coalesce: if a frame is already queued it will read the newest
      // coordinates, so there is nothing to cancel and reschedule.
      if (rafId.current) return;
      rafId.current = requestAnimationFrame(flush);
    },
    [flush],
  );

  useEffect(
    () => () => {
      if (rafId.current) cancelAnimationFrame(rafId.current);
      rafId.current = 0;
    },
    [],
  );

  /**
   * Start both decoders in one task and then leave them alone.
   *
   * There is deliberately no drift correction. Assigning currentTime on a
   * webm forces a seek to the nearest keyframe and flushes the decode
   * buffer, which stutters far worse than any drift it was correcting.
   * autoPlay is also deliberately absent: it starts each element whenever
   * that element happens to be ready, which is precisely what pulls the two
   * apart. Waiting for both to be playable and calling play() together is
   * the whole sync mechanism.
   */
  useEffect(() => {
    if (failed || reducedMotion) return;
    const base = baseRef.current;
    const color = colorRef.current;
    if (!base || !color) return;

    let cancelled = false;

    const startBoth = () => {
      if (cancelled) return;
      // HAVE_FUTURE_DATA on both, or starting now would stall one of them.
      if (base.readyState < 3 || color.readyState < 3) return;
      void Promise.all([base.play(), color.play()]).catch(() => {
        // Autoplay can still be refused; the poster frame is an acceptable
        // resting state and there is nothing useful to retry.
      });
    };

    base.addEventListener("canplay", startBoth);
    color.addEventListener("canplay", startBoth);
    startBoth();

    return () => {
      cancelled = true;
      base.removeEventListener("canplay", startBoth);
      color.removeEventListener("canplay", startBoth);
    };
  }, [failed, reducedMotion]);

  useEffect(() => {
    if (!reducedMotion) return;
    baseRef.current?.pause();
    colorRef.current?.pause();
  }, [reducedMotion, failed]);

  const handleError = useCallback(() => setFailed(true), []);

  return (
    <div
      ref={containerRef}
      onMouseMove={failed ? undefined : handleMouseMove}
      data-hero-video
      aria-label="Showreel: move the pointer to reveal it in colour"
      className={cn(
        // `group` drives the fade through CSS :hover, so hovering does not
        // set state either. overflow stays visible on purpose - the 125%
        // scale is what gives the layers their pop-out.
        //
        // contain is layout-only here, deliberately. `contain: paint` clips
        // every descendant to the padding box, which would amputate the
        // scale-125 pop-out (72px per side) that this component exists for.
        // layout containment still cuts the subtree out of the page's layout
        // graph; the paint containment lives on the video layers instead,
        // where there is nothing to clip.
        "group relative flex w-full items-center justify-center overflow-visible",
        "translate-z-0 transform-gpu [contain:layout]",
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
              // Overrides will-change-transform from LAYER_CLASS (tailwind-merge
              // keeps the last member of the will-change group). mask-image is
              // the requested hint; mask-position is the property that actually
              // animates every frame; transform keeps the compositor promotion
              // that guarantees this layer gets its own GPU surface.
              "will-change-[mask-image,mask-position,transform]",
              "opacity-0 transition-opacity duration-300 group-hover:opacity-100",
            )}
            style={COLOR_LAYER_STYLE}
            {...DECODE_HINTS}
          />
        </>
      )}
    </div>
  );
}
