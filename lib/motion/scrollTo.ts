import { prefersReducedMotion } from "./engine";

/**
 * The slice of the Lenis API the app needs for programmatic scrolling.
 *
 * Typed structurally rather than importing Lenis so this module stays free of
 * the dependency and can fall back cleanly when Lenis is not running.
 */
export interface SmoothScroller {
  scrollTo: (
    target: string | number | HTMLElement,
    options?: {
      offset?: number;
      duration?: number;
      easing?: (progress: number) => number;
      immediate?: boolean;
      onComplete?: () => void;
    },
  ) => void;
}

let scroller: SmoothScroller | null = null;

/**
 * Hand the live Lenis instance to the app.
 *
 * Lenis owns the scroll position whenever it is running, and it only absorbs
 * an external jump while it is idle — anything written to `window.scrollTo`
 * mid-glide gets overwritten on the next Lenis frame. Routing programmatic
 * scrolls through the instance itself is the only way to stay in sync.
 */
export function registerSmoothScroller(next: SmoothScroller | null) {
  scroller = next;
}

/** easeOutExpo — leaves immediately, lands without a bump. */
function easeOutExpo(progress: number) {
  return progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
}

/**
 * Scroll to an element or selector, using Lenis when it is available and the
 * platform's own smooth scroll when it is not (reduced motion, /arcade).
 */
export function smoothScrollTo(
  target: string | HTMLElement,
  { duration = 1.5, offset = 0 }: { duration?: number; offset?: number } = {},
) {
  const reduced = prefersReducedMotion();

  if (scroller) {
    scroller.scrollTo(
      target,
      reduced
        ? { offset, immediate: true }
        : { offset, duration, easing: easeOutExpo },
    );
    return;
  }

  const node =
    typeof target === "string" ? document.querySelector(target) : target;
  if (!node) return;

  window.scrollTo({
    top: node.getBoundingClientRect().top + window.scrollY + offset,
    behavior: reduced ? "auto" : "smooth",
  });
}
