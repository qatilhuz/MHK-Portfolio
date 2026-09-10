"use client";

import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { AnimationMixer, LoopRepeat, type AnimationAction, type Group as ThreeGroup } from "three";
import { materials } from "@/components/three/materials";
import type { CharacterClip, CharacterHit } from "@/data/character";
import { createHostClips } from "@/lib/character/clips";

const ARMOR = "#1a222c";
const PLATE = "#2a3544";
const DARK = "#10141a";
const GLOW = materials.accent;
const TRIM = "#7c2d12";
const LENS = "#93c5fd";

function Plate({
  args,
  position,
  rotation,
  color = ARMOR,
  metalness = 0.78,
  roughness = 0.28,
  emissive,
  emissiveIntensity = 0,
  name,
}: {
  args: [number, number, number];
  position?: [number, number, number];
  rotation?: [number, number, number];
  color?: string;
  metalness?: number;
  roughness?: number;
  emissive?: string;
  emissiveIntensity?: number;
  name?: string;
}) {
  return (
    <mesh name={name} position={position} rotation={rotation} castShadow>
      <boxGeometry args={args} />
      <meshStandardMaterial
        color={color}
        metalness={metalness}
        roughness={roughness}
        emissive={emissive ?? "#000000"}
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
  const neck = useRef<ThreeGroup>(null);
  const chest = useRef<ThreeGroup>(null);
  const leftEye = useRef<ThreeGroup>(null);
  const rightEye = useRef<ThreeGroup>(null);
  const mixer = useRef<AnimationMixer | null>(null);
  const actions = useRef<Record<string, AnimationAction>>({});
  const current = useRef("Idle");
  const clips = useMemo(() => createHostClips(), []);

  useEffect(() => {
    if (!root.current) return;
    const next = new AnimationMixer(root.current);
    mixer.current = next;
    const map: Record<string, AnimationAction> = {};
    for (const item of clips) {
      const action = next.clipAction(item);
      action.setEffectiveWeight(0);
      map[item.name] = action;
    }
    actions.current = map;
    map.Idle?.reset().setEffectiveWeight(1).fadeIn(0.01).play();
    return () => {
      next.stopAllAction();
    };
  }, [clips]);

  useEffect(() => {
    const list = actions.current;
    const incoming = list[clip] ?? list.Idle;
    const outgoing = list[current.current];
    if (!incoming || current.current === clip) return;
    const loop = clip === "Idle" || clip === "Talk" || clip === "Walk";
    incoming.reset();
    incoming.setLoop(LoopRepeat, loop ? Infinity : 1);
    incoming.clampWhenFinished = !loop;
    incoming.setEffectiveTimeScale(reducedMotion ? 1.35 : 1);
    incoming.setEffectiveWeight(1);
    const fade = reducedMotion ? 0.04 : 0.42;
    if (outgoing && outgoing !== incoming) {
      incoming.crossFadeFrom(outgoing, fade, true);
    } else {
      incoming.fadeIn(fade);
    }
    incoming.play();
    current.current = clip;
  }, [clip, reducedMotion]);

  useFrame((_, delta) => {
    mixer.current?.update(delta);
    if (reducedMotion) return;
    const aim = look.current;
    const headY = Math.max(-0.72, Math.min(0.72, aim.x * 0.72));
    const headX = Math.max(-0.42, Math.min(0.42, -aim.y * 0.48));
    const eyeY = Math.max(-0.22, Math.min(0.22, aim.x * 0.28));
    const eyeX = Math.max(-0.16, Math.min(0.16, -aim.y * 0.2));
    if (head.current) {
      head.current.rotation.y += (headY - head.current.rotation.y) * 0.14;
      head.current.rotation.x += (headX - head.current.rotation.x) * 0.14;
    }
    if (neck.current) {
      neck.current.rotation.y += (headY * 0.28 - neck.current.rotation.y) * 0.1;
      neck.current.rotation.x += (headX * 0.22 - neck.current.rotation.x) * 0.1;
    }
    if (chest.current) {
      chest.current.rotation.y += (headY * 0.12 - chest.current.rotation.y) * 0.06;
    }
    for (const eye of [leftEye.current, rightEye.current]) {
      if (!eye) continue;
      eye.rotation.y += (eyeY - eye.rotation.y) * 0.22;
      eye.rotation.x += (eyeX - eye.rotation.x) * 0.22;
    }
  });

  return (
    <group ref={root} name="Host" position={[0, -0.95, 0]}>
      <group name="Hips">
        <Plate args={[0.3, 0.14, 0.22]} position={[0, 0.9, 0]} color={DARK} />
        <group name="Spine" position={[0, 1.0, 0]}>
          <group ref={chest} name="Chest" position={[0, 0.2, 0]}>
            <mesh
              name="Body"
              onClick={(e) => {
                e.stopPropagation();
                onHit("body");
              }}
            >
              <boxGeometry args={[0.46, 0.5, 0.28]} />
              <meshStandardMaterial color={PLATE} metalness={0.82} roughness={0.24} />
            </mesh>
            <Plate args={[0.2, 0.26, 0.06]} position={[0, 0.04, 0.15]} color={DARK} />
            <Plate
              args={[0.07, 0.22, 0.03]}
              position={[0, 0.02, 0.185]}
              color={GLOW}
              emissive={GLOW}
              emissiveIntensity={0.45}
            />
            <Plate args={[0.42, 0.05, 0.3]} position={[0, 0.24, 0]} color={DARK} />
            <Plate args={[0.05, 0.04, 0.02]} position={[0.14, 0.16, 0.15]} color={TRIM} />
            <group
              name="LeftShoulder"
              position={[-0.32, 0.22, 0]}
              onClick={(e) => {
                e.stopPropagation();
                onHit("shoulder");
              }}
            >
              <Plate args={[0.24, 0.18, 0.24]} />
              <Plate args={[0.1, 0.05, 0.1]} position={[-0.08, 0.1, 0.05]} color={GLOW} emissive={GLOW} emissiveIntensity={0.35} />
            </group>
            <group
              name="RightShoulder"
              position={[0.32, 0.22, 0]}
              onClick={(e) => {
                e.stopPropagation();
                onHit("shoulder");
              }}
            >
              <Plate args={[0.24, 0.18, 0.24]} />
              <Plate args={[0.1, 0.05, 0.1]} position={[0.08, 0.1, 0.05]} color={GLOW} emissive={GLOW} emissiveIntensity={0.35} />
            </group>
            <group ref={neck} name="Neck" position={[0, 0.34, 0]}>
              <Plate args={[0.11, 0.12, 0.11]} color={DARK} />
              <group ref={head} name="Head" position={[0, 0.2, 0]}>
                <mesh
                  name="Head"
                  onClick={(e) => {
                    e.stopPropagation();
                    onHit("head");
                  }}
                >
                  <boxGeometry args={[0.24, 0.26, 0.24]} />
                  <meshStandardMaterial color={PLATE} metalness={0.74} roughness={0.26} />
                </mesh>
                <Plate args={[0.26, 0.07, 0.26]} position={[0, 0.14, 0]} color={DARK} />
                <Plate args={[0.18, 0.05, 0.05]} position={[0, 0.02, 0.13]} color={GLOW} emissive={GLOW} emissiveIntensity={0.5} />
                <Plate args={[0.16, 0.08, 0.04]} position={[0, -0.08, 0.12]} color={DARK} />
                <group ref={leftEye} name="LeftEye" position={[-0.06, 0.04, 0.12]}>
                  <Plate args={[0.045, 0.03, 0.02]} color={LENS} emissive={LENS} emissiveIntensity={0.55} />
                </group>
                <group ref={rightEye} name="RightEye" position={[0.06, 0.04, 0.12]}>
                  <Plate args={[0.045, 0.03, 0.02]} color={LENS} emissive={LENS} emissiveIntensity={0.55} />
                </group>
              </group>
            </group>
            <group name="LeftArm" position={[-0.36, 0.04, 0]} rotation={[0, 0, 0.16]}>
              <Plate args={[0.11, 0.22, 0.13]} />
              <Plate args={[0.13, 0.16, 0.15]} position={[0, -0.2, 0]} color={DARK} />
              <Plate args={[0.09, 0.08, 0.09]} position={[0, -0.32, 0]} />
            </group>
            <group name="RightArm" position={[0.36, 0.04, 0]} rotation={[0, 0, -0.16]}>
              <mesh
                onClick={(e) => {
                  e.stopPropagation();
                  onHit("hand");
                }}
              >
                <boxGeometry args={[0.11, 0.22, 0.13]} />
                <meshStandardMaterial color={ARMOR} metalness={0.78} roughness={0.28} />
              </mesh>
              <Plate args={[0.13, 0.16, 0.15]} position={[0, -0.2, 0]} color={DARK} />
              <group name="RightHand" position={[0, -0.34, 0]}>
                <mesh
                  name="RightHand"
                  onClick={(e) => {
                    e.stopPropagation();
                    onHit("hand");
                  }}
                >
                  <boxGeometry args={[0.1, 0.09, 0.1]} />
                  <meshStandardMaterial color={DARK} metalness={0.65} roughness={0.38} />
                </mesh>
                <Plate args={[0.02, 0.06, 0.02]} position={[-0.04, -0.06, 0.03]} />
                <Plate args={[0.02, 0.07, 0.02]} position={[0, -0.07, 0.03]} />
                <Plate args={[0.02, 0.06, 0.02]} position={[0.04, -0.06, 0.03]} />
              </group>
            </group>
          </group>
        </group>
        <group name="LeftUpLeg" position={[-0.11, 0.76, 0]}>
          <Plate args={[0.15, 0.28, 0.16]} />
          <Plate args={[0.16, 0.22, 0.17]} position={[0, -0.26, 0]} color={DARK} />
          <Plate args={[0.14, 0.08, 0.2]} position={[0, -0.4, 0.02]} />
        </group>
        <group name="RightUpLeg" position={[0.11, 0.76, 0]}>
          <Plate args={[0.15, 0.28, 0.16]} />
          <Plate args={[0.16, 0.22, 0.17]} position={[0, -0.26, 0]} color={DARK} />
          <Plate args={[0.14, 0.08, 0.2]} position={[0, -0.4, 0.02]} />
        </group>
      </group>
    </group>
  );
}
