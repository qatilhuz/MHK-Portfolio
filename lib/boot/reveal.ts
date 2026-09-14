type Listener = () => void;

const listeners = new Set<Listener>();
let revealed = false;
let heroReady = false;

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
  heroReady = true;
}

export function waitHeroReady(ms = 2800) {
  if (heroReady) return Promise.resolve();
  return new Promise<void>((resolve) => {
    const started = Date.now();
    const tick = () => {
      if (heroReady || Date.now() - started >= ms) {
        resolve();
        return;
      }
      window.setTimeout(tick, 80);
    };
    tick();
  });
}

export async function waitCriticalBoot() {
  if (typeof window === "undefined") return;
  const fonts = document.fonts?.ready ?? Promise.resolve();
  const painted = new Promise<void>((resolve) => {
    requestAnimationFrame(() => requestAnimationFrame(() => resolve()));
  });
  const cap = new Promise<void>((resolve) => {
    window.setTimeout(resolve, 5500);
  });
  await Promise.race([Promise.all([fonts, painted, waitHeroReady()]), cap]);
}
