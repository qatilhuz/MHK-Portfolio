"use client";

import gsap from "gsap";
import { ARCADE_SPATIAL_SCALE, ARCADE_TRANSITION_LOCK_CLASS } from "./session";

export const ARCADE_SPATIAL_ROOT_SELECTOR = "[data-arcade-spatial-root]";
export const ARCADE_SPATIAL_EASE = "power4.inOut";
export const ARCADE_SPATIAL_DURATION = 1.98;

/**
 * The return trip gets its own pacing. Entering is a push *into* the monitor,
 * so `power4.inOut` over ~2s reads as deliberate. Coming back is a reveal, and
 * a slow-in ease means the visitor stares at a black screen for most of a
 * second after clicking "Exit" - which feels like lag whether or not a single
 * frame is dropped. Fast-out gets the page on screen immediately and lets it
 * settle. The enter transition is deliberately left untouched.
 */
export const ARCADE_RETURN_EASE = "power3.out";
export const ARCADE_RETURN_DURATION = 1.1;

/** Fired on window once the page is fully handed back. */
export const ARCADE_RETURN_SETTLED_EVENT = "arcade:return-settled";

let returnInFlight = false;

/** True while the return zoom is playing: heavy work must stay off the main thread. */
export function isArcadeReturnActive() {
  return returnInFlight;
}

/**
 * Run `callback` once the return transition is over. Fires immediately when no
 * transition is in flight, so callers do not need to branch.
 * Returns an unsubscribe function.
 */
export function onArcadeReturnSettled(callback: () => void) {
  if (typeof window === "undefined" || !returnInFlight) {
    callback();
    return () => {};
  }

  const handler = () => callback();
  window.addEventListener(ARCADE_RETURN_SETTLED_EVENT, handler, { once: true });
  return () => window.removeEventListener(ARCADE_RETURN_SETTLED_EVENT, handler);
}

function settleArcadeReturn() {
  returnInFlight = false;
  finalizeArcadeReturn();
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent(ARCADE_RETURN_SETTLED_EVENT));
  }
}

/**
 * Wait for the main thread to go quiet before starting an animation.
 *
 * On return the whole home page is mounting inside the element we are about to
 * animate - every section and its ScrollTriggers, Lenis, the deferred 3D rig.
 * Starting the tween in the same tick means each frame scales a layer whose
 * contents are still changing, so the compositor re-rasterises continuously and
 * the animation stutters. Hard ceiling keeps the page from ever hanging hidden.
 */
function whenMainThreadQuiet(run: () => void) {
  let fired = false;
  const fire = () => {
    if (fired) return;
    fired = true;
    run();
  };

  // Two frames: one for React to commit, one for the browser to lay out.
  requestAnimationFrame(() =>
    requestAnimationFrame(() => {
      const requestIdle = (window as typeof window & {
        requestIdleCallback?: typeof window.requestIdleCallback;
      }).requestIdleCallback;

      if (typeof requestIdle === "function") requestIdle(fire, { timeout: 200 });
      else globalThis.setTimeout(fire, 64);
    }),
  );

  globalThis.setTimeout(fire, 350);
}

function prepareArcadeGsapTicker() {
  gsap.ticker.lagSmoothing(0);
}

function setGlobalTransitionLock(locked: boolean) {
  if (typeof document === "undefined") return;
  document.body.classList.toggle(ARCADE_TRANSITION_LOCK_CLASS, locked);
}

/**
 * Drop any scroll lock the arcade left on the document.
 *
 * GameWorld pins `<body>` with `overflow: hidden`, and Next renders "/" while
 * GameWorld is still mounted. Anything that measures scrollable distance in
 * that window - SmoothScroll's ScrollTrigger.refresh() above all - sees a page
 * that cannot scroll, so every trigger collapses onto the same start/end and
 * none of them ever fire again. Only `hidden` is cleared, so an unrelated
 * inline overflow value is left untouched.
 */
export function releaseArcadeScrollLock() {
  if (typeof document === "undefined") return;

  for (const node of [document.body, document.documentElement]) {
    if (!node) continue;
    if (node.style.overflow === "hidden") node.style.removeProperty("overflow");
    if (node.style.overflowY === "hidden") node.style.removeProperty("overflow-y");
    node.style.removeProperty("overscroll-behavior");
  }
}

/** Scroll lock plus the cursor/selection lock, for the end of the return trip. */
export function releaseArcadeDocumentLocks() {
  releaseArcadeScrollLock();
  setGlobalTransitionLock(false);
}

/**
 * Re-measure every ScrollTrigger once the page is genuinely back.
 *
 * ScrollTrigger caches start/end from getBoundingClientRect(). The return zoom
 * holds the whole spatial root at scale(1.15) with `contain: paint style` for
 * ARCADE_SPATIAL_DURATION seconds, and SmoothScroll's own refresh runs inside
 * that window, so every trigger on the home page is measured through a scaled,
 * contained ancestor and is wrong by the time the transform clears. Nothing
 * recalculated them afterwards, which is why sections stopped appearing and the
 * scroll felt stuck after exiting the arcade.
 *
 * ScrollTrigger is imported lazily so the /arcade bundle does not pull it in.
 */
export function refreshArcadeScrollTriggers() {
  if (typeof window === "undefined") return;

  void import("gsap/ScrollTrigger").then(({ ScrollTrigger }) => {
    gsap.registerPlugin(ScrollTrigger);
    requestAnimationFrame(() => {
      ScrollTrigger.refresh();
      // Sections below the fold mount lazily; a second pass picks up whatever
      // registered itself between the zoom ending and this frame.
      globalThis.setTimeout(() => ScrollTrigger.refresh(), 240);
    });
  });
}

/** Single funnel for "the arcade is fully behind us, hand the page back". */
export function finalizeArcadeReturn() {
  releaseArcadeDocumentLocks();
  refreshArcadeScrollTriggers();
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
  releaseArcadeScrollLock();
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
  returnInFlight = true;

  if (!root) {
    settleArcadeReturn();
    onComplete?.();
    return;
  }

  // Hide synchronously so the half-mounted page never flashes, but do not
  // start animating yet.
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

  // Only transform and opacity are animated, both on the compositor, and the
  // tween is held back until the page behind it has stopped thrashing.
  whenMainThreadQuiet(() => {
    gsap.to(root, {
      scale: 1,
      opacity: 1,
      duration: ARCADE_RETURN_DURATION,
      ease: ARCADE_RETURN_EASE,
      force3D: true,
      overwrite: "auto",
      onComplete: () => {
        clearArcadeSpatialZoom(root);
        // Only now: ScrollTrigger.refresh(), Lenis resume, deferred rig mount.
        // Running any of it earlier lands as a dropped-frame spike mid-animation.
        settleArcadeReturn();
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
