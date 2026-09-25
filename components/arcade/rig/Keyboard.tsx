"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { RoundedBox } from "@react-three/drei";
import { Color, InstancedMesh, MeshStandardMaterial, Object3D, type PointLight } from "three";

const dummy = new Object3D();
const tint = new Color();
const RGB = [
  new Color("#22d3ee"),
  new Color("#3b82f6"),
  new Color("#a855f7"),
  new Color("#e879f9"),
];

const U = 0.0185;
const G = 0.003;
const P = U + G;

type KeySpec = { x: number; z: number; w: number };

function row(z: number, units: number[], startX: number): KeySpec[] {
  const out: KeySpec[] = [];
  let x = startX;
  for (const w of units) {
    out.push({ x: x + (w * P - G) / 2, z, w: w * P - G });
    x += w * P;
  }
  return out;
}

function rowWidth(units: number[]) {
  return units.reduce((a, b) => a + b, 0) * P;
}

function buildLayout() {
  const fnU = [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1];
  const numU = [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2];
  const qU = [1.5, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1.5];
  const aU = [1.75, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2.25];
  const zU = [2.25, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2.75];
  const bU = [1.25, 1.25, 1.25, 6.25, 1.25, 1.25, 1.25];
  const span = Math.max(rowWidth(fnU), rowWidth(numU), rowWidth(qU), rowWidth(aU), rowWidth(zU), rowWidth(bU));
  const start = -span / 2;
  const zFn = -P * 2.5;
  const all = [
    ...row(zFn, fnU, start),
    ...row(zFn + P, numU, start),
    ...row(zFn + P * 2, qU, start),
    ...row(zFn + P * 3, aU, start),
    ...row(zFn + P * 4, zU, start),
    ...row(zFn + P * 5, bU, start),
  ];
  return {
    unit: all.filter((k) => Math.abs(k.w - U) < 0.002),
    wide: all.filter((k) => Math.abs(k.w - U) >= 0.002),
    span,
    depth: P * 6,
  };
}

function rgbWave(t: number, x: number, out: Color) {
  const u = (((t * 0.18 + x * 3.2) % 1) + 1) % 1;
  const s = u * (RGB.length - 1);
  const i = Math.floor(s);
  return out.lerpColors(RGB[i], RGB[Math.min(i + 1, RGB.length - 1)], s - i);
}

export function Keyboard({ reduced }: { reduced?: boolean }) {
  const mesh = useRef<InstancedMesh>(null);
  const under = useRef<MeshStandardMaterial>(null);
  const lamp = useRef<PointLight>(null);
  const layout = useMemo(() => buildLayout(), []);
  const color = useMemo(() => new Color(), []);
  const rimMat = useMemo(
    () =>
      new MeshStandardMaterial({
        color: "#22d3ee",
        emissive: "#22d3ee",
        emissiveIntensity: 0.65,
        roughness: 0.22,
      }),
    [],
  );
  const chassisW = layout.span + 0.04;
  const chassisD = layout.depth + 0.036;

  useFrame((state) => {
    const node = mesh.current;
    const t = reduced ? 0 : state.clock.elapsedTime;
    if (node) {
      layout.unit.forEach((key, index) => {
        dummy.position.set(key.x, 0.012, key.z);
        dummy.updateMatrix();
        node.setMatrixAt(index, dummy.matrix);
        rgbWave(t, key.x, tint);
        tint.multiplyScalar(0.32);
        node.setColorAt(index, tint);
      });
      node.instanceMatrix.needsUpdate = true;
      if (node.instanceColor) node.instanceColor.needsUpdate = true;
    }
    rgbWave(t, 0, color);
    if (under.current) {
      under.current.emissive.copy(color);
      under.current.emissiveIntensity = 0.3 + 0.1 * Math.sin(t * 1.05);
    }
    rimMat.emissive.copy(color);
    rimMat.color.copy(color);
    rimMat.emissiveIntensity = 0.55 + 0.15 * Math.sin(t * 1.05);
    if (lamp.current) {
      lamp.current.color.copy(color);
      lamp.current.intensity = 0.24 + 0.06 * Math.sin(t * 1.05);
    }
  });

  return (
    <group position={[0.02, 0.061, 0.26]} rotation={[0.1, 0, 0]}>
      <RoundedBox args={[chassisW, 0.016, chassisD]} radius={0.006} smoothness={4} castShadow receiveShadow>
        <meshStandardMaterial color="#3a3d46" metalness={0.42} roughness={0.44} envMapIntensity={0.9} />
      </RoundedBox>
      <mesh position={[0, 0.009, 0]}>
        <boxGeometry args={[chassisW - 0.016, 0.002, chassisD - 0.016]} />
        <meshStandardMaterial color="#4a4e58" metalness={0.46} roughness={0.38} />
      </mesh>
      <mesh position={[0, -0.007, 0]}>
        <boxGeometry args={[chassisW - 0.03, 0.002, chassisD - 0.02]} />
        <meshStandardMaterial ref={under} color="#22d3ee" emissive="#22d3ee" emissiveIntensity={0.35} roughness={0.3} />
      </mesh>
      {/* perimeter RGB — four edge strips, not a hidden under-plate */}
      <mesh position={[0, 0.001, chassisD / 2]} material={rimMat}>
        <boxGeometry args={[chassisW, 0.004, 0.006]} />
      </mesh>
      <mesh position={[0, 0.001, -chassisD / 2]} material={rimMat}>
        <boxGeometry args={[chassisW, 0.004, 0.006]} />
      </mesh>
      <mesh position={[chassisW / 2, 0.001, 0]} material={rimMat}>
        <boxGeometry args={[0.006, 0.004, chassisD]} />
      </mesh>
      <mesh position={[-chassisW / 2, 0.001, 0]} material={rimMat}>
        <boxGeometry args={[0.006, 0.004, chassisD]} />
      </mesh>
      <pointLight position={[0, -0.018, 0]} intensity={0.28} distance={0.42} color="#a78bfa" />
      {[-chassisW * 0.38, chassisW * 0.38].map((x) =>
        [-chassisD * 0.38, chassisD * 0.38].map((z) => (
          <mesh key={`${x}${z}`} position={[x, -0.01, z]}>
            <cylinderGeometry args={[0.007, 0.008, 0.004, 12]} />
            <meshStandardMaterial color="#1c1e24" roughness={0.8} />
          </mesh>
        )),
      )}

      <instancedMesh ref={mesh} args={[undefined, undefined, layout.unit.length]} castShadow>
        <boxGeometry args={[U, 0.01, U * 0.9]} />
        <meshStandardMaterial color="#3a3d46" roughness={0.52} metalness={0.08} />
      </instancedMesh>

      {layout.wide.map((key) => (
        <group key={`${key.x}-${key.z}`} position={[key.x, 0.012, key.z]}>
          <mesh castShadow>
            <boxGeometry args={[key.w, 0.01, U * 0.9]} />
            <meshStandardMaterial color="#4a4e58" roughness={0.48} metalness={0.1} />
          </mesh>
          <mesh position={[0, -0.005, 0]}>
            <boxGeometry args={[key.w * 0.9, 0.0025, U * 0.6]} />
            <meshStandardMaterial color="#22d3ee" emissive="#7c3aed" emissiveIntensity={0.24} roughness={0.35} />
          </mesh>
        </group>
      ))}

      <pointLight ref={lamp} position={[0, 0.024, 0]} intensity={0.26} distance={0.42} color="#a78bfa" />
    </group>
  );
}
