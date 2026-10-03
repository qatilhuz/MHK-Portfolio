"use client";

import type { CharacterClip, CharacterHit } from "@/data/character";
import { ArmoredRig } from "@/components/character/ArmoredRig";

/**
 * The licensed GLB is intentionally absent from this repository. Keep the
 * procedural rig mounted synchronously so a missing, rewritten, or malformed
 * model response can never replace the visible host with an empty scene.
 */
export function CharacterHost({
  clip,
  look,
  lookWeight,
  reducedMotion,
  onHit,
}: {
  clip: CharacterClip;
  look: { current: { x: number; y: number } };
  lookWeight: { current: number };
  reducedMotion: boolean;
  onHit: (region: CharacterHit) => void;
}) {
  return (
    <ArmoredRig
      clip={clip}
      look={look}
      lookWeight={lookWeight}
      reducedMotion={reducedMotion}
      onHit={onHit}
    />
  );
}
