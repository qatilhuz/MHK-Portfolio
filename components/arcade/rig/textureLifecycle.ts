"use client";

/**
 * Reference-counted ownership for the rig's module-level texture caches.
 *
 * Why this exists
 * ---------------
 * `textures.ts`, `pcTextures.ts`, `DeskAccessories.tsx` and `Speakers.tsx` each
 * memoise their procedural atlases in a module-level `Map`, and consumers grab
 * them once with `useMemo(() => pcBrushedMetal(), [])`. Disposal used to hang
 * off a plain unmount cleanup in `ArcadeScene`:
 *
 *     useEffect(() => () => { disposeArcadeTextures(); ... }, []);
 *
 * That is correct only if exactly one scene is ever alive, which is not what
 * React guarantees:
 *
 *   - On a client route change Next mounts the incoming tree *before* it runs
 *     the outgoing tree's passive cleanups. Coming back from /arcade, the new
 *     `ArcadeScene` repopulated the shared caches and memoised the fresh
 *     textures, and only then did the previous scene's cleanup run - disposing
 *     the textures the live scene was already holding. The GPU handles were
 *     gone but the materials still pointed at them, which is the "components
 *     disappear, colours and textures turn black" failure.
 *   - A Suspense boundary that re-suspends unmounts the effects of the hidden
 *     subtree and re-runs them on reveal, and StrictMode double-invokes effects
 *     in development. Both fire the same destructive cleanup under a scene that
 *     is still very much alive.
 *
 * The contract
 * ------------
 * Every scene instance acquires on mount and releases on unmount. Disposal only
 * happens once the live count reaches zero, and even then it is deferred by a
 * short grace period so an immediately remounting scene can cancel it. The
 * generators are pure, so rebuilding after a real teardown is just CPU time.
 */

type Disposer = () => void;

/**
 * Long enough to cover a React commit that mounts the replacement scene after
 * tearing the old one down, short enough that leaving the page for good still
 * frees several MB of VRAM promptly.
 */
const RELEASE_GRACE_MS = 1500;

let liveScenes = 0;
let pendingRelease: ReturnType<typeof setTimeout> | null = null;

function cancelPendingRelease() {
  if (pendingRelease === null) return;
  globalThis.clearTimeout(pendingRelease);
  pendingRelease = null;
}

/** Claim the shared caches for one scene instance. */
export function acquireArcadeTextureCaches() {
  liveScenes += 1;
  cancelPendingRelease();
}

/**
 * Give up one scene's claim. Runs `disposers` only if nothing re-acquires
 * within the grace period.
 */
export function releaseArcadeTextureCaches(disposers: readonly Disposer[]) {
  liveScenes = Math.max(0, liveScenes - 1);
  if (liveScenes > 0) return;

  cancelPendingRelease();
  pendingRelease = globalThis.setTimeout(() => {
    pendingRelease = null;
    // Re-check: a scene may have mounted and unmounted again while we waited.
    if (liveScenes > 0) return;
    for (const dispose of disposers) dispose();
  }, RELEASE_GRACE_MS);
}
