"use client";

import { Environment, Lightformer, RoundedBox } from "@react-three/drei";
import { useFrame, type ThreeEvent } from "@react-three/fiber";
import { createContext, useContext, useEffect, useMemo, useRef, type RefObject } from "react";
import {
  AdditiveBlending,
  AnimationMixer,
  CanvasTexture,
  Color,
  LoopRepeat,
  MathUtils,
  RepeatWrapping,
  Sprite,
  SpriteMaterial,
  type AnimationAction,
  type Group as ThreeGroup,
  type MeshBasicMaterial,
  type MeshPhysicalMaterial,
  type Texture,
} from "three";
import type { CharacterClip, CharacterHit } from "@/data/character";
import { createHostClips } from "@/lib/character/clips";
import { sampleViseme } from "@/lib/character/visemes";

const PRIMARY = "#020202";
const SECONDARY = "#303942";
const ACCENT = "#00eeff";
const ACCENT_HOT = "#bafaff";
const DETAIL = "#91a3b0";
const JOINT = "#1a222a";
const DARK_JOINT = "#070c12";
const SCREEN_GLASS = "#02080d";
const FLOW_DIM_COLOR = new Color("#00a9c7");
const FLOW_HOT_COLOR = new Color("#e8ffff");

export type CharacterExpression = "default" | "angry" | "happy" | "sad" | "surprised";

type Vec3 = [number, number, number];
type SurfaceFinish = "carbon" | "brushed" | "polished" | "satin";

type ExpressionStyle = {
  color: Color;
  leftTilt: number;
  rightTilt: number;
  scaleX: number;
  scaleY: number;
  offsetY: number;
};

const EXPRESSION_STYLES: Record<CharacterExpression, ExpressionStyle> = {
  default: { color: new Color("#00eeff"), leftTilt: 0, rightTilt: 0, scaleX: 1, scaleY: 1, offsetY: 0 },
  angry: { color: new Color("#ff0000"), leftTilt: -0.4, rightTilt: 0.4, scaleX: 0.9, scaleY: 0.62, offsetY: 0 },
  happy: { color: new Color("#ffe34d"), leftTilt: 0.1, rightTilt: -0.1, scaleX: 1.06, scaleY: 0.42, offsetY: 0.008 },
  sad: { color: new Color("#7ddcff"), leftTilt: 0.28, rightTilt: -0.28, scaleX: 0.94, scaleY: 0.74, offsetY: -0.006 },
  surprised: { color: new Color("#bafaff"), leftTilt: 0, rightTilt: 0, scaleX: 1.08, scaleY: 1.24, offsetY: 0.002 },
};

const CLIP_EXPRESSIONS: Partial<Record<CharacterClip, CharacterExpression>> = {
  Dance: "happy",
  Wave: "happy",
  Victory: "happy",
  Celebrate: "happy",
  Clap: "happy",
  Laugh: "happy",
  ThumbsUp: "happy",
  Playful: "happy",
  Facepalm: "angry",
  Annoyed: "angry",
  Sad: "sad",
  Fall: "sad",
  Stagger: "sad",
  Surprise: "surprised",
  Curious: "surprised",
  Backflip: "surprised",
};

const CarbonFiberContext = createContext<Texture | null>(null);

type FlowLightRegistration = {
  material: MeshPhysicalMaterial;
  halo: MeshBasicMaterial | null;
  offset: number;
  baseIntensity: number;
};

const FlowLightContext = createContext<{ current: FlowLightRegistration[] } | null>(null);

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
  finish?: SurfaceFinish;
  radius?: number;
  name?: string;
  materialRef?: RefObject<MeshPhysicalMaterial | null>;
  onClick?: (event: ThreeEvent<MouseEvent>) => void;
};

function makeCarbonFiberTexture() {
  const canvas = document.createElement("canvas");
  canvas.width = 64;
  canvas.height = 64;
  const ctx = canvas.getContext("2d");
  if (ctx) {
    ctx.fillStyle = "#b8b8b8";
    ctx.fillRect(0, 0, 64, 64);
    for (let y = -8; y < 72; y += 8) {
      for (let x = -8; x < 72; x += 8) {
        const alternate = ((x + y) / 8) % 2 === 0;
        ctx.save();
        ctx.translate(x + 4, y + 4);
        ctx.rotate(alternate ? Math.PI / 4 : -Math.PI / 4);
        const gradient = ctx.createLinearGradient(-5, 0, 5, 0);
        gradient.addColorStop(0, "#767676");
        gradient.addColorStop(0.42, alternate ? "#d8d8d8" : "#a0a0a0");
        gradient.addColorStop(0.58, alternate ? "#9a9a9a" : "#d3d3d3");
        gradient.addColorStop(1, "#696969");
        ctx.fillStyle = gradient;
        ctx.fillRect(-6, -2.2, 12, 4.4);
        ctx.restore();
      }
    }
  }
  const texture = new CanvasTexture(canvas);
  texture.wrapS = RepeatWrapping;
  texture.wrapT = RepeatWrapping;
  texture.repeat.set(4, 7);
  texture.anisotropy = 4;
  texture.needsUpdate = true;
  return texture;
}

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
  metalness,
  roughness,
  clearcoat,
  emissive,
  emissiveIntensity = 0,
  finish,
  radius,
  name,
  materialRef,
  onClick,
}: ArmorPartProps) {
  const carbonFiber = useContext(CarbonFiberContext);
  const surface: SurfaceFinish =
    finish ??
    (color === DARK_JOINT
      ? "carbon"
      : color === PRIMARY
        ? "satin"
        : color === SECONDARY || color === JOINT
          ? "brushed"
          : "polished");
  const isCarbon = surface === "carbon";
  const isPolished = surface === "polished";
  const isSatin = surface === "satin";
  const resolvedMetalness = metalness ?? (isCarbon ? 0.72 : isPolished ? 0.98 : isSatin ? 0.92 : 0.93);
  const requestedRoughness = roughness ?? (isCarbon ? 0.42 : isPolished ? 0.08 : isSatin ? 0.14 : 0.17);
  const resolvedRoughness = isPolished ? Math.min(requestedRoughness, 0.12) : requestedRoughness;
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
        ref={materialRef}
        color={color}
        metalness={resolvedMetalness}
        roughness={resolvedRoughness}
        roughnessMap={isCarbon ? carbonFiber : null}
        bumpMap={isCarbon ? carbonFiber : null}
        bumpScale={isCarbon ? 0.004 : 0}
        clearcoat={clearcoat ?? (isCarbon ? 0.88 : isSatin ? 0.98 : 1)}
        clearcoatRoughness={isCarbon ? 0.18 : isPolished ? 0.035 : isSatin ? 0.055 : 0.08}
        anisotropy={surface === "brushed" ? 0.62 : isSatin ? 0.24 : 0}
        anisotropyRotation={Math.PI / 2}
        ior={1.52}
        specularIntensity={1}
        specularColor="#ffffff"
        sheen={isCarbon ? 0.18 : 0.08}
        sheenColor={isCarbon ? "#1e5f7a" : "#ffffff"}
        sheenRoughness={isCarbon ? 0.42 : 0.14}
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
  flowOffset,
}: {
  args: Vec3;
  position?: Vec3;
  rotation?: Vec3;
  color?: string;
  intensity?: number;
  flowOffset?: number;
}) {
  const materialRef = useRef<MeshPhysicalMaterial>(null);
  const haloRef = useRef<MeshBasicMaterial>(null);
  const flowLights = useContext(FlowLightContext);
  const isFlowing = flowOffset !== undefined;
  const activeIntensity = isFlowing ? Math.max(intensity, 5.8) : intensity;
  const haloArgs: Vec3 = [args[0] + 0.01, args[1] + 0.01, args[2] + 0.008];

  useEffect(() => {
    const material = materialRef.current;
    if (!flowLights || !material || flowOffset === undefined) return;
    const registration = {
      material,
      halo: haloRef.current,
      offset: flowOffset,
      baseIntensity: activeIntensity,
    };
    const registrations = flowLights.current;
    registrations.push(registration);
    return () => {
      const index = registrations.indexOf(registration);
      if (index >= 0) registrations.splice(index, 1);
    };
  }, [activeIntensity, flowLights, flowOffset]);

  return (
    <group position={position} rotation={rotation}>
      <ArmorPart
        materialRef={materialRef}
        args={args}
        color={color}
        metalness={0.18}
        roughness={0.08}
        clearcoat={1}
        emissive={color}
        emissiveIntensity={activeIntensity}
        radius={Math.min(...args) * 0.26}
      />
      {isFlowing ? (
        <RoundedBox
          args={haloArgs}
          radius={Math.max(0.004, Math.min(...haloArgs) * 0.3)}
          smoothness={2}
          renderOrder={3}
        >
          <meshBasicMaterial
            ref={haloRef}
            color={color}
            transparent
            opacity={0.12}
            blending={AdditiveBlending}
            depthWrite={false}
            toneMapped={false}
          />
        </RoundedBox>
      ) : null}
    </group>
  );
}

