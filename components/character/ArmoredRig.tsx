"use client";

import { RoundedBox } from "@react-three/drei";
import { useFrame, type ThreeEvent } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import {
  AnimationMixer,
  CanvasTexture,
  LoopRepeat,
  MathUtils,
  Sprite,
  SpriteMaterial,
  type AnimationAction,
  type Group as ThreeGroup,
} from "three";
import type { CharacterClip, CharacterHit } from "@/data/character";
import { createHostClips } from "@/lib/character/clips";
import { sampleViseme } from "@/lib/character/visemes";

const PRIMARY = "#111827";
const SECONDARY = "#334155";
const ACCENT = "#38bdf8";
const ACCENT_HOT = "#67e8f9";
const DETAIL = "#dbeafe";
const JOINT = "#64748b";
const DARK_JOINT = "#0f172a";

type Vec3 = [number, number, number];

type ArmorPartProps = {
  args: Vec3;
  position?: Vec3;
  rotation?: Vec3;
  color?: string;
  metalness?: number;
  roughness?: number;
  clearcoat?: number;
  emissive?: string;
  emissiveIntensity?: number;
  radius?: number;
  name?: string;
  onClick?: (event: ThreeEvent<MouseEvent>) => void;
};

function makeZTexture() {
  const canvas = document.createElement("canvas");
  canvas.width = 64;
  canvas.height = 64;
  const ctx = canvas.getContext("2d");
  if (ctx) {
    ctx.clearRect(0, 0, 64, 64);
    ctx.font = "700 46px ui-sans-serif, system-ui, sans-serif";
    ctx.fillStyle = "#93c5fd";
    ctx.globalAlpha = 0.95;
    ctx.fillText("Z", 10, 48);
  }
  const texture = new CanvasTexture(canvas);
  texture.needsUpdate = true;
  return texture;
}

function SleepZs({ active }: { active: boolean }) {
  const group = useRef<ThreeGroup>(null);
  const sprites = useRef<Sprite[]>([]);
  const texture = useMemo(() => (typeof document === "undefined" ? null : makeZTexture()), []);
  const seeds = useRef([
    { phase: 0, drift: 0.035, size: 0.085, span: 1.35 },
    { phase: 0.42, drift: -0.028, size: 0.07, span: 1.55 },
    { phase: 0.78, drift: 0.02, size: 0.095, span: 1.7 },
  ]);

  useEffect(() => {
    const node = group.current;
    if (!node || !texture) return;
    for (let i = 0; i < 3; i += 1) {
      const mat = new SpriteMaterial({
        map: texture,
        transparent: true,
        depthWrite: false,
        opacity: 0,
      });
      const sprite = new Sprite(mat);
      sprite.scale.set(0.08, 0.08, 1);
      node.add(sprite);
      sprites.current.push(sprite);
    }
    return () => {
      for (const sprite of sprites.current) {
        node.remove(sprite);
        sprite.material.dispose();
      }
      sprites.current = [];
      texture.dispose();
    };
  }, [texture]);

  useFrame((_, delta) => {
    const list = sprites.current;
    if (!list.length) return;
    for (let i = 0; i < list.length; i += 1) {
      const seed = seeds.current[i];
      seed.phase += delta / seed.span;
      if (seed.phase > 1) seed.phase -= 1;
      const u = active ? seed.phase : 1;
      const rise = u * u * (3 - 2 * u);
      const sprite = list[i];
      sprite.visible = active && u < 0.98;
      sprite.position.set(0.06 + seed.drift * Math.sin(u * 4.2 + i), 0.08 + rise * 0.28, 0.1);
      const fade = active ? Math.sin(u * Math.PI) : 0;
      sprite.material.opacity = fade * 0.85;
      const s = seed.size * (0.75 + u * 0.55);
      sprite.scale.set(s, s, 1);
    }
  });

  return <group ref={group} name="SleepZs" />;
}

