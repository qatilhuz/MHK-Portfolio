import { characterWorldLimits, clampViewport } from "./bounds";
import type { CharacterSafeZone } from "./types";

export function pickSafeZone(opts: {
  preferNx?: number;
  preferNy?: number;
  currentNx?: number;
  currentNy?: number;
  variety?: boolean;
}): CharacterSafeZone | null {
  const lim = characterWorldLimits();
  const xs = [0.18, 0.32, 0.5, 0.68, 0.82];
  let best: CharacterSafeZone | null = null;
  let score = -Infinity;
  xs.forEach((nx, i) => {
    if (nx < lim.minNx || nx > lim.maxNx) return;
    const prefer = opts.preferNx != null ? 1 - Math.abs(nx - opts.preferNx) : 0;
    const stay = opts.currentNx != null ? 1 - Math.abs(nx - opts.currentNx) * 0.4 : 0;
    const s = prefer * 1.6 + stay + (opts.variety ? Math.random() * 0.3 : 0);
    if (s > score) {
      score = s;
      best = { id: `b-${i}`, nx, ny: lim.stageNy, priority: s };
    }
  });
  return best;
}

export function viewportToWorld(nx: number, ny: number) {
  const clamped = clampViewport(nx);
  return {
    x: (clamped.nx - 0.5) * 5.4,
    y: (0.52 - clamped.ny) * 3.35,
    z: 0,
  };
}

export function worldToViewport(x: number, y: number) {
  return {
    nx: x / 5.4 + 0.5,
    ny: 0.52 - y / 3.35,
  };
}
