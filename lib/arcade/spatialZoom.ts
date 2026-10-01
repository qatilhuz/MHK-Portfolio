"use client";

import gsap from "gsap";
import { ARCADE_SPATIAL_SCALE, ARCADE_TRANSITION_LOCK_CLASS } from "./session";

export const ARCADE_SPATIAL_ROOT_SELECTOR = "[data-arcade-spatial-root]";
export const ARCADE_SPATIAL_EASE = "power4.inOut";
export const ARCADE_SPATIAL_DURATION = 1.98;

function prepareArcadeGsapTicker() {
  gsap.ticker.lagSmoothing(0);
}

function setGlobalTransitionLock(locked: boolean) {
  if (typeof document === "undefined") return;
  document.body.classList.toggle(ARCADE_TRANSITION_LOCK_CLASS, locked);
}

function activateSpatialRoot(root: HTMLElement | null) {
  if (!root) return;
  root.dataset.arcadeSpatialActive = "true";
}

export function getArcadeSpatialRoot() {
  if (typeof document === "undefined") return null;
  return document.querySelector<HTMLElement>(ARCADE_SPATIAL_ROOT_SELECTOR);
}

export function primeArcadeSpatialExit(root: HTMLElement | null) {
  prepareArcadeGsapTicker();
  if (!root) return;

  setGlobalTransitionLock(true);
  activateSpatialRoot(root);
  root.style.transformOrigin = "50% 50%";
  root.style.transform = `translate3d(0, 0, 0) scale(${ARCADE_SPATIAL_SCALE})`;
  root.style.opacity = "0";
  root.style.pointerEvents = "none";
  root.style.willChange = "transform, opacity";
}

export function attachArcadeSpatialZoom(timeline: gsap.core.Timeline, root: HTMLElement | null) {
  prepareArcadeGsapTicker();
  setGlobalTransitionLock(true);
  if (!root) return null;

  const duration = timeline.duration();
  activateSpatialRoot(root);
  gsap.killTweensOf(root);
  gsap.set(root, {
    transformOrigin: "50% 50%",
    pointerEvents: "none",
    willChange: "transform, opacity",
    force3D: true,
    transformPerspective: 1000,
  });

  timeline.fromTo(
    root,
    { scale: 1, opacity: 1, force3D: true },
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

export function releaseArcadeSpatialInputLock() {
  setGlobalTransitionLock(false);
}

export function clearArcadeSpatialZoom(root: HTMLElement | null) {
  setGlobalTransitionLock(false);
  if (!root) return;

  delete root.dataset.arcadeSpatialActive;
  gsap.killTweensOf(root);
  gsap.set(root, {
    clearProps: "transform,opacity,pointerEvents,willChange,transformOrigin,transformPerspective",
  });
}


export function runArcadeReturnZoom(root: HTMLElement | null, onComplete?: () => void) {
  prepareArcadeGsapTicker();
  setGlobalTransitionLock(true);
  if (!root) {
    setGlobalTransitionLock(false);
    onComplete?.();
    return;
  }

  activateSpatialRoot(root);
  gsap.killTweensOf(root);
  gsap.set(root, {
    transformOrigin: "50% 50%",
    scale: ARCADE_SPATIAL_SCALE,
    opacity: 0,
    pointerEvents: "none",
    willChange: "transform, opacity",
    force3D: true,
    transformPerspective: 1000,
  });
  requestAnimationFrame(() => {
    gsap.to(root, {
      scale: 1,
      opacity: 1,
      duration: ARCADE_SPATIAL_DURATION,
      ease: ARCADE_SPATIAL_EASE,
      force3D: true,
      overwrite: "auto",
      onComplete: () => {
        clearArcadeSpatialZoom(root);
        onComplete?.();
      },
    });
  });
}

export function runArcadeExitHandoff(onComplete: () => void) {
  prepareArcadeGsapTicker();
  if (typeof document === "undefined") {
    onComplete();
    return;
  }

  setGlobalTransitionLock(true);
  const root = document.querySelector<HTMLElement>(".arcade-world");
  if (!root) {
    requestAnimationFrame(onComplete);
    return;
  }

  root.dataset.arcadeHandoffActive = "true";
  gsap.killTweensOf(root);
  gsap.set(root, {
    transformOrigin: "50% 50%",
    pointerEvents: "none",
    willChange: "transform, opacity",
    force3D: true,
    transformPerspective: 1000,
  });
  gsap.to(root, {
    scale: 0.985,
    opacity: 0,
    duration: 0.22,
    ease: ARCADE_SPATIAL_EASE,
    force3D: true,
    overwrite: "auto",
    onComplete,
  });
}
