# Project media

Drop real files here. Empty folders stay `coming-soon`. Do not add placeholders.

```
public/projects/
├── ecommerce/          # PHP + MySQL store
│   ├── thumbnail.webp|png|jpg
│   ├── video.mp4|webm
│   ├── poster.webp|png|jpg
│   └── screenshots/
├── laptop-ecommerce/   # Flutter + .NET
├── weather/            # HTML/CSS/JS SPA
└── gaming/             # static showcase site
```

PHP is never executed by this Next.js app. Flutter is shown in the phone frame when screenshots exist.

The build hydrates paths from disk (`lib/assets.ts`). Missing files never become broken `<img>` URLs.
