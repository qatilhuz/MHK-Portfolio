# Arcade WebGL / R3F Performance Audit

**Scope:** `app/arcade/`, `components/arcade/**`, `lib/arcade/**` (+ the shared R3F plumbing they depend on)
**Date:** 2026-11-01 · **Commit audited:** `acc2e05` on `arena/01a107bd-mhk-portfolio`
**Status:** read-only audit as originally written. **No source files were modified by the audit itself.**
A follow-up implementation pass (recommendations 1-6) landed afterwards in commits `623d9d0`..`38e83c4`; see
[Remediation log](#remediation-log--what-was-actually-implemented) at the end. Section bodies below are left at
their as-audited state so the before/after is legible.

**Method:** static analysis of the source tree, plus verification of actual library behaviour in the installed
`@react-three/fiber@9.7.0` / `@react-three/drei@10.7.8` / `three@0.185.1` bundles (so claims about "R3F disposes X for you"
are checked against the shipped code, not from memory). Runtime counters (draw calls, VRAM, frame time) could **not** be
measured — there is no browser/GPU in this sandbox. Every number below marked *(est.)* is a hand-expanded static count,
and the derivation is shown so it can be checked with `r3f-perf` later.

---

## 0. A structural finding first: the 3D rig is not on `/arcade`

This matters for every answer below.

| Route | What actually renders | WebGL? |
| --- | --- | --- |
| `/arcade` (`app/arcade/page.tsx:12`) | `GameWorld` → Snake / Memory / Reaction / RPS, all DOM + React state | **No** |
| `/` (home, `app/page.tsx:40`) | `ArcadeSection` → `ArcadeSetup` → `ArcadeScene` (`components/arcade/rig/ArcadeScene.tsx:872`) | **Yes — the entire rig** |

So the heavy scene is a **section of the home page**, sharing the main thread with Lenis smooth scroll, GSAP ScrollTriggers,
the Showcase pin timeline and the Experience horizontal track. `GameWorld.tsx:34-45` additionally warm-imports
`ArcadeSetup` + `ArcadeScene` on idle while you are inside `/arcade`, so the rig's JS is parsed on both routes.

### Scene inventory (the budget everything else is spent against)

| Metric | Count | Source of truth |
| --- | --- | --- |
| Authored mesh nodes | **229** (210 `<mesh>`, 13 `<RoundedBox>`, 5 `<Text>`, 1 `<instancedMesh>`) | grep over `rig/*.tsx` |
| Live meshes in main pass *(est.)* | **≈ 380–450** | 229 authored + `.map()` repeats: 12 × `AcousticTile` (12 meshes each = 144), 2 × `Speaker` (36), 2 × `PortraitScreen` (20), 2 × `MiniArcade` (12), 4 × `CoolingFan` (7 blades + 8 body each ≈ 60), 6 shelf items, 6 cable combs, 14 mouse ribs, ~14 wide keycaps × 2 |
| Draw calls in the two off-screen render targets *(est.)* | **≈ 230** | Terminal RT: 34 lines × 4 + 25 scanlines + 5 ≈ 166 (`Monitor.tsx:86-155`); HUD RT: ≈ 60 (`Monitor.tsx:164-250`) |
| Real-time lights | **42** (37 point, 2 spot, 1 directional, 1 hemisphere, 1 ambient) | enumerated below |
| Shadow-casting lights | **3** (directional 2048², 2 × spot 1024²) | `ArcadeScene.tsx:885-890`, `DeskAccessories.tsx:564,586` |
| `castShadow` / `receiveShadow` flags | 48 / 24 | grep |
| Materials | 176 inline `meshStandardMaterial`, 45 `MeshStandardMaterial` refs, 12 `meshPhysicalMaterial`, 26 `meshBasicMaterial` | grep |
| Procedural canvas textures | 20+ (incl. one **2048²** and five 1024²) | `textures.ts`, `pcTextures.ts`, `DeskAccessories.tsx`, `Speakers.tsx` |
| `useFrame` subscribers | 19 | grep |
| `.dispose()` calls in arcade code | **0** | grep |

---

## Executive summary

| # | Question | Status | One-line verdict |
| --- | --- | --- | --- |
| 1 | Draco compression | **Not applicable in arcade / missing repo-wide** | The rig loads **zero** `.glb`/`.gltf` — it is 100 % procedural by deliberate licensing policy (`docs/arcade-assets.md`). The repo's only GLTF (`public/models/planet`, 1.6 MB uncompressed, `EarthCanvas.tsx:11`) is loaded with no Draco decoder. |
| 2 | Instanced rendering | **Partial — exactly one instance** | `<instancedMesh>` is used for keycaps only (`Keyboard.tsx:172`). The 12 identical acoustic tiles, 4 fans, screws, shelf items, cable combs and ribs are all individual meshes. `<Instances>` from drei is never imported. |
| 3 | Asset disposal | **Missing in app code; partially rescued by R3F** | No `.dispose()` anywhere in arcade. R3F auto-disposes JSX-created geometries/materials and force-loses the GL context on Canvas unmount, but every **imperatively** created geometry/material/texture (10 geometries, 5 materials, 20+ cached textures ≈ 55–70 MB VRAM) is never released. |
| 4 | Render loop | **Missing — continuous** | No `frameloop` prop → defaults to `"always"`. Zero `invalidate()` calls in the arcade tree. The canvas keeps drawing at full refresh rate even when scrolled far off-screen; only the *animation math* and the two render-targets are gated. |
| 5 | Material & lighting overhead | **Largely unoptimised** | 42 real-time lights with ~220 `MeshStandardMaterial`/`MeshPhysicalMaterial` surfaces, 3 shadow maps re-rendered **every frame**, `ContactShadows frames={Infinity}`, no baking, no env map (yet 12 materials set `envMapIntensity`), no KTX2. |

**If only one thing gets fixed:** the light count (42 → ≤ 8). In three.js's forward renderer every punctual light is evaluated
per-fragment inside every lit material's shader, so 37 point lights multiply the cost of every pixel of every Standard surface.

---

## 1. Draco compression

**Status: not applicable inside `/arcade` (no models exist); missing everywhere a model *is* loaded.**

### Evidence

```
grep -rn "useGLTF|GLTFLoader|DRACOLoader|setDecoderPath|draco|KTX2|meshopt" app components lib
→ components/contact/EarthCanvas.tsx:11   const earth = useGLTF(PLANET_MODEL);
→ components/contact/EarthCanvas.tsx:78   useGLTF.preload(PLANET_MODEL);
→ components/guide/GltfHost.tsx:17        const gltf = useGLTF(GUIDE_MODEL_PATH);
(no hits anywhere under components/arcade, lib/arcade, app/arcade)
```

* `find public -name "*.glb" -o -name "*.gltf"` → only `public/models/planet/scene.gltf` + `scene.bin` (**1.6 MB**).
* No `draco3d`, `@gltf-transform/*`, `meshoptimizer` or KTX2 tooling in `package.json`.

### Why it is missing

This is **documented and intentional** for the arcade. `docs/arcade-assets.md`:

> "No third-party GLB was used. All desk hardware (case, fans, internals, monitor, keyboard, mouse) is original in-repo
> Three.js geometry in `components/arcade/rig/`… empty `public/models/` stays blocked for unlicensed/hotlinked files."

So there is nothing to Draco-compress — the geometry is generated at runtime from `boxGeometry`/`cylinderGeometry`/
`LatheGeometry` etc. The trade is explicit: **zero download bytes, but ~400 separate geometries built on the CPU at mount
and ~400 draw calls per frame forever.** Draco would have cost nothing here and saved a lot.

Two genuinely actionable points that fall out of this question:

1. **`EarthCanvas` (non-arcade) should use the decoder.** drei supports it in one character: `useGLTF(PLANET_MODEL, true)`
   enables the CDN Draco decoder; pairing that with a `gltf-transform draco` pass typically takes a 1.6 MB `.bin` to
   200–400 KB. Today it is loaded raw, and `useGLTF.preload` fires it eagerly on the contact page bundle.
2. **The inversion is the real arcade win.** ~90 % of the rig is static (walls, desk, legs, monitor chassis and mount, PC
   case shell, shelf, accessories). Baking that once into a single Draco/meshopt GLB with a baked AO/light map would
   collapse hundreds of draw calls into single digits and delete most of the runtime texture generation — while keeping
   the licensing policy intact, because the asset would be authored from this repo's own geometry.

---

## 2. Instanced rendering

**Status: partial — one instanced mesh in the whole scene.**

### What exists (and is done well)

`components/arcade/rig/Keyboard.tsx:172`

```tsx
<instancedMesh ref={mesh} args={[undefined, undefined, layout.unit.length]} castShadow>
  <boxGeometry args={[U, 0.01, U * 0.9]} />
  <meshStandardMaterial color="#3a3d46" roughness={0.52} metalness={0.08} />
</instancedMesh>
```

~61–75 unit keycaps in **one** draw call, with per-key RGB via `setColorAt` + `instanceColor.needsUpdate`
(`Keyboard.tsx:94-120`). This is textbook — and it proves the team already knows the API, which makes the gap below a
pure oversight rather than a knowledge problem.

### What is *not* instanced (ranked by payoff)

| Repeated element | Instances × meshes | Live meshes *(est.)* | Where |
| --- | --- | --- | --- |
| `AcousticTile` wall panels | 12 × 12 | **144** | `ArcadeScene.tsx:355-430`, `541-556` |
| `CoolingFan` (7 blades + 8 body parts) | 4 × 15 | **60** | `CoolingFan.tsx:67-110`, `PcCase.tsx:216-218,248` |
| `Speaker` | 2 × 18 | 36 | `Speakers.tsx`, mounted at `ArcadeScene.tsx:897-898` |
| `PortraitScreen` | 2 × ~10 | 20 | `Monitor.tsx:255-327` |
| Terminal RT text rows | 34 × 4 | **136** (in RT pass) | `Monitor.tsx:125-147` |
| Scan lines | 25 × 1 | 25 (in RT pass) | `Monitor.tsx:150-155` |
| Mouse side ribs | 14 × 1 | 14 | `Mouse.tsx:186` |
| Shelf collectibles / cable comb / screws / mount hardware | various | ~40 | `ArcadeScene.tsx:586-610`, `PcCase.tsx:79`, `Monitor.tsx:358,383` |

`<Instances>`/`<Instance>` from drei: **never imported** (`grep "Instances" components/arcade` → 0 hits).
`BatchedMesh`, `mergeGeometries` and `Merged`: also absent.

### Why it is missing

Two defensible-but-solvable reasons are visible in the code:

1. **Per-instance animated materials.** Each `AcousticTile` drives its *own* `MeshStandardMaterial.emissive` through a ref
   in `useFrame` (`ArcadeScene.tsx:321-352`) plus its own `<pointLight>`. Naive instancing breaks that — but
   `instanceColor` (already used for keycaps) covers the emissive tint, and the 12 lights need to go anyway (§5).
2. **Composite sub-objects.** A "tile" is 12 boxes of 4 different sizes, so it is 4 instanced batches, not 1 — more
   refactoring than a flat particle field. Still: **144 draws → 4 draws**.

The 136-mesh terminal readout inside the render target is the cheapest fix of all: those are 4 box rows per line with
only colour/width varying, i.e. a single `<Instances>` block or even one pre-drawn `CanvasTexture`.

---

## 3. Asset disposal

**Status: missing in application code (0 explicit `.dispose()` calls); partially rescued by R3F's own teardown.
Everything created imperatively leaks for the lifetime of the tab.**

```
grep -rn "dispose" components/arcade lib/arcade app/arcade   →   no matches
```

For comparison, the non-arcade scenes do it properly: `CyberpunkRainCanvas.tsx:263-264`
(`useEffect(() => () => geometry.dispose())`), `EvolvingJourneyCanvas.tsx:175-176`, `ArmoredRig.tsx:235-238`.

### What R3F cleans up for you (verified in the installed bundle)

From `@react-three/fiber@9.7.0` (`dist/events-156d8d12.esm.js`):

```js
// removeChild() — runs for every JSX node that unmounts
const shouldDispose = child.props.dispose !== null && dispose !== false;
if (shouldDispose && child.type !== 'primitive' && child.object.type !== 'Scene')
  disposeOnIdle(child.object);          // → object.dispose() at idle priority

// unmountComponentAtNode() — runs when the <Canvas> itself unmounts
state.gl.renderLists.dispose();
state.gl.forceContextLoss();
dispose(state.scene);                   // recursive: obj.dispose() + every prop with .dispose()
```

So:

* ✅ The ~229 JSX-declared geometries and materials **are** disposed when their component unmounts
  (this covers the `fullRigReady` / `transitionLite` sub-tree toggles at `ArcadeScene.tsx:893-902`).
* ✅ Navigating `/` → `/arcade` unmounts the Canvas, which force-loses the WebGL context — the driver reclaims all GPU
  memory regardless of what the app forgot.
* ✅ drei cleans up its own resources: `RenderTexture`'s FBO via `useFBO` (`Fbo.js:41-43` → `return () => target.dispose()`),
  and `Text` via `return () => troikaMesh.dispose()` (`Text.js:43`).

### What leaks (never disposed, survives component unmount)

**a) Module-level texture caches — the big one.** These are *deliberately* global, outlive every component, and hold both
the GPU texture **and** its backing `HTMLCanvasElement`:

