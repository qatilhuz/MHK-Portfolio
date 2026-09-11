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
import type { CharacterClip, CharacterHit } from "@/data/character";
import { createHostClips } from "@/lib/character/clips";
import { sampleViseme } from "@/lib/character/visemes";

const PRIMARY = "#1a1f2e";
const SECONDARY = "#2e3444";
const ACCENT = "#3b82f6";
const DETAIL = "#e5e7eb";

function Plate({
  args,
  position,
  rotation,
  color = PRIMARY,
  metalness = 0.18,
  roughness = 0.62,
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
  const mouth = useRef<ThreeGroup>(null);
  const mixer = useRef<AnimationMixer | null>(null);
  const actions = useRef<Record<string, AnimationAction>>({});
  const current = useRef("Idle");
  const blink = useRef(0);
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
    const loop = clip === "Idle" || clip === "Talk" || clip === "Walk" || clip === "Run" || clip === "Dance";
    incoming.reset();
    incoming.setLoop(LoopRepeat, loop ? Infinity : 1);
    incoming.clampWhenFinished = !loop;
    incoming.setEffectiveTimeScale(reducedMotion ? 1.2 : 1);
    incoming.setEffectiveWeight(1);
    const fade = reducedMotion ? 0.05 : 0.36;
    if (outgoing && outgoing !== incoming) incoming.crossFadeFrom(outgoing, fade, true);
    else incoming.fadeIn(fade);
    incoming.play();
    current.current = clip;
  }, [clip, reducedMotion]);

  useFrame((_, delta) => {
    mixer.current?.update(delta);
    const greeting = clip === "Wave";
    const walking = clip === "Walk" || clip === "Run" || clip === "Turn";
    const fullBody = clip === "Backflip" || clip === "Jump" || clip === "Dance" || clip === "Sit" || clip === "Bow" || clip === "Fall";
    const contactEmote = clip === "Clap" || clip === "Facepalm" || clip === "Think";
    const w =
      (reducedMotion ? 0.2 : lookWeight.current) *
      (fullBody || contactEmote ? 0 : greeting ? 0.22 : walking ? 0.18 : 1);
    const aim = look.current;
    const yaw = MathUtils.clamp(aim.x * 0.62 * w, -0.65, 0.65);
    const pitch = MathUtils.clamp(aim.y * 0.46 * w, -0.38, 0.4);
    const damp = reducedMotion ? 14 : 16;
    if (head.current) {
      head.current.rotation.y = MathUtils.damp(head.current.rotation.y, yaw, damp, delta);
      head.current.rotation.x = MathUtils.damp(head.current.rotation.x, pitch, damp, delta);
    }
    if (neck.current) {
      neck.current.rotation.y = MathUtils.damp(neck.current.rotation.y, yaw * 0.3, damp, delta);
      neck.current.rotation.x = MathUtils.damp(neck.current.rotation.x, pitch * 0.2, damp, delta);
    }
    if (chest.current && !walking) {
      chest.current.rotation.y = MathUtils.damp(chest.current.rotation.y, yaw * 0.08, 6, delta);
    }
    const eyeY = MathUtils.clamp(aim.x * 0.2 * w, -0.18, 0.18);
    const eyeX = MathUtils.clamp(aim.y * 0.14 * w, -0.12, 0.12);
    blink.current += delta;
    const lid = blink.current % 4.2 > 4.05 ? 0.35 : 1;
    for (const eye of [leftEye.current, rightEye.current]) {
      if (!eye) continue;
      eye.rotation.y = MathUtils.damp(eye.rotation.y, eyeY, 18, delta);
      eye.rotation.x = MathUtils.damp(eye.rotation.x, eyeX, 18, delta);
      eye.scale.y = MathUtils.damp(eye.scale.y, lid, 18, delta);
    }
    if (mouth.current) {
      const viseme = sampleViseme();
      const talk = viseme
        ? 0.28 + viseme.open * 0.85
        : clip === "Talk"
          ? 0.7 + Math.sin(blink.current * 10) * 0.25
          : clip === "Wave" || clip === "Laugh"
            ? 0.55
            : 0.35;
      const wide = viseme ? viseme.wide : clip === "Wave" || clip === "Laugh" ? 1.18 : 1;
      mouth.current.scale.y = MathUtils.damp(mouth.current.scale.y, talk, 14, delta);
      mouth.current.scale.x = MathUtils.damp(mouth.current.scale.x, wide, 12, delta);
    }
  });

  return (
    <group ref={root} name="Host">
      <group name="Hips">
        <Plate args={[0.28, 0.1, 0.18]} position={[0, 0.88, 0]} color={SECONDARY} />
        <group name="Spine" position={[0, 0.98, 0]}>
          <group ref={chest} name="Chest" position={[0, 0.2, 0]}>
            <mesh
              name="Body"
              onClick={(e) => {
                e.stopPropagation();
                onHit("body");
              }}
            >
              <boxGeometry args={[0.42, 0.46, 0.24]} />
              <meshStandardMaterial color={PRIMARY} metalness={0.12} roughness={0.68} />
            </mesh>
            <Plate args={[0.18, 0.22, 0.06]} position={[0, 0.04, 0.12]} color={SECONDARY} />
            <Plate
              args={[0.06, 0.06, 0.02]}
              position={[0, 0.12, 0.15]}
              color={ACCENT}
              emissive={ACCENT}
              emissiveIntensity={0.45}
            />
            <Plate args={[0.08, 0.22, 0.05]} position={[-0.12, 0.02, 0.1]} color={ACCENT} emissive={ACCENT} emissiveIntensity={0.18} />
            <Plate args={[0.08, 0.22, 0.05]} position={[0.12, 0.02, 0.1]} color={ACCENT} emissive={ACCENT} emissiveIntensity={0.18} />
            <Plate args={[0.28, 0.32, 0.1]} position={[0, 0.02, -0.16]} color={SECONDARY} />
            <group
              name="LeftShoulder"
              position={[-0.28, 0.18, 0]}
              onClick={(e) => {
                e.stopPropagation();
                onHit("shoulder");
              }}
            >
              <Plate args={[0.16, 0.14, 0.18]} color={PRIMARY} />
            </group>
            <group
              name="RightShoulder"
              position={[0.28, 0.18, 0]}
              onClick={(e) => {
                e.stopPropagation();
                onHit("shoulder");
              }}
            >
              <Plate args={[0.16, 0.14, 0.18]} color={PRIMARY} />
            </group>
            <group ref={neck} name="Neck" position={[0, 0.3, 0]}>
              <Plate args={[0.09, 0.08, 0.09]} color={DETAIL} roughness={0.55} />
              <group ref={head} name="Head" position={[0, 0.18, 0]}>
                <mesh
                  name="Head"
                  onClick={(e) => {
                    e.stopPropagation();
                    onHit("head");
                  }}
                >
                  <boxGeometry args={[0.2, 0.22, 0.2]} />
                  <meshStandardMaterial color={DETAIL} metalness={0.08} roughness={0.55} />
                </mesh>
                <Plate args={[0.22, 0.08, 0.22]} position={[0, 0.12, 0]} color={PRIMARY} />
                <Plate args={[0.08, 0.1, 0.08]} position={[-0.12, 0.08, 0]} color={PRIMARY} />
                <Plate args={[0.08, 0.1, 0.08]} position={[0.12, 0.08, 0]} color={PRIMARY} />
                <group ref={leftEye} name="LeftEye" position={[-0.05, 0.03, 0.11]}>
                  <Plate args={[0.045, 0.03, 0.02]} color={PRIMARY} />
                  <Plate args={[0.02, 0.02, 0.012]} position={[0, 0, 0.01]} color={ACCENT} emissive={ACCENT} emissiveIntensity={0.35} />
                </group>
                <group ref={rightEye} name="RightEye" position={[0.05, 0.03, 0.11]}>
                  <Plate args={[0.045, 0.03, 0.02]} color={PRIMARY} />
                  <Plate args={[0.02, 0.02, 0.012]} position={[0, 0, 0.01]} color={ACCENT} emissive={ACCENT} emissiveIntensity={0.35} />
                </group>
                <group ref={mouth} name="Mouth" position={[0, -0.06, 0.11]}>
                  <Plate args={[0.07, 0.02, 0.015]} color={SECONDARY} />
                </group>
              </group>
            </group>
            <group name="LeftArm" position={[-0.32, 0.02, 0]} rotation={[0, 0, 0.12]}>
              <Plate args={[0.09, 0.2, 0.11]} color={PRIMARY} />
              <group name="LeftForeArm" position={[0, -0.18, 0]}>
                <Plate args={[0.08, 0.12, 0.1]} color={SECONDARY} />
                <group name="LeftHand" position={[0, -0.12, 0]}>
                  <Plate args={[0.09, 0.08, 0.09]} color={DETAIL} roughness={0.7} />
                  <Plate args={[0.02, 0.05, 0.02]} position={[-0.03, -0.05, 0.03]} color={DETAIL} />
                  <Plate args={[0.02, 0.055, 0.02]} position={[0, -0.055, 0.03]} color={DETAIL} />
                  <Plate args={[0.02, 0.05, 0.02]} position={[0.03, -0.05, 0.03]} color={DETAIL} />
                </group>
              </group>
            </group>
            <group name="RightArm" position={[0.32, 0.02, 0]} rotation={[0, 0, -0.12]}>
              <mesh
                onClick={(e) => {
                  e.stopPropagation();
                  onHit("hand");
                }}
              >
                <boxGeometry args={[0.09, 0.2, 0.11]} />
                <meshStandardMaterial color={PRIMARY} roughness={0.68} metalness={0.12} />
              </mesh>
              <group name="RightForeArm" position={[0, -0.18, 0]}>
                <Plate args={[0.08, 0.12, 0.1]} color={SECONDARY} />
                <group name="RightHand" position={[0, -0.12, 0]}>
                  <mesh
                    name="RightHand"
                    onClick={(e) => {
                      e.stopPropagation();
                      onHit("hand");
                    }}
                  >
                    <boxGeometry args={[0.09, 0.08, 0.09]} />
                    <meshStandardMaterial color={DETAIL} roughness={0.7} metalness={0.1} />
                  </mesh>
                  <Plate args={[0.02, 0.05, 0.02]} position={[-0.03, -0.05, 0.03]} color={DETAIL} />
                  <Plate args={[0.02, 0.055, 0.02]} position={[0, -0.055, 0.03]} color={DETAIL} />
                  <Plate args={[0.02, 0.05, 0.02]} position={[0.03, -0.05, 0.03]} color={DETAIL} />
                  <group name="RightThumb" position={[0.05, 0.02, 0.01]} rotation={[0, 0, -0.85]}>
                    <Plate args={[0.018, 0.065, 0.018]} color={DETAIL} />
                  </group>
                </group>
              </group>
            </group>
          </group>
        </group>
        <group name="LeftUpLeg" position={[-0.09, 0.74, 0]}>
          <Plate args={[0.13, 0.26, 0.14]} color={PRIMARY} />
          <group name="LeftLeg" position={[0, -0.22, 0]}>
            <Plate args={[0.14, 0.16, 0.15]} color={SECONDARY} />
            <group name="LeftFoot" position={[0, -0.12, 0.03]}>
              <Plate args={[0.15, 0.07, 0.2]} color={SECONDARY} />
              <Plate args={[0.15, 0.03, 0.22]} position={[0, -0.04, 0.02]} color={DETAIL} roughness={0.8} />
            </group>
          </group>
        </group>
        <group name="RightUpLeg" position={[0.09, 0.74, 0]}>
          <Plate args={[0.13, 0.26, 0.14]} color={PRIMARY} />
          <group name="RightLeg" position={[0, -0.22, 0]}>
            <Plate args={[0.14, 0.16, 0.15]} color={SECONDARY} />
            <group name="RightFoot" position={[0, -0.12, 0.03]}>
              <Plate args={[0.15, 0.07, 0.2]} color={SECONDARY} />
              <Plate args={[0.15, 0.03, 0.22]} position={[0, -0.04, 0.02]} color={DETAIL} roughness={0.8} />
            </group>
          </group>
        </group>
      </group>
    </group>
  );
}
