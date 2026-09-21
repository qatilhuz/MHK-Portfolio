"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import type { MeshStandardMaterial } from "three";
import { hexPadAlbedo } from "./textures";

export function MousePad() {
  const hex = useMemo(() => hexPadAlbedo(), []);
  return (
    <mesh position={[0.33, 0.052, 0.27]} rotation={[-Math.PI / 2, 0, 0.12]} receiveShadow>
      <planeGeometry args={[0.36, 0.28]} />
      <meshStandardMaterial map={hex} roughness={0.9} metalness={0.03} />
    </mesh>
  );
}

export function Mouse({ reduced }: { reduced?: boolean }) {
  const led = useRef<MeshStandardMaterial>(null);

  useFrame((state) => {
    if (!led.current || reduced) return;
    led.current.emissiveIntensity = 0.45 + 0.35 * (0.5 + 0.5 * Math.sin(state.clock.elapsedTime * 1.6));
  });

  return (
    <group position={[0.33, 0.07, 0.26]} rotation={[0.08, -0.35, 0]} scale={1.15}>
      <mesh castShadow position={[0, 0.012, -0.008]} scale={[0.92, 0.62, 1.38]}>
        <sphereGeometry args={[0.032, 24, 18]} />
        <meshStandardMaterial color="#1c1d24" roughness={0.62} metalness={0.08} />
      </mesh>
      <mesh castShadow position={[0.002, 0.018, -0.018]} scale={[0.78, 0.55, 0.7]}>
        <sphereGeometry args={[0.03, 22, 16]} />
        <meshStandardMaterial color="#16171c" roughness={0.58} metalness={0.07} />
      </mesh>
      <mesh position={[0, 0.01, 0.018]} scale={[0.72, 0.38, 0.55]}>
        <sphereGeometry args={[0.028, 18, 14]} />
        <meshStandardMaterial color="#22232b" roughness={0.5} metalness={0.1} />
      </mesh>
      <mesh position={[-0.018, 0.004, -0.004]} scale={[0.35, 0.42, 0.85]} rotation={[0, 0, 0.35]}>
        <sphereGeometry args={[0.028, 16, 12]} />
        <meshStandardMaterial color="#121318" roughness={0.72} metalness={0.04} />
      </mesh>
      <mesh position={[-0.012, 0.016, 0.01]} rotation={[0.15, 0, -0.04]}>
        <boxGeometry args={[0.02, 0.006, 0.032]} />
        <meshStandardMaterial color="#2a2b33" roughness={0.42} />
      </mesh>
      <mesh position={[0.012, 0.016, 0.01]} rotation={[0.15, 0, 0.04]}>
        <boxGeometry args={[0.02, 0.006, 0.032]} />
        <meshStandardMaterial color="#2a2b33" roughness={0.42} />
      </mesh>
      <mesh position={[0, 0.02, 0.008]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.006, 0.006, 0.014, 18]} />
        <meshStandardMaterial color="#4b5563" metalness={0.45} roughness={0.3} />
      </mesh>
      <mesh position={[0, 0.02, 0.008]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.0062, 0.0011, 8, 16]} />
        <meshStandardMaterial color="#6b7280" metalness={0.5} roughness={0.28} />
      </mesh>
      <mesh position={[-0.024, 0.006, 0.0]}>
        <boxGeometry args={[0.006, 0.01, 0.012]} />
        <meshStandardMaterial color="#111827" roughness={0.55} />
      </mesh>
      <mesh position={[-0.024, 0.006, -0.014]}>
        <boxGeometry args={[0.006, 0.01, 0.01]} />
        <meshStandardMaterial color="#111827" roughness={0.55} />
      </mesh>
      <mesh position={[0, -0.008, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.018, 0.0016, 8, 24]} />
        <meshStandardMaterial ref={led} color="#fb7185" emissive="#fb7185" emissiveIntensity={0.7} />
      </mesh>
      {[
        [-0.012, -0.014, 0.016],
        [0.012, -0.014, 0.016],
        [-0.012, -0.014, -0.02],
        [0.012, -0.014, -0.02],
      ].map((p) => (
        <mesh key={p.join(",")} position={p as [number, number, number]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.004, 0.004, 0.0015, 10]} />
          <meshStandardMaterial color="#e5e7eb" roughness={0.35} metalness={0.2} />
        </mesh>
      ))}
    </group>
  );
}