| Cache | Contents | Resolution |
| --- | --- | --- |
| `textures.ts:5` `textureCache` | wood, concrete, hexPad, metal, grille, brushed (×2), leather (×3), pcb | 2 × 1024², 7 × 512², 1 × 256² |
| `pcTextures.ts:5` `pcTextureCache` | PCB albedo + roughness, brushed metal, hex mesh | **1 × 2048²**, 3 × 1024² |
| `DeskAccessories.tsx:19-21` | brass, paper, mug exterior/interior/roughness/bump | 256², 512², 4 × 512² |
| `Speakers.tsx:8` | speaker cone map | 512² |

Rough VRAM once uploaded with mipmaps (`anisotropy: 8`, mipmaps on by default): **≈ 55–70 MB**, plus a comparable amount
of **CPU** RAM because every `CanvasTexture` pins its source `<canvas>`. None of it is freed when the user scrolls past
the section or routes away; after `forceContextLoss` the same objects are re-uploaded from scratch on the next mount.
Note also `textures.ts:146-161`: `createBrushedMetalMaps()` returns `{ albedo: metalAlbedo(), roughness: new CanvasTexture(node) }`
— the 2048² PCB albedo in particular is almost certainly invisible at this camera distance (`far: 16`, case behind the desk).

**b) Imperative geometries attached via `geometry={...}` props.** R3F never sees these as instances, so `disposeOnIdle`
never touches them:

