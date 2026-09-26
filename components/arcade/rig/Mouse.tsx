"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { AdditiveBlending, Color, ExtrudeGeometry, Shape, Vector2, type MeshBasicMaterial, type MeshStandardMaterial, type PointLight } from "three";
import { RoundedBox } from "@react-three/drei";
import { glowAlbedo, gripNormal, hexPadAlbedo } from "./textures";

/**
 * World: -Z monitor, +Z user.
 * Shape XY then rotateX(-90): shape +Y → world -Z (nose).
 * Thin nose / tall palm. Wheel in the front gap between clicks.
 */
const RGB_STOPS = [
  new Color("#22d3ee"),
  new Color("#3b82f6"),
  new Color("#a855f7"),
  new Color("#e879f9"),
  new Color("#22d3ee"),
];

function rgbAt(t: number, out: Color) {
  const u = ((t % 1) + 1) % 1;
  const scaled = u * (RGB_STOPS.length - 1);
  const i = Math.floor(scaled);
  return out.lerpColors(RGB_STOPS[i], RGB_STOPS[i + 1], scaled - i);
}

function extrudeY(shape: Shape, depth: number, y: number, z = 0) {
  const g = new ExtrudeGeometry(shape, {
    depth,
    steps: 2,
    curveSegments: 64,
    bevelEnabled: true,
    bevelThickness: 0.005,
    bevelSize: 0.005,
    bevelSegments: 12,
  });
  g.rotateX(-Math.PI / 2);
  g.translate(0, y, z);
  g.computeVertexNormals();
  return g;
}

function baseShape() {
  const s = new Shape();
  s.moveTo(0, 0.056);
  s.bezierCurveTo(0.016, 0.056, 0.027, 0.036, 0.0285, 0.008);
  s.bezierCurveTo(0.0295, -0.02, 0.025, -0.046, 0.01, -0.054);
  s.lineTo(-0.01, -0.054);
  s.bezierCurveTo(-0.025, -0.046, -0.0295, -0.02, -0.0285, 0.008);
  s.bezierCurveTo(-0.027, 0.036, -0.016, 0.056, 0, 0.056);
  return s;
}

function palmShape() {
  const s = new Shape();
  s.moveTo(0.0265, -0.006);
  s.bezierCurveTo(0.03, -0.022, 0.025, -0.046, 0.01, -0.052);
  s.lineTo(-0.01, -0.052);
  s.bezierCurveTo(-0.025, -0.046, -0.03, -0.022, -0.0265, -0.006);
  s.closePath();
  return s;
}

function clickShape(side: -1 | 1) {
  const s = new Shape();
  const gap = 0.006 * side;
  s.moveTo(gap, 0.054);
  s.quadraticCurveTo(0.019 * side, 0.051, 0.0262 * side, 0.041);
  s.lineTo(0.0268 * side, 0.015);
  s.quadraticCurveTo(0.021 * side, 0.009, gap, 0.008);
  s.closePath();
  return s;
}

export function MousePad() {
  const hex = useMemo(() => hexPadAlbedo(), []);
  return (
    <mesh position={[0.34, 0.052, 0.28]} rotation={[-Math.PI / 2, 0, 0.08]} receiveShadow>
      <planeGeometry args={[0.34, 0.26]} />
      <meshStandardMaterial map={hex} roughness={0.9} metalness={0.03} />
    </mesh>
  );
}

