-- Privacy-conscious analytics for the Huzaifa Khan portfolio.
-- Apply on a Postgres-compatible host (Neon, Supabase, Vercel Postgres, etc.)

CREATE TABLE IF NOT EXISTS analytics_sessions (
  id UUID PRIMARY KEY,
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_activity_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  referrer_source TEXT,
  device_category TEXT,
  browser_category TEXT,
  os_category TEXT,
  viewport_category TEXT
);

CREATE TABLE IF NOT EXISTS analytics_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES analytics_sessions (id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  occurred_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  path TEXT,
  meta JSONB NOT NULL DEFAULT '{}'::jsonb
);

CREATE INDEX IF NOT EXISTS analytics_events_session_idx ON analytics_events (session_id);
CREATE INDEX IF NOT EXISTS analytics_events_name_idx ON analytics_events (name);
CREATE INDEX IF NOT EXISTS analytics_events_occurred_idx ON analytics_events (occurred_at);
