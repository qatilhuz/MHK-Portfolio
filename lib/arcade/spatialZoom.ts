"use client";

import gsap from "gsap";
import { ARCADE_SPATIAL_SCALE } from "./session";

export const ARCADE_SPATIAL_ROOT_SELECTOR = "[data-arcade-spatial-root]";
export const ARCADE_SPATIAL_EASE = "power3.inOut";

export function getArcadeSpatialRoot() {
  if (typeof document === "undefined") return null;
  return document.querySelector<HTMLElement>(ARCADE_SPATIAL_ROOT_SELECTOR);
}

export function primeArcadeSpatialExit(root: HTMLElement | null) {
  if (!root) return;

  gsap.set(root, {
    transformOrigin: "50% 50%",
    scale: ARCADE_SPATIAL_SCALE,
    opacity: 0,
    pointerEvents: "none",
    willChange: "transform, opacity",
    force3D: true,
  });
}

export function attachArcadeSpatialZoom(timeline: gsap.core.Timeline, root: HTMLElement | null) {
  if (!root) return null;

  const duration = timeline.duration();
  gsap.set(root, {
    transformOrigin: "50% 50%",
    pointerEvents: "none",
    willChange: "transform, opacity",
    force3D: true,
  });

  timeline.fromTo(
    root,
    { scale: 1, opacity: 1 },
    {
      scale: ARCADE_SPATIAL_SCALE,
      opacity: 0,
      duration,
      ease: ARCADE_SPATIAL_EASE,
      force3D: true,
      immediateRender: false,
      overwrite: "auto",
    },
    0,
  );

  return root;
}

export function clearArcadeSpatialZoom(root: HTMLElement | null) {
  if (!root) return;

  gsap.set(root, {
    clearProps: "transform,opacity,pointerEvents,willChange,transformOrigin",
  });
}
