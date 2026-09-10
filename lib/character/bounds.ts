/** Bottom-stage world: horizontal strip only, never navbar. */

let cache = { at: 0, minNx: 0.12, maxNx: 0.88, minNy: 0.78, maxNy: 0.9, stageNy: 0.84 };

export function characterWorldLimits() {
  if (typeof window === "undefined") return cache;
  const now = performance.now();
  if (now - cache.at < 250) return cache;
  const header = document.querySelector("header");
  const navBottom = header?.getBoundingClientRect().bottom ?? 64;
  const minNy = Math.max(0.72, (navBottom + 48) / window.innerHeight);
  cache = {
    at: now,
    minNx: 0.12,
    maxNx: 0.88,
    minNy,
    maxNy: 0.92,
    stageNy: Math.min(0.88, Math.max(minNy + 0.04, 0.84)),
  };
  return cache;
}

export function clampViewport(nx: number) {
  const lim = characterWorldLimits();
  return {
    nx: Math.min(lim.maxNx, Math.max(lim.minNx, nx)),
    ny: lim.stageNy,
  };
}

export function isBottomStageEvent(clientY: number) {
  const lim = characterWorldLimits();
  return clientY / window.innerHeight >= lim.minNy;
}
