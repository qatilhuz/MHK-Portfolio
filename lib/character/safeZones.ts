import { characterWorldLimits, clampViewport, nxToWorldX } from "./bounds";
import type { CharacterSafeZone } from "./types";

export function pickSafeZone(opts: {
  preferNx?: number;
  variety?: boolean;
  currentNx?: number;
}): CharacterSafeZone | null {
  const lim = characterWorldLimits();
  const xs = [0.2, 0.35, 0.5, 0.65, 0.8];
  let best: CharacterSafeZone | null = null;
  let score = -Infinity;
  xs.forEach((nx, i) => {
    if (nx < lim.minNx || nx > lim.maxNx) return;
    const prefer = opts.preferNx != null ? 1 - Math.abs(nx - opts.preferNx) : 0;
    const stay = opts.currentNx != null ? 1 - Math.abs(nx - opts.currentNx) * 0.4 : 0;
    const s = prefer * 1.6 + stay + (opts.variety ? Math.random() * 0.35 : 0);
    if (s > score) {
      score = s;
      best = { id: `b-${i}`, nx, ny: 0.87, priority: s };
    }
  });
  return best;
}

export function viewportToWorld(nx: number) {
  const clamped = clampViewport(nx);
  return { x: nxToWorldX(clamped.nx), y: 0, z: 0 };
}

export function worldToViewport(x: number) {
  const lim = characterWorldLimits();
  return { nx: x / (lim.maxNxWorld * 2) + 0.5, ny: 0.87 };
}
