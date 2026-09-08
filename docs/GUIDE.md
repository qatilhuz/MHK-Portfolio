# Guided 3D host

Homepage companion: greets, narrates sections, then stays interactive after Skip.

Not a likeness of Muhammad Huzaifa Khan. Not the Q&A assistant.

## Model slot

Drop a **rigged, licensed** GLB at:

`public/models/portfolio-guide.glb`

Preferred clip names (aliases accepted): Idle, Greet, Wave, Nod, Point, Talk, Think, Walk.

Until that file exists, a local **AnimationMixer** humanoid (original, no third-party mesh) is used. It is a fallback host, not a photoreal person.

Do not hotlink unlicensed models.

## Interaction

- Hover/pointer: limited head look-at
- Head click: nod
- Hand click: wave
- Body click: short acknowledgment
- Keyboard: focus the host stage, Enter/Space waves
- Reactions do **not** skip or restart narration

## Tour (unchanged rules)

Hero → About → Skills → Experience → Projects → QA → Arcade → Terminal → Assistant → Resume → Contact.

Skip Intro / Escape / navbar / workspace click restores free scroll. Host remains.

`sessionStorage` `mhk-guide-skipped`.

## Voice

`speechSynthesis` only. Autoplay may be blocked.
