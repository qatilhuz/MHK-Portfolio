"use client";

import { useEffect } from "react";

/**
 * Global scroll pacing.
 *
 * The site has no smooth-scroll library (no Lenis), so wheel/trackpad input is
 * damped natively instead: every wheel tick travels 0.8x of its default
 * distance, which makes the whole page feel slightly heavier and smoother.
 *
 * Section-level pacing is untouched — ScrollTrigger scrubs (Showcase 2.5,
 * Experience 1.5) keep their own slower, custom timing because this only
 * scales the raw input delta, never the animations.
 */
const SCROLL_MULTIPLIER = 0.8;
const LINE_HEIGHT_PX = 16;

function hasScrollableAncestor(target: EventTarget | null) {
  let node = target instanceof Element ? target : null;

  while (node && node !== document.body && node !== document.documentElement) {
    const { overflowY } = window.getComputedStyle(node);
    const scrollable =
      (overflowY === "auto" || overflowY === "scroll") &&
      node.scrollHeight > node.clientHeight + 1;

    if (scrollable) return true;
    node = node.parentElement;
  }

  return false;
}

export function GlobalScrollSpeed() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const onWheel = (event: WheelEvent) => {
      // Never fight another handler that already took control of this gesture
      // (for example the guided-tour scroll gate).
      if (event.defaultPrevented) return;
      // Browser zoom and page-mode deltas stay native.
      if (event.ctrlKey || event.metaKey || event.deltaMode === 2) return;
      if (!event.deltaY || Math.abs(event.deltaX) > Math.abs(event.deltaY)) return;
      // Inner scroll areas (chat log, terminal output, menus) stay native.
      if (hasScrollableAncestor(event.target)) return;

      const delta =
        event.deltaMode === 1 ? event.deltaY * LINE_HEIGHT_PX : event.deltaY;

      event.preventDefault();
      window.scrollBy({
        top: delta * SCROLL_MULTIPLIER,
        left: 0,
        behavior: "auto",
      });
    };

    window.addEventListener("wheel", onWheel, { passive: false });
    return () => window.removeEventListener("wheel", onWheel);
  }, []);

  return null;
}