| File:line | Object | Cost |
| --- | --- | --- |
| `DeskAccessories.tsx:239` | `new LatheGeometry(pts, 224)` | 224 radial segments |
| `DeskAccessories.tsx:252` | `new LatheGeometry(pts, 192)` | |
| `DeskAccessories.tsx:206,219` | `new LatheGeometry(pts, 64 / 56)` | |
| `DeskAccessories.tsx:273` | `new TubeGeometry(curve, 150, 0.0064, 30, false)` | ≈ 9 000 tris for a cable |
| `HeadsetStand.tsx:51,68,83` | 2 × `LatheGeometry(pts, 72)` + `TubeGeometry` | |
| `PcCase.tsx:29` | `new TubeGeometry(curve, 42, r, 10, false)` | |
| `Mouse.tsx:29` | `new ExtrudeGeometry(shape, …)` | |

**c) Imperative materials attached via `material={...}`:** `HeadsetStand.tsx:130,142,152,165` (4 × `MeshStandardMaterial`)
and `Keyboard.tsx:80` (`rimMat`). Same story.

### Why it is missing

The scene was written as "mount once, live forever on the home page", so unmount was never a code path anyone exercised —
and the global caches were added for the *opposite* reason (avoid regenerating 20 canvases if the component remounts
during the enter/exit portal transition). That is a reasonable trade **while mounted**; it becomes a leak only because
nothing ever tears the cache down. A `disposeArcadeTextures()` exported from `textures.ts`/`pcTextures.ts` and called from
an `ArcadeScene` unmount effect would close it without losing the warm-cache benefit during the transition.

