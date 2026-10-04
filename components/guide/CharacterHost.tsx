"use client";

import { lazy, Suspense, useEffect, useState } from "react";
import { GUIDE_MODEL_PATH } from "@/data/guide";
import type { CharacterClip, CharacterHit } from "@/data/character";
import { ArmoredRig, type CharacterExpression } from "@/components/character/ArmoredRig";

const GltfHost = lazy(() => import("./GltfHost").then((module) => ({ default: module.GltfHost })));

let guideModelAvailable: boolean | undefined;
let guideModelProbe: Promise<boolean> | null = null;

function probeGuideModel() {
  if (guideModelAvailable !== undefined) return Promise.resolve(guideModelAvailable);
  if (!guideModelProbe) {
    guideModelProbe = fetch(GUIDE_MODEL_PATH, { method: "HEAD" })
      .then((response) => {
        const len = Number(response.headers.get("content-length") ?? "0");
        return response.ok && len > 2048;
      })
      .catch(() => false)
      .then((available) => {
        guideModelAvailable = available;
        return available;
      });
  }
  return guideModelProbe;
}

export function CharacterHost({
  clip,
  expression,
  look,
  lookWeight,
  reducedMotion,
  onHit,
}: {
  clip: CharacterClip;
  expression: CharacterExpression;
  look: { current: { x: number; y: number } };
  lookWeight: { current: number };
  reducedMotion: boolean;
  onHit: (region: CharacterHit) => void;
}) {
  const [hasFile, setHasFile] = useState(() => guideModelAvailable === true);

  useEffect(() => {
    let live = true;
    void probeGuideModel().then((available) => {
      if (live) setHasFile(available);
    });
    return () => {
      live = false;
    };
  }, []);

  const fallback = (
    <ArmoredRig
      clip={clip}
      expression={expression}
      look={look}
      lookWeight={lookWeight}
      reducedMotion={reducedMotion}
      onHit={onHit}
    />
  );

  if (!hasFile) return fallback;

  return (
    <Suspense fallback={fallback}>
      <GltfHost clip={clip} reducedMotion={reducedMotion} onHit={onHit} />
    </Suspense>
  );
}
