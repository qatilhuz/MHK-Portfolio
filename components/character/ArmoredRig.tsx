"use client";

import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { AnimationMixer, LoopRepeat, type AnimationAction, type Group as ThreeGroup } from "three";
import { materials } from "@/components/three/materials";
import type { CharacterClip, CharacterHit } from "@/data/character";
import { createHostClips } from "@/lib/character/clips";

const ARMOR = "#1c2430";
const PLATE = "#243044";
const DARK = "#12161c";
const GLOW = materials.accent;
const TRIM = "#9a3412";

function Plate({
  args,
  position,
  rotation,
  color = ARMOR,
  metalness = 0.72,
  roughness = 0.32,
  emissive,
  emissiveIntensity = 0,
}: {
  args: [number, number, number];
  position?: [number, number, number];
  rotation?: [number, number, number];
  color?: string;
  metalness?: number;
  roughness?: number;
  emissive?: string;
  emissiveIntensity?: number;
}) {
  return (
    <mesh position={position} rotation={rotation} castShadow>
      <boxGeometry args={args} />
      <meshStandardMaterial
        color={color}
        metalness={metalness}
        roughness={roughness}
        emissive={emissive ?? "#000"}
        emissiveIntensity={emissiveIntensity}
      />
    </mesh>
  );
}

