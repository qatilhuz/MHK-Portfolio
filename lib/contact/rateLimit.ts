const WINDOW_MS = 15 * 60 * 1000;
const MAX = 3;
const hits = new Map<string, { count: number; reset: number }>();

export function contactRateLimit(key: string): boolean {
  const now = Date.now();
  const row = hits.get(key);
  if (!row || now > row.reset) {
    hits.set(key, { count: 1, reset: now + WINDOW_MS });
    return true;
  }
  if (row.count >= MAX) return false;
  row.count += 1;
  return true;
}

export function clientKey(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  const raw = forwarded?.split(",")[0]?.trim() || "unknown";
  let hash = 0;
  for (let i = 0; i < raw.length; i += 1) {
    hash = (hash * 31 + raw.charCodeAt(i)) >>> 0;
  }
  return String(hash);
}
