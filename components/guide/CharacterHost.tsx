"use client";

import { Component, Suspense, useEffect, useMemo, useState, type ReactNode } from "react";
import { useAnimations, useGLTF } from "@react-three/drei";
import { GUIDE_MODEL_PATH } from "@/data/guide";
import { CLIP_ALIASES, type CharacterClip, type CharacterHit } from "@/data/character";
import { ArmoredRig } from "@/components/character/ArmoredRig";

class ModelErrorBoundary extends Component<
  { children: ReactNode; fallback: ReactNode; resetKey: string },
  { failed: boolean }
> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidUpdate(prevProps: { resetKey: string }) {
    if (prevProps.resetKey !== this.props.resetKey && this.state.failed) {
      this.setState({ failed: false });
    }
  }

  render() {
    return this.state.failed ? this.props.fallback : this.props.children;
  }
}

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
  const [hasFile, setHasFile] = useState(false);

  useEffect(() => {
    let live = true;
    fetch(GUIDE_MODEL_PATH, { method: "HEAD" })
      .then((response) => {
        const len = Number(response.headers.get("content-length") ?? "0");
        if (live && response.ok && len > 2048) setHasFile(true);
      })
      .catch(() => {
        if (live) setHasFile(false);
      });
    return () => {
      live = false;
    };
  }, []);

  const proceduralFallback = (
    <ArmoredRig clip={clip} look={look} lookWeight={lookWeight} reducedMotion={reducedMotion} onHit={onHit} />
  );

  if (!hasFile) return proceduralFallback;

  return (
    <ModelErrorBoundary fallback={proceduralFallback} resetKey={GUIDE_MODEL_PATH}>
      <Suspense fallback={proceduralFallback}>
        <GltfHost clip={clip} reducedMotion={reducedMotion} onHit={onHit} />
      </Suspense>
    </ModelErrorBoundary>
  );
}