function ArmorPart({
  args,
  position,
  rotation,
  color = PRIMARY,
  metalness = 0.72,
  roughness = 0.28,
  clearcoat = 0.7,
  emissive,
  emissiveIntensity = 0,
  radius,
  name,
  onClick,
}: ArmorPartProps) {
  const bevel = radius ?? Math.min(args[0], args[1], args[2]) * 0.18;
  return (
    <RoundedBox
      name={name}
      args={args}
      position={position}
      rotation={rotation}
      radius={Math.max(0.003, bevel)}
      smoothness={3}
      castShadow
      receiveShadow
      onClick={onClick}
    >
      <meshPhysicalMaterial
        color={color}
        metalness={metalness}
        roughness={roughness}
        clearcoat={clearcoat}
        clearcoatRoughness={0.16}
        emissive={emissive ?? "#000000"}
        emissiveIntensity={emissiveIntensity}
        toneMapped={emissiveIntensity < 1}
      />
    </RoundedBox>
  );
}

function GlowLine({
  args,
  position,
  rotation,
  color = ACCENT,
  intensity = 1.4,
}: {
  args: Vec3;
  position?: Vec3;
  rotation?: Vec3;
  color?: string;
  intensity?: number;
}) {
  return (
    <ArmorPart
      args={args}
      position={position}
      rotation={rotation}
      color={color}
      metalness={0.35}
      roughness={0.2}
      clearcoat={1}
      emissive={color}
      emissiveIntensity={intensity}
      radius={Math.min(...args) * 0.26}
    />
  );
}

function Joint({
  name,
  position,
  rotation = [0, 0, Math.PI / 2],
  radius = 0.052,
  width = 0.085,
}: {
  name: string;
  position?: Vec3;
  rotation?: Vec3;
  radius?: number;
  width?: number;
}) {
  return (
    <group name={name} position={position}>
      <mesh rotation={rotation} castShadow receiveShadow>
        <cylinderGeometry args={[radius, radius * 0.92, width, 20, 2]} />
        <meshPhysicalMaterial
          color={JOINT}
          metalness={0.92}
          roughness={0.2}
          clearcoat={0.65}
          clearcoatRoughness={0.18}
        />
      </mesh>
      <mesh castShadow>
        <sphereGeometry args={[radius * 0.72, 18, 12]} />
        <meshPhysicalMaterial color={DARK_JOINT} metalness={0.82} roughness={0.24} clearcoat={0.5} />
      </mesh>
      <mesh position={[0, 0, radius * 0.72]}>
        <circleGeometry args={[radius * 0.34, 18]} />
        <meshPhysicalMaterial
          color={ACCENT_HOT}
          emissive={ACCENT}
          emissiveIntensity={1.8}
          toneMapped={false}
          metalness={0.25}
          roughness={0.18}
        />
      </mesh>
    </group>
  );
}

function Piston({ position, rotation }: { position: Vec3; rotation?: Vec3 }) {
  return (
    <group position={position} rotation={rotation}>
      <mesh castShadow>
        <cylinderGeometry args={[0.012, 0.012, 0.13, 12]} />
        <meshPhysicalMaterial color={DETAIL} metalness={0.9} roughness={0.16} clearcoat={0.85} />
      </mesh>
      <mesh position={[0, -0.03, 0]} castShadow>
        <cylinderGeometry args={[0.018, 0.018, 0.07, 12]} />
        <meshPhysicalMaterial color={DARK_JOINT} metalness={0.75} roughness={0.3} clearcoat={0.45} />
      </mesh>
    </group>
  );
}

function Finger({ x, length = 0.058 }: { x: number; length?: number }) {
  return (
    <group position={[x, -0.035, 0.026]}>
      <ArmorPart args={[0.019, length * 0.55, 0.026]} position={[0, -length * 0.2, 0]} color={DETAIL} roughness={0.24} radius={0.006} />
      <mesh position={[0, -length * 0.5, 0]} castShadow>
        <sphereGeometry args={[0.011, 12, 8]} />
        <meshPhysicalMaterial color={JOINT} metalness={0.82} roughness={0.22} clearcoat={0.65} />
      </mesh>
      <ArmorPart
        args={[0.017, length * 0.48, 0.022]}
        position={[0, -length * 0.72, 0.004]}
        rotation={[-0.12, 0, 0]}
        color={DETAIL}
        roughness={0.22}
        radius={0.005}
      />
      <GlowLine args={[0.007, length * 0.36, 0.006]} position={[0, -length * 0.72, 0.017]} intensity={0.9} />
    </group>
  );
}

