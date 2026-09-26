"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { RoundedBox } from "@react-three/drei";
import {
  AdditiveBlending,
  Color,
  InstancedMesh,
  MeshBasicMaterial,
  MeshStandardMaterial,
  Object3D,
  Vector2,
  type PointLight,
} from "three";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";
import { glowAlbedo, keycapNormal } from "./textures";

const dummy = new Object3D();
const tint = new Color();
const white = new Color("#ffffff");
const RGB = [
  new Color("#22d3ee"),
  new Color("#3b82f6"),
  new Color("#a855f7"),
  new Color("#e879f9"),
];

const U = 0.0185;
const G = 0.003;
const P = U + G;
const CAP_H = 0.011;
const CAP_D = U * 0.86;
/** glow light-guide sits around each cap, inside the key gap */
const BAR_W = 0.0205;
const BAR_D = 0.02;

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

/**
 * PBT keycap: rounded bevels + concave cylindrical dish scooped into the top
 * face (the classic Cherry/SA profile read).
 */
function makeCapGeometry(w: number) {
  const g = new RoundedBoxGeometry(w, CAP_H, CAP_D, 3, 0.0017);
  const pos = g.attributes.position;
  const top = CAP_H / 2;
  const dish = 0.0021;
  for (let i = 0; i < pos.count; i += 1) {
    const x = pos.getX(i);
    const y = pos.getY(i);
    const z = pos.getZ(i);
    if (y < top - 0.0005) continue;
    const nx = x / (w / 2);
    const nz = z / (CAP_D / 2);
    const r2 = Math.min(1, nx * nx + nz * nz);
    pos.setY(i, y - dish * (1 - r2));
  }
  g.computeVertexNormals();
  return g;
}

function rgbWave(t: number, x: number, out: Color) {
  const u = (((t * 0.18 + x * 3.2) % 1) + 1) % 1;
  const s = u * (RGB.length - 1);
  const i = Math.floor(s);
  return out.lerpColors(RGB[i], RGB[Math.min(i + 1, RGB.length - 1)], s - i);
}

