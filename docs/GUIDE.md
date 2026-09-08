# Guided 3D narrator

A homepage-only companion that greets visitors and walks section by section.

It does **not** replace the Developer Workspace or the Q&A assistant.

## Character

No approved likeness is in the repository.

- Drop a GLB at `public/models/portfolio-guide.glb` to replace the stylized humanoid.
- Until that file exists, a local procedural figure is used (not a portrait of Muhammad Huzaifa Khan).
- Do not load unlicensed third-party models.

## Behaviour

1. Hero greeting (text + SpeechSynthesis when the browser allows it).
2. After each line finishes, scroll to the next unlocked section.
3. **Skip Intro** (or Escape when the mobile menu is closed) restores free scrolling.
4. Navbar links skip the guide, then navigate.
5. `sessionStorage` key `mhk-guide-skipped` (`skipped` | `complete`) prevents trapping on refresh.

## Voice

Browser `speechSynthesis` only. No paid API.

Autoplay may be blocked. Text still runs; **Enable Voice** appears after a failed autoplay attempt. Mute completes the section on the reading timer so the tour cannot stall.

## Analytics

Optional events: `guided_intro_start`, `guided_intro_skip`, `guided_intro_complete`. No transcripts.
