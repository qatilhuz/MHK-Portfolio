# MHK Portfolio

Personal developer portfolio for **Muhammad Huzaifa Khan** (display name Huzaifa Khan).

Next.js App Router, dark theme, CV-backed content, 3D workspace with 2D fallback, arcade, QA hunt, terminal, assistant, privacy-conscious analytics, and a Resend contact API.

## Local

```bash
npm install
npm run dev
```

Works without production secrets. Contact send and analytics persistence stay disabled until env vars are set.

## Production env

Public:

- `NEXT_PUBLIC_SITE_URL`
- `NEXT_PUBLIC_ANALYTICS_ENABLED`

Server only:

- `DATABASE_URL`
- `CONTACT_EMAIL_TO`
- `EMAIL_API_KEY`
- `EMAIL_FROM`

See `docs/ANALYTICS.md`, `docs/CONTACT.md`, and `docs/ASSETS.md`.

## Assets

Resume PDF and project media are not in the repository yet. Do not invent them.
