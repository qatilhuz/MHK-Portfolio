const PREFIX = "mhk-arcade-";

export function readScore(key: string, fallback = 0): number {
  try {
    const raw = window.localStorage.getItem(PREFIX + key);
    if (raw === null) return fallback;
    const value = Number(raw);
    return Number.isFinite(value) ? value : fallback;
  } catch {
    return fallback;
  }
}

export function writeScore(key: string, value: number) {
  try {
    window.localStorage.setItem(PREFIX + key, String(value));
  } catch {
    /* private mode */
  }
}

export function minScore(key: string, value: number) {
  const current = readScore(key, Number.POSITIVE_INFINITY);
  const next = Math.min(current, value);
  writeScore(key, Number.isFinite(next) ? next : value);
  return next;
}

export function maxScore(key: string, value: number) {
  const next = Math.max(readScore(key, 0), value);
  writeScore(key, next);
  return next;
}