export function ArmoredRig({
  clip,
  look,
  reducedMotion,
  onHit,
}: {
  clip: CharacterClip;
  look: { current: { x: number; y: number } };
  reducedMotion: boolean;
  onHit: (region: CharacterHit) => void;
}) {
  const root = useRef<ThreeGroup>(null);
  const head = useRef<ThreeGroup>(null);
  const mixer = useRef<AnimationMixer | null>(null);
  const actions = useRef<Record<string, AnimationAction>>({});
  const current = useRef("Idle");
  const clips = useMemo(() => createHostClips(), []);

  useEffect(() => {
    if (!root.current) return;
    const next = new AnimationMixer(root.current);
    mixer.current = next;
    const map: Record<string, AnimationAction> = {};
    for (const item of clips) map[item.name] = next.clipAction(item);
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
    const loop = clip === "Idle" || clip === "Talk" || clip === "Walk";
    incoming.setLoop(LoopRepeat, loop ? Infinity : 1);
    incoming.clampWhenFinished = !loop;
    incoming.setEffectiveWeight(1);
    incoming.fadeIn(reducedMotion ? 0 : 0.32);
    incoming.play();
    outgoing?.fadeOut(reducedMotion ? 0 : 0.32);
    current.current = clip;
  }, [clip, reducedMotion]);

  useFrame((_, delta) => {
    if (!reducedMotion) mixer.current?.update(delta);
    if (!head.current || reducedMotion) return;
    const aim = look.current;
    const ty = Math.max(-0.7, Math.min(0.7, aim.x * 0.55));
    const tx = Math.max(-0.35, Math.min(0.35, -aim.y * 0.28));
    head.current.rotation.y += (ty - head.current.rotation.y) * 0.12;
    head.current.rotation.x += (tx - head.current.rotation.x) * 0.12;
  });

  return (
    <group ref={root} name="Host" position={[0, -0.95, 0]}>
      <group name="Hips">
        <Plate args={[0.28, 0.16, 0.2]} position={[0, 0.92, 0]} color={DARK} />
        <group name="Spine" position={[0, 1.02, 0]}>
          <group name="Chest" position={[0, 0.2, 0]}>
            <mesh
              name="Body"
              onClick={(e) => {
                e.stopPropagation();
                onHit("body");
              }}
            >
              <boxGeometry args={[0.42, 0.48, 0.26]} />
              <meshStandardMaterial color={PLATE} metalness={0.78} roughness={0.28} />
            </mesh>
            <Plate args={[0.18, 0.22, 0.06]} position={[0, 0.06, 0.14]} color={DARK} />
            <Plate
              args={[0.08, 0.2, 0.03]}
              position={[0, 0.04, 0.17]}
              emissive={GLOW}
              emissiveIntensity={0.55}
              color={GLOW}
            />
            <Plate args={[0.06, 0.04, 0.02]} position={[0.12, 0.14, 0.14]} color={TRIM} />
            <group
              name="LeftShoulder"
              position={[-0.3, 0.2, 0]}
              onClick={(e) => {
                e.stopPropagation();
                onHit("shoulder");
              }}
            >
              <Plate args={[0.22, 0.16, 0.22]} position={[0, 0.04, 0]} />
              <Plate args={[0.08, 0.04, 0.08]} position={[-0.08, 0.1, 0.04]} emissive={GLOW} emissiveIntensity={0.4} color={GLOW} />
            </group>
            <group
              name="RightShoulder"
              position={[0.3, 0.2, 0]}
              onClick={(e) => {
                e.stopPropagation();
                onHit("shoulder");
              }}
            >
              <Plate args={[0.22, 0.16, 0.22]} position={[0, 0.04, 0]} />
              <Plate args={[0.08, 0.04, 0.08]} position={[0.08, 0.1, 0.04]} emissive={GLOW} emissiveIntensity={0.4} color={GLOW} />
            </group>
            <group name="Neck" position={[0, 0.32, 0]}>
              <Plate args={[0.1, 0.1, 0.1]} color={DARK} />
              <group ref={head} name="Head" position={[0, 0.18, 0]}>
                <mesh
                  name="Head"
                  onClick={(e) => {
                    e.stopPropagation();
                    onHit("head");
                  }}
                >
                  <boxGeometry args={[0.22, 0.24, 0.22]} />
                  <meshStandardMaterial color={PLATE} metalness={0.7} roughness={0.3} />
                </mesh>
                <Plate args={[0.24, 0.06, 0.24]} position={[0, 0.12, 0]} color={DARK} />
                <Plate args={[0.16, 0.04, 0.04]} position={[0, 0.02, 0.12]} emissive={GLOW} emissiveIntensity={0.7} color={GLOW} />
                <Plate args={[0.03, 0.03, 0.02]} position={[-0.05, 0.04, 0.12]} color={materials.light} />
                <Plate args={[0.03, 0.03, 0.02]} position={[0.05, 0.04, 0.12]} color={materials.light} />
              </group>
            </group>
            <group name="LeftArm" position={[-0.34, 0.06, 0]} rotation={[0, 0, 0.18]}>
              <Plate args={[0.1, 0.36, 0.12]} />
              <Plate args={[0.12, 0.14, 0.14]} position={[0, -0.22, 0]} color={DARK} />
            </group>
            <group name="RightArm" position={[0.34, 0.06, 0]} rotation={[0, 0, -0.18]}>
              <mesh
                onClick={(e) => {
                  e.stopPropagation();
                  onHit("hand");
                }}
              >
                <boxGeometry args={[0.1, 0.36, 0.12]} />
                <meshStandardMaterial color={ARMOR} metalness={0.72} roughness={0.32} />
              </mesh>
              <group name="RightHand" position={[0, -0.28, 0]}>
                <mesh
                  name="RightHand"
                  onClick={(e) => {
                    e.stopPropagation();
                    onHit("hand");
                  }}
                >
                  <boxGeometry args={[0.1, 0.1, 0.1]} />
                  <meshStandardMaterial color={DARK} metalness={0.6} roughness={0.4} />
                </mesh>
              </group>
            </group>
          </group>
        </group>
        <group name="LeftUpLeg" position={[-0.1, 0.78, 0]}>
          <Plate args={[0.14, 0.42, 0.16]} />
          <Plate args={[0.16, 0.12, 0.18]} position={[0, -0.28, 0]} color={DARK} />
        </group>
        <group name="RightUpLeg" position={[0.1, 0.78, 0]}>
          <Plate args={[0.14, 0.42, 0.16]} />
          <Plate args={[0.16, 0.12, 0.18]} position={[0, -0.28, 0]} color={DARK} />
        </group>
      </group>
    </group>
  );
}
