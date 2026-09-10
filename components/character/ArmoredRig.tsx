"use client";

import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import {
  AnimationMixer,
  LoopRepeat,
  MathUtils,
  type AnimationAction,
  type Group as ThreeGroup,
} from "three";
import { materials } from "@/components/three/materials";
import type { CharacterClip, CharacterHit } from "@/data/character";
import { createHostClips } from "@/lib/character/clips";

const JACKET = materials.figure;
const INNER = materials.metal;
const BOOT = materials.desk;
const GLOVE = materials.paper;
const TRIM = materials.accent;
const LIGHT = materials.fill;

function Plate({
  args,
  position,
  rotation,
  color = JACKET,
  metalness = 0.35,
  roughness = 0.55,
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
    incoming.setEffectiveTimeScale(reducedMotion ? 1.2 : 1);
    incoming.setEffectiveWeight(1);
    const fade = reducedMotion ? 0.05 : 0.38;
    if (outgoing && outgoing !== incoming) incoming.crossFadeFrom(outgoing, fade, true);
    else incoming.fadeIn(fade);
    incoming.play();
    current.current = clip;
  }, [clip, reducedMotion]);

  useFrame((_, delta) => {
    mixer.current?.update(delta);
    const w = reducedMotion ? 0.25 : lookWeight.current;
    const aim = look.current;
    const yaw = MathUtils.clamp(aim.x * 0.68 * w, -0.7, 0.7);
    const pitch = MathUtils.clamp(aim.y * 0.5 * w, -0.4, 0.42);
    const damp = reducedMotion ? 14 : 16;
    if (head.current) {
      head.current.rotation.y = MathUtils.damp(head.current.rotation.y, yaw, damp, delta);
      head.current.rotation.x = MathUtils.damp(head.current.rotation.x, pitch, damp, delta);
    }
    if (neck.current) {
      neck.current.rotation.y = MathUtils.damp(neck.current.rotation.y, yaw * 0.32, damp, delta);
      neck.current.rotation.x = MathUtils.damp(neck.current.rotation.x, pitch * 0.22, damp, delta);
    }
    if (chest.current) {
      chest.current.rotation.y = MathUtils.damp(chest.current.rotation.y, yaw * 0.1, 5, delta);
    }
    const eyeY = MathUtils.clamp(aim.x * 0.22 * w, -0.2, 0.2);
    const eyeX = MathUtils.clamp(aim.y * 0.16 * w, -0.14, 0.14);
    for (const eye of [leftEye.current, rightEye.current]) {
      if (!eye) continue;
      eye.rotation.y = MathUtils.damp(eye.rotation.y, eyeY, 14, delta);
      eye.rotation.x = MathUtils.damp(eye.rotation.x, eyeX, 14, delta);
    }
  });

  return (
    <group ref={root} name="Host">
      <group name="Hips">
        <Plate args={[0.3, 0.12, 0.2]} position={[0, 0.9, 0]} color={BOOT} roughness={0.62} />
        <group name="Spine" position={[0, 1.0, 0]}>
          <group ref={chest} name="Chest" position={[0, 0.2, 0]}>
            <mesh
              name="Body"
              onClick={(e) => {
                e.stopPropagation();
                onHit("body");
              }}
            >
              <boxGeometry args={[0.44, 0.48, 0.26]} />
              <meshStandardMaterial color={JACKET} metalness={0.28} roughness={0.58} />
            </mesh>
            <Plate args={[0.2, 0.28, 0.08]} position={[0, 0.02, 0.12]} color={INNER} metalness={0.45} roughness={0.4} />
            <Plate
              args={[0.06, 0.2, 0.02]}
              position={[0, 0.04, 0.17]}
              color={TRIM}
              emissive={TRIM}
              emissiveIntensity={0.28}
              metalness={0.2}
              roughness={0.4}
            />
            <Plate args={[0.42, 0.04, 0.28]} position={[0, 0.24, 0]} color={INNER} />
            <group
              name="LeftShoulder"
              position={[-0.3, 0.2, 0]}
              onClick={(e) => {
                e.stopPropagation();
                onHit("shoulder");
              }}
            >
              <Plate args={[0.2, 0.16, 0.22]} color={JACKET} />
              <Plate args={[0.08, 0.04, 0.08]} position={[-0.07, 0.08, 0.04]} color={TRIM} emissive={TRIM} emissiveIntensity={0.2} />
            </group>
            <group
              name="RightShoulder"
              position={[0.3, 0.2, 0]}
              onClick={(e) => {
                e.stopPropagation();
                onHit("shoulder");
              }}
            >
              <Plate args={[0.2, 0.16, 0.22]} color={JACKET} />
              <Plate args={[0.08, 0.04, 0.08]} position={[0.07, 0.08, 0.04]} color={TRIM} emissive={TRIM} emissiveIntensity={0.2} />
            </group>
            <group ref={neck} name="Neck" position={[0, 0.32, 0]}>
              <Plate args={[0.1, 0.1, 0.1]} color={INNER} />
              <group ref={head} name="Head" position={[0, 0.18, 0]}>
                <mesh
                  name="Head"
                  onClick={(e) => {
                    e.stopPropagation();
                    onHit("head");
                  }}
                >
                  <boxGeometry args={[0.22, 0.24, 0.22]} />
                  <meshStandardMaterial color={INNER} metalness={0.4} roughness={0.42} />
                </mesh>
                <Plate args={[0.24, 0.05, 0.24]} position={[0, 0.13, 0]} color={JACKET} />
                <Plate args={[0.14, 0.03, 0.03]} position={[0, -0.06, 0.12]} color={BOOT} />
                <group ref={leftEye} name="LeftEye" position={[-0.05, 0.04, 0.12]}>
                  <Plate args={[0.04, 0.025, 0.018]} color={LIGHT} emissive={TRIM} emissiveIntensity={0.22} />
                </group>
                <group ref={rightEye} name="RightEye" position={[0.05, 0.04, 0.12]}>
                  <Plate args={[0.04, 0.025, 0.018]} color={LIGHT} emissive={TRIM} emissiveIntensity={0.22} />
                </group>
              </group>
            </group>
            <group name="LeftArm" position={[-0.34, 0.04, 0]} rotation={[0, 0, 0.14]}>
              <Plate args={[0.1, 0.22, 0.12]} color={JACKET} />
              <Plate args={[0.11, 0.14, 0.13]} position={[0, -0.2, 0]} color={INNER} />
              <group name="LeftHand" position={[0, -0.32, 0]}>
                <Plate args={[0.09, 0.08, 0.09]} color={GLOVE} roughness={0.7} metalness={0.12} />
                <Plate args={[0.02, 0.05, 0.02]} position={[-0.03, -0.05, 0.02]} color={GLOVE} />
                <Plate args={[0.02, 0.055, 0.02]} position={[0, -0.055, 0.02]} color={GLOVE} />
                <Plate args={[0.02, 0.05, 0.02]} position={[0.03, -0.05, 0.02]} color={GLOVE} />
              </group>
            </group>
            <group name="RightArm" position={[0.34, 0.04, 0]} rotation={[0, 0, -0.14]}>
              <mesh
                onClick={(e) => {
                  e.stopPropagation();
                  onHit("hand");
                }}
              >
                <boxGeometry args={[0.1, 0.22, 0.12]} />
                <meshStandardMaterial color={JACKET} metalness={0.28} roughness={0.58} />
              </mesh>
              <Plate args={[0.11, 0.14, 0.13]} position={[0, -0.2, 0]} color={INNER} />
              <group name="RightHand" position={[0, -0.32, 0]}>
                <mesh
                  name="RightHand"
                  onClick={(e) => {
                    e.stopPropagation();
                    onHit("hand");
                  }}
                >
                  <boxGeometry args={[0.09, 0.08, 0.09]} />
                  <meshStandardMaterial color={GLOVE} metalness={0.12} roughness={0.7} />
                </mesh>
                <Plate args={[0.02, 0.05, 0.02]} position={[-0.03, -0.05, 0.02]} color={GLOVE} />
                <Plate args={[0.02, 0.055, 0.02]} position={[0, -0.055, 0.02]} color={GLOVE} />
                <Plate args={[0.02, 0.05, 0.02]} position={[0.03, -0.05, 0.02]} color={GLOVE} />
              </group>
            </group>
          </group>
        </group>
        <group name="LeftUpLeg" position={[-0.1, 0.76, 0]}>
          <Plate args={[0.14, 0.26, 0.15]} color={BOOT} />
          <Plate args={[0.15, 0.2, 0.16]} position={[0, -0.24, 0]} color={JACKET} />
          <Plate args={[0.13, 0.07, 0.2]} position={[0, -0.38, 0.02]} color={INNER} />
        </group>
        <group name="RightUpLeg" position={[0.1, 0.76, 0]}>
          <Plate args={[0.14, 0.26, 0.15]} color={BOOT} />
          <Plate args={[0.15, 0.2, 0.16]} position={[0, -0.24, 0]} color={JACKET} />
          <Plate args={[0.13, 0.07, 0.2]} position={[0, -0.38, 0.02]} color={INNER} />
        </group>
      </group>
    </group>
  );
}