---

## 4. Render loop

**Status: missing — the canvas runs a continuous, unthrottled render loop.**

`components/arcade/rig/ArcadeScene.tsx:872-880`

```tsx
<Canvas
  shadows
  dpr={[1, 2]}
  gl={{ antialias: true, alpha: false, powerPreference: "high-performance" }}
  camera={{ fov: 40, near: 0.05, far: 16, position: DEFAULT_CAMERA_POSITION }}
  …
>
```

No `frameloop` prop → R3F defaults to `"always"`. Confirmed: `grep -rn "frameloop|invalidate|advance(" components/arcade` → **0 hits**.
(For contrast, `components/three/CyberpunkRainCanvas.tsx:400` *does* use `frameloop="demand"` with explicit `invalidate()`,
and `StarsCanvas.tsx:89` switches to `"demand"` under reduced motion — so the pattern exists in this codebase, just not here.)

### What one frame costs today *(est.)*

| Pass | Draw calls | Target |
| --- | --- | --- |
| Terminal `RenderTexture` | ≈ 166 | 384×768 × dpr, `samples: 8` MSAA → **768×1536 8× MSAA at dpr 2** |
| Developer-HUD `RenderTexture` | ≈ 60 | same |
| Directional shadow map | ≈ 48 casters | 2048² depth |
| 2 × spot shadow maps | ≈ 96 casters | 2 × 1024² depth |
| `ContactShadows` (`frames` defaults to `Infinity`) | desk subset + 2 blur passes | 512² RT |
| **Main pass** | **≈ 380–450**, each shaded by 42 lights | canvas × dpr², MSAA |
| **Total** | **≈ 750–850 draw calls/frame** | at 60 fps (120 on a high-refresh display) |

### Mitigations that *are* present (credit where due)