export function Mouse({ reduced }: { reduced?: boolean }) {
  const rgbL = useRef<MeshStandardMaterial>(null);
  const rgbR = useRef<MeshStandardMaterial>(null);
  const wheelLed = useRef<MeshStandardMaterial>(null);
  const logoLed = useRef<MeshStandardMaterial>(null);
  const spill = useRef<MeshBasicMaterial>(null);
  const glow = useRef<PointLight>(null);
  const color = useMemo(() => new Color(), []);
  const base = useMemo(() => extrudeY(baseShape(), 0.006, 0.001), []);
  // palm hump: dome displaced into the top face
  const palm = useMemo(() => {
    const g = extrudeY(palmShape(), 0.02, 0.008);
    const pos = g.attributes.position;
    for (let i = 0; i < pos.count; i += 1) {
      const x = pos.getX(i);
      const y = pos.getY(i);
      const z = pos.getZ(i);
      if (y < 0.0225) continue;
      const w = Math.min(1, (y - 0.0225) / 0.0055);
      const nx = x / 0.0285;
      const nz = (z - 0.032) / 0.04;
      const r2 = nx * nx + nz * nz;
      pos.setY(i, y + 0.0042 * Math.max(0, 1 - r2) * w);
    }
    g.computeVertexNormals();
    return g;
  }, []);
  const left = useMemo(() => extrudeY(clickShape(-1), 0.0025, 0.01), []);
  const right = useMemo(() => extrudeY(clickShape(1), 0.0025, 0.01), []);
  const gripTex = useMemo(() => {
    const t = gripNormal();
    t.repeat.set(6, 2);
    return t;
  }, []);
  const spillTex = useMemo(() => glowAlbedo(), []);

  useFrame((state) => {
    if (reduced) return;
    rgbAt(state.clock.elapsedTime * 0.12, color);
    const pulse = 0.7 + 0.2 * Math.sin(state.clock.elapsedTime * 1.05);
    for (const mat of [rgbL.current, rgbR.current, wheelLed.current, logoLed.current]) {
      if (!mat) continue;
      mat.emissive.copy(color);
      mat.color.copy(color);
      mat.emissiveIntensity = pulse;
    }
    if (spill.current) {
      spill.current.color.copy(color).multiplyScalar(0.45 + 0.12 * Math.sin(state.clock.elapsedTime * 1.05));
    }
    if (glow.current) {
      glow.current.color.copy(color);
      glow.current.intensity = 0.14 + 0.04 * Math.sin(state.clock.elapsedTime * 1.05);
    }
  });

  return (
    <group position={[0.34, 0.066, 0.27]} rotation={[0.05, -0.22, 0]} scale={1.22}>
      <mesh geometry={base} castShadow>
        <meshStandardMaterial color="#35383f" roughness={0.56} metalness={0.06} envMapIntensity={1} />
      </mesh>
      <mesh geometry={palm} castShadow>
        <meshStandardMaterial color="#2f323a" roughness={0.62} metalness={0.05} envMapIntensity={0.85} />
      </mesh>
      <mesh geometry={left} castShadow>
        <meshStandardMaterial color="#3d414b" roughness={0.3} metalness={0.12} envMapIntensity={1.1} />
      </mesh>
      <mesh geometry={right} castShadow>
        <meshStandardMaterial color="#3d414b" roughness={0.3} metalness={0.12} envMapIntensity={1.1} />
      </mesh>
      {/* grippy rubber side bands */}
      <mesh position={[-0.029, 0.0065, 0.006]}>
        <boxGeometry args={[0.004, 0.009, 0.04]} />
        <meshStandardMaterial color="#2a2d34" normalMap={gripTex} normalScale={new Vector2(0.7, 0.7)} roughness={0.92} metalness={0.02} />
      </mesh>
      <mesh position={[0.029, 0.0065, 0.006]}>
        <boxGeometry args={[0.004, 0.009, 0.04]} />
        <meshStandardMaterial color="#2a2d34" normalMap={gripTex} normalScale={new Vector2(0.7, 0.7)} roughness={0.92} metalness={0.02} />
      </mesh>
      <mesh position={[0, 0.012, -0.028]}>
        <boxGeometry args={[0.0022, 0.006, 0.04]} />
        <meshStandardMaterial color="#23262e" roughness={0.7} />
      </mesh>
      <mesh position={[-0.014, 0.011, -0.02]} rotation={[0, 0, 0.08]}>
        <boxGeometry args={[0.0016, 0.005, 0.036]} />
        <meshStandardMaterial color="#23262e" roughness={0.7} />
      </mesh>
      <mesh position={[0.014, 0.011, -0.02]} rotation={[0, 0, -0.08]}>
        <boxGeometry args={[0.0016, 0.005, 0.036]} />
        <meshStandardMaterial color="#23262e" roughness={0.7} />
      </mesh>
      {/* wheel in the front gap, between L/R, proud of the thin clicks */}
      <mesh position={[0, 0.016, -0.046]}>
        <boxGeometry args={[0.01, 0.01, 0.014]} />
        <meshStandardMaterial color="#202329" roughness={0.5} />
      </mesh>
      <group position={[0, 0.0195, -0.046]} rotation={[0, Math.PI / 2, 0]}>
        <mesh>
          <torusGeometry args={[0.007, 0.0031, 28, 56]} />
          <meshStandardMaterial color="#262930" roughness={0.85} metalness={0} />
        </mesh>
        {/* physical tread ridges around the tire */}
        {Array.from({ length: 24 }, (_, i) => {
          const a = (i / 24) * Math.PI * 2;
          return (
            <mesh key={i} position={[0, Math.cos(a) * 0.0099, Math.sin(a) * 0.0099]}>
              <boxGeometry args={[0.0125, 0.0013, 0.0013]} />
              <meshStandardMaterial color="#3a3e47" roughness={0.7} metalness={0.05} />
            </mesh>
          );
        })}
        <mesh>
          <torusGeometry args={[0.0074, 0.0008, 10, 44]} />
          <meshStandardMaterial ref={wheelLed} color="#22d3ee" emissive="#22d3ee" emissiveIntensity={0.8} roughness={0.22} />
        </mesh>
      </group>
      <RoundedBox args={[0.006, 0.01, 0.012]} radius={0.0016} smoothness={4} position={[-0.03, 0.01, 0.004]} rotation={[0.05, 0, 0.4]}>
        <meshStandardMaterial color="#454954" roughness={0.35} metalness={0.12} />
      </RoundedBox>
      <RoundedBox args={[0.006, 0.009, 0.01]} radius={0.0016} smoothness={4} position={[-0.03, 0.009, 0.018]} rotation={[0.05, 0, 0.4]}>
        <meshStandardMaterial color="#454954" roughness={0.35} metalness={0.12} />
      </RoundedBox>
      {/* DPI button behind the wheel */}
      <RoundedBox args={[0.009, 0.004, 0.012]} radius={0.0013} smoothness={4} position={[0, 0.0105, -0.028]}>
        <meshStandardMaterial color="#454954" roughness={0.4} metalness={0.1} />
      </RoundedBox>
      {/* side RGB: frosted diffuser shell around a bright core */}
      <mesh position={[-0.0315, -0.0005, 0.004]} rotation={[0.12, 0, -0.2]}>
        <boxGeometry args={[0.0048, 0.005, 0.076]} />
        <meshPhysicalMaterial color="#e6ecfa" roughness={0.34} transmission={0.4} thickness={0.004} metalness={0} />
      </mesh>
      <mesh position={[-0.0315, -0.0005, 0.004]} rotation={[0.12, 0, -0.2]}>
        <boxGeometry args={[0.002, 0.0018, 0.07]} />
        <meshStandardMaterial ref={rgbL} color="#22d3ee" emissive="#22d3ee" emissiveIntensity={0.7} roughness={0.22} toneMapped={false} />
      </mesh>
      <mesh position={[0.0315, -0.0005, 0.004]} rotation={[0.12, 0, 0.2]}>
        <boxGeometry args={[0.0048, 0.005, 0.076]} />
        <meshPhysicalMaterial color="#e6ecfa" roughness={0.34} transmission={0.4} thickness={0.004} metalness={0} />
      </mesh>
      <mesh position={[0.0315, -0.0005, 0.004]} rotation={[0.12, 0, 0.2]}>
        <boxGeometry args={[0.002, 0.0018, 0.07]} />
        <meshStandardMaterial ref={rgbR} color="#22d3ee" emissive="#22d3ee" emissiveIntensity={0.7} roughness={0.22} toneMapped={false} />
      </mesh>
      {/* illuminated logo ring on the palm hump */}
      <mesh position={[0, 0.0331, 0.032]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.0042, 0.0007, 10, 40]} />
        <meshStandardMaterial ref={logoLed} color="#22d3ee" emissive="#22d3ee" emissiveIntensity={0.7} roughness={0.25} toneMapped={false} />
      </mesh>
      <mesh position={[0, 0.0331, 0.032]}>
        <cylinderGeometry args={[0.0017, 0.0017, 0.0009, 20]} />
        <meshStandardMaterial color="#2c3038" metalness={0.5} roughness={0.3} />
      </mesh>
      {/* desk spill halo */}
      <mesh position={[0, -0.0052, 0.005]} rotation={[Math.PI / 2, 0, 0]}>
        <planeGeometry args={[0.14, 0.18]} />
        <meshBasicMaterial
          ref={spill}
          map={spillTex}
          transparent
          opacity={0.36}
          depthWrite={false}
          side={2}
          blending={AdditiveBlending}
        />
      </mesh>
      <pointLight ref={glow} position={[0, 0.02, 0.02]} distance={0.14} intensity={0.14} color="#22d3ee" />
      {[
        [-0.015, -0.002, -0.04],
        [0.015, -0.002, -0.04],
        [-0.015, -0.002, 0.04],
        [0.015, -0.002, 0.04],
      ].map((p) => (
        <mesh key={p.join(",")} position={p as [number, number, number]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.005, 0.005, 0.0015, 12]} />
          <meshStandardMaterial color="#e5e7eb" roughness={0.32} />
        </mesh>
      ))}
    </group>
  );
}
