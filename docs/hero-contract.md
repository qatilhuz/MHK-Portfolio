# Hero section — user-owned files (do not revert)

**Canonical commit: `1d55978` "update hero section" (qatilhuz, 2026-11-10).**

Everything in `components/hero/` is authored and owned by the repository owner.
The state recorded here is ground truth. Automated refactors, formatters and
"fixes" must not revert, reformat or re-opinionate these files. If a change is
genuinely required, change the minimum and state plainly what was touched.

This file exists because the working copy is periodically reset. When that
happens the on-disk hero files can silently roll back to an older commit while
still *looking* like local edits. Verify against origin before trusting the
working tree — see "Recovery" below.

## Locked files

| File | Line endings | Status |
|---|---|---|
| `components/hero/Hero.tsx` | CRLF | owner-edited |
| `components/hero/HeroDescription.tsx` | CRLF | owner-edited |
| `components/hero/HeroInteractiveVideo.tsx` | CRLF | owner-edited |
| `components/hero/HeroStackLoop.tsx` | CRLF | owner-edited |
| `components/hero/TerminalBrailleImage.tsx` | CRLF | owner-edited |

All five are **pure CRLF, zero bare LF**. Preserve that exactly; a line-ending
flip rewrites every line and buries real changes in the diff.

## What the owner changed (and must keep)

### `Hero.tsx`
- The `<InView stagger="[data-hero-intro]" y={12}>` intro-pill block is
  **commented out**, not deleted.
- The right-column `<p className="mb-4 text-right font-mono text-[9px] …">`
  label is **commented out**, not deleted.
- Leave both as comments. They are parked, not dead. Consequently
  `Orbit` from `lucide-react` is imported but unused — this is an intentional
  side effect of parking the block and produces a lint *warning* only
  (`eslint` exit code 0). **Do not "clean up" that import**; removing it would
  have to be undone the moment the block is restored.

### `HeroStackLoop.tsx`
- Rotator paragraph spacing is `mt-7` (previously `mt-3`). Keep `mt-7`.

### `TerminalBrailleImage.tsx` — redesigned into a terminal window
- Added a `cellCount` derived value (`rows * columns`).
- Added window chrome: a `h-9` title bar with three traffic-light dots
  (rose / amber / emerald), the title `mhk@artifact — hero protocol`, and a
  `utf-8` badge.
- Added an inner panel containing a prompt line
  `$ render-image --protocol=braille --columns={columns}` and a metadata strip
  reading `cell 2x4`, `threshold {threshold}`, and either
  `{cellCount} glyph cells` or `decoding pixels`.
- The loading well is now a fixed `h-[184px] sm:h-[244px]`.

### Superseded earlier instruction
An earlier instruction required the braille shell to be
`min-h-[450px] sm:min-h-[550px]` with the loading well at
`min-h-[400px] sm:min-h-[500px]`, vertically centred via
`flex flex-col justify-center`. **That is obsolete.** The owner removed it in
`1d55978` in favour of the fixed-height well above. Do not reintroduce it.

## Still-active constraints from earlier work

These were requested by the owner and survive in the current files:

- `HeroInteractiveVideo` must stay `overflow-visible`; the layers are
  `scale-125` and overflow deliberately for the pop-out. Never add
  `overflow-hidden`, and never put `contain: paint` on the container (it clips
  descendants to the padding box and would amputate the pop-out). Paint
  containment belongs on the leaf video layers only.
- Pointer tracking must never use `useState`. Coordinates go through a ref and
  `style.setProperty` inside `requestAnimationFrame`.
- Both `<video>` elements keep `loop`, `muted`, `playsInline`,
  `disablePictureInPicture`, `preload="metadata"`, and are started together by
  a single `Promise.all([...play()])` from a `useEffect`.
- The hero `<h1>` must hold its text **directly**. It uses
  `.hero-heading-shimmer`, which relies on `background-clip: text`; that only
  masks glyphs painted in the same layer, so wrapping the text in per-word or
  per-character spans (e.g. `TextReveal variant="assemble"`, which applies
  `overflow-hidden` / `will-change: transform`) makes the heading render
  completely invisible. Any reveal must animate the `<h1>` as a whole.

## Known environment gap

`public/videos/` contains only `README.md`. The two clips referenced by
`HeroInteractiveVideo` are not committed, so both URLs 404 and the component
falls back to `TerminalBrailleImage`. That fallback is therefore what is
actually on screen today, which is why it carries the detailed design work.

## Recovery after a workspace reset

A reset can rewind `HEAD` to the base commit while leaving files on disk, which
makes stale files look like fresh local edits. Before assuming the working tree
is authoritative:

```sh
git fetch -q origin <branch>
git rev-parse --short HEAD FETCH_HEAD          # do they match?
# compare a hero file on disk against origin, ignoring line endings:
git show FETCH_HEAD:components/hero/Hero.tsx | diff --strip-trailing-cr - components/hero/Hero.tsx
```

If the disk copy matches an **older** commit than origin, the disk is stale:
restore with `git reset --hard FETCH_HEAD`. Never `git add -A && commit` a
rewound tree — that silently reverts the owner's pushed hero work.
