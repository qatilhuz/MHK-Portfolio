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
 */
const LAYER_CLASS =
  "pointer-events-none absolute inset-0 h-full w-full scale-125 object-contain";

const MASK_RADIUS = 250;

/**
 * Two <video> elements are two independent decoders. autoPlay/loop/muted do
 * not keep them in lockstep - they start whenever each is ready and drift
 * apart, most visibly right after a loop wraps. The greyscale layer is the
 * clock and the colour layer is nudged back whenever it slips past this.
 */
const MAX_DRIFT_SECONDS = 0.08;

function maskFor(x: number, y: number) {
  return `radial-gradient(circle ${MASK_RADIUS}px at ${x}px ${y}px, black 40%, transparent 100%)`;
}

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

  /**
   * The mask is written straight to the node instead of being held in state.
   * A setState per mousemove re-renders this subtree 60-120 times a second,
   * and the subtree contains two decoding <video> elements. Opacity is a
   * class rather than an inline style for the same reason: React never
   * touches the style attribute, so it can never clobber this write.
   */
  const applyMask = useCallback((clientX: number, clientY: number) => {
    const container = containerRef.current;
    const video = colorRef.current;
    if (!container || !video) return;

    const rect = container.getBoundingClientRect();
    const mask = maskFor(clientX - rect.left, clientY - rect.top);
    // webkitMaskImage is not in the DOM typings, so set both longhand.
    video.style.setProperty("-webkit-mask-image", mask);
    video.style.setProperty("mask-image", mask);
  }, []);

  const handleMouseMove = useCallback(
    (event: MouseEvent<HTMLDivElement>) => applyMask(event.clientX, event.clientY),
    [applyMask],
  );

  const handleMouseEnter = useCallback(
    (event: MouseEvent<HTMLDivElement>) => {
      // Position the hole BEFORE fading the layer in. Without this the first
      // hover pops a circle at the container's top-left corner, because the
      // mask still holds its initial 0,0 position for one frame.
      applyMask(event.clientX, event.clientY);
      setIsHovering(true);
    },
    [applyMask],
  );

  const handleMouseLeave = useCallback(() => setIsHovering(false), []);

  // Park the hole in the centre so the very first fade has somewhere sane to
  // come from.
  useEffect(() => {
    const container = containerRef.current;
    const video = colorRef.current;
    if (!container || !video) return;

    const rect = container.getBoundingClientRect();
    const mask = maskFor(rect.width / 2, rect.height / 2);
    video.style.setProperty("-webkit-mask-image", mask);
    video.style.setProperty("mask-image", mask);
  }, [failed]);

  // Keep the colour copy locked to the greyscale one.
  useEffect(() => {
    const base = baseRef.current;
    const color = colorRef.current;
    if (!base || !color) return;

    const resync = () => {
      if (Math.abs(color.currentTime - base.currentTime) > MAX_DRIFT_SECONDS) {
        color.currentTime = base.currentTime;
      }
    };

    base.addEventListener("timeupdate", resync);
    base.addEventListener("play", resync);
    base.addEventListener("seeked", resync);
    return () => {
      base.removeEventListener("timeupdate", resync);
      base.removeEventListener("play", resync);
      base.removeEventListener("seeked", resync);
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
            onError={handleError}
            aria-hidden="true"
            className={LAYER_CLASS}
          />

          <video
            ref={colorRef}
            src={colorSrc}
            autoPlay
            loop
            muted
            playsInline
            preload="auto"
            onError={handleError}
            aria-hidden="true"
            className={cn(
              LAYER_CLASS,
              "transition-opacity duration-300",
              isHovering ? "opacity-100" : "opacity-0",
            )}
          />
        </>
      )}
    </div>
  );
}
