import type { CharacterSafeZone } from "./types";

const BLOCK =
  "header, nav, h1, h2, form, [data-character-block], #main-content button, #main-content a.btn, input, textarea, select";

function overlaps(
  nx: number,
  ny: number,
  rects: DOMRect[],
  pad = 28,
): boolean {
  const x = nx * window.innerWidth;
  const y = ny * window.innerHeight;
  return rects.some(
    (r) =>
      x > r.left - pad &&
      x < r.right + pad &&
      y > r.top - pad &&
      y < r.bottom + pad,
  );
}

export function collectBlockedRects(): DOMRect[] {
  if (typeof document === "undefined") return [];
  return [...document.querySelectorAll(BLOCK)].map((node) => node.getBoundingClientRect());
}

export function pickSafeZone(opts: {
  preferNx?: number;
  preferNy?: number;
  currentNx?: number;
  currentNy?: number;
}): CharacterSafeZone | null {
  const blocked = collectBlockedRects();
  const candidates: CharacterSafeZone[] = [];
  const xs = [0.12, 0.22, 0.78, 0.88, 0.5];
  const ys = [0.28, 0.42, 0.58, 0.72];
  let i = 0;
  for (const nx of xs) {
    for (const ny of ys) {
      if (nx > 0.35 && nx < 0.65 && ny > 0.32 && ny < 0.68) continue;
      if (overlaps(nx, ny, blocked, 36)) continue;
      const prefer =
        opts.preferNx != null
          ? 1 - Math.hypot(nx - opts.preferNx, ny - (opts.preferNy ?? 0.5))
          : 0;
      const stay =
        opts.currentNx != null
          ? 1 - Math.min(1, Math.hypot(nx - opts.currentNx, ny - (opts.currentNy ?? 0.5)))
          : 0;
      candidates.push({
        id: `z-${i++}`,
        nx,
        ny,
        priority: prefer * 2 + stay + (nx > 0.7 || nx < 0.25 ? 0.3 : 0),
      });
    }
  }
  candidates.sort((a, b) => b.priority - a.priority);
  return candidates[0] ?? null;
}

export function viewportToWorld(nx: number, ny: number) {
  return {
    x: (nx - 0.5) * 5.2,
    y: (0.52 - ny) * 3.2,
    z: 0,
  };
}

export function worldToViewport(x: number, y: number) {
  return {
    nx: x / 5.2 + 0.5,
    ny: 0.52 - y / 3.2,
  };
}