function FlowingStrip({
  length,
  position,
  rotation,
  axis = "y",
  segments = 4,
  thickness = 0.011,
  depth = 0.009,
  gap = 0.008,
  phase = 0,
  intensity = 1.5,
}: {
  length: number;
  position: Vec3;
  rotation?: Vec3;
  axis?: "x" | "y";
  segments?: number;
  thickness?: number;
  depth?: number;
  gap?: number;
  phase?: number;
  intensity?: number;
}) {
  const segmentLength = (length - gap * (segments - 1)) / segments;
  return (
    <group position={position} rotation={rotation}>
      {Array.from({ length: segments }, (_, index) => {
        const offset = -length / 2 + segmentLength / 2 + index * (segmentLength + gap);
        const args: Vec3 = axis === "y" ? [thickness, segmentLength, depth] : [segmentLength, thickness, depth];
        const segmentPosition: Vec3 = axis === "y" ? [0, offset, 0] : [offset, 0, 0];
        return (
          <GlowLine
            key={index}
            args={args}
            position={segmentPosition}
            intensity={intensity}
            flowOffset={phase + (segments - 1 - index) * 0.82}
          />
        );
      })}
    </group>
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
      <mesh position={[0, radius * 0.82, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[radius * 0.46, radius * 0.62, radius * 1.85, 18, 2]} />
        <meshPhysicalMaterial color={SECONDARY} metalness={0.94} roughness={0.17} clearcoat={0.9} clearcoatRoughness={0.08} />
      </mesh>
      <mesh position={[0, -radius * 0.82, 0]} rotation={[0, 0, Math.PI]} castShadow receiveShadow>
        <cylinderGeometry args={[radius * 0.46, radius * 0.62, radius * 1.85, 18, 2]} />
        <meshPhysicalMaterial color={SECONDARY} metalness={0.94} roughness={0.17} clearcoat={0.9} clearcoatRoughness={0.08} />
      </mesh>
      <mesh castShadow>
        <sphereGeometry args={[radius * 0.78, 20, 14]} />
        <meshPhysicalMaterial color={JOINT} metalness={0.96} roughness={0.14} clearcoat={0.92} clearcoatRoughness={0.08} />
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

function Piston({
  position,
  rotation,
  length = 0.13,
  radius = 0.012,
}: {
  position: Vec3;
  rotation?: Vec3;
  length?: number;
  radius?: number;
}) {
  return (
    <group position={position} rotation={rotation}>
      <mesh castShadow>
        <cylinderGeometry args={[radius, radius, length, 12]} />
        <meshPhysicalMaterial color={DETAIL} metalness={0.9} roughness={0.16} clearcoat={0.85} />
      </mesh>
      <mesh position={[0, -length * 0.23, 0]} castShadow>
        <cylinderGeometry args={[radius * 1.5, radius * 1.5, length * 0.54, 12]} />
        <meshPhysicalMaterial color={DARK_JOINT} metalness={0.75} roughness={0.3} clearcoat={0.45} />
      </mesh>
    </group>
  );
}

function SensorLens({
  position,
  radius = 0.018,
  color = "#89f8ff",
}: {
  position: Vec3;
  radius?: number;
  color?: string;
}) {
  return (
    <group position={position} name="HeadSensorLens">
      <mesh rotation={[Math.PI / 2, 0, 0]} castShadow>
        <cylinderGeometry args={[radius * 1.45, radius * 1.6, 0.018, 24, 2]} />
        <meshPhysicalMaterial color={DARK_JOINT} metalness={0.9} roughness={0.16} clearcoat={1} />
      </mesh>
      <mesh position={[0, 0, 0.012]}>
        <torusGeometry args={[radius, radius * 0.24, 8, 24]} />
        <meshPhysicalMaterial color={DETAIL} metalness={0.96} roughness={0.1} clearcoat={1} />
      </mesh>
      <mesh position={[0, 0, 0.014]} scale={[1, 1, 0.35]}>
        <sphereGeometry args={[radius * 0.72, 18, 12]} />
        <meshPhysicalMaterial
          color={color}
          emissive={color}
          emissiveIntensity={1.45}
          metalness={0.32}
          roughness={0.06}
          clearcoat={1}
          toneMapped={false}
        />
      </mesh>
      <mesh position={[-radius * 0.22, radius * 0.24, 0.02]}>
        <circleGeometry args={[radius * 0.16, 12]} />
        <meshBasicMaterial color="#ffffff" />
      </mesh>
    </group>
  );
}

function MechanicalCable({
  position,
  rotation,
  length,
  radius = 0.009,
}: {
  position: Vec3;
  rotation?: Vec3;
  length: number;
  radius?: number;
}) {
  return (
    <mesh position={position} rotation={rotation} castShadow>
      <cylinderGeometry args={[radius, radius * 0.82, length, 10, 4]} />
      <meshPhysicalMaterial color={DARK_JOINT} metalness={0.74} roughness={0.38} clearcoat={0.45} />
    </mesh>
  );
}

function VentBank({
  position,
  rotation,
  scale = 1,
}: {
  position: Vec3;
  rotation?: Vec3;
  scale?: number;
}) {
  return (
    <group position={position} rotation={rotation} scale={[scale, scale, scale]}>
      <ArmorPart args={[0.072, 0.055, 0.006]} position={[0, 0, -0.004]} color={JOINT} finish="brushed" radius={0.005} />
      {[-1, 0, 1].map((row) => (
        <mesh key={row} position={[0, row * 0.014, 0.003]} castShadow>
          <boxGeometry args={[0.052, 0.006, 0.008]} />
          <meshPhysicalMaterial color={DARK_JOINT} metalness={0.72} roughness={0.44} clearcoat={0.42} />
        </mesh>
      ))}
      {([-1, 1] as const).map((side) => (
        <mesh key={side} position={[side * 0.031, 0.021, 0.007]}>
          <sphereGeometry args={[0.004, 10, 7]} />
          <meshPhysicalMaterial color={DETAIL} metalness={0.96} roughness={0.12} clearcoat={1} />
        </mesh>
      ))}
    </group>
  );
}

function SpineVertebrae({ position }: { position: Vec3 }) {
  const levels = [-0.12, -0.04, 0.04, 0.12];
  return (
    <group position={position}>
      {levels.map((y, index) => (
        <group key={y} position={[0, y, 0]} rotation={[0, 0, index % 2 === 0 ? 0.08 : -0.08]}>
          <mesh rotation={[Math.PI / 2, 0, 0]} castShadow>
            <cylinderGeometry args={[0.026, 0.039, 0.014, 8, 1]} />
            <meshPhysicalMaterial color={SECONDARY} metalness={0.94} roughness={0.15} clearcoat={0.94} clearcoatRoughness={0.06} />
          </mesh>
          <mesh position={[0, 0, -0.009]}>
            <torusGeometry args={[0.022, 0.0045, 7, 16]} />
            <meshPhysicalMaterial color={DARK_JOINT} metalness={0.82} roughness={0.32} clearcoat={0.5} />
          </mesh>
          {index < levels.length - 1 ? (
            <mesh position={[0, 0.04, 0.004]} castShadow>
              <cylinderGeometry args={[0.007, 0.007, 0.052, 10]} />
              <meshPhysicalMaterial color={DETAIL} metalness={0.95} roughness={0.14} clearcoat={0.9} />
            </mesh>
          ) : null}
        </group>
      ))}
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
      <Joint name={`${side}AnkleJoint`} position={[0, 0.025, -0.012]} rotation={[Math.PI / 2, 0, 0]} radius={0.042} width={0.07} />
      <ArmorPart args={[0.155, 0.075, 0.21]} position={[0, -0.025, 0.035]} color={PRIMARY} finish="satin" />
      <ArmorPart args={[0.135, 0.045, 0.105]} position={[0, -0.012, 0.125]} rotation={[-0.09, 0, 0]} color={SECONDARY} finish="brushed" />
      <ArmorPart args={[0.165, 0.025, 0.245]} position={[0, -0.072, 0.035]} color={DARK_JOINT} roughness={0.72} clearcoat={0.15} radius={0.008} />
      <GlowLine
        args={[0.088, 0.008, 0.009]}
        position={[0, -0.008, 0.181]}
        intensity={1.15}
        flowOffset={side === "Left" ? 13.2 : 13.9}
      />
    </>
  );
}

function DigitalFaceScreen() {
  return (
    <group name="HeadDisplay">
      <ArmorPart
        name="HeadScreenBezel"
        args={[0.294, 0.218, 0.026]}
        position={[0, 0.002, 0.121]}
        color={SECONDARY}
        metalness={0.94}
        roughness={0.14}
        clearcoat={0.96}
        finish="brushed"
        radius={0.034}
      />
      <ArmorPart
        args={[0.278, 0.202, 0.018]}
        position={[0, 0.002, 0.138]}
        color={DARK_JOINT}
        roughness={0.4}
        clearcoat={0.82}
        finish="carbon"
        radius={0.03}
      />
      <RoundedBox
        name="HeadScreenGlass"
        args={[0.252, 0.178, 0.012]}
        position={[0, 0.002, 0.151]}
        radius={0.026}
        smoothness={5}
        castShadow
        receiveShadow
      >
        <meshPhysicalMaterial
          color={SCREEN_GLASS}
          metalness={0.76}
          roughness={0.08}
          clearcoat={1}
          clearcoatRoughness={0.018}
          ior={1.52}
          specularIntensity={1}
          specularColor="#d8f8ff"
        />
      </RoundedBox>
      <GlowLine args={[0.204, 0.004, 0.004]} position={[0, 0.083, 0.159]} intensity={0.8} />
      <GlowLine args={[0.204, 0.004, 0.004]} position={[0, -0.079, 0.159]} intensity={0.8} />
      <GlowLine args={[0.004, 0.13, 0.004]} position={[-0.119, 0.002, 0.159]} intensity={0.8} />
      <GlowLine args={[0.004, 0.13, 0.004]} position={[0.119, 0.002, 0.159]} intensity={0.8} />
      <GlowLine args={[0.182, 0.0025, 0.003]} position={[0, 0.052, 0.16]} intensity={0.18} />
      <GlowLine args={[0.182, 0.0025, 0.003]} position={[0, -0.026, 0.16]} intensity={0.15} />
      <SensorLens position={[-0.124, 0.087, 0.158]} radius={0.013} color="#6ebaff" />
      <SensorLens position={[0.124, 0.087, 0.158]} radius={0.013} color="#9affbd" />
      <SensorLens position={[-0.124, -0.083, 0.158]} radius={0.012} color="#74e7ff" />
      <SensorLens position={[0.124, -0.083, 0.158]} radius={0.012} color="#74e7ff" />
    </group>
  );
}

function DigitalEye({
  glowMaterial,
  coreMaterial,
}: {
  glowMaterial: RefObject<MeshPhysicalMaterial | null>;
  coreMaterial: RefObject<MeshPhysicalMaterial | null>;
}) {
  return (
    <>
      <ArmorPart
        materialRef={glowMaterial}
        args={[0.066, 0.014, 0.009]}
        position={[0, 0.018, 0]}
        color="#002631"
        metalness={0.12}
        roughness={0.1}
        clearcoat={1}
        emissive={ACCENT}
        emissiveIntensity={3.2}
        finish="polished"
        radius={0.004}
      />
      <ArmorPart
        materialRef={coreMaterial}
        args={[0.044, 0.036, 0.009]}
        position={[0, -0.008, 0.008]}
        color="#dffcff"
        metalness={0.04}
        roughness={0.05}
        clearcoat={1}
        emissive="#00eeff"
        emissiveIntensity={4.8}
        finish="polished"
        radius={0.004}
      />
      <GlowLine args={[0.009, 0.009, 0.004]} position={[-0.014, 0.002, 0.015]} color="#ffffff" intensity={5} />
    </>
  );
}

function DigitalMouth() {
  return (
    <>
      <ArmorPart
        args={[0.122, 0.029, 0.009]}
        color="#00232d"
        metalness={0.12}
        roughness={0.1}
        clearcoat={1}
        emissive={ACCENT}
        emissiveIntensity={1.15}
        finish="polished"
        radius={0.008}
      />
      <GlowLine args={[0.07, 0.007, 0.006]} position={[0, -0.002, 0.009]} color="#00eeff" intensity={4.2} />
      <GlowLine args={[0.018, 0.007, 0.006]} position={[-0.048, 0.006, 0.009]} color={ACCENT_HOT} intensity={3.4} />
      <GlowLine args={[0.018, 0.007, 0.006]} position={[0.048, 0.006, 0.009]} color={ACCENT_HOT} intensity={3.4} />
    </>
  );
}

function Headphones() {
  return (
    <group name="Headphones">
      <mesh name="HeadphoneBand" position={[0, 0.075, -0.025]} castShadow>
        <torusGeometry args={[0.19, 0.019, 12, 42, Math.PI]} />
        <meshPhysicalMaterial
          color={DARK_JOINT}
          metalness={0.42}
          roughness={0.5}
          clearcoat={0.62}
          clearcoatRoughness={0.24}
          anisotropy={0.3}
        />
      </mesh>
      <mesh name="HeadphoneBandArmor" position={[0, 0.075, -0.02]} castShadow>
        <torusGeometry args={[0.19, 0.008, 8, 42, Math.PI]} />
        <meshPhysicalMaterial color={SECONDARY} metalness={0.92} roughness={0.15} clearcoat={0.94} />
      </mesh>
      <mesh name="HeadphoneEnergyBand" position={[0, 0.075, 0.001]}>
        <torusGeometry args={[0.19, 0.0038, 6, 42, Math.PI]} />
        <meshPhysicalMaterial color={ACCENT_HOT} emissive={ACCENT} emissiveIntensity={2.4} toneMapped={false} />
      </mesh>
      {([-1, 1] as const).map((side) => (
        <group key={side} name={side < 0 ? "HeadLeftEarpiece" : "HeadRightEarpiece"} position={[side * 0.184, 0.035, 0]}>
          <mesh rotation={[0, 0, Math.PI / 2]} castShadow>
            <cylinderGeometry args={[0.067, 0.061, 0.052, 28, 3]} />
            <meshPhysicalMaterial color={PRIMARY} metalness={0.84} roughness={0.2} clearcoat={0.9} clearcoatRoughness={0.1} />
          </mesh>
          <mesh rotation={[0, Math.PI / 2, 0]} position={[side * 0.029, 0, 0]}>
            <torusGeometry args={[0.046, 0.008, 10, 28]} />
            <meshPhysicalMaterial color={ACCENT_HOT} emissive={ACCENT} emissiveIntensity={2.8} toneMapped={false} />
          </mesh>
          <mesh rotation={[0, 0, Math.PI / 2]} position={[-side * 0.024, 0, 0]} castShadow>
            <cylinderGeometry args={[0.055, 0.055, 0.025, 28]} />
            <meshPhysicalMaterial color={DARK_JOINT} metalness={0.28} roughness={0.65} clearcoat={0.35} />
          </mesh>
          <ArmorPart args={[0.033, 0.082, 0.062]} position={[side * 0.028, -0.067, 0]} color={PRIMARY} finish="satin" radius={0.011} />
          <GlowLine args={[0.006, 0.052, 0.007]} position={[side * 0.046, -0.067, 0.032]} intensity={1.8} />
        </group>
      ))}
    </group>
  );
}

function Antenna() {
  return (
    <group name="HeadAntenna" position={[0.13, 0.155, -0.025]} rotation={[0.04, 0, -0.05]}>
      <mesh castShadow>
        <sphereGeometry args={[0.022, 18, 12]} />
        <meshPhysicalMaterial color={JOINT} metalness={0.92} roughness={0.14} clearcoat={0.9} />
      </mesh>
      <mesh position={[0, 0.075, 0]} castShadow>
        <cylinderGeometry args={[0.006, 0.009, 0.15, 12]} />
        <meshPhysicalMaterial color={DETAIL} metalness={0.95} roughness={0.12} clearcoat={1} />
      </mesh>
      <ArmorPart args={[0.025, 0.068, 0.016]} position={[0, 0.15, 0]} color={PRIMARY} finish="satin" radius={0.006} />
      <GlowLine args={[0.007, 0.048, 0.006]} position={[0, 0.15, 0.011]} intensity={2} />
      <mesh position={[0, 0.196, 0]}>
        <sphereGeometry args={[0.015, 16, 10]} />
        <meshPhysicalMaterial color={ACCENT_HOT} emissive={ACCENT_HOT} emissiveIntensity={3.3} toneMapped={false} />
      </mesh>
    </group>
  );
}

export function ArmoredRig({
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
  const root = useRef<ThreeGroup>(null);
  const hipsAim = useRef<ThreeGroup>(null);
  const spineAim = useRef<ThreeGroup>(null);
  const chestAim = useRef<ThreeGroup>(null);
  const neckAim = useRef<ThreeGroup>(null);
  const headAim = useRef<ThreeGroup>(null);
  const leftEye = useRef<ThreeGroup>(null);
  const rightEye = useRef<ThreeGroup>(null);
  const leftEyeGlow = useRef<MeshPhysicalMaterial>(null);
  const leftEyeCore = useRef<MeshPhysicalMaterial>(null);
  const rightEyeGlow = useRef<MeshPhysicalMaterial>(null);
  const rightEyeCore = useRef<MeshPhysicalMaterial>(null);
  const mouth = useRef<ThreeGroup>(null);
  const flowLights = useRef<FlowLightRegistration[]>([]);
  const mixer = useRef<AnimationMixer | null>(null);
  const actions = useRef<Record<string, AnimationAction>>({});
  const current = useRef("Idle");
  const blink = useRef(0);
  const clips = useMemo(() => createHostClips(), []);
  const carbonFiber = useMemo(
    () => (typeof document === "undefined" ? null : makeCarbonFiberTexture()),
    [],
  );

  useEffect(() => () => carbonFiber?.dispose(), [carbonFiber]);

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

  useFrame((state, delta) => {
    mixer.current?.update(delta);
    const energyTime = state.clock.elapsedTime;
    for (const light of flowLights.current) {
      const wave = (Math.sin(energyTime * 2.9 - light.offset) + 1) * 0.5;
      const highlight = wave * wave * wave * wave;
      const targetIntensity = reducedMotion
        ? light.baseIntensity * 0.9
        : light.baseIntensity * (0.74 + highlight * 0.98);
      light.material.emissiveIntensity = MathUtils.damp(
        light.material.emissiveIntensity,
        targetIntensity,
        reducedMotion ? 14 : 10,
        delta,
      );
      const heat = reducedMotion ? 0.3 : 0.12 + highlight * 0.88;
      light.material.emissive.lerpColors(FLOW_DIM_COLOR, FLOW_HOT_COLOR, heat);
      light.material.color.lerpColors(FLOW_DIM_COLOR, FLOW_HOT_COLOR, heat * 0.62);
      if (light.halo) {
        const targetOpacity = reducedMotion ? 0.1 : 0.045 + wave * 0.04 + highlight * 0.3;
        light.halo.opacity = MathUtils.damp(
          light.halo.opacity,
          targetOpacity,
          reducedMotion ? 14 : 11,
          delta,
        );
        light.halo.color.lerpColors(FLOW_DIM_COLOR, FLOW_HOT_COLOR, heat * 0.75);
      }
    }

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
      lookWeight.current *
      (reducedMotion ? 0.2 : 1) *
      (fullBody || contactEmote ? 0 : greeting ? 0.22 : walking ? 0.18 : 1);
    const aim = look.current;
    const yaw = MathUtils.clamp(aim.x * 0.62 * w, -0.65, 0.65);
    const pitch = MathUtils.clamp(aim.y * 0.46 * w, -0.38, 0.4);
    const damp = reducedMotion ? 14 : 16;

    // These non-animation-target child pivots keep procedural aim additive:
    // authored rotations remain on Hips/Spine/Chest/Neck/Head while the full
    // chain shares extreme pointer motion instead of forcing it through the neck.
    if (hipsAim.current) {
      hipsAim.current.rotation.y = MathUtils.damp(hipsAim.current.rotation.y, yaw * 0.03, 6, delta);
    }
    if (spineAim.current) {
      spineAim.current.rotation.y = MathUtils.damp(spineAim.current.rotation.y, yaw * 0.09, 7, delta);
      spineAim.current.rotation.x = MathUtils.damp(spineAim.current.rotation.x, pitch * 0.11, 7, delta);
    }
    if (chestAim.current) {
      chestAim.current.rotation.y = MathUtils.damp(chestAim.current.rotation.y, yaw * 0.18, 8, delta);
      chestAim.current.rotation.x = MathUtils.damp(chestAim.current.rotation.x, pitch * 0.12, 8, delta);
    }
    if (neckAim.current) {
      neckAim.current.rotation.y = MathUtils.damp(neckAim.current.rotation.y, yaw * 0.2, damp, delta);
      neckAim.current.rotation.x = MathUtils.damp(neckAim.current.rotation.x, pitch * 0.2, damp, delta);
    }
    if (headAim.current) {
      headAim.current.rotation.y = MathUtils.damp(headAim.current.rotation.y, yaw * 0.5, damp, delta);
      headAim.current.rotation.x = MathUtils.damp(headAim.current.rotation.x, pitch * 0.57, damp, delta);
    }

    const eyeY = MathUtils.clamp(aim.x * 0.2 * w, -0.18, 0.18);
    const eyeX = MathUtils.clamp(aim.y * 0.14 * w, -0.12, 0.12);
    blink.current += delta;
    const resolvedExpression = expression === "default" ? (CLIP_EXPRESSIONS[clip] ?? "default") : expression;
    const wakeT = actions.current.Wake?.time ?? 0;
    const lid =
      clip === "Sleep"
        ? 0.08
        : clip === "Wake"
          ? Math.min(1, 0.12 + wakeT / 1.2)
          : resolvedExpression === "surprised"
            ? 1.22
            : blink.current % 4.2 > 4.05
              ? 0.35
              : 1;
    const expressionStyle = EXPRESSION_STYLES[resolvedExpression];
    const eyeBlend = reducedMotion ? 20 : 14;
    const colorBlend = 1 - Math.exp(-12 * delta);
    const eyes = [
      {
        node: leftEye.current,
        tilt: expressionStyle.leftTilt,
        materials: [leftEyeGlow.current, leftEyeCore.current],
      },
      {
        node: rightEye.current,
        tilt: expressionStyle.rightTilt,
        materials: [rightEyeGlow.current, rightEyeCore.current],
      },
    ];
    for (const eye of eyes) {
      if (!eye.node) continue;
      eye.node.rotation.y = MathUtils.damp(eye.node.rotation.y, eyeY, 18, delta);
      eye.node.rotation.x = MathUtils.damp(eye.node.rotation.x, eyeX, 18, delta);
      eye.node.rotation.z = MathUtils.damp(eye.node.rotation.z, eye.tilt, eyeBlend, delta);
      eye.node.position.y = MathUtils.damp(eye.node.position.y, 0.027 + expressionStyle.offsetY, eyeBlend, delta);
      eye.node.scale.x = MathUtils.damp(eye.node.scale.x, expressionStyle.scaleX, eyeBlend, delta);
      eye.node.scale.y = MathUtils.damp(eye.node.scale.y, lid * expressionStyle.scaleY, 18, delta);
      for (const material of eye.materials) {
        if (!material) continue;
        material.emissive.lerp(expressionStyle.color, colorBlend);
        material.color.lerp(expressionStyle.color, colorBlend * 0.55);
      }
    }
    if (mouth.current) {
      const viseme = sampleViseme();
      const talk = viseme
        ? 0.28 + viseme.open * 0.85
        : clip === "Talk"
          ? 0.7 + Math.sin(blink.current * 10) * 0.25
          : clip === "Sleep"
            ? 0.22
            : clip === "Think"
              ? 0.28
              : resolvedExpression === "happy"
                ? 0.55
                : resolvedExpression === "surprised"
                  ? 0.85
                  : resolvedExpression === "angry"
                    ? 0.18
                    : resolvedExpression === "sad"
                      ? 0.24
                      : 0.35;
      const wide = viseme
        ? viseme.wide
        : resolvedExpression === "happy"
          ? 1.18
          : resolvedExpression === "surprised"
            ? 0.82
            : resolvedExpression === "angry"
              ? 0.88
              : resolvedExpression === "sad"
                ? 0.92
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
    <CarbonFiberContext.Provider value={carbonFiber}>
      <FlowLightContext.Provider value={flowLights}>
      <Environment resolution={128} frames={1} background={false}>
        <Lightformer form="rect" intensity={3.8} color="#ffffff" position={[0, 2.5, 4]} scale={[4, 1.4, 1]} />
        <Lightformer form="rect" intensity={2.6} color="#c8efff" position={[-3, 1, 1]} rotation={[0, Math.PI / 2, 0]} scale={[2, 4, 1]} />
        <Lightformer form="rect" intensity={2.2} color="#ffffff" position={[3, 0.5, 0]} rotation={[0, -Math.PI / 2, 0]} scale={[2, 3, 1]} />
        <Lightformer form="ring" intensity={2.8} color="#62dcff" position={[0, -1.5, 2]} scale={2.2} />
      </Environment>
      <group ref={root} name="Host">
        <group name="Hips">
          <group ref={hipsAim} name="HipsAim">
          <ArmorPart args={[0.3, 0.115, 0.14]} position={[0, 0.875, 0]} color={PRIMARY} finish="satin" />
          <ArmorPart args={[0.19, 0.045, 0.012]} position={[0, 0.895, 0.076]} color={SECONDARY} finish="brushed" />
          <Joint name="HipCore" position={[0, 0.88, 0]} rotation={[Math.PI / 2, 0, 0]} radius={0.052} width={0.12} />
          <FlowingStrip length={0.215} position={[0, 0.93, 0.076]} axis="x" segments={5} phase={7.1} intensity={1.45} />

        <group name="Spine" position={[0, 0.98, 0]}>
          <group ref={spineAim} name="SpineAim">
          <mesh position={[0, 0.08, 0]} castShadow>
            <cylinderGeometry args={[0.042, 0.055, 0.22, 16]} />
            <meshPhysicalMaterial color={DARK_JOINT} metalness={0.78} roughness={0.28} clearcoat={0.5} />
          </mesh>

          <group name="Chest" position={[0, 0.2, 0]}>
            <group ref={chestAim} name="ChestAim">
              <ArmorPart
                name="Body"
                args={[0.42, 0.42, 0.14]}
                color={PRIMARY}
                finish="satin"
                radius={0.045}
                onClick={hit("body")}
              />
              <ArmorPart
                args={[0.14, 0.052, 0.01]}
                position={[-0.095, 0.158, 0.076]}
                rotation={[0, 0, -0.09]}
                color={SECONDARY}
                finish="brushed"
                radius={0.007}
              />
              <ArmorPart
                args={[0.14, 0.052, 0.01]}
                position={[0.095, 0.158, 0.076]}
                rotation={[0, 0, 0.09]}
                color={SECONDARY}
                finish="brushed"
                radius={0.007}
              />
              <ArmorPart
                args={[0.135, 0.255, 0.008]}
                position={[-0.098, 0.005, 0.074]}
                rotation={[0, 0, -0.055]}
                color="#10171c"
                finish="carbon"
                radius={0.006}
              />
              <ArmorPart
                args={[0.135, 0.255, 0.008]}
                position={[0.098, 0.005, 0.074]}
                rotation={[0, 0, 0.055]}
                color="#10171c"
                finish="carbon"
                radius={0.006}
              />
              <ArmorPart args={[0.112, 0.036, 0.01]} position={[0, -0.074, 0.076]} color={SECONDARY} finish="brushed" radius={0.006} />
              <ArmorPart args={[0.096, 0.034, 0.01]} position={[0, -0.122, 0.076]} color={JOINT} finish="brushed" radius={0.006} />
              <ArmorPart args={[0.08, 0.032, 0.01]} position={[0, -0.168, 0.076]} color={SECONDARY} finish="brushed" radius={0.006} />
              <VentBank position={[-0.105, 0.055, 0.082]} rotation={[0, 0, -0.055]} scale={0.72} />
              <VentBank position={[0.105, 0.055, 0.082]} rotation={[0, 0, 0.055]} scale={0.72} />
              <mesh position={[0, 0.09, 0.081]} rotation={[Math.PI / 2, 0, 0]} castShadow>
                <cylinderGeometry args={[0.045, 0.052, 0.012, 16, 1]} />
                <meshPhysicalMaterial color={DARK_JOINT} metalness={0.88} roughness={0.2} clearcoat={0.72} />
              </mesh>
              <mesh position={[0, 0.09, 0.091]}>
                <torusGeometry args={[0.036, 0.005, 8, 24]} />
                <meshPhysicalMaterial color={DETAIL} metalness={0.98} roughness={0.08} clearcoat={1} />
              </mesh>
              <mesh position={[0, 0.09, 0.098]} rotation={[0, 0, Math.PI / 4]}>
                <octahedronGeometry args={[0.027, 0]} />
                <meshPhysicalMaterial
                  color={ACCENT_HOT}
                  emissive={ACCENT}
                  emissiveIntensity={7.5}
                  toneMapped={false}
                  metalness={0.28}
                  roughness={0.16}
                  clearcoat={1}
                />
              </mesh>
              <FlowingStrip length={0.25} position={[-0.176, 0.015, 0.082]} phase={0} intensity={1.55} />
              <FlowingStrip length={0.25} position={[0.176, 0.015, 0.082]} phase={1.1} intensity={1.55} />
              <FlowingStrip length={0.22} position={[0, 0.172, 0.082]} axis="x" segments={5} phase={2.2} intensity={1.25} />
              <FlowingStrip length={0.105} position={[0, -0.12, 0.087]} segments={3} phase={3.2} intensity={1.25} />

              <ArmorPart
                args={[0.135, 0.265, 0.008]}
                position={[-0.09, 0.005, -0.074]}
                rotation={[0, 0, 0.055]}
                color="#0b1116"
                finish="carbon"
                radius={0.006}
              />
              <ArmorPart
                args={[0.135, 0.265, 0.008]}
                position={[0.09, 0.005, -0.074]}
                rotation={[0, 0, -0.055]}
                color="#0b1116"
                finish="carbon"
                radius={0.006}
              />
              <ArmorPart args={[0.07, 0.11, 0.008]} position={[0, 0.1, -0.074]} color={SECONDARY} finish="brushed" radius={0.006} />
              <VentBank position={[-0.115, -0.09, -0.082]} rotation={[0, Math.PI, 0]} scale={0.68} />
              <VentBank position={[0.115, -0.09, -0.082]} rotation={[0, Math.PI, 0]} scale={0.68} />
              <SpineVertebrae position={[0, 0, -0.088]} />
              <FlowingStrip length={0.17} position={[0, -0.06, -0.102]} segments={4} phase={4.1} intensity={1.4} />
              <FlowingStrip length={0.155} position={[-0.075, 0.045, -0.082]} rotation={[0, 0, -0.48]} phase={5.1} intensity={1.35} />
              <FlowingStrip length={0.155} position={[0.075, 0.045, -0.082]} rotation={[0, 0, 0.48]} phase={6.1} intensity={1.35} />

              <group name="LeftShoulder" position={[-0.26, 0.17, 0]} onClick={hit("shoulder")}>
                <Joint name="LeftShoulderJoint" radius={0.065} width={0.145} />
                <ArmorPart args={[0.16, 0.07, 0.13]} position={[-0.028, -0.015, 0]} rotation={[0, 0, 0.045]} color={PRIMARY} finish="satin" />
                <mesh position={[-0.028, 0.005, 0]} scale={[1.12, 0.78, 0.94]} castShadow receiveShadow>
                  <sphereGeometry args={[0.075, 24, 14, 0, Math.PI * 2, 0, Math.PI / 2]} />
                  <meshPhysicalMaterial color={PRIMARY} metalness={0.94} roughness={0.12} clearcoat={1} clearcoatRoughness={0.04} />
                </mesh>
                <ArmorPart args={[0.085, 0.046, 0.008]} position={[-0.04, 0.023, 0.071]} color={SECONDARY} finish="brushed" radius={0.006} />
                <VentBank position={[-0.04, 0.023, 0.078]} scale={0.52} />
                <FlowingStrip length={0.085} position={[-0.038, 0.079, 0.071]} axis="x" segments={3} phase={6.4} intensity={1.4} />
              </group>
              <group name="RightShoulder" position={[0.26, 0.17, 0]} onClick={hit("shoulder")}>
                <Joint name="RightShoulderJoint" radius={0.065} width={0.145} />
                <ArmorPart args={[0.16, 0.07, 0.13]} position={[0.028, -0.015, 0]} rotation={[0, 0, -0.045]} color={PRIMARY} finish="satin" />
                <mesh position={[0.028, 0.005, 0]} scale={[1.12, 0.78, 0.94]} castShadow receiveShadow>
                  <sphereGeometry args={[0.075, 24, 14, 0, Math.PI * 2, 0, Math.PI / 2]} />
                  <meshPhysicalMaterial color={PRIMARY} metalness={0.94} roughness={0.12} clearcoat={1} clearcoatRoughness={0.04} />
                </mesh>
                <ArmorPart args={[0.085, 0.046, 0.008]} position={[0.04, 0.023, 0.071]} color={SECONDARY} finish="brushed" radius={0.006} />
                <VentBank position={[0.04, 0.023, 0.078]} scale={0.52} />
                <FlowingStrip length={0.085} position={[0.038, 0.079, 0.071]} axis="x" segments={3} phase={7} intensity={1.4} />
              </group>

              <group name="Neck" position={[0, 0.3, 0]}>
                <group ref={neckAim} name="NeckAim">
                  <mesh position={[0, 0.045, 0]} castShadow receiveShadow>
                    <cylinderGeometry args={[0.052, 0.067, 0.16, 20, 3]} />
                    <meshPhysicalMaterial color={DARK_JOINT} metalness={0.78} roughness={0.34} clearcoat={0.62} clearcoatRoughness={0.2} />
                  </mesh>
                  <mesh position={[0, 0.095, 0]} castShadow receiveShadow>
                    <sphereGeometry args={[0.064, 22, 16]} />
                    <meshPhysicalMaterial color={JOINT} metalness={0.92} roughness={0.18} clearcoat={0.9} clearcoatRoughness={0.08} />
                  </mesh>
                  <mesh position={[0, 0.143, 0]} castShadow receiveShadow>
                    <cylinderGeometry args={[0.047, 0.056, 0.085, 20, 2]} />
                    <meshPhysicalMaterial color={SECONDARY} metalness={0.93} roughness={0.18} clearcoat={0.88} clearcoatRoughness={0.1} />
                  </mesh>
                  <mesh position={[0, 0.012, 0]} rotation={[Math.PI / 2, 0, 0]}>
                    <torusGeometry args={[0.073, 0.012, 8, 28]} />
                    <meshPhysicalMaterial color={SECONDARY} metalness={0.92} roughness={0.18} clearcoat={0.82} />
                  </mesh>
                  <mesh position={[0, 0.167, 0]} rotation={[Math.PI / 2, 0, 0]}>
                    <torusGeometry args={[0.057, 0.009, 8, 24]} />
                    <meshPhysicalMaterial color={DETAIL} metalness={0.94} roughness={0.14} clearcoat={0.88} />
                  </mesh>
                  <Piston position={[-0.056, 0.085, 0.012]} rotation={[0, 0, -0.08]} length={0.14} radius={0.008} />
                  <Piston position={[0.056, 0.085, 0.012]} rotation={[0, 0, 0.08]} length={0.14} radius={0.008} />
                  <MechanicalCable position={[-0.043, 0.085, -0.045]} rotation={[0.08, 0, -0.12]} length={0.16} />
                  <MechanicalCable position={[0.043, 0.085, -0.045]} rotation={[0.08, 0, 0.12]} length={0.16} />
                  <FlowingStrip length={0.105} position={[0, 0.07, 0.062]} segments={3} thickness={0.014} depth={0.014} phase={5.7} intensity={1.7} />

                  <group name="Head" position={[0, 0.18, 0]}>
                    <group ref={headAim} name="HeadAim">
                      <ArmorPart
                        name="Head"
                        args={[0.33, 0.255, 0.225]}
                        color={PRIMARY}
                        metalness={0.86}
                        roughness={0.2}
                        clearcoat={0.9}
                        finish="satin"
                        onClick={hit("head")}
                      />
                      <ArmorPart args={[0.285, 0.065, 0.238]} position={[0, 0.126, -0.008]} color={SECONDARY} finish="brushed" />
                      <ArmorPart args={[0.17, 0.028, 0.22]} position={[0, 0.16, -0.004]} color={DARK_JOINT} finish="carbon" />
                      <ArmorPart args={[0.045, 0.14, 0.105]} position={[-0.17, 0.03, -0.005]} color={SECONDARY} finish="brushed" />
                      <ArmorPart args={[0.045, 0.14, 0.105]} position={[0.17, 0.03, -0.005]} color={SECONDARY} finish="brushed" />
                      <ArmorPart args={[0.25, 0.035, 0.08]} position={[0, -0.132, -0.042]} color={DARK_JOINT} finish="carbon" />
                      <Headphones />
                      <DigitalFaceScreen />

                      <group ref={leftEye} name="LeftEye" position={[-0.068, 0.028, 0.166]}>
                        <DigitalEye glowMaterial={leftEyeGlow} coreMaterial={leftEyeCore} />
                      </group>
                      <group ref={rightEye} name="RightEye" position={[0.068, 0.028, 0.166]}>
                        <DigitalEye glowMaterial={rightEyeGlow} coreMaterial={rightEyeCore} />
                      </group>
                      <group ref={mouth} name="Mouth" position={[0, -0.055, 0.166]}>
                        <DigitalMouth />
                      </group>

                      <ArmorPart args={[0.19, 0.05, 0.075]} position={[0, -0.126, 0.038]} color={SECONDARY} finish="brushed" />
                      <ArmorPart args={[0.135, 0.025, 0.055]} position={[0, -0.144, 0.074]} color={PRIMARY} finish="satin" />
                      <GlowLine args={[0.112, 0.008, 0.012]} position={[0, -0.146, 0.107]} intensity={1.7} />
                      <Antenna />
                      <SleepZs active={clip === "Sleep"} />
                    </group>
                  </group>
                </group>
              </group>

              <group name="LeftArm" position={[-0.32, 0.02, 0]} rotation={[0, 0, 0.12]}>
                <ArmorPart args={[0.115, 0.205, 0.12]} color={PRIMARY} finish="satin" />
                <ArmorPart args={[0.125, 0.066, 0.124]} position={[0, 0.05, 0]} color={SECONDARY} finish="brushed" />
                <ArmorPart args={[0.064, 0.13, 0.018]} position={[0, 0, 0.066]} color={DARK_JOINT} finish="carbon" />
                <FlowingStrip length={0.112} position={[-0.044, 0, 0.079]} segments={3} phase={7.2} intensity={1.55} />
                <Piston position={[0.048, -0.02, -0.045]} rotation={[0, 0, -0.08]} length={0.16} radius={0.009} />
                <group name="LeftForeArm" position={[0, -0.18, 0]}>
                  <Joint name="LeftElbowJoint" radius={0.05} width={0.1} />
                  <mesh position={[0, 0, 0.058]}>
                    <torusGeometry args={[0.034, 0.005, 8, 22]} />
                    <meshPhysicalMaterial color={DETAIL} metalness={0.97} roughness={0.1} clearcoat={1} />
                  </mesh>
                  <ArmorPart args={[0.13, 0.165, 0.13]} position={[0, -0.078, 0]} color={PRIMARY} finish="satin" />
                  <ArmorPart args={[0.018, 0.112, 0.09]} position={[-0.067, -0.076, 0]} color={SECONDARY} finish="brushed" radius={0.006} />
                  <ArmorPart args={[0.09, 0.12, 0.018]} position={[0, -0.074, 0.072]} color={SECONDARY} finish="brushed" />
                  <VentBank position={[0.018, -0.074, 0.084]} scale={0.52} />
                  <FlowingStrip length={0.1} position={[-0.049, -0.074, 0.084]} segments={3} phase={9.5} intensity={1.35} />
                  <group name="LeftHand" position={[0, -0.18, 0]}>
                    <Joint name="LeftWristJoint" radius={0.035} width={0.068} />
                    <ArmorPart args={[0.1, 0.085, 0.09]} position={[0, -0.025, 0]} color={PRIMARY} finish="satin" />
                    <ArmorPart args={[0.07, 0.044, 0.018]} position={[0, -0.012, 0.05]} color={SECONDARY} finish="brushed" />
                    <GlowLine args={[0.052, 0.009, 0.008]} position={[0, -0.012, 0.061]} intensity={1.1} flowOffset={11.8} />
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
                <ArmorPart args={[0.115, 0.205, 0.12]} color={PRIMARY} finish="satin" />
                <ArmorPart args={[0.125, 0.066, 0.124]} position={[0, 0.05, 0]} color={SECONDARY} finish="brushed" />
                <ArmorPart args={[0.064, 0.13, 0.018]} position={[0, 0, 0.066]} color={DARK_JOINT} finish="carbon" />
                <FlowingStrip length={0.112} position={[0.044, 0, 0.079]} segments={3} phase={7.8} intensity={1.55} />
                <Piston position={[-0.048, -0.02, -0.045]} rotation={[0, 0, 0.08]} length={0.16} radius={0.009} />
                <group name="RightForeArm" position={[0, -0.18, 0]}>
                  <Joint name="RightElbowJoint" radius={0.05} width={0.1} />
                  <mesh position={[0, 0, 0.058]}>
                    <torusGeometry args={[0.034, 0.005, 8, 22]} />
                    <meshPhysicalMaterial color={DETAIL} metalness={0.97} roughness={0.1} clearcoat={1} />
                  </mesh>
                  <ArmorPart args={[0.13, 0.165, 0.13]} position={[0, -0.078, 0]} color={PRIMARY} finish="satin" />
                  <ArmorPart args={[0.018, 0.112, 0.09]} position={[0.067, -0.076, 0]} color={SECONDARY} finish="brushed" radius={0.006} />
                  <ArmorPart args={[0.09, 0.12, 0.018]} position={[0, -0.074, 0.072]} color={SECONDARY} finish="brushed" />
                  <VentBank position={[-0.018, -0.074, 0.084]} scale={0.52} />
                  <FlowingStrip length={0.1} position={[0.049, -0.074, 0.084]} segments={3} phase={10.1} intensity={1.35} />
                  <group name="RightHand" position={[0, -0.18, 0]}>
                    <Joint name="RightWristJoint" radius={0.035} width={0.068} />
                    <ArmorPart name="RightHand" args={[0.1, 0.085, 0.09]} position={[0, -0.025, 0]} color={PRIMARY} finish="satin" onClick={hit("hand")} />
                    <ArmorPart args={[0.07, 0.044, 0.018]} position={[0, -0.012, 0.05]} color={SECONDARY} finish="brushed" />
                    <GlowLine args={[0.052, 0.009, 0.008]} position={[0, -0.012, 0.061]} intensity={1.1} flowOffset={12.4} />
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
        </group>
        </group>

        <group name="LeftUpLeg" position={[-0.09, 0.74, 0]}>
          <Joint name="LeftHipJoint" position={[0, 0.105, 0]} radius={0.058} width={0.13} />
          <ArmorPart args={[0.155, 0.265, 0.145]} color={PRIMARY} finish="satin" />
          <ArmorPart args={[0.165, 0.07, 0.15]} position={[0, 0.08, 0]} color={SECONDARY} finish="brushed" />
          <ArmorPart args={[0.075, 0.175, 0.018]} position={[0, 0.005, 0.08]} color={DARK_JOINT} finish="carbon" />
          <FlowingStrip length={0.148} position={[-0.06, 0.005, 0.092]} segments={4} phase={8.2} intensity={1.55} />
          <Piston position={[-0.055, -0.01, -0.045]} rotation={[0, 0, -0.05]} length={0.18} radius={0.009} />
          <group name="LeftLeg" position={[0, -0.22, 0]}>
            <Joint name="LeftKneeJoint" radius={0.058} width={0.1} />
            <mesh position={[0, 0, 0.067]}>
              <torusGeometry args={[0.039, 0.006, 8, 24]} />
              <meshPhysicalMaterial color={DETAIL} metalness={0.97} roughness={0.1} clearcoat={1} />
            </mesh>
            <ArmorPart args={[0.15, 0.2, 0.145]} position={[0, -0.09, 0]} color={PRIMARY} finish="satin" />
            <ArmorPart args={[0.085, 0.14, 0.018]} position={[0, -0.086, 0.081]} color={SECONDARY} finish="brushed" />
            <VentBank position={[0.018, -0.086, 0.093]} scale={0.46} />
            <FlowingStrip length={0.115} position={[-0.057, -0.086, 0.093]} segments={3} phase={10.9} intensity={1.4} />
            <Piston position={[0.055, -0.078, -0.045]} rotation={[0, 0, 0.04]} length={0.17} radius={0.009} />
            <group name="LeftFoot" position={[0, -0.15, 0.025]}>
              <FootAssembly side="Left" />
            </group>
          </group>
        </group>

        <group name="RightUpLeg" position={[0.09, 0.74, 0]}>
          <Joint name="RightHipJoint" position={[0, 0.105, 0]} radius={0.058} width={0.13} />
          <ArmorPart args={[0.155, 0.265, 0.145]} color={PRIMARY} finish="satin" />
          <ArmorPart args={[0.165, 0.07, 0.15]} position={[0, 0.08, 0]} color={SECONDARY} finish="brushed" />
          <ArmorPart args={[0.075, 0.175, 0.018]} position={[0, 0.005, 0.08]} color={DARK_JOINT} finish="carbon" />
          <FlowingStrip length={0.148} position={[0.06, 0.005, 0.092]} segments={4} phase={8.8} intensity={1.55} />
          <Piston position={[0.055, -0.01, -0.045]} rotation={[0, 0, 0.05]} length={0.18} radius={0.009} />
          <group name="RightLeg" position={[0, -0.22, 0]}>
            <Joint name="RightKneeJoint" radius={0.058} width={0.1} />
            <mesh position={[0, 0, 0.067]}>
              <torusGeometry args={[0.039, 0.006, 8, 24]} />
              <meshPhysicalMaterial color={DETAIL} metalness={0.97} roughness={0.1} clearcoat={1} />
            </mesh>
            <ArmorPart args={[0.15, 0.2, 0.145]} position={[0, -0.09, 0]} color={PRIMARY} finish="satin" />
            <ArmorPart args={[0.085, 0.14, 0.018]} position={[0, -0.086, 0.081]} color={SECONDARY} finish="brushed" />
            <VentBank position={[-0.018, -0.086, 0.093]} scale={0.46} />
            <FlowingStrip length={0.115} position={[0.057, -0.086, 0.093]} segments={3} phase={11.5} intensity={1.4} />
            <Piston position={[-0.055, -0.078, -0.045]} rotation={[0, 0, -0.04]} length={0.17} radius={0.009} />
            <group name="RightFoot" position={[0, -0.15, 0.025]}>
              <FootAssembly side="Right" />
            </group>
          </group>
        </group>
      </group>
    </group>
      </FlowLightContext.Provider>
    </CarbonFiberContext.Provider>
  );
}
