import { bootConfig } from "@/data/bootConfig";

type Listener = () => void;

const listeners = new Set<Listener>();
let revealed = !bootConfig.ENABLE_INITIAL_LOADER;

export function isPageRevealed() {
  return revealed;
}

export function markPageRevealed() {
  if (revealed) return;
  revealed = true;
  listeners.forEach((fn) => fn());
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("mhk:page-revealed"));
  }
}

export function onPageRevealed(fn: Listener) {
  if (revealed) fn();
  listeners.add(fn);
  return () => {
    listeners.delete(fn);
  };
}

export function markHeroReady() {
  /* Hero 3D is deferred; kept for callers that still signal paint. */
}

export async function waitCriticalBoot() {
  if (typeof window === "undefined") return;
  const fonts = document.fonts?.ready ?? Promise.resolve();
  const painted = new Promise<void>((resolve) => {
    requestAnimationFrame(() => requestAnimationFrame(() => resolve()));
  });
  const cap = new Promise<void>((resolve) => {
    window.setTimeout(resolve, 900);
  });
  await Promise.race([Promise.all([fonts, painted]), cap]);
}
