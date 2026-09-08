"use client";

import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { AnimationMixer, LoopRepeat, type AnimationAction, type Group as ThreeGroup } from "three";
import { materials } from "@/components/three/materials";
import type { CharacterClip, CharacterHit } from "@/data/character";
import { createHostClips } from "@/lib/guide/clips";

const SKIN = "#b9a394";
const HAIR = "#18181b";
const SHIRT = materials.plastic;
const PANTS = materials.desk;

export function CharacterRig({
  clip,
  look,
  reducedMotion,
  onHit,
}: {
  clip: CharacterClip;
  look: { x: number; y: number } | { current: { x: number; y: number } };
  reducedMotion: boolean;
  onHit: (region: CharacterHit) => void;
}) {
  const root = useRef<ThreeGroup>(null);
  const head = useRef<ThreeGroup>(null);
  const mixer = useRef<AnimationMixer | null>(null);
  const actions = useRef<Record<string, AnimationAction>>({});
  const current = useRef<string>("Idle");
  const clips = useMemo(() => createHostClips(), []);

  useEffect(() => {
    if (!root.current) return;
    const next = new AnimationMixer(root.current);
    mixer.current = next;
    const map: Record<string, AnimationAction> = {};
    for (const item of clips) {
      map[item.name] = next.clipAction(item);
    }
    actions.current = map;
    map.Idle?.reset().play();
    return () => {
      next.stopAllAction();
    };
  }, [clips]);

  useEffect(() => {
    const list = actions.current;
    const incoming = list[clip] ?? list.Idle;
    const outgoing = list[current.current];
    if (!incoming || current.current === clip) return;
    incoming.reset();
    incoming.setLoop(LoopRepeat, clip === "Idle" || clip === "Talk" || clip === "Walk" ? Infinity : 1);
    incoming.clampWhenFinished = clip !== "Idle" && clip !== "Talk" && clip !== "Walk";
    incoming.fadeIn(reducedMotion ? 0 : 0.28);
    incoming.play();
    outgoing?.fadeOut(reducedMotion ? 0 : 0.28);
    current.current = clip;
  }, [clip, reducedMotion]);

  useFrame((_, delta) => {
    if (!reducedMotion) mixer.current?.update(delta);
    if (!head.current || reducedMotion) return;
    const aim = "current" in look ? look.current : look;
    head.current.rotation.y += (aim.x * 0.35 - head.current.rotation.y) * 0.08;
    head.current.rotation.x += (-aim.y * 0.2 - head.current.rotation.x) * 0.08;
  });

  return (
    <group ref={root} name="Host" position={[0, -0.95, 0]} onPointerMissed={() => undefined}>
      <group name="Hips">
        <mesh position={[0, 0.95, 0]} name="Pelvis" castShadow>
          <sphereGeometry args={[0.14, 16, 16]} />
          <meshStandardMaterial color={PANTS} roughness={0.55} />
        </mesh>
        <group name="Spine" position={[0, 1.05, 0]}>
          <group name="Chest" position={[0, 0.22, 0]}>
            <mesh
              name="Body"
              position={[0, 0.08, 0]}
              castShadow
              onClick={(event) => {
                event.stopPropagation();
                onHit("body");
              }}
            >
              <capsuleGeometry args={[0.2, 0.42, 6, 12]} />
              <meshStandardMaterial color={SHIRT} roughness={0.5} />
            </mesh>
            <mesh position={[0, 0.12, 0.12]}>
              <boxGeometry args={[0.12, 0.22, 0.03]} />
              <meshStandardMaterial color={materials.accent} roughness={0.4} />
            </mesh>
            <group name="Neck" position={[0, 0.38, 0]}>
              <group ref={head} name="Head" position={[0, 0.16, 0]}>
                <mesh
                  name="Head"
                  castShadow
                  onClick={(event) => {
                    event.stopPropagation();
                    onHit("head");
                  }}
                >
                  <sphereGeometry args={[0.175, 24, 24]} />
                  <meshStandardMaterial color={SKIN} roughness={0.45} />
                </mesh>
                <mesh position={[0, 0.08, 0]} scale={[1.05, 0.55, 1.05]}>
                  <sphereGeometry args={[0.16, 16, 12]} />
                  <meshStandardMaterial color={HAIR} roughness={0.7} />
                </mesh>
              </group>
            </group>
            <group name="LeftArm" position={[-0.28, 0.18, 0]} rotation={[0, 0, 0.25]}>
              <mesh castShadow>
                <capsuleGeometry args={[0.055, 0.38, 4, 8]} />
                <meshStandardMaterial color={SHIRT} roughness={0.5} />
              </mesh>
            </group>
            <group name="RightArm" position={[0.28, 0.18, 0]} rotation={[0, 0, -0.25]}>
              <mesh
                castShadow
                onClick={(event) => {
                  event.stopPropagation();
                  onHit("hand");
                }}
              >
                <capsuleGeometry args={[0.055, 0.38, 4, 8]} />
                <meshStandardMaterial color={SHIRT} roughness={0.5} />
              </mesh>
              <group name="RightHand" position={[0, -0.28, 0]}>
                <mesh
                  name="RightHand"
                  onClick={(event) => {
                    event.stopPropagation();
                    onHit("hand");
                  }}
                >
                  <sphereGeometry args={[0.045, 10, 10]} />
                  <meshStandardMaterial color={SKIN} roughness={0.5} />
                </mesh>
              </group>
            </group>
          </group>
        </group>
        <group name="LeftUpLeg" position={[-0.09, 0.82, 0]}>
          <mesh castShadow>
            <capsuleGeometry args={[0.07, 0.42, 4, 8]} />
            <meshStandardMaterial color={PANTS} roughness={0.55} />
          </mesh>
        </group>
        <group name="RightUpLeg" position={[0.09, 0.82, 0]}>
          <mesh castShadow>
            <capsuleGeometry args={[0.07, 0.42, 4, 8]} />
            <meshStandardMaterial color={PANTS} roughness={0.55} />
          </mesh>
        </group>
      </group>
    </group>
  );
}
