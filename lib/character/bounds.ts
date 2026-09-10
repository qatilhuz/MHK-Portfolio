/** Bottom-stage: the host lives in the lower ~26vh strip only. */

const STAGE_VH = 0.26;

let cache = { at: 0, minNx: 0.1, maxNx: 0.9, minNy: 0.74, maxNxWorld: 2.1 };

export function characterWorldLimits() {
  if (typeof window === "undefined") return cache;
  const now = performance.now();
  if (now - cache.at < 250) return cache;
  cache = {
    at: now,
    minNx: 0.1,
    maxNx: 0.9,
    minNy: 1 - STAGE_VH,
    maxNxWorld: window.innerWidth < 768 ? 1.55 : 2.15,
  };
  return cache;
}

export function clampViewport(nx: number) {
  const lim = characterWorldLimits();
  return {
    nx: Math.min(lim.maxNx, Math.max(lim.minNx, nx)),
    ny: 1 - STAGE_VH / 2,
  };
}

export function isBottomStageEvent(clientY: number) {
  return clientY / window.innerHeight >= 1 - STAGE_VH;
}

export function nxToWorldX(nx: number) {
  const lim = characterWorldLimits();
  const n = Math.min(lim.maxNx, Math.max(lim.minNx, nx));
  return (n - 0.5) * (lim.maxNxWorld * 2);
}
