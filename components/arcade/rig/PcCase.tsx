"use client";

import { Suspense, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { RoundedBox, Text } from "@react-three/drei";
import {
  CatmullRomCurve3,
  Color,
  TubeGeometry,
  Vector3,
  type MeshStandardMaterial,
  type PointLight,
} from "three";
import { arcadeBreath, arcadeRgbAt } from "@/lib/arcade/rgb";
import { PC_POS, PC_YAW } from "@/lib/arcade/layout";
import { CoolingFan } from "./CoolingFan";
import { pcBrushedMetal, pcHexMesh, pcPcbMaps } from "./pcTextures";

const ARCADE_TEXT_FONT = "/fonts/ArcadeText-Bold.ttf";

const CASE_W = 0.43;
const CASE_H = 0.6;
const CASE_D = 0.54;
const FRONT_Z = CASE_D / 2;
const SIDE_X = -CASE_W / 2;

function makeCable(pts: [number, number, number][], radius: number) {
  const curve = new CatmullRomCurve3(pts.map((p) => new Vector3(...p)));
  return new TubeGeometry(curve, 42, radius, 10, false);
}

const COOLANT_TUBE_A = makeCable(
  [
    [-0.18, 0.42, -0.09],
    [-0.1, 0.51, -0.14],
    [0.04, 0.52, -0.08],
    [0.12, 0.47, 0.1],
  ],
  0.006,
);
const COOLANT_TUBE_B = makeCable(
  [
    [-0.18, 0.395, -0.075],
    [-0.08, 0.475, -0.02],
    [0.075, 0.475, 0.02],
    [0.145, 0.41, 0.13],
  ],
  0.0055,
);
const GPU_CABLE = makeCable(
  [
    [-0.11, 0.225, 0.05],
    [-0.02, 0.245, 0.09],
    [0.075, 0.205, 0.13],
    [0.13, 0.155, 0.16],
  ],
  0.0044,
);

function FrontFan({
  y,
  phase,
  reduced,
}: {
  y: number;
  phase: number;
  reduced?: boolean;
}) {
  return (
    <group position={[0.112, y, FRONT_Z + 0.015]} rotation={[Math.PI / 2, 0, 0]}>
      <CoolingFan radius={0.057} speed={8.2 + phase * 2} reduced={reduced} phase={phase} depth={0.024} />
    </group>
  );
}

function CableComb({ y }: { y: number }) {
  return (
    <group position={[-0.025, y, 0.158]}>
      {Array.from({ length: 6 }, (_, i) => (
        <mesh key={i} position={[i * 0.011, 0, 0]}>
          <boxGeometry args={[0.006, 0.065, 0.004]} />
          <meshStandardMaterial color={i % 2 ? "#f8fafc" : "#111827"} roughness={0.62} metalness={0.08} />
        </mesh>
      ))}
    </group>
  );
}

export function PcCase({ reduced }: { reduced?: boolean }) {
  const metal = useMemo(() => pcBrushedMetal(), []);
  const hex = useMemo(() => pcHexMesh(), []);
  const pcb = useMemo(() => pcPcbMaps(), []);
  const accentA = useRef<MeshStandardMaterial>(null);
  const accentB = useRef<MeshStandardMaterial>(null);
  const ramA = useRef<MeshStandardMaterial>(null);
  const ramB = useRef<MeshStandardMaterial>(null);
  const pump = useRef<MeshStandardMaterial>(null);
  const sideGlow = useRef<PointLight>(null);
  const frontGlow = useRef<PointLight>(null);
  const colorA = useMemo(() => new Color(), []);
  const colorB = useMemo(() => new Color(), []);

  useFrame((state) => {
    if (reduced) return;
    const t = state.clock.elapsedTime;
    arcadeRgbAt(t * 0.046, colorA, 0.18);
    arcadeRgbAt(t * 0.052, colorB, 0.62);
    const pulseA = arcadeBreath(t * 0.62, 0.12, 0.52, 0.88);
    const pulseB = arcadeBreath(t * 0.7, 0.54, 0.55, 0.95);

    for (const mat of [accentA.current, pump.current]) {
      if (!mat) continue;
      mat.color.copy(colorA);
      mat.emissive.copy(colorA);
      mat.emissiveIntensity = pulseA;
    }
    for (const mat of [accentB.current, ramA.current, ramB.current]) {
      if (!mat) continue;
      mat.color.copy(colorB);
      mat.emissive.copy(colorB);
      mat.emissiveIntensity = pulseB;
    }
    if (sideGlow.current) {
      sideGlow.current.color.copy(colorA);
      sideGlow.current.intensity = 0.75 + 0.18 * pulseA;
    }
    if (frontGlow.current) {
      frontGlow.current.color.copy(colorB);
      frontGlow.current.intensity = 0.62 + 0.18 * pulseB;
    }
  });

  return (
    <group position={PC_POS} rotation={[0, PC_YAW, 0]}>
      {/* Reference-style full tower: black chassis, glass side, glass front fan column. */}
      <RoundedBox args={[CASE_W, CASE_H, CASE_D]} radius={0.018} smoothness={5} position={[0, CASE_H / 2, 0]} castShadow receiveShadow>
        <meshStandardMaterial
          map={metal}
          color="#11141c"
          metalness={0.46}
          roughness={0.42}
          transparent
          opacity={0.08}
          depthWrite={false}
        />
      </RoundedBox>
      <mesh position={[0, 0.022, 0]} castShadow receiveShadow>
        <boxGeometry args={[CASE_W, 0.044, CASE_D]} />
        <meshStandardMaterial map={metal} color="#0b0e15" metalness={0.48} roughness={0.5} />
      </mesh>
      <mesh position={[0, CASE_H - 0.018, 0]} castShadow>
        <boxGeometry args={[CASE_W, 0.036, CASE_D]} />
        <meshStandardMaterial map={metal} color="#131720" metalness={0.52} roughness={0.36} />
      </mesh>
      <mesh position={[CASE_W / 2 - 0.016, CASE_H / 2, 0]} castShadow>
        <boxGeometry args={[0.032, CASE_H, CASE_D]} />
        <meshStandardMaterial map={metal} color="#11141c" metalness={0.5} roughness={0.4} />
      </mesh>
      <mesh position={[0, CASE_H / 2, -CASE_D / 2 + 0.012]}>
        <boxGeometry args={[CASE_W, CASE_H, 0.024]} />
        <meshStandardMaterial map={hex} color="#0a0d14" metalness={0.34} roughness={0.54} />
      </mesh>

      {/* hollow dark interior visible through the panels */}
      <mesh position={[SIDE_X + 0.018, 0.315, 0]}>
        <boxGeometry args={[0.018, 0.52, 0.48]} />
        <meshStandardMaterial color="#060912" roughness={0.72} metalness={0.12} />
      </mesh>
      <mesh position={[0.012, 0.31, FRONT_Z - 0.018]}>
        <boxGeometry args={[0.31, 0.52, 0.022]} />
        <meshStandardMaterial map={hex} color="#080b12" roughness={0.58} metalness={0.28} />
      </mesh>

      {/* side tempered glass: large clear window like the reference. */}
      <mesh position={[SIDE_X - 0.006, 0.315, 0]}>
        <boxGeometry args={[0.008, 0.53, 0.49]} />
        <meshPhysicalMaterial
          color="#dbeafe"
          metalness={0}
          roughness={0.035}
          transmission={0.84}
          thickness={0.045}
          transparent
          opacity={0.23}
          ior={1.5}
          envMapIntensity={1.4}
        />
      </mesh>
      <mesh position={[SIDE_X - 0.011, 0.315, 0]}>
        <boxGeometry args={[0.002, 0.54, 0.5]} />
        <meshStandardMaterial color="#22d3ee" emissive="#22d3ee" emissiveIntensity={0.18} transparent opacity={0.22} roughness={0.2} />
      </mesh>

      {/* front glass and fan column */}
      <mesh position={[0.07, 0.315, FRONT_Z + 0.006]}>
        <boxGeometry args={[0.285, 0.535, 0.009]} />
        <meshPhysicalMaterial
          color="#c7d2fe"
          roughness={0.05}
          metalness={0}
          transmission={0.8}
          thickness={0.04}
          transparent
          opacity={0.22}
          ior={1.48}
        />
      </mesh>
      <mesh position={[0.185, 0.315, FRONT_Z + 0.017]}>
        <boxGeometry args={[0.012, 0.47, 0.006]} />
        <meshStandardMaterial ref={accentA} color="#c084fc" emissive="#c084fc" emissiveIntensity={0.6} roughness={0.25} />
      </mesh>
      <mesh position={[-0.105, 0.315, FRONT_Z + 0.016]}>
        <boxGeometry args={[0.006, 0.43, 0.005]} />
        <meshStandardMaterial ref={accentB} color="#22d3ee" emissive="#22d3ee" emissiveIntensity={0.54} roughness={0.25} />
      </mesh>
      <FrontFan y={0.46} phase={0.04} reduced={reduced} />
      <FrontFan y={0.315} phase={0.22} reduced={reduced} />
      <FrontFan y={0.17} phase={0.4} reduced={reduced} />

      {/* glass/chassis bevels and feet */}
      {[-1, 1].map((side) => (
        <mesh key={`front-rail-${side}`} position={[side * 0.198, 0.315, FRONT_Z + 0.014]}>
          <boxGeometry args={[0.014, 0.56, 0.018]} />
          <meshStandardMaterial map={metal} color="#1b1f2a" metalness={0.62} roughness={0.35} />
        </mesh>
      ))}
      {[-0.15, 0.15].flatMap((x) =>
        [-0.18, 0.18].map((z) => (
          <mesh key={`${x}-${z}`} position={[x, 0.006, z]}>
            <cylinderGeometry args={[0.018, 0.022, 0.012, 18]} />
            <meshStandardMaterial color="#05070c" roughness={0.7} metalness={0.12} />
          </mesh>
        )),
      )}

      {/* visible internal hardware through the side panel */}
      <mesh position={[-0.154, 0.34, -0.04]}>
        <boxGeometry args={[0.012, 0.35, 0.34]} />
        <meshStandardMaterial map={pcb.albedo} roughnessMap={pcb.roughness} color="#0b1d16" roughness={0.55} metalness={0.12} />
      </mesh>
      <mesh position={[-0.165, 0.34, -0.038]}>
        <boxGeometry args={[0.006, 0.305, 0.285]} />
        <meshStandardMaterial color="#101827" roughness={0.64} metalness={0.16} transparent opacity={0.45} />
      </mesh>

      {/* rear exhaust fan and CPU pump on the side view */}
      <group position={[SIDE_X - 0.002, 0.455, -0.17]} rotation={[0, 0, Math.PI / 2]}>
        <CoolingFan radius={0.049} speed={8.7} reduced={reduced} phase={0.75} depth={0.02} />
      </group>
      <mesh position={[SIDE_X - 0.004, 0.38, -0.055]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.039, 0.043, 0.018, 36]} />
        <meshStandardMaterial color="#1a1f2b" metalness={0.5} roughness={0.34} />
      </mesh>
      <mesh position={[SIDE_X - 0.016, 0.38, -0.055]} rotation={[0, 0, Math.PI / 2]}>
        <torusGeometry args={[0.032, 0.0022, 12, 48]} />
        <meshStandardMaterial ref={pump} color="#c084fc" emissive="#c084fc" emissiveIntensity={0.7} roughness={0.22} />
      </mesh>

      {/* RAM light bars */}
      {[-0.02, 0.012].map((z, index) => (
        <group key={z} position={[-0.172, 0.382, z + 0.06]}>
          <mesh>
            <boxGeometry args={[0.008, 0.125, 0.022]} />
            <meshStandardMaterial color="#d8dee9" metalness={0.52} roughness={0.3} />
          </mesh>
          <mesh position={[-0.006, 0.002, 0]}>
            <boxGeometry args={[0.004, 0.112, 0.018]} />
            <meshStandardMaterial
              ref={index === 0 ? ramA : ramB}
              color={index === 0 ? "#22d3ee" : "#c084fc"}
              emissive={index === 0 ? "#22d3ee" : "#c084fc"}
              emissiveIntensity={0.76}
              roughness={0.22}
            />
          </mesh>
        </group>
      ))}

      {/* horizontal GPU and PSU shroud, matching the lower dark block in the reference. */}
      <mesh position={[-0.166, 0.205, 0.045]} castShadow>
        <boxGeometry args={[0.035, 0.062, 0.305]} />
        <meshStandardMaterial map={metal} color="#202633" metalness={0.48} roughness={0.36} />
      </mesh>
      <mesh position={[SIDE_X - 0.019, 0.226, 0.045]}>
        <boxGeometry args={[0.004, 0.006, 0.255]} />
        <meshStandardMaterial ref={accentB} color="#22d3ee" emissive="#22d3ee" emissiveIntensity={0.45} roughness={0.24} />
      </mesh>
      <mesh position={[-0.164, 0.102, 0.02]}>
        <boxGeometry args={[0.04, 0.09, 0.43]} />
        <meshStandardMaterial map={metal} color="#111827" metalness={0.42} roughness={0.48} />
      </mesh>
      <Suspense fallback={null}>
        <Text
          font={ARCADE_TEXT_FONT}
          position={[SIDE_X - 0.024, 0.115, 0.095]}
          rotation={[0, -Math.PI / 2, 0]}
          fontSize={0.034}
          letterSpacing={0.05}
          anchorX="center"
          anchorY="middle"
          color="#8b5cf6"
        >
          Arcade
        </Text>
        <Text
          font={ARCADE_TEXT_FONT}
          position={[0.118, 0.065, FRONT_Z + 0.026]}
          fontSize={0.032}
          letterSpacing={0.07}
          anchorX="center"
          anchorY="middle"
          color="#22d3ee"
        >
          Arcade
        </Text>
      </Suspense>

      <CableComb y={0.275} />
      <mesh geometry={COOLANT_TUBE_A}>
        <meshStandardMaterial color="#151923" roughness={0.72} metalness={0.1} />
      </mesh>
      <mesh geometry={COOLANT_TUBE_B}>
        <meshStandardMaterial color="#242935" roughness={0.7} metalness={0.08} />
      </mesh>
      <mesh geometry={GPU_CABLE}>
        <meshStandardMaterial color="#f4f4f5" roughness={0.68} metalness={0.05} />
      </mesh>

      {/* bottom and top RGB edge glows */}
      <mesh position={[0, 0.036, FRONT_Z + 0.02]}>
        <boxGeometry args={[0.33, 0.006, 0.004]} />
        <meshStandardMaterial ref={accentA} color="#c084fc" emissive="#c084fc" emissiveIntensity={0.5} roughness={0.24} />
      </mesh>
      <mesh position={[-0.02, CASE_H - 0.026, FRONT_Z + 0.018]}>
        <boxGeometry args={[0.31, 0.004, 0.004]} />
        <meshStandardMaterial ref={accentB} color="#22d3ee" emissive="#22d3ee" emissiveIntensity={0.42} roughness={0.24} />
      </mesh>

      <pointLight ref={sideGlow} position={[SIDE_X - 0.08, 0.32, 0.02]} intensity={0.9} distance={0.74} color="#c084fc" />
      <pointLight ref={frontGlow} position={[0.15, 0.34, FRONT_Z + 0.12]} intensity={0.74} distance={0.65} color="#22d3ee" />
      <pointLight position={[-0.12, 0.48, -0.12]} intensity={0.32} distance={0.42} color="#8b5cf6" />
    </group>
  );
}
