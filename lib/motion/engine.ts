import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

let registered = false;

export const MOTION_START = {
  heading: "top 80%",
  body: "top 72%",
  card: "top 76%",
} as const;

export function motionEngine() {
  if (typeof window === "undefined") return gsap;
  if (!registered) {
    gsap.registerPlugin(ScrollTrigger);
    registered = true;
    const refresh = () => ScrollTrigger.refresh();
    window.addEventListener("load", refresh, { once: true });
    document.fonts?.ready.then(refresh).catch(() => undefined);
  }
  return gsap;
}

export function prefersReducedMotion() {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function isCompactViewport() {
  if (typeof window === "undefined") return true;
  return window.innerWidth < 768;
}

export function isPastTrigger(node: HTMLElement, viewportRatio = 0.72) {
  const rect = node.getBoundingClientRect();
  return rect.top < window.innerHeight * viewportRatio && rect.bottom > 64;
}
