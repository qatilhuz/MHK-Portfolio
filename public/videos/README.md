# Hero showreel clips

`HeroInteractiveVideo` expects **two** files here. They are not in the repo
yet, so the hero currently falls back to the braille terminal.

| file | content |
| --- | --- |
| `hero-grayscale.webm` | the base layer, desaturated |
| `hero-color.webm` | the same footage in colour, revealed under the pointer |

## Requirements

These matter more than usual, because the effect is two copies stacked
exactly on top of each other:

1. **Identical pixel dimensions and identical aspect ratio.** The layers use
   `object-contain`, so a different aspect ratio letterboxes them by
   different amounts and they will visibly fail to line up.
2. **Identical duration and frame rate.** The colour layer is resynced to the
   greyscale one whenever it drifts past 80ms, but matching encodes keep it
   from drifting at all.
3. **Encode both from the same master** - apply the desaturation as a filter
   on export rather than sourcing two different renders.
4. **WebM/VP9 is assumed** by the default paths. For alpha, export with
   `-pix_fmt yuva420p`. Add an `.mp4` sibling only if you need Safari < 16.
5. Keep them short and small; they autoplay on every page load.

To point at different files, pass `baseSrc` / `colorSrc`:

```tsx
<HeroInteractiveVideo baseSrc="/videos/foo-gray.webm" colorSrc="/videos/foo.webm" />
```
