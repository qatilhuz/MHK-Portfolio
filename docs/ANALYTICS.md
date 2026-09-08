# Privacy-conscious analytics

First-party usage events for UX. Not advertising, not a cookie wall.

## Database

PostgreSQL-compatible (Neon, Supabase, Vercel Postgres, or any `DATABASE_URL` host).

## Environment

```
NEXT_PUBLIC_SITE_URL=
NEXT_PUBLIC_ANALYTICS_ENABLED=true
DATABASE_URL=
```

- `DATABASE_URL` is **server-only**. Never expose it to the client.
- Set `NEXT_PUBLIC_ANALYTICS_ENABLED=false` to disable the client collector.
- Visitors can opt out in the notice (`localStorage` key `mhk-analytics-consent`).

## Setup

1. Create a Postgres database.
2. Run `db/schema.sql`.
3. Set `DATABASE_URL` on the host.
4. Restart the Next.js server.

## Flow

Browser (after consent) → `POST /api/analytics` (whitelisted JSON) → Postgres.

Without `DATABASE_URL`, the API still accepts valid payloads and returns `{ persisted: false }`. The UI does not fail.

## Events (allowlist)

page_view, section_view, project_view, project_demo_open, project_github_click, project_media_open, resume_view, resume_download, arcade_open, arcade_game_start, arcade_game_complete, qa_open, qa_bug_found, terminal_command_used, assistant_open, assistant_question_category, contact_start, contact_submit_success, contact_submit_error, guided_intro_start, guided_intro_skip, guided_intro_complete.

Writes are skipped when `DATABASE_URL` is unset (`persisted: false`). Delivery to Postgres is not verified without credentials.

## Not collected

Passwords, payments, message text, IPs, precise location, mic/camera, clipboard, raw terminal input, assistant questions/answers.

## Session

Random UUID in `sessionStorage` for the tab. No login.
