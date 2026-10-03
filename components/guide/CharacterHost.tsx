"use client";

import type { CharacterClip, CharacterHit } from "@/data/character";
import { ArmoredRig } from "@/components/character/ArmoredRig";

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
