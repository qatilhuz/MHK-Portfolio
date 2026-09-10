let cache = { at: 0, minNx: 0.08, maxNx: 0.92, minNy: 0.14, maxNy: 0.88 };

export function characterWorldLimits() {
  if (typeof window === "undefined") return cache;
  const now = performance.now();
  if (now - cache.at < 250) return cache;
  const header = document.querySelector("header");
  const top = (header?.getBoundingClientRect().bottom ?? 64) + 18;
  cache = {
    at: now,
    minNx: 0.1,
    maxNx: 0.9,
    minNy: Math.min(0.42, Math.max(0.12, top / window.innerHeight)),
    maxNy: 0.9,
  };
  return cache;
}

export function clampViewport(nx: number, ny: number) {
  const lim = characterWorldLimits();
  return {
    nx: Math.min(lim.maxNx, Math.max(lim.minNx, nx)),
    ny: Math.min(lim.maxNy, Math.max(lim.minNy, ny)),
  };
}
