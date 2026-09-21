"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import type { MeshStandardMaterial } from "three";

export function MousePad() {
  return (
    <mesh position={[0.38, 0.034, 0.3]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
      <planeGeometry args={[0.28, 0.22]} />
      <meshStandardMaterial color="#0b0c12" roughness={0.85} metalness={0.05} />
    </mesh>
  );
}

export function Mouse({ reduced }: { reduced?: boolean }) {
  const led = useRef<MeshStandardMaterial>(null);

  useFrame((state) => {
    if (!led.current || reduced) return;
    led.current.emissiveIntensity = 0.55 + 0.45 * (0.5 + 0.5 * Math.sin(state.clock.elapsedTime * 2.2));
  });

  return (
    <group position={[0.38, 0.052, 0.3]} rotation={[0.1, -0.4, 0]}>
      <mesh castShadow>
        <capsuleGeometry args={[0.017, 0.05, 6, 14]} />
        <meshStandardMaterial color="#1a0f14" roughness={0.5} metalness={0.18} />
      </mesh>
      <mesh position={[-0.008, 0.01, 0.01]}>
        <boxGeometry args={[0.015, 0.005, 0.026]} />
        <meshStandardMaterial color="#221218" roughness={0.4} />
      </mesh>
      <mesh position={[0.008, 0.01, 0.01]}>
        <boxGeometry args={[0.015, 0.005, 0.026]} />
        <meshStandardMaterial color="#221218" roughness={0.4} />
      </mesh>
      <mesh position={[0, 0.013, 0.008]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.0045, 0.0045, 0.011, 12]} />
        <meshStandardMaterial color="#2a2b32" metalness={0.5} roughness={0.3} />
      </mesh>
      <mesh position={[0, -0.015, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.015, 0.0015, 8, 20]} />
        <meshStandardMaterial ref={led} color="#ef4444" emissive="#ef4444" emissiveIntensity={0.8} />
      </mesh>
    </group>
  );
}
