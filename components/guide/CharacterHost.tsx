"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useAnimations, useGLTF } from "@react-three/drei";
import { GUIDE_MODEL_PATH } from "@/data/guide";
import { CLIP_ALIASES, type CharacterClip, type CharacterHit } from "@/data/character";
import { CharacterRig } from "./CharacterRig";

function GltfHost({
  clip,
  reducedMotion,
  onHit,
}: {
  clip: CharacterClip;
  reducedMotion: boolean;
  onHit: (region: CharacterHit) => void;
}) {
  const gltf = useGLTF(GUIDE_MODEL_PATH);
  const { actions, names } = useAnimations(gltf.animations, gltf.scene);
  const resolved = useMemo(() => {
    const direct = names.find((name) => CLIP_ALIASES[name] === clip || name === clip);
    return direct ?? names.find((name) => CLIP_ALIASES[name] === "Idle") ?? names[0];
  }, [clip, names]);

  useEffect(() => {
    if (!resolved || !actions[resolved]) return;
    const action = actions[resolved];
    action?.reset().fadeIn(reducedMotion ? 0 : 0.3).play();
    return () => {
      action?.fadeOut(reducedMotion ? 0 : 0.3);
    };
  }, [actions, reducedMotion, resolved]);

  return (
    <primitive
      object={gltf.scene}
      position={[0, -0.95, 0]}
      scale={1.05}
      onClick={(event: { stopPropagation: () => void }) => {
        event.stopPropagation();
        onHit("body");
      }}
    />
  );
}

export function CharacterHost({
  clip,
  look,
  reducedMotion,
  onHit,
}: {
  clip: CharacterClip;
  look: { x: number; y: number };
  reducedMotion: boolean;
  onHit: (region: CharacterHit) => void;
}) {
  const [hasFile, setHasFile] = useState(false);

  useEffect(() => {
    let live = true;
    fetch(GUIDE_MODEL_PATH, { method: "HEAD" })
      .then((response) => {
        if (live && response.ok) setHasFile(true);
      })
      .catch(() => {
        if (live) setHasFile(false);
      });
    return () => {
      live = false;
    };
  }, []);

  if (!hasFile) {
    return (
      <CharacterRig clip={clip} look={look} reducedMotion={reducedMotion} onHit={onHit} />
    );
  }

  return (
    <Suspense
      fallback={
        <CharacterRig clip={clip} look={look} reducedMotion={reducedMotion} onHit={onHit} />
      }
    >
      <GltfHost clip={clip} reducedMotion={reducedMotion} onHit={onHit} />
    </Suspense>
  );
}