* `ArcadeSetup.tsx:160-192` — `IntersectionObserver` with `rootMargin: "900px"` defers the first mount.
* `ArcadeSetup.tsx:144-150` — `visibilitychange` → `pageVisible`.
* `ArcadeScene.tsx:805` — `animationReduced = reduced || transitionLite || !active`, which early-returns from most
  `useFrame` bodies and flips both `RenderTexture`s to `frames={1}` (`Monitor.tsx:109,195`), so the two RT passes *do* stop
  when the section is off-screen.
* `ArcadeScene.tsx:161/192` — a nice `gl.setPixelRatio(1)` during the portal transition, restored on completion.
* Progressive mount: `fullRigReady` gates PC case, speakers, keyboard, mouse, accessories and ContactShadows behind
  `requestIdleCallback` (`ArcadeScene.tsx:808-832`).

### What is still wrong

`sceneActive` only mutes *animation*; the renderer still clears, re-renders ~400 meshes, and re-renders **3 shadow maps +
ContactShadows every frame** while the user is reading the Experience or Contact section 4 screens below. Nothing ever
unmounts the canvas or sets `frameloop="never"`. Combined with Lenis + GSAP on the same main thread, that is a direct
contributor to scroll jank on the home page.

### Why `frameloop="demand"` alone is not the answer

The scene is intrinsically animated — RGB waves (`ArcadeScene.tsx:321`), neon breathing (`:457`), desk runner (`:641`),
fan rotation (`CoolingFan.tsx:35`), screen shader uniform (`Monitor.tsx:592`), plus `OrbitControls` damping
(`dampingFactor: 0.08`, which needs a frame per damped step). Under `"demand"` every one of those would need a manual
`invalidate()`, which converges back to `"always"` whenever the user is looking at it. **The correct fix is visibility-scoped:**

```tsx
frameloop={sceneActive ? "always" : "never"}   // one line, canvas stays warm, 0 GPU work off-screen
```

…plus freezing shadow maps (`gl.shadowMap.autoUpdate = false` / drei `<BakeShadows/>`) and `ContactShadows frames={1}`
once the rig has settled, since neither the desk nor the monitor ever moves.

---

## 5. Material & lighting overhead

**Status: largely unoptimised — this is where the frame budget actually goes.**

### 5a. 42 real-time lights

| Source | Lights |
| --- | --- |
| `AcousticTile` × 12 (`ArcadeScene.tsx:425`) | **12 point** |
| `ReferenceWall` wall washes (`:622-625`) | 4 point |
| `NeonWallTitle` (`:535`) | 1 point |
| `DeskAmbientLoops` (`:692-693`) | 2 point |
| `Monitor` root (`:627-629`) + `PortraitScreen` × 2 (`:324`) + enter button (`:572`) | 6 point |
| `PcCase` (`:339-341`) | 3 point |
| `Speaker` × 2 (`Speakers.tsx`) | 4 point |
| `Keyboard` (`:162,196`) | 2 point |
| `Mouse` (`:213`), `HeadsetStand` (`:256`), `DeskAccessories` (`:597`) | 3 point |
| `DeskAccessories` desk lamp (`:564,586`) | **2 spot, both `castShadow` 1024²** |
| Scene key light (`ArcadeScene.tsx:885`) | **1 directional, `castShadow` 2048²** |
| Fill (`:884`, `:891`) | 1 hemisphere + 1 ambient |
| **Total** | **42 (37 punctual + 3 shadow casters)** |

Three.js's forward renderer loops over `NUM_POINT_LIGHTS` **inside the fragment shader** for every lit material. 37 point
lights × ~220 Standard/Physical surfaces × every covered pixel at `dpr 2` with MSAA is, by a wide margin, the single
largest cost in this scene. Worse: the light count *changes* when `fullRigReady` flips, which invalidates three.js's
program cache and forces a **shader recompile for every material in the scene** mid-interaction — a classic one-off hitch.

Most of these lights are decorative and sub-centimetre in range (`distance: 0.14`–`0.42`): a 0.32 m point light behind a
2 cm acoustic tile contributes almost nothing visually that an `emissive` material + bloom would not.

### 5b. Material choices

* **176 inline `meshStandardMaterial` + 45 imperative + 12 `meshPhysicalMaterial`** vs **26 `meshBasicMaterial`**.
* The `meshPhysicalMaterial` uses are the expensive kind — `clearcoat` + `clearcoatRoughness`
  (`DeskAccessories.tsx:424,428,440`), which adds a second specular lobe per fragment, on a coffee mug and a notebook.
