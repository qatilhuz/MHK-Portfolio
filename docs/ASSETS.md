# Resume and project media

## Resume

Expected file: `public/resume/huzaifa-resume.pdf`

**Current status:** not in the repository. View/Download stay hidden. The 3D folder still goes to `/#resume`.

## Project folders

See `public/projects/README.md`. Hydration is in `lib/assets.ts` (filesystem at build/request time).

**Current status:** no thumbnails, screenshots, or videos. UI shows “coming soon”. No fake images.

PHP e-commerce is a case study only — Next.js does not run PHP.

## Connecting files later

1. Drop real media into the matching folder.
2. Redeploy / restart. Paths are filled automatically.
3. For the resume, add the PDF; the server checks disk (and `siteConfig.resumeAvailable` for the assistant/terminal).
