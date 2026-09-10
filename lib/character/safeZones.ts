import type { CharacterSafeZone } from "./types";

const BLOCK =
  "header, nav, h1, h2, form, [data-character-block], #main-content button, input, textarea, select";

let cache: { at: number; rects: DOMRect[] } = { at: 0, rects: [] };

function overlaps(nx: number, ny: number, rects: DOMRect[], pad = 40): boolean {
  const x = nx * window.innerWidth;
  const y = ny * window.innerHeight;
  return rects.some(
    (r) => x > r.left - pad && x < r.right + pad && y > r.top - pad && y < r.bottom + pad,
  );
}

export function collectBlockedRects(): DOMRect[] {
  if (typeof document === "undefined") return [];
  const now = performance.now();
  if (now - cache.at < 420) return cache.rects;
  cache = {
    at: now,
    rects: [...document.querySelectorAll(BLOCK)]
      .map((node) => node.getBoundingClientRect())
      .filter((r) => r.width > 8 && r.height > 8 && r.bottom > 0 && r.top < window.innerHeight),
  };
  return cache.rects;
}

export function listSafeZones(opts: {
  preferNx?: number;
  preferNy?: number;
  currentNx?: number;
  currentNy?: number;
}): CharacterSafeZone[] {
  const blocked = collectBlockedRects();
  const candidates: CharacterSafeZone[] = [];
  let i = 0;
  for (let gx = 0; gx <= 10; gx += 1) {
    for (let gy = 0; gy <= 8; gy += 1) {
      const nx = 0.08 + (gx / 10) * 0.84;
      const ny = 0.18 + (gy / 8) * 0.64;
      if (ny < 0.16 || ny > 0.86) continue;
      if (overlaps(nx, ny, blocked, 42)) continue;
      const prefer =
        opts.preferNx != null
          ? 1 - Math.hypot(nx - opts.preferNx, ny - (opts.preferNy ?? 0.5))
          : 0;
      const stay =
        opts.currentNx != null
          ? 1 - Math.min(1, Math.hypot(nx - opts.currentNx, ny - (opts.currentNy ?? 0.5)) * 0.7)
          : 0;
      const edge = nx < 0.22 || nx > 0.78 ? 0.15 : 0;
      candidates.push({
        id: `z-${i++}`,
        nx,
        ny,
        priority: prefer * 1.8 + stay * 0.4 + edge,
      });
    }
  }
  candidates.sort((a, b) => b.priority - a.priority);
  return candidates;
}

export function pickSafeZone(opts: {
  preferNx?: number;
  preferNy?: number;
  currentNx?: number;
  currentNy?: number;
  variety?: boolean;
}): CharacterSafeZone | null {
  const list = listSafeZones(opts);
  if (!list.length) return null;
  if (opts.variety && list.length > 3) {
    return list[Math.floor(Math.random() * Math.min(6, list.length))] ?? list[0];
  }
  return list[0];
}

export function viewportToWorld(nx: number, ny: number) {
  return {
    x: (nx - 0.5) * 5.4,
    y: (0.52 - ny) * 3.35,
    z: ((nx - 0.5) * 0.15),
  };
}

export function worldToViewport(x: number, y: number) {
  return {
    nx: x / 5.4 + 0.5,
    ny: 0.52 - y / 3.35,
  };
}