* Dozens of pure-glow decorations (RGB strips, tile edges, shelf accents, fan rings) use `MeshStandardMaterial` with
  `emissive`, where `meshBasicMaterial` + `toneMapped={false}` would be pixel-identical and skip the entire BRDF **and**
  all 37 light iterations. Two places already found `toneMapped={false}` (`ArcadeScene.tsx:672,684`) but kept Standard.
* The `RenderTexture` sub-scenes are the one place that gets it right — everything there is `meshBasicMaterial`.

### 5c. Dead PBR parameters

`envMapIntensity` is set on 12+ materials (`DeskAccessories.tsx:369-440`, `Monitor.tsx:304`, `PcCase.tsx:186`,
`HeadsetStand.tsx:136`, `Keyboard.tsx:139`, `Mouse.tsx:153`) — but **there is no `<Environment>`, no `useEnvironment`, no
PMREM, no `scene.environment` anywhere in the arcade** (`grep` → 0 hits). Without an env map the parameter does nothing.
The metals therefore rely entirely on 37 punctual lights to fake reflections, which is exactly the expensive way to do it.
One 256-px `<Environment preset="city">` (a single PMREM, generated once) would look better *and* let most of those
lights be deleted.

### 5d. Shadows

* `shadows` (bare prop) → `THREE.PCFSoftShadowMap` (verified in the fiber bundle at `events-…esm.js:15883`).
* `shadowMap.autoUpdate` is left at its default `true`, so **all three shadow maps are fully re-rendered every frame**
  even though the desk, monitor, PC and walls never move. 48 `castShadow` objects × 3 passes ≈ 144 extra draws/frame,
  forever. Only the fan blades and the desk runner actually move, and neither is shadow-relevant.
* `ContactShadows` (`ArcadeScene.tsx:902`) uses the default `frames={Infinity}` → a depth render plus two blur passes
  every frame (verified in `drei/core/ContactShadows.js:9,75`).
* Good: both spotlights set `shadow-bias` (`-0.00018`, `-0.00016`) and 1024² maps; camera `far: 16` keeps frusta tight.

### 5e. Textures

All 20+ maps are generated at runtime as `CanvasTexture` (2D-canvas drawing on the main thread at mount), uploaded
uncompressed with mipmaps and `anisotropy: 8`. No KTX2/Basis, no `.ktx2` tooling, no `generateMipmaps: false` anywhere.
One is **2048²** (`pcTextures.ts` PCB albedo) for a part that sits behind tinted glass at ~1 m virtual distance.

---

## Prioritised recommendations (not implemented — audit only)

| # | Change | Expected win | Risk / effort |
| --- | --- | --- | --- |
| 1 | **Cut 42 lights → ≤ 8.** Delete the 12 tile lights + most sub-5 cm accent lights; keep key/fill/hemisphere + 2–3 hero lights. Replace with `emissive` + (optional) selective bloom. | Largest single GPU win; also removes the shader-recompile hitch when `fullRigReady` flips | Low risk, medium effort, purely visual tuning |
| 2 | **Freeze shadows after warm-up.** `gl.shadowMap.autoUpdate = false` + `needsUpdate` on demand (drei `<BakeShadows/>`), and `ContactShadows frames={1}`. | ≈ 144 draws + 3 depth passes + 3 blur passes per frame → ~0 | Very low risk, ~5 lines |
| 3 | **Scope the render loop to visibility.** `frameloop={sceneActive ? "always" : "never"}` on the Canvas. | 100 % of GPU work while the user reads the rest of the home page; directly helps the Lenis/GSAP scroll smoothness | Very low risk, 1 line |
| 4 | **Instance the repeats.** 12 acoustic tiles (144 → ~4 draws), 4 fans, mouse ribs, shelf items, and the 136-mesh terminal readout (→ `<Instances>` or one pre-baked CanvasTexture). | ≈ −300 draw calls/frame | Medium effort; `instanceColor` already proven in `Keyboard.tsx` |
| 5 | **Right-size materials.** Glow-only surfaces → `meshBasicMaterial` + `toneMapped={false}`; drop `clearcoat` where it does not read; either add one small `<Environment>` or delete the dead `envMapIntensity` props. | Removes the 37-light loop from dozens of surfaces | Low risk, mechanical |
| 6 | **Close the disposal gap.** Export `disposeArcadeTextures()` from `textures.ts`/`pcTextures.ts` and call it on `ArcadeScene` unmount; add `useEffect(() => () => geo.dispose(), [geo])` for the 10 imperative geometries and 5 materials; drop the 2048² PCB map to 512². | ≈ 55–70 MB VRAM + an equal amount of CPU RAM returned on route change | Low risk, contained |
| 7 | **Bake the static 90 %** (walls, desk, mounts, chassis, shelf) into one Draco/meshopt GLB with a baked AO/light map, authored from this repo's own geometry so `docs/arcade-assets.md` policy still holds. | Hundreds of draws → single digits; removes most runtime canvas-texture generation | High effort, biggest structural win |
| 8 | **Non-arcade quick win:** `useGLTF(PLANET_MODEL, true)` + a `gltf-transform draco` pass on `public/models/planet` (1.6 MB → ~300 KB). | Faster contact page | Trivial |

