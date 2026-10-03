# Contact form

Transactional email via **Resend** (`POST https://api.resend.com/emails`). One provider, server-side only, no extra SDK.

Resend was chosen because it is a simple HTTPS JSON API that fits Next.js App Router without extra infrastructure.

## Environment

```
CONTACT_EMAIL_TO=
EMAIL_API_KEY=
EMAIL_FROM=
```

- `CONTACT_EMAIL_TO` — inbox that receives messages (never sent to the browser).
- `EMAIL_API_KEY` — Resend API key (server only).
- `EMAIL_FROM` — verified sender, e.g. `Portfolio <hello@your-domain>`.

Visitor address is set as `reply_to`, never as `from`.

## Domain

Verify the sending domain in Resend before production. Unverified `from` addresses are rejected by the API.

## Local / production

1. Create a Resend account and API key.
2. Verify a domain (or use Resend’s onboarding sender for tests if they still allow it).
3. Set the three variables on the host.
4. Without them, `POST /api/contact` returns **503** and the UI says the service is temporarily unavailable. Nothing is faked as sent. **Email delivery is not verified** until these variables and a verified Resend domain exist.

## Rate limit

In-memory: 3 submissions / 15 minutes per hashed `x-forwarded-for`. On multi-instance hosts this is per process; add a shared limiter later if needed.

## Honeypot

Hidden `website` field. If filled, the API returns `{ ok: true }` and does **not** send mail.

## Storage

Messages are emailed only. They are not written to analytics Postgres or logged.
