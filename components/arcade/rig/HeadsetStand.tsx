"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { RoundedBox } from "@react-three/drei";
import {
  Color,
  CatmullRomCurve3,
  LatheGeometry,
  MeshStandardMaterial,
  TubeGeometry,
  Vector2,
  Vector3,
  type PointLight,
} from "three";
import { SPEAKER_Z } from "@/lib/arcade/layout";
import { brushedMetalMaps, driverGrilleAlbedo, leatherMaps } from "./textures";

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

/* ---------- geometry helpers ---------- */

/** Closed lathed disc — smooth, bevelled ear-cup shell (axis +Y = outward). */
function cupShellGeometry() {
  const pts = [
    new Vector2(0.0004, -0.0095),
    new Vector2(0.03, -0.009),
    new Vector2(0.043, -0.0075),
    new Vector2(0.0478, -0.0035),
    new Vector2(0.0496, 0.0035),
    new Vector2(0.0494, 0.0105),
    new Vector2(0.0472, 0.0185),
    new Vector2(0.041, 0.0255),
    new Vector2(0.03, 0.0305),
    new Vector2(0.014, 0.033),
    new Vector2(0.0004, 0.0335),
  ];
  const g = new LatheGeometry(pts, 72);
  g.computeVertexNormals();
  return g;
}

/** Weighted chamfered base disc (axis +Y). */
function standBaseGeometry() {
  const pts = [
    new Vector2(0.0004, 0.0),
    new Vector2(0.06, 0.0),
    new Vector2(0.0655, 0.0025),
    new Vector2(0.066, 0.0085),
    new Vector2(0.0645, 0.0145),
    new Vector2(0.056, 0.019),
    new Vector2(0.03, 0.0205),
    new Vector2(0.0004, 0.0205),
  ];
  const g = new LatheGeometry(pts, 72);
  g.computeVertexNormals();
  return g;
}

/** Braided cable from the left cup down across the base. */
function headsetCableGeometry() {
  const curve = new CatmullRomCurve3([
    new Vector3(-0.078, 0.05, 0.012),
    new Vector3(-0.07, 0.028, 0.035),
    new Vector3(-0.045, 0.012, 0.052),
    new Vector3(-0.008, 0.008, 0.05),
    new Vector3(0.03, 0.007, 0.038),
    new Vector3(0.058, 0.006, 0.012),
  ]);
  return new TubeGeometry(curve, 40, 0.0026, 10, false);
}

/** Shared PBR map bundle for the headset + stand. */
function useRigPbr() {
  return useMemo(() => {
    const leather = leatherMaps();
    const brushed = brushedMetalMaps();
    const grille = driverGrilleAlbedo();
    return { leather, brushed, grille };
  }, []);
}

/**
 * FLAGSHIP GAMING HEADSET on weighted stand.
 * - Suspension headband: brushed-steel outer arc + leather comfort strap
 * - Machined slider blocks with fork yokes into cup pivots
 * - Lathe-bevelled ear cups, memory-foam leather cushions (normal-mapped)
 * - Perforated driver grille, RGB rim channels, side logo puck
 */
