"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import type { MeshStandardMaterial } from "three";

export function Mouse({ reduced }: { reduced?: boolean }) {
  const led = useRef<MeshStandardMaterial>(null);

  useFrame((state) => {
    if (!led.current || reduced) return;
    const t = (Math.sin(state.clock.elapsedTime * 2) + 1) / 2;
    led.current.emissiveIntensity = 0.5 + t * 0.8;
  });

  return (
    <group position={[0.48, 0.028, 0.22]} rotation={[0.08, -0.35, 0]}>
      <mesh castShadow>
        <capsuleGeometry args={[0.018, 0.052, 6, 14]} />
        <meshStandardMaterial color="#14151b" roughness={0.55} metalness={0.2} />
      </mesh>
      <mesh position={[-0.008, 0.01, 0.012]} castShadow>
        <boxGeometry args={[0.016, 0.006, 0.028]} />
        <meshStandardMaterial color="#1a1b22" roughness={0.45} />
      </mesh>
      <mesh position={[0.008, 0.01, 0.012]} castShadow>
        <boxGeometry args={[0.016, 0.006, 0.028]} />
        <meshStandardMaterial color="#1a1b22" roughness={0.45} />
      </mesh>
      <mesh position={[0, 0.014, 0.01]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.005, 0.005, 0.012, 12]} />
        <meshStandardMaterial color="#2a2b32" metalness={0.5} roughness={0.35} />
      </mesh>
      <mesh position={[-0.018, 0, 0]}>
        <boxGeometry args={[0.004, 0.01, 0.012]} />
        <meshStandardMaterial color="#1f2028" />
      </mesh>
      <mesh position={[0, -0.016, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.016, 0.0016, 8, 24]} />
        <meshStandardMaterial
          ref={led}
          color="#22d3ee"
          emissive="#22d3ee"
          emissiveIntensity={0.9}
        />
      </mesh>
    </group>
  );
}