function FootAssembly({ side }: { side: "Left" | "Right" }) {
  return (
    <>
      <Joint name={`${side}AnkleJoint`} position={[0, 0.025, -0.012]} rotation={[Math.PI / 2, 0, 0]} radius={0.044} width={0.07} />
      <ArmorPart args={[0.155, 0.075, 0.19]} position={[0, -0.025, 0.035]} color={SECONDARY} roughness={0.25} />
      <ArmorPart args={[0.13, 0.045, 0.095]} position={[0, -0.015, 0.115]} rotation={[-0.09, 0, 0]} color={PRIMARY} roughness={0.24} />
      <ArmorPart args={[0.14, 0.035, 0.075]} position={[0, -0.026, -0.075]} color={PRIMARY} roughness={0.32} />
      <ArmorPart args={[0.16, 0.025, 0.225]} position={[0, -0.07, 0.035]} color={DARK_JOINT} roughness={0.72} clearcoat={0.15} radius={0.008} />
      <GlowLine args={[0.012, 0.022, 0.15]} position={[-0.071, -0.03, 0.04]} intensity={1.15} />
      <GlowLine args={[0.012, 0.022, 0.15]} position={[0.071, -0.03, 0.04]} intensity={1.15} />
      <ArmorPart args={[0.044, 0.028, 0.055]} position={[-0.047, -0.05, 0.135]} color={DETAIL} roughness={0.28} />
      <ArmorPart args={[0.044, 0.028, 0.055]} position={[0.047, -0.05, 0.135]} color={DETAIL} roughness={0.28} />
    </>
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
  const headAim = useRef<ThreeGroup>(null);
  const neckAim = useRef<ThreeGroup>(null);
  const chestAim = useRef<ThreeGroup>(null);
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
    const fromFlip = current.current === "Backflip";
    const repeats = clip === "Idle" || clip === "Talk" || clip === "Walk" || clip === "Run" || clip === "Sleep";
    incoming.reset();
    incoming.setLoop(LoopRepeat, repeats ? Infinity : 1);
    incoming.clampWhenFinished = !repeats;
    incoming.setEffectiveTimeScale(reducedMotion ? 1.2 : 1);
    incoming.setEffectiveWeight(1);
    const fade = reducedMotion ? 0.05 : fromFlip ? 0.04 : 0.36;
    if (fromFlip) {
      outgoing?.stop();
      outgoing?.setEffectiveWeight(0);
      const hips = root.current?.getObjectByName("Hips");
      if (hips) {
        hips.rotation.set(0, 0, 0);
        hips.position.y = 0;
        hips.position.z = 0;
      }
      const spine = root.current?.getObjectByName("Spine");
      if (spine) spine.rotation.set(0, 0, 0);
      incoming.reset();
      incoming.setEffectiveWeight(1);
      incoming.fadeIn(fade);
    } else if (outgoing && outgoing !== incoming) {
      incoming.crossFadeFrom(outgoing, fade, true);
    } else {
      incoming.fadeIn(fade);
    }
    incoming.play();
    current.current = clip;
  }, [clip, reducedMotion]);

  useFrame((_, delta) => {
    mixer.current?.update(delta);
    const greeting = clip === "Wave";
    const walking = clip === "Walk" || clip === "Run" || clip === "Turn";
    const fullBody =
      clip === "Backflip" ||
      clip === "Jump" ||
      clip === "Dance" ||
      clip === "Celebrate" ||
      clip === "Sit" ||
      clip === "Bow" ||
      clip === "Fall" ||
      clip === "Sleep" ||
      clip === "Wake";
    const contactEmote = clip === "Clap" || clip === "Facepalm" || clip === "Think";
    const w =
      (reducedMotion ? 0.2 : lookWeight.current) *
      (fullBody || contactEmote ? 0 : greeting ? 0.22 : walking ? 0.18 : 1);
    const aim = look.current;
    const yaw = MathUtils.clamp(aim.x * 0.62 * w, -0.65, 0.65);
    const pitch = MathUtils.clamp(aim.y * 0.46 * w, -0.38, 0.4);
    const damp = reducedMotion ? 14 : 16;

    if (headAim.current) {
      headAim.current.rotation.y = MathUtils.damp(headAim.current.rotation.y, yaw * 0.72, damp, delta);
      headAim.current.rotation.x = MathUtils.damp(headAim.current.rotation.x, pitch * 0.72, damp, delta);
    }
    if (neckAim.current) {
      neckAim.current.rotation.y = MathUtils.damp(neckAim.current.rotation.y, yaw * 0.28, damp, delta);
      neckAim.current.rotation.x = MathUtils.damp(neckAim.current.rotation.x, pitch * 0.22, damp, delta);
    }
    if (chestAim.current) {
      const chestYaw = walking ? 0 : yaw * 0.08;
      chestAim.current.rotation.y = MathUtils.damp(chestAim.current.rotation.y, chestYaw, 7, delta);
      chestAim.current.rotation.x = MathUtils.damp(chestAim.current.rotation.x, pitch * 0.025, 7, delta);
    }

    const eyeY = MathUtils.clamp(aim.x * 0.2 * w, -0.18, 0.18);
    const eyeX = MathUtils.clamp(aim.y * 0.14 * w, -0.12, 0.12);
    blink.current += delta;
    const wakeT = actions.current.Wake?.time ?? 0;
    const lid =
      clip === "Sleep"
        ? 0.08
        : clip === "Wake"
          ? Math.min(1, 0.12 + wakeT / 1.2)
          : clip === "Surprise"
            ? 1.22
            : blink.current % 4.2 > 4.05
              ? 0.35
              : 1;
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
            : clip === "Surprise"
              ? 0.85
              : clip === "Facepalm"
                ? 0.18
                : clip === "Think"
                  ? 0.28
                  : clip === "Sleep"
                    ? 0.22
                    : 0.35;
      const wide =
        viseme
          ? viseme.wide
          : clip === "Wave" || clip === "Laugh" || clip === "Surprise" || clip === "Celebrate"
            ? 1.18
            : 1;
      mouth.current.scale.y = MathUtils.damp(mouth.current.scale.y, talk, 14, delta);
      mouth.current.scale.x = MathUtils.damp(mouth.current.scale.x, wide, 12, delta);
    }
  });

  const hit = (region: CharacterHit) => (event: ThreeEvent<MouseEvent>) => {
    event.stopPropagation();
    onHit(region);
  };

  return (
    <group ref={root} name="Host">
      <group name="Hips">
        <ArmorPart args={[0.31, 0.11, 0.21]} position={[0, 0.88, 0]} color={SECONDARY} />
        <ArmorPart args={[0.19, 0.09, 0.235]} position={[0, 0.9, 0]} color={PRIMARY} roughness={0.22} />
        <Joint name="HipCore" position={[0, 0.9, 0.02]} rotation={[Math.PI / 2, 0, 0]} radius={0.055} width={0.12} />
        <GlowLine args={[0.25, 0.018, 0.018]} position={[0, 0.94, 0.1]} intensity={1.65} />

        <group name="Spine" position={[0, 0.98, 0]}>
          <mesh position={[0, 0.08, -0.005]} castShadow>
            <cylinderGeometry args={[0.055, 0.07, 0.24, 16]} />
            <meshPhysicalMaterial color={DARK_JOINT} metalness={0.78} roughness={0.28} clearcoat={0.5} />
          </mesh>
          <GlowLine args={[0.026, 0.2, 0.02]} position={[0, 0.08, -0.065]} intensity={1.25} />

          <group name="Chest" position={[0, 0.2, 0]}>
            <group ref={chestAim} name="ChestAim">
              <ArmorPart name="Body" args={[0.4, 0.43, 0.23]} color={PRIMARY} roughness={0.24} onClick={hit("body")} />
              <ArmorPart args={[0.46, 0.09, 0.27]} position={[0, 0.19, -0.005]} color={SECONDARY} roughness={0.22} />
              <ArmorPart args={[0.22, 0.22, 0.065]} position={[0, 0.055, 0.125]} color={SECONDARY} roughness={0.2} />
              <ArmorPart args={[0.12, 0.13, 0.075]} position={[0, 0.085, 0.155]} color={PRIMARY} roughness={0.18} />
              <mesh position={[0, 0.105, 0.199]} rotation={[0, 0, Math.PI / 4]}>
                <octahedronGeometry args={[0.045, 0]} />
                <meshPhysicalMaterial
                  color={ACCENT_HOT}
                  emissive={ACCENT}
                  emissiveIntensity={2.2}
                  toneMapped={false}
                  metalness={0.28}
                  roughness={0.16}
                  clearcoat={1}
                />
              </mesh>
              <GlowLine args={[0.026, 0.2, 0.018]} position={[-0.105, 0.035, 0.155]} rotation={[0, 0, -0.08]} intensity={1.55} />
              <GlowLine args={[0.026, 0.2, 0.018]} position={[0.105, 0.035, 0.155]} rotation={[0, 0, 0.08]} intensity={1.55} />
              <ArmorPart args={[0.055, 0.24, 0.045]} position={[-0.19, 0.02, 0.115]} rotation={[0, 0, -0.06]} color={DETAIL} roughness={0.2} />
              <ArmorPart args={[0.055, 0.24, 0.045]} position={[0.19, 0.02, 0.115]} rotation={[0, 0, 0.06]} color={DETAIL} roughness={0.2} />
              <ArmorPart args={[0.29, 0.3, 0.085]} position={[0, 0.02, -0.17]} color={SECONDARY} roughness={0.3} />
              <ArmorPart args={[0.18, 0.065, 0.06]} position={[0, -0.185, 0.015]} color={JOINT} roughness={0.24} />

              <group name="LeftShoulder" position={[-0.29, 0.17, 0]} onClick={hit("shoulder")}>
                <Joint name="LeftShoulderJoint" radius={0.073} width={0.11} />
                <ArmorPart args={[0.18, 0.115, 0.205]} position={[-0.012, 0.035, 0]} rotation={[0, 0, 0.08]} color={PRIMARY} roughness={0.2} />
                <ArmorPart args={[0.13, 0.042, 0.215]} position={[-0.015, 0.09, 0]} rotation={[0, 0, 0.08]} color={DETAIL} roughness={0.22} />
                <GlowLine args={[0.115, 0.018, 0.018]} position={[-0.02, 0.11, 0.105]} intensity={1.45} />
              </group>
              <group name="RightShoulder" position={[0.29, 0.17, 0]} onClick={hit("shoulder")}>
                <Joint name="RightShoulderJoint" radius={0.073} width={0.11} />
                <ArmorPart args={[0.18, 0.115, 0.205]} position={[0.012, 0.035, 0]} rotation={[0, 0, -0.08]} color={PRIMARY} roughness={0.2} />
                <ArmorPart args={[0.13, 0.042, 0.215]} position={[0.015, 0.09, 0]} rotation={[0, 0, -0.08]} color={DETAIL} roughness={0.22} />
                <GlowLine args={[0.115, 0.018, 0.018]} position={[0.02, 0.11, 0.105]} intensity={1.45} />
              </group>

              <group name="Neck" position={[0, 0.3, 0]}>
                <group ref={neckAim} name="NeckAim">
                  <mesh castShadow>
                    <cylinderGeometry args={[0.055, 0.07, 0.105, 20]} />
                    <meshPhysicalMaterial color={JOINT} metalness={0.88} roughness={0.18} clearcoat={0.78} />
                  </mesh>
                  <mesh position={[0, 0.012, 0]} rotation={[Math.PI / 2, 0, 0]}>
                    <torusGeometry args={[0.064, 0.011, 8, 24]} />
                    <meshPhysicalMaterial color={DARK_JOINT} metalness={0.82} roughness={0.25} clearcoat={0.55} />
                  </mesh>
                  <GlowLine args={[0.018, 0.075, 0.018]} position={[0, 0.005, 0.057]} intensity={1.7} />

                  <group name="Head" position={[0, 0.18, 0]}>
                    <group ref={headAim} name="HeadAim">
                      <ArmorPart name="Head" args={[0.215, 0.225, 0.205]} color={DETAIL} metalness={0.62} roughness={0.2} onClick={hit("head")} />
                      <ArmorPart args={[0.24, 0.09, 0.225]} position={[0, 0.11, -0.005]} color={PRIMARY} roughness={0.19} />
                      <ArmorPart args={[0.19, 0.035, 0.045]} position={[0, 0.065, 0.109]} color={DARK_JOINT} roughness={0.16} />
                      <GlowLine args={[0.175, 0.015, 0.014]} position={[0, 0.081, 0.134]} color={ACCENT_HOT} intensity={2.1} />
                      <ArmorPart args={[0.08, 0.12, 0.09]} position={[-0.125, 0.055, -0.004]} color={PRIMARY} roughness={0.21} />
                      <ArmorPart args={[0.08, 0.12, 0.09]} position={[0.125, 0.055, -0.004]} color={PRIMARY} roughness={0.21} />
                      <mesh position={[-0.13, 0.05, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
                        <cylinderGeometry args={[0.032, 0.032, 0.025, 18]} />
                        <meshPhysicalMaterial color={JOINT} metalness={0.9} roughness={0.18} clearcoat={0.75} />
                      </mesh>
                      <mesh position={[0.13, 0.05, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
                        <cylinderGeometry args={[0.032, 0.032, 0.025, 18]} />
                        <meshPhysicalMaterial color={JOINT} metalness={0.9} roughness={0.18} clearcoat={0.75} />
                      </mesh>
                      <ArmorPart args={[0.13, 0.055, 0.065]} position={[0, -0.105, 0.055]} color={SECONDARY} roughness={0.23} />
                      <GlowLine args={[0.085, 0.012, 0.014]} position={[0, -0.115, 0.092]} intensity={1.25} />

                      <group ref={leftEye} name="LeftEye" position={[-0.052, 0.025, 0.111]}>
                        <ArmorPart args={[0.052, 0.036, 0.025]} color={DARK_JOINT} roughness={0.16} />
                        <ArmorPart
                          args={[0.024, 0.021, 0.013]}
                          position={[0, 0, 0.016]}
                          color={ACCENT_HOT}
                          metalness={0.25}
                          roughness={0.12}
                          emissive={ACCENT}
                          emissiveIntensity={2.4}
                          clearcoat={1}
                        />
                      </group>
                      <group ref={rightEye} name="RightEye" position={[0.052, 0.025, 0.111]}>
                        <ArmorPart args={[0.052, 0.036, 0.025]} color={DARK_JOINT} roughness={0.16} />
                        <ArmorPart
                          args={[0.024, 0.021, 0.013]}
                          position={[0, 0, 0.016]}
                          color={ACCENT_HOT}
                          metalness={0.25}
                          roughness={0.12}
                          emissive={ACCENT}
                          emissiveIntensity={2.4}
                          clearcoat={1}
                        />
                      </group>
                      <group ref={mouth} name="Mouth" position={[0, -0.057, 0.111]}>
                        <ArmorPart
                          args={[0.075, 0.021, 0.017]}
                          color={ACCENT_HOT}
                          metalness={0.35}
                          roughness={0.16}
                          emissive={ACCENT}
                          emissiveIntensity={1.15}
                          clearcoat={1}
                        />
                      </group>
                      <mesh position={[0.075, 0.155, -0.02]} rotation={[0.08, 0, -0.18]} castShadow>
                        <cylinderGeometry args={[0.008, 0.012, 0.1, 12]} />
                        <meshPhysicalMaterial color={JOINT} metalness={0.88} roughness={0.18} clearcoat={0.7} />
                      </mesh>
                      <mesh position={[0.083, 0.21, -0.01]}>
                        <sphereGeometry args={[0.017, 14, 10]} />
                        <meshPhysicalMaterial color={ACCENT_HOT} emissive={ACCENT} emissiveIntensity={2} toneMapped={false} />
                      </mesh>
                      <SleepZs active={clip === "Sleep"} />
                    </group>
                  </group>
                </group>
              </group>

              <group name="LeftArm" position={[-0.32, 0.02, 0]} rotation={[0, 0, 0.12]}>
                <ArmorPart args={[0.105, 0.205, 0.125]} color={PRIMARY} roughness={0.22} />
                <ArmorPart args={[0.125, 0.075, 0.14]} position={[0, 0.045, 0.005]} color={SECONDARY} roughness={0.22} />
                <ArmorPart args={[0.075, 0.145, 0.035]} position={[0, 0, 0.073]} color={DETAIL} roughness={0.2} />
                <GlowLine args={[0.018, 0.12, 0.014]} position={[0, 0, 0.095]} intensity={1.35} />
                <Piston position={[0.048, -0.02, -0.045]} rotation={[0, 0, -0.08]} />
                <group name="LeftForeArm" position={[0, -0.18, 0]}>
                  <Joint name="LeftElbowJoint" radius={0.053} width={0.09} />
                  <ArmorPart args={[0.11, 0.145, 0.12]} position={[0, -0.07, 0]} color={SECONDARY} roughness={0.24} />
                  <ArmorPart args={[0.075, 0.12, 0.045]} position={[0, -0.065, 0.073]} color={PRIMARY} roughness={0.2} />
                  <GlowLine args={[0.014, 0.09, 0.012]} position={[0, -0.07, 0.101]} intensity={1.25} />
                  <group name="LeftHand" position={[0, -0.16, 0]}>
                    <Joint name="LeftWristJoint" radius={0.036} width={0.065} />
                    <ArmorPart args={[0.1, 0.082, 0.098]} position={[0, -0.025, 0]} color={DETAIL} roughness={0.23} />
                    <ArmorPart args={[0.075, 0.046, 0.035]} position={[0, -0.012, 0.06]} color={PRIMARY} roughness={0.2} />
                    <GlowLine args={[0.055, 0.011, 0.011]} position={[0, -0.012, 0.081]} intensity={1.2} />
                    <Finger x={-0.031} />
                    <Finger x={0} length={0.064} />
                    <Finger x={0.031} />
                    <group name="LeftThumb" position={[-0.056, -0.005, 0.015]} rotation={[0, 0, 0.72]}>
                      <ArmorPart args={[0.02, 0.062, 0.025]} color={DETAIL} roughness={0.23} radius={0.006} />
                    </group>
                  </group>
                </group>
              </group>

              <group name="RightArm" position={[0.32, 0.02, 0]} rotation={[0, 0, -0.12]} onClick={hit("hand")}>
                <ArmorPart args={[0.105, 0.205, 0.125]} color={PRIMARY} roughness={0.22} />
                <ArmorPart args={[0.125, 0.075, 0.14]} position={[0, 0.045, 0.005]} color={SECONDARY} roughness={0.22} />
                <ArmorPart args={[0.075, 0.145, 0.035]} position={[0, 0, 0.073]} color={DETAIL} roughness={0.2} />
                <GlowLine args={[0.018, 0.12, 0.014]} position={[0, 0, 0.095]} intensity={1.35} />
                <Piston position={[-0.048, -0.02, -0.045]} rotation={[0, 0, 0.08]} />
                <group name="RightForeArm" position={[0, -0.18, 0]}>
                  <Joint name="RightElbowJoint" radius={0.053} width={0.09} />
                  <ArmorPart args={[0.11, 0.145, 0.12]} position={[0, -0.07, 0]} color={SECONDARY} roughness={0.24} />
                  <ArmorPart args={[0.075, 0.12, 0.045]} position={[0, -0.065, 0.073]} color={PRIMARY} roughness={0.2} />
                  <GlowLine args={[0.014, 0.09, 0.012]} position={[0, -0.07, 0.101]} intensity={1.25} />
                  <group name="RightHand" position={[0, -0.16, 0]}>
                    <Joint name="RightWristJoint" radius={0.036} width={0.065} />
                    <ArmorPart name="RightHand" args={[0.1, 0.082, 0.098]} position={[0, -0.025, 0]} color={DETAIL} roughness={0.23} onClick={hit("hand")} />
                    <ArmorPart args={[0.075, 0.046, 0.035]} position={[0, -0.012, 0.06]} color={PRIMARY} roughness={0.2} />
                    <GlowLine args={[0.055, 0.011, 0.011]} position={[0, -0.012, 0.081]} intensity={1.2} />
                    <Finger x={-0.031} />
                    <Finger x={0} length={0.064} />
                    <Finger x={0.031} />
                    <group name="RightThumb" position={[0.056, -0.005, 0.015]} rotation={[0, 0, -0.72]}>
                      <ArmorPart args={[0.02, 0.062, 0.025]} color={DETAIL} roughness={0.23} radius={0.006} />
                      <GlowLine args={[0.007, 0.035, 0.007]} position={[0, -0.005, 0.016]} intensity={1} />
                    </group>
                  </group>
                </group>
              </group>
            </group>
          </group>
        </group>

        <group name="LeftUpLeg" position={[-0.09, 0.74, 0]}>
          <Joint name="LeftHipJoint" position={[0, 0.105, 0]} radius={0.058} width={0.09} />
          <ArmorPart args={[0.145, 0.255, 0.155]} color={PRIMARY} roughness={0.23} />
          <ArmorPart args={[0.16, 0.075, 0.17]} position={[0, 0.075, 0]} color={SECONDARY} roughness={0.21} />
          <ArmorPart args={[0.085, 0.18, 0.04]} position={[0, 0.005, 0.093]} color={DETAIL} roughness={0.2} />
          <GlowLine args={[0.017, 0.145, 0.013]} position={[0, 0.005, 0.119]} intensity={1.35} />
          <Piston position={[-0.052, -0.01, -0.045]} rotation={[0, 0, -0.05]} />
          <group name="LeftLeg" position={[0, -0.22, 0]}>
            <Joint name="LeftKneeJoint" radius={0.061} width={0.105} />
            <ArmorPart args={[0.15, 0.18, 0.155]} position={[0, -0.085, 0]} color={SECONDARY} roughness={0.24} />
            <ArmorPart args={[0.09, 0.13, 0.05]} position={[0, -0.075, 0.1]} color={PRIMARY} roughness={0.2} />
            <GlowLine args={[0.02, 0.095, 0.015]} position={[0, -0.075, 0.132]} intensity={1.4} />
            <Piston position={[0.052, -0.075, -0.045]} rotation={[0, 0, 0.04]} />
            <group name="LeftFoot" position={[0, -0.15, 0.025]}>
              <FootAssembly side="Left" />
            </group>
          </group>
        </group>

        <group name="RightUpLeg" position={[0.09, 0.74, 0]}>
          <Joint name="RightHipJoint" position={[0, 0.105, 0]} radius={0.058} width={0.09} />
          <ArmorPart args={[0.145, 0.255, 0.155]} color={PRIMARY} roughness={0.23} />
          <ArmorPart args={[0.16, 0.075, 0.17]} position={[0, 0.075, 0]} color={SECONDARY} roughness={0.21} />
          <ArmorPart args={[0.085, 0.18, 0.04]} position={[0, 0.005, 0.093]} color={DETAIL} roughness={0.2} />
          <GlowLine args={[0.017, 0.145, 0.013]} position={[0, 0.005, 0.119]} intensity={1.35} />
          <Piston position={[0.052, -0.01, -0.045]} rotation={[0, 0, 0.05]} />
          <group name="RightLeg" position={[0, -0.22, 0]}>
            <Joint name="RightKneeJoint" radius={0.061} width={0.105} />
            <ArmorPart args={[0.15, 0.18, 0.155]} position={[0, -0.085, 0]} color={SECONDARY} roughness={0.24} />
            <ArmorPart args={[0.09, 0.13, 0.05]} position={[0, -0.075, 0.1]} color={PRIMARY} roughness={0.2} />
            <GlowLine args={[0.02, 0.095, 0.015]} position={[0, -0.075, 0.132]} intensity={1.4} />
            <Piston position={[-0.052, -0.075, -0.045]} rotation={[0, 0, -0.04]} />
            <group name="RightFoot" position={[0, -0.15, 0.025]}>
              <FootAssembly side="Right" />
            </group>
          </group>
        </group>
      </group>
    </group>
  );
}