**Suggested order:** 3 → 2 → 1 → 5 → 6 → 4 → 7 (cheapest/safest first; 1–3 alone should reclaim the majority of the frame).

---

## Appendix — reproducing the evidence

```bash
# model loading / compression
grep -rn "useGLTF\|DRACOLoader\|KTX2\|meshopt" app components lib
find public -name "*.glb" -o -name "*.gltf"

# instancing
grep -rn "InstancedMesh\|instancedMesh\|<Instances\|BatchedMesh\|mergeGeometries" components/arcade

# disposal
grep -rn "dispose" components/arcade lib/arcade app/arcade          # → 0 matches
grep -n "disposeOnIdle\|forceContextLoss" node_modules/@react-three/fiber/dist/events-*.esm.js

# render loop
grep -rn "frameloop\|invalidate(" components/arcade                  # → 0 matches
sed -n '872,880p' components/arcade/rig/ArcadeScene.tsx

# lights & materials
grep -rhoc "<pointLight\|<spotLight" components/arcade/rig/*.tsx
grep -rho "mesh[A-Za-z]*Material" components/arcade/rig/*.tsx | sort | uniq -c
grep -rn "envMapIntensity" components/arcade/rig | wc -l
grep -rn "<Environment\|useEnvironment\|PMREM" components/arcade     # → 0 matches
```

Runtime verification still to be done in a browser (not available in this sandbox): drop in `r3f-perf` or read
`gl.info.render.calls` / `gl.info.memory` in `onCreated` to confirm the estimated draw-call and texture figures.

---

## Remediation log — what was actually implemented

Landed on `arena/01a107bd-mhk-portfolio` after the audit, in the suggested order (3 → 2 → 1 → 5 → 6 → 4 → 7).
Only `components/arcade/rig/**` was touched; the pure-DOM `/arcade` game is untouched.
Every commit was gated on `npx tsc --noEmit`, `npx eslint components/arcade/rig/` and a full `npm run build`.

| Commit | Recommendation | Change |
| --- | --- | --- |
| `623d9d0` | 3 + 2 | Render loop scoped to visibility + shadows frozen |
| `f654d68` | 1 (part 1) | Decorative point lights deleted from the scene, keyboard, mouse, headset stand, speakers |
| `f7ab0f0` | 1 (part 2) + 5 (part 1) | Monitor / PC case / desk accessories cut to one hero light each; every dead `envMapIntensity` removed |
| `546d2b3` | 4 | Static repeats batched into `InstancedMesh` |
| `487beec` | 5 (part 2) | Glow-only surfaces → unlit `meshBasicMaterial` (scene, keyboard, mouse, speakers, headset) |
| `cfe911e` | 5 (part 3) | Same sweep finished in the PC case and cooling fans |
| `e00ca7f` | 6 (part 1) | Procedural texture caches disposed on unmount |
| `38e83c4` | 6 (part 2) | Imperative geometries and materials disposed on unmount |

### Measured deltas (static counts, same method as the audit)

| Metric | Audited (`acc2e05`) | Now (`38e83c4`) |
| --- | --- | --- |
| Real-time lights | 42 | **8** |
| Shadow-casting lights | 4 | **2** (1 directional key + the desk-lamp spot) |
| Shadow map rebuilds | every frame | **once**, then frozen (`ContactShadows frames={1}`) |
| Render loop when the rig is off-screen | `"always"` | **`"never"`** (`"always"` only while active or warming up) |
| `envMapIntensity` props with no `<Environment>` | 18 | **0** |
| `meshStandard` / `meshPhysical` JSX sites | 183 | **156** |
| `meshBasicMaterial` JSX sites | 26 | **53** |
| Draw calls removed by instancing *(est.)* | — | **≈ 354** |
| `.dispose()` call sites in arcade code | 0 | **26** |

### 1 — lights: 42 → 8

The surviving set, and what each one is for:

