"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Color, type MeshStandardMaterial, type PointLight } from "three";
import { SPEAKER_Z } from "@/lib/arcade/layout";

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

const SHELL = { color: "#2c2f38", metalness: 0.28, roughness: 0.42, envMapIntensity: 0.9 };
const LEATHER = { color: "#1c1e24", metalness: 0.06, roughness: 0.72 };

/**
 * Over-ear on RGB tower. z behind the left speaker. Headband rests on the
 * tower crown. Foam offset toward −side so pads face inward.
 */
export function HeadsetStand({ reduced }: { reduced?: boolean }) {
  const strips = useRef<(MeshStandardMaterial | null)[]>([]);
  const glow = useRef<PointLight>(null);
  const color = useMemo(() => new Color(), []);

  useFrame((state) => {
    if (reduced) return;
    rgbAt(state.clock.elapsedTime * 0.11, color);
    const pulse = 0.5 + 0.16 * Math.sin(state.clock.elapsedTime * 0.85);
    for (const mat of strips.current) {
      if (!mat) continue;
      mat.emissive.copy(color);
      mat.color.copy(color);
      mat.emissiveIntensity = pulse;
    }
    if (glow.current) {
      glow.current.color.copy(color);
      glow.current.intensity = 0.1 + 0.03 * Math.sin(state.clock.elapsedTime * 0.85);
    }
  });

  const setStrip = (i: number) => (el: MeshStandardMaterial | null) => {
    strips.current[i] = el;
  };

  return (
    <group position={[-0.76, 0.05, SPEAKER_Z - 0.14]} rotation={[0, 0.12, 0]} scale={1.18}>
      <mesh position={[0, 0.007, 0]} castShadow>
        <cylinderGeometry args={[0.055, 0.068, 0.014, 32]} />
        <meshStandardMaterial {...SHELL} />
      </mesh>
      <mesh position={[0, 0.012, 0.008]}>
        <boxGeometry args={[0.09, 0.008, 0.04]} />
        <meshStandardMaterial color="#32353e" roughness={0.46} metalness={0.2} />
      </mesh>

      <mesh position={[0, 0.118, 0]} castShadow>
        <boxGeometry args={[0.038, 0.2, 0.016]} />
        <meshStandardMaterial {...SHELL} />
      </mesh>
      <mesh position={[0, 0.118, 0]}>
        <boxGeometry args={[0.022, 0.148, 0.02]} />
        <meshStandardMaterial color="#15161c" roughness={0.62} />
      </mesh>
      {[-0.018, 0.018].map((x, i) => (
        <mesh key={x} position={[x, 0.118, 0.001]}>
          <boxGeometry args={[0.0032, 0.17, 0.011]} />
          <meshStandardMaterial
            ref={setStrip(i)}
            color="#22d3ee"
            emissive="#22d3ee"
            emissiveIntensity={0.65}
            roughness={0.26}
          />
        </mesh>
      ))}
      <mesh position={[0, 0.02, 0.018]}>
        <boxGeometry args={[0.036, 0.0035, 0.028]} />
        <meshStandardMaterial
          ref={setStrip(2)}
          color="#a855f7"
          emissive="#a855f7"
          emissiveIntensity={0.5}
          roughness={0.28}
        />
      </mesh>
      <pointLight ref={glow} position={[0, 0.09, 0.05]} distance={0.2} intensity={0.1} color="#22d3ee" />

      <mesh position={[0, 0.152, 0]} castShadow>
        <torusGeometry args={[0.074, 0.007, 16, 40, Math.PI]} />
        <meshStandardMaterial {...SHELL} />
      </mesh>
      <mesh position={[0, 0.156, 0]}>
        <torusGeometry args={[0.07, 0.012, 14, 32, Math.PI * 0.62]} />
        <meshStandardMaterial {...LEATHER} />
      </mesh>
      {([-1, 1] as const).map((side) => (
        <mesh key={`slide-${side}`} position={[0.06 * side, 0.175, 0]}>
          <boxGeometry args={[0.01, 0.036, 0.012]} />
          <meshStandardMaterial color="#4a4e58" metalness={0.35} roughness={0.38} />
        </mesh>
      ))}

      {([-1, 1] as const).map((side) => (
        <group key={side} position={[0.078 * side, 0.148, 0]}>
          <mesh rotation={[0, 0, Math.PI / 2]}>
            <torusGeometry args={[0.028, 0.005, 12, 24, Math.PI * 1.15]} />
            <meshStandardMaterial color="#3a3d46" metalness={0.32} roughness={0.4} />
          </mesh>
          <mesh position={[0.01 * side, 0, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
            <cylinderGeometry args={[0.032, 0.034, 0.02, 28]} />
            <meshStandardMaterial {...SHELL} />
          </mesh>
          <mesh position={[-0.014 * side, 0, 0]} rotation={[0, Math.PI / 2, 0]}>
            <torusGeometry args={[0.026, 0.01, 14, 28]} />
            <meshStandardMaterial {...LEATHER} />
          </mesh>
          <mesh position={[-0.008 * side, 0, 0]} rotation={[0, Math.PI / 2, 0]}>
            <circleGeometry args={[0.017, 22]} />
            <meshStandardMaterial color="#111318" roughness={0.7} />
          </mesh>
        </group>
      ))}

      <group position={[-0.1, 0.12, 0.018]} rotation={[0.4, 0.55, 0.2]}>
        <mesh>
          <cylinderGeometry args={[0.002, 0.002, 0.078, 10]} />
          <meshStandardMaterial color="#4a4e58" metalness={0.45} roughness={0.36} />
        </mesh>
        <mesh position={[0, 0.046, 0]}>
          <sphereGeometry args={[0.0075, 14, 12]} />
          <meshStandardMaterial {...SHELL} />
        </mesh>
      </group>

      <mesh position={[0.038, 0.01, 0.028]} rotation={[1.15, 0.35, 0.15]}>
        <cylinderGeometry args={[0.0018, 0.0018, 0.07, 8]} />
        <meshStandardMaterial color="#111318" roughness={0.72} />
      </mesh>
    </group>
  );
}