export function HeadsetStand({ reduced }: { reduced?: boolean }) {
  const pbr = useRigPbr();
  const rgbRingL = useRef<MeshStandardMaterial>(null);
  const rgbRingR = useRef<MeshStandardMaterial>(null);
  const rgbLed = useRef<MeshStandardMaterial>(null);
  const glow = useRef<PointLight>(null);
  const color = useMemo(() => new Color(), []);

  useFrame((state) => {
    if (reduced) return;
    const t = state.clock.elapsedTime;
    rgbAt(t * 0.1, color);
    const pulse = 0.55 + 0.18 * Math.sin(t * 0.85);
    for (const mat of [rgbRingL.current, rgbRingR.current, rgbLed.current]) {
      if (!mat) continue;
      mat.emissive.copy(color);
      mat.color.copy(color);
      mat.emissiveIntensity = pulse;
    }
    if (glow.current) {
      glow.current.color.copy(color);
      glow.current.intensity = 0.12 + 0.04 * Math.sin(t * 0.85);
    }
  });

  const steel = useMemo(
    () =>
      new MeshStandardMaterial({
        map: pbr.brushed.albedo,
        roughnessMap: pbr.brushed.roughness,
        color: "#cfd4dd",
        metalness: 0.92,
        roughness: 0.42,
        envMapIntensity: 1.1,
      }),
    [pbr],
  );
  const darkMetal = useMemo(
    () =>
      new MeshStandardMaterial({
        map: pbr.brushed.albedo,
        color: "#7e8593",
        metalness: 0.85,
        roughness: 0.5,
      }),
    [pbr],
  );
  const leather = useMemo(
    () =>
      new MeshStandardMaterial({
        map: pbr.leather.albedo,
        normalMap: pbr.leather.normal,
        normalScale: new Vector2(1.15, 1.15),
        roughnessMap: pbr.leather.roughness,
        color: "#eef1f6",
        metalness: 0.04,
        roughness: 0.78,
      }),
    [pbr],
  );
  const cupShellMat = useMemo(
    () =>
      new MeshStandardMaterial({
        map: pbr.brushed.albedo,
        color: "#464b57",
        metalness: 0.4,
        roughness: 0.42,
      }),
    [pbr],
  );

  const cupShell = useMemo(() => cupShellGeometry(), []);
  const baseGeo = useMemo(() => standBaseGeometry(), []);
  const cableGeo = useMemo(() => headsetCableGeometry(), []);

  const BAND_R = 0.088;
  const CROWN_Y = 0.2225; // top of saddle, where band outer surface rests
  const BAND_Y = CROWN_Y - 0.007 - BAND_R; // band centreline height
  const CUP_Y = BAND_Y - 0.057; // cups hang below band ends
  const CUP_X = 0.0805;

  return (
    <group position={[-0.76, 0.05, SPEAKER_Z - 0.14]} rotation={[0, 0.14, 0]}>
      {/* ---------- weighted base ---------- */}
      <mesh geometry={baseGeo} castShadow receiveShadow material={steel} />
      <mesh position={[0, -0.0022, 0]}>
        <cylinderGeometry args={[0.062, 0.062, 0.0045, 48]} />
        <meshStandardMaterial color="#1e2128" roughness={0.92} metalness={0.05} />
      </mesh>
      <mesh position={[0, 0.0205, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.03, 0.0016, 10, 56]} />
        <meshStandardMaterial {...{ color: "#5b616e", metalness: 0.8, roughness: 0.35 }} />
      </mesh>
      {/* machined collar on base */}
      <mesh position={[0, 0.024, 0]}>
        <cylinderGeometry args={[0.0235, 0.027, 0.011, 40]} />
        <meshStandardMaterial map={pbr.brushed.albedo} color="#9aa1ad" metalness={0.9} roughness={0.36} />
      </mesh>

      {/* ---------- mast ---------- */}
      <mesh position={[0, 0.1085, 0]} castShadow>
        <cylinderGeometry args={[0.012, 0.014, 0.179, 40]} />
        <meshStandardMaterial map={pbr.brushed.albedo} color="#787f8c" metalness={0.88} roughness={0.46} />
      </mesh>
      {/* machined groove rings */}
      {[0.09, 0.14].map((y) => (
        <mesh key={y} position={[0, y, 0]}>
          <cylinderGeometry args={[0.0138, 0.0138, 0.004, 40]} />
          <meshStandardMaterial color="#2b2e36" metalness={0.7} roughness={0.42} />
        </mesh>
      ))}
      {/* matte sleeve for mixed-material read */}
      <mesh position={[0, 0.06, 0]}>
        <cylinderGeometry args={[0.0152, 0.0158, 0.045, 40]} />
        <meshStandardMaterial color="#31353d" metalness={0.25} roughness={0.6} />
      </mesh>
      {/* cable hook */}
      <mesh position={[0.019, 0.058, 0]} rotation={[0, 0, -0.35]}>
        <boxGeometry args={[0.014, 0.006, 0.01]} />
        <meshStandardMaterial color="#3a3f49" metalness={0.6} roughness={0.4} />
      </mesh>
      {/* brand LED slot on mast */}
      <mesh position={[0, 0.155, 0.0124]}>
        <boxGeometry args={[0.004, 0.026, 0.0016]} />
        <meshStandardMaterial
          ref={rgbLed}
          color="#22d3ee"
          emissive="#22d3ee"
          emissiveIntensity={0.55}
          roughness={0.25}
        />
      </mesh>

      {/* ---------- saddle crown (headband rests here) ---------- */}
      <mesh position={[0, 0.196, 0]} castShadow>
        <cylinderGeometry args={[0.0135, 0.0155, 0.01, 32]} />
        <meshStandardMaterial map={pbr.brushed.albedo} color="#8f96a3" metalness={0.88} roughness={0.4} />
      </mesh>
      <mesh position={[0, 0.2035, 0]}>
        <boxGeometry args={[0.026, 0.006, 0.017]} />
        <meshStandardMaterial color="#2c2f37" metalness={0.4} roughness={0.5} />
      </mesh>
      {/* leather-padded rest the band presses onto */}
      <RoundedBox args={[0.028, 0.005, 0.0155]} radius={0.0022} smoothness={4} position={[0, 0.2061, 0]}>
        <meshStandardMaterial
          map={pbr.leather.albedo}
          normalMap={pbr.leather.normal}
          color="#eef1f6"
          roughness={0.8}
          metalness={0.04}
        />
      </RoundedBox>

      <pointLight ref={glow} position={[0, 0.13, 0.06]} distance={0.24} intensity={0.12} color="#22d3ee" />

      {/* ---------- headband: brushed-steel arc ---------- */}
      <mesh position={[0, BAND_Y, 0]} castShadow material={steel}>
        <torusGeometry args={[BAND_R, 0.0068, 18, 72, Math.PI]} />
      </mesh>
      {/* leather suspension strap under the arc */}
      <mesh position={[0, BAND_Y, 0]} rotation={[0, 0, 0.1 * Math.PI]} material={leather}>
        <torusGeometry args={[BAND_R - 0.0105, 0.005, 14, 56, Math.PI * 0.8]} />
      </mesh>
      {/* band end caps */}
      {([-1, 1] as const).map((side) => (
        <mesh key={`cap-${side}`} position={[side * BAND_R, BAND_Y, 0]} rotation={[0, 0, Math.PI / 2]} material={darkMetal}>
          <cylinderGeometry args={[0.0085, 0.0085, 0.014, 24]} />
        </mesh>
      ))}

      {/* ---------- per-cup assembly ---------- */}
      {([-1, 1] as const).map((side) => (
        <group key={side}>
          {/* machined slider block with adjustment notches */}
          <RoundedBox
            args={[0.013, 0.03, 0.019]}
            radius={0.0035}
            smoothness={4}
            position={[side * (BAND_R + 0.001), BAND_Y - 0.012, 0]}
            castShadow
          >
            <meshStandardMaterial map={pbr.brushed.albedo} color="#9ba2af" metalness={0.9} roughness={0.38} />
          </RoundedBox>
          {[0, 1, 2].map((i) => (
            <mesh key={i} position={[side * (BAND_R + 0.0075), BAND_Y - 0.006 - i * 0.008, 0]}>
              <boxGeometry args={[0.0016, 0.0035, 0.012]} />
              <meshStandardMaterial color="#23262d" metalness={0.6} roughness={0.45} />
            </mesh>
          ))}

          {/* fork yoke from slider down over the cup */}
          <mesh
            position={[side * (BAND_R + 0.001), BAND_Y - 0.038, 0]}
            rotation={[0, 0, side * -0.16]}
            material={steel}
            castShadow
          >
            <boxGeometry args={[0.0075, 0.038, 0.013]} />
          </mesh>
          {/* pivot barrel into cup crown */}
          <mesh
            position={[side * (BAND_R - 0.004), BAND_Y - 0.056, 0]}
            rotation={[Math.PI / 2, 0, 0]}
            material={darkMetal}
          >
            <cylinderGeometry args={[0.0058, 0.0058, 0.02, 24]} />
          </mesh>

          {/* ear cup — lathe-bevelled shell, outer face +Y rotated to ±X */}
          <group position={[side * CUP_X, CUP_Y, 0]} rotation={[0, 0, side === 1 ? -Math.PI / 2 : Math.PI / 2]} scale={1.06}>
            <mesh geometry={cupShell} castShadow material={cupShellMat} />
            {/* RGB rim channel on outer face */}
            <mesh position={[0, 0.0245, 0]} rotation={[Math.PI / 2, 0, 0]}>
              <torusGeometry args={[0.0415, 0.0018, 12, 72]} />
              <meshStandardMaterial
                ref={side === 1 ? rgbRingR : rgbRingL}
                color="#22d3ee"
                emissive="#22d3ee"
                emissiveIntensity={0.75}
                roughness={0.25}
                metalness={0.1}
              />
            </mesh>
            {/* brushed logo puck */}
            <mesh position={[0, 0.0315, 0]}>
              <cylinderGeometry args={[0.016, 0.017, 0.004, 40]} />
              <meshStandardMaterial map={pbr.brushed.albedo} color="#767d8b" metalness={0.9} roughness={0.32} />
            </mesh>
            <mesh position={[0, 0.034, 0]}>
              <cylinderGeometry args={[0.006, 0.006, 0.0022, 24]} />
              <meshStandardMaterial color="#22d3ee" emissive="#22d3ee" emissiveIntensity={0.4} roughness={0.3} />
            </mesh>

            {/* memory-foam leather cushion (inner face) */}
            <mesh position={[0, -0.0155, 0]} rotation={[Math.PI / 2, 0, 0]} scale={[1, 1, 1.2]} castShadow>
              <torusGeometry args={[0.0335, 0.0155, 24, 64]} />
              <meshPhysicalMaterial
                map={pbr.leather.albedo}
                normalMap={pbr.leather.normal}
                roughnessMap={pbr.leather.roughness}
                color="#f0f3f8"
                metalness={0.03}
                roughness={0.72}
                sheen={0.25}
                sheenRoughness={0.6}
                sheenColor="#9aa1ad"
              />
            </mesh>
            {/* cushion seam stitch ring */}
            <mesh position={[0, -0.019, 0]} rotation={[Math.PI / 2, 0, 0]}>
              <torusGeometry args={[0.0335, 0.0012, 8, 72]} />
              <meshStandardMaterial color="#171a20" roughness={0.85} metalness={0.02} />
            </mesh>

            {/* inner baffle + perforated driver grille */}
            <mesh position={[0, -0.026, 0]} rotation={[-Math.PI / 2, 0, 0]}>
              <circleGeometry args={[0.031, 48]} />
              <meshStandardMaterial map={pbr.grille} color="#9aa2b0" metalness={0.7} roughness={0.5} />
            </mesh>
            <mesh position={[0, -0.0275, 0]}>
              <sphereGeometry args={[0.011, 24, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
              <meshStandardMaterial color="#31353d" metalness={0.5} roughness={0.4} />
            </mesh>
            {/* cup rim ring joining cushion to shell */}
            <mesh position={[0, -0.008, 0]} rotation={[Math.PI / 2, 0, 0]}>
              <torusGeometry args={[0.047, 0.003, 10, 64]} />
              <meshStandardMaterial color="#262a31" metalness={0.4} roughness={0.5} />
            </mesh>
          </group>
        </group>
      ))}

      {/* braided cable resting toward the desk */}
      <mesh geometry={cableGeo} castShadow>
        <meshStandardMaterial color="#22252c" roughness={0.78} metalness={0.06} />
      </mesh>
    </group>
  );
}