export function Keyboard({ reduced }: { reduced?: boolean }) {
  const caps = useRef<InstancedMesh>(null);
  const bars = useRef<InstancedMesh>(null);
  const under = useRef<MeshStandardMaterial>(null);
  const spill = useRef<MeshBasicMaterial>(null);
  const lamp = useRef<PointLight>(null);
  const layout = useMemo(() => buildLayout(), []);
  const color = useMemo(() => new Color(), []);

  const capGeo = useMemo(() => makeCapGeometry(U), []);
  const wideGeos = useMemo(() => {
    const map = new Map<number, RoundedBoxGeometry>();
    for (const k of layout.wide) {
      const key = Math.round(k.w * 1000);
      if (!map.has(key)) map.set(key, makeCapGeometry(k.w));
    }
    return map;
  }, [layout]);

  const capMat = useMemo(() => {
    const m = new MeshStandardMaterial({
      color: "#2e313a",
      roughness: 0.62,
      metalness: 0.05,
      envMapIntensity: 0.72,
    });
    m.normalMap = keycapNormal();
    m.normalScale = new Vector2(0.4, 0.4);
    return m;
  }, []);

  // unlit light-guide material — instanceColor drives the wave through gaps
  const barMat = useMemo(() => new MeshBasicMaterial({ toneMapped: false }), []);
  const glowTex = useMemo(() => glowAlbedo(), []);

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
    const t = reduced ? 0 : state.clock.elapsedTime;
    const node = caps.current;
    const glow = bars.current;
    if (node && glow) {
      layout.unit.forEach((key, index) => {
        dummy.position.set(key.x, 0.016, key.z);
        dummy.updateMatrix();
        node.setMatrixAt(index, dummy.matrix);
        // caps pick up only a whisper of the wave
        rgbWave(t, key.x, tint);
        tint.copy(white).lerp(tint, 0.14);
        node.setColorAt(index, tint);
        // light guides take the full wave
        dummy.position.set(key.x, 0.0107, key.z);
        dummy.updateMatrix();
        glow.setMatrixAt(index, dummy.matrix);
        rgbWave(t, key.x, tint);
        glow.setColorAt(index, tint);
      });
      node.instanceMatrix.needsUpdate = true;
      if (node.instanceColor) node.instanceColor.needsUpdate = true;
      glow.instanceMatrix.needsUpdate = true;
      if (glow.instanceColor) glow.instanceColor.needsUpdate = true;
    }
    rgbWave(t, 0, color);
    if (under.current) {
      under.current.emissive.copy(color);
      under.current.emissiveIntensity = 0.34 + 0.1 * Math.sin(t * 1.05);
    }
    rimMat.emissive.copy(color);
    rimMat.color.copy(color);
    rimMat.emissiveIntensity = 0.6 + 0.15 * Math.sin(t * 1.05);
    if (spill.current) {
      spill.current.color.copy(color).multiplyScalar(0.55 + 0.15 * Math.sin(t * 1.05));
    }
    if (lamp.current) {
      lamp.current.color.copy(color);
      lamp.current.intensity = 0.26 + 0.06 * Math.sin(t * 1.05);
    }
  });

  return (
    <group position={[0.02, 0.061, 0.26]} rotation={[0.1, 0, 0]}>
      {/* CNC aluminium case */}
      <RoundedBox args={[chassisW, 0.016, chassisD]} radius={0.006} smoothness={4} castShadow receiveShadow>
        <meshStandardMaterial color="#3a3d46" metalness={0.42} roughness={0.44} envMapIntensity={0.9} />
      </RoundedBox>
      {/* switch plate */}
      <mesh position={[0, 0.009, 0]}>
        <boxGeometry args={[chassisW - 0.016, 0.002, chassisD - 0.016]} />
        <meshStandardMaterial color="#4a4e58" metalness={0.46} roughness={0.38} />
      </mesh>
      {/* bottom diffuser — underglow bouncing off the desk */}
      <mesh position={[0, -0.007, 0]}>
        <boxGeometry args={[chassisW - 0.03, 0.002, chassisD - 0.02]} />
        <meshStandardMaterial ref={under} color="#22d3ee" emissive="#22d3ee" emissiveIntensity={0.35} roughness={0.3} />
      </mesh>
      {/* perimeter RGB — mid rails */}
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
      {/* lower edge-glow rails that spill toward the desk */}
      <mesh position={[0, -0.0068, chassisD / 2 - 0.002]} material={rimMat}>
        <boxGeometry args={[chassisW - 0.012, 0.003, 0.004]} />
      </mesh>
      <mesh position={[0, -0.0068, -chassisD / 2 + 0.002]} material={rimMat}>
        <boxGeometry args={[chassisW - 0.012, 0.003, 0.004]} />
      </mesh>
      <mesh position={[chassisW / 2 - 0.002, -0.0068, 0]} material={rimMat}>
        <boxGeometry args={[0.004, 0.003, chassisD - 0.012]} />
      </mesh>
      <mesh position={[-chassisW / 2 + 0.002, -0.0068, 0]} material={rimMat}>
        <boxGeometry args={[0.004, 0.003, chassisD - 0.012]} />
      </mesh>
      {/* desk spill — soft additive halo around the board */}
      <mesh position={[0, -0.0118, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <planeGeometry args={[chassisW + 0.1, chassisD + 0.07]} />
        <meshBasicMaterial
          ref={spill}
          map={glowTex}
          transparent
          opacity={0.42}
          depthWrite={false}
          side={2}
          blending={AdditiveBlending}
        />
      </mesh>
      <pointLight position={[0, -0.018, 0]} intensity={0.3} distance={0.44} color="#a78bfa" />
      {/* rubber feet + case screws */}
      {[-chassisW * 0.38, chassisW * 0.38].map((x) =>
        [-chassisD * 0.38, chassisD * 0.38].map((z) => (
          <mesh key={`${x}${z}`} position={[x, -0.01, z]}>
            <cylinderGeometry args={[0.007, 0.008, 0.004, 12]} />
            <meshStandardMaterial color="#24272e" roughness={0.8} />
          </mesh>
        )),
      )}
      {[-chassisW * 0.44, chassisW * 0.44].map((x) =>
        [-chassisD * 0.4, chassisD * 0.4].map((z) => (
          <mesh key={`sc${x}${z}`} position={[x, 0.0088, z]}>
            <cylinderGeometry args={[0.0022, 0.0022, 0.0016, 14]} />
            <meshStandardMaterial color="#8b919d" metalness={0.9} roughness={0.25} />
          </mesh>
        )),
      )}

      {/* under-key light guides (visible through the cap gaps) */}
      <instancedMesh ref={bars} args={[undefined, undefined, layout.unit.length]} material={barMat}>
        <boxGeometry args={[BAR_W, 0.0016, BAR_D]} />
      </instancedMesh>

      {/* PBT keycaps: bevelled, dish-topped */}
      <instancedMesh ref={caps} args={[undefined, undefined, layout.unit.length]} castShadow material={capMat}>
        <primitive object={capGeo} attach="geometry" />
      </instancedMesh>

      {layout.wide.map((key) => (
        <group key={`${key.x}-${key.z}`} position={[key.x, 0.016, key.z]}>
          <mesh castShadow geometry={wideGeos.get(Math.round(key.w * 1000))} material={capMat} />
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
