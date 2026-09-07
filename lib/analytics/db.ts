import type { AnalyticsBatch } from "./types";

const hits = new Map<string, { count: number; reset: number }>();

export function analyticsConfigured(): boolean {
  return Boolean(process.env.DATABASE_URL);
}

export function rateLimitOk(sessionId: string): boolean {
  const now = Date.now();
  const row = hits.get(sessionId);
  if (!row || now > row.reset) {
    hits.set(sessionId, { count: 1, reset: now + 60_000 });
    return true;
  }
  if (row.count >= 60) return false;
  row.count += 1;
  return true;
}

export async function persistBatch(batch: AnalyticsBatch): Promise<"written" | "skipped"> {
  const url = process.env.DATABASE_URL;
  if (!url) return "skipped";

  const postgres = (await import("postgres")).default;
  const sql = postgres(url, { max: 1, idle_timeout: 5, connect_timeout: 5 });
  try {
    await sql`
      INSERT INTO analytics_sessions (
        id, started_at, last_activity_at, referrer_source, device_category,
        browser_category, os_category, viewport_category
      )
      VALUES (
        ${batch.sessionId}::uuid, NOW(), NOW(), ${batch.context.referrerSource},
        ${batch.context.deviceCategory}, ${batch.context.browserCategory},
        ${batch.context.osCategory}, ${batch.context.viewportCategory}
      )
      ON CONFLICT (id) DO UPDATE SET
        last_activity_at = NOW(),
        viewport_category = EXCLUDED.viewport_category
    `;

    for (const event of batch.events) {
      await sql`
        INSERT INTO analytics_events (session_id, name, path, meta)
        VALUES (
          ${batch.sessionId}::uuid,
          ${event.name},
          ${event.path ?? null},
          ${JSON.stringify(event.meta ?? {})}::jsonb
        )
      `;
    }
    return "written";
  } finally {
    await sql.end({ timeout: 1 });
  }
}
