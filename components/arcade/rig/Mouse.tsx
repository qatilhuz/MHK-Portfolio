"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Color, ExtrudeGeometry, Shape, type MeshStandardMaterial, type PointLight } from "three";
import { hexPadAlbedo } from "./textures";

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
    curveSegments: 48,
    bevelEnabled: true,
    bevelThickness: 0.005,
    bevelSize: 0.005,
    bevelSegments: 8,
  });
  g.rotateX(-Math.PI / 2);
  g.translate(0, y, z);
  g.computeVertexNormals();
  return g;
}

function baseShape() {
  const s = new Shape();
  s.moveTo(0, 0.056);
  s.bezierCurveTo(0.016, 0.056, 0.028, 0.036, 0.03, 0.008);
  s.bezierCurveTo(0.031, -0.02, 0.026, -0.046, 0.01, -0.054);
  s.lineTo(-0.01, -0.054);
  s.bezierCurveTo(-0.026, -0.046, -0.031, -0.02, -0.03, 0.008);
  s.bezierCurveTo(-0.028, 0.036, -0.016, 0.056, 0, 0.056);
  return s;
}

function palmShape() {
  const s = new Shape();
  s.moveTo(0.02, -0.004);
  s.bezierCurveTo(0.024, -0.02, 0.02, -0.044, 0.008, -0.05);
  s.lineTo(-0.008, -0.05);
  s.bezierCurveTo(-0.02, -0.044, -0.024, -0.02, -0.02, -0.004);
  s.closePath();
  return s;
}

function clickShape(side: -1 | 1) {
  const s = new Shape();
  const gap = 0.006 * side;
  s.moveTo(gap, 0.054);
  s.lineTo(0.026 * side, 0.042);
  s.lineTo(0.026 * side, 0.012);
  s.lineTo(gap, 0.008);
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
  const glow = useRef<PointLight>(null);
  const color = useMemo(() => new Color(), []);
  const base = useMemo(() => extrudeY(baseShape(), 0.006, 0.001), []);
  const palm = useMemo(() => extrudeY(palmShape(), 0.02, 0.008), []);
  const left = useMemo(() => extrudeY(clickShape(-1), 0.0025, 0.01), []);
  const right = useMemo(() => extrudeY(clickShape(1), 0.0025, 0.01), []);

  useFrame((state) => {
    if (reduced) return;
    rgbAt(state.clock.elapsedTime * 0.12, color);
    const pulse = 0.7 + 0.2 * Math.sin(state.clock.elapsedTime * 1.05);
    for (const mat of [rgbL.current, rgbR.current, wheelLed.current]) {
      if (!mat) continue;
      mat.emissive.copy(color);
      mat.color.copy(color);
      mat.emissiveIntensity = pulse;
    }
    if (glow.current) {
      glow.current.color.copy(color);
      glow.current.intensity = 0.14 + 0.04 * Math.sin(state.clock.elapsedTime * 1.05);
    }
  });

  return (
    <group position={[0.34, 0.066, 0.27]} rotation={[0.05, -0.22, 0]} scale={1.22}>
      <mesh geometry={base} castShadow>
        <meshStandardMaterial color="#3a3d46" roughness={0.5} metalness={0.18} envMapIntensity={1.15} />
      </mesh>
      <mesh geometry={palm} castShadow>
        <meshStandardMaterial color="#32353e" roughness={0.58} metalness={0.1} envMapIntensity={0.85} />
      </mesh>
      <mesh geometry={left} castShadow>
        <meshStandardMaterial color="#4a4e58" roughness={0.36} metalness={0.18} />
      </mesh>
      <mesh geometry={right} castShadow>
        <meshStandardMaterial color="#4a4e58" roughness={0.36} metalness={0.18} />
      </mesh>
      <mesh position={[0, 0.012, -0.028]}>
        <boxGeometry args={[0.0022, 0.006, 0.04]} />
        <meshStandardMaterial color="#15161c" roughness={0.7} />
      </mesh>
      <mesh position={[-0.014, 0.011, -0.02]} rotation={[0, 0, 0.08]}>
        <boxGeometry args={[0.0016, 0.005, 0.036]} />
        <meshStandardMaterial color="#15161c" roughness={0.7} />
      </mesh>
      <mesh position={[0.014, 0.011, -0.02]} rotation={[0, 0, -0.08]}>
        <boxGeometry args={[0.0016, 0.005, 0.036]} />
        <meshStandardMaterial color="#15161c" roughness={0.7} />
      </mesh>
      {/* wheel in the front gap, between L/R, proud of the thin clicks */}
      <mesh position={[0, 0.016, -0.046]}>
        <boxGeometry args={[0.01, 0.01, 0.014]} />
        <meshStandardMaterial color="#111318" roughness={0.5} />
      </mesh>
      <group position={[0, 0.021, -0.046]} rotation={[0, Math.PI / 2, 0]}>
        <mesh>
          <torusGeometry args={[0.007, 0.0036, 12, 24]} />
          <meshStandardMaterial color="#1a1c22" roughness={0.78} />
        </mesh>
        {Array.from({ length: 14 }, (_, i) => (
          <mesh key={i} rotation={[(i / 14) * Math.PI * 2, 0, 0]}>
            <boxGeometry args={[0.013, 0.001, 0.0014]} />
            <meshStandardMaterial color="#4b5160" roughness={0.4} />
          </mesh>
        ))}
        <mesh>
          <torusGeometry args={[0.0074, 0.0008, 8, 22]} />
          <meshStandardMaterial ref={wheelLed} color="#22d3ee" emissive="#22d3ee" emissiveIntensity={0.8} roughness={0.22} />
        </mesh>
      </group>
      <mesh position={[-0.03, 0.01, 0.004]} rotation={[0.05, 0, 0.4]}>
        <boxGeometry args={[0.006, 0.01, 0.012]} />
        <meshStandardMaterial color="#2a2d35" roughness={0.72} />
      </mesh>
      <mesh position={[-0.03, 0.009, 0.018]} rotation={[0.05, 0, 0.4]}>
        <boxGeometry args={[0.006, 0.009, 0.01]} />
        <meshStandardMaterial color="#2a2d35" roughness={0.72} />
      </mesh>
      <mesh position={[-0.026, 0.008, 0.004]} rotation={[0.12, 0, -0.2]}>
        <boxGeometry args={[0.0025, 0.0025, 0.08]} />
        <meshStandardMaterial ref={rgbL} color="#22d3ee" emissive="#22d3ee" emissiveIntensity={0.7} roughness={0.22} />
      </mesh>
      <mesh position={[0.026, 0.008, 0.004]} rotation={[0.12, 0, 0.2]}>
        <boxGeometry args={[0.0025, 0.0025, 0.08]} />
        <meshStandardMaterial ref={rgbR} color="#22d3ee" emissive="#22d3ee" emissiveIntensity={0.7} roughness={0.22} />
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