| Light | Where | Role |
| --- | --- | --- |
| `hemisphereLight` | ArcadeScene | sky/ground ambient |
| `directionalLight` (castShadow) | ArcadeScene | key light, the only shadow-casting directional |
| `ambientLight` | ArcadeScene | floor fill |
| `pointLight #38bdf8` | ArcadeScene / ReferenceWall | one wall wash, replaces four accent points |
| `pointLight #22d3ee` | ArcadeScene / DeskAmbientLoops | desk wash |
| `pointLight #b45cf0` | Monitor | screen bounce onto the desk, replaces five small points |
| `pointLight #c084fc` | PcCase | RGB bleed out of the glass side panel |
| `spotLight` (castShadow) | DeskAccessories | the only practical: the desk lamp |

The removed lights were compensated with higher `emissiveIntensity` on the surfaces they used to wash, so the
dark/premium look is preserved. Shader permutations also collapse: fewer lights means a much smaller uniform
block and no recompile storm when `fullRigReady` flips the rest of the rig in.

### 4 — instancing

Implemented with native `InstancedMesh` written **once** in `useLayoutEffect`, not drei `<Instances>`:
`node_modules/@react-three/drei/core/Instances.js:129` recomposes every instance matrix on every frame, which
would have re-introduced the per-frame CPU cost the batching was meant to remove.

New shared helper `components/arcade/rig/StaticInstances.tsx` (`InstanceSpec[]` in, one draw call out).

| Batch | Before | After |
| --- | --- | --- |
| Acoustic wall tiles (ReferenceWall) | 156 draws | **6** |
| Monitor terminal rows + scanlines + HUD lines | 171 draws | **3** |
| Cooling fan blades + screws | 11 draws × 4 fans | **2 × 4** |

Rules that any further batching must follow (they are load-bearing here):

* per-instance hue is baked **statically** into `instanceColor`; only a global brightness pulse animates, because
  `instanceColor` multiplies `color` but **not** a Standard material's `emissive` — so glow batches must be
  `meshBasicMaterial`;
* old per-mesh `opacity` values are folded into the instance colour via `multiplyScalar`;
* a unit-box geometry plus per-instance `scale` replaces per-mesh `args`.

### 5 — materials

27 JSX material sites (≈ 40 rendered surfaces once the repeated sub-trees expand: 4 fans, 2 speakers, 2 RAM bars)
were emissive-only decals rendered with `MeshStandardMaterial`, so each one paid the full PBR cost — the lighting
loop over every light, the BRDF, the IBL branches — just to draw a flat colour. They are now `meshBasicMaterial`
with `toneMapped={false}`, and the old `emissiveIntensity` animation was rewritten as a colour multiply:

```ts
// before: Standard
mat.emissive.copy(color);
mat.emissiveIntensity = pulse;
// after: Basic — same on-screen value, no lighting loop
mat.color.copy(color).multiplyScalar(pulse);
```

Values above 1.0 clamp at sRGB output exactly as the old emissive did, so the neon reads the same.
Surfaces that are genuinely *lit* (monitor chassis rails, PC panels, headset metal/leather) stayed Standard.

### 6 — disposal

Two distinct leaks, both closed:

1. **Module-level texture caches.** Every atlas is a runtime `CanvasTexture` parked in a module `Map` (or a
   `let` singleton), so it outlives the canvas — R3F disposes materials on unmount, but `Material.dispose()`
   never touches its maps. Added `disposeArcadeTextures()` (`textures.ts`), `disposePcTextures()`
   (`pcTextures.ts`), `disposeDeskAccessoryTextures()` and `disposeSpeakerTextures()`; `ArcadeScene` calls all
   four from one unmount effect. The walkers dedupe through a `Set` because several cache entries alias the same
   texture (`driverGrilleAlbedo` → `grilleAlbedo`, `brushedMetalMaps.albedo` → `metalAlbedo`).
2. **Imperative geometries/materials.** Objects passed as `geometry={...}` / `material={...}` are *attached*
   objects in R3F, not children, and attached objects are never auto-disposed. Added explicit cleanups for the
   desk mug shell/inner wall/handle, the lamp dome/liner, the headset cup shell/base/cable plus its four
   imperative materials, the four extruded mouse shells, and the PC case's module-level coolant/GPU tubes
   (disposing those is safe: the CPU-side attributes survive, so a later mount simply re-uploads).

### Not implemented

* **Recommendation 7** (bake the static 90 % into one Draco/meshopt GLB with a baked AO/light map) — the big
  structural win, but it is an asset-authoring project, not a code change, and it conflicts with the
  "procedural, no binary assets" policy in `docs/arcade-assets.md` until that policy is revisited.
* **Recommendation 8** (Draco for `public/models/planet`, used by the contact page's `EarthCanvas`) — outside
  the arcade rig, left alone deliberately.
* Dropping the 2048² PCB atlas to 512² — a visual-quality call that belongs with the designer, not a perf fix
  to make unilaterally.
