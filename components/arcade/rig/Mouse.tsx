"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import type { MeshStandardMaterial } from "three";
import { hexPadAlbedo } from "./textures";

export function MousePad() {
  const hex = useMemo(() => hexPadAlbedo(), []);
  return (
    <mesh position={[0.36, 0.037, 0.29]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
      <planeGeometry args={[0.32, 0.24]} />
      <meshStandardMaterial map={hex} roughness={0.88} metalness={0.04} />
    </mesh>
  );
}

export function Mouse({ reduced }: { reduced?: boolean }) {
  const led = useRef<MeshStandardMaterial>(null);

  useFrame((state) => {
    if (!led.current || reduced) return;
    led.current.emissiveIntensity = 0.6 + 0.5 * (0.5 + 0.5 * Math.sin(state.clock.elapsedTime * 2.1));
  });

  return (
    <group position={[0.36, 0.062, 0.29]} rotation={[0.12, -0.38, 0]} scale={1.72}>
      <mesh castShadow>
        <capsuleGeometry args={[0.02, 0.058, 7, 16]} />
        <meshStandardMaterial color="#1c1016" roughness={0.48} metalness={0.16} />
      </mesh>
      <mesh position={[-0.01, 0.012, 0.012]} castShadow>
        <boxGeometry args={[0.018, 0.006, 0.03]} />
        <meshStandardMaterial color="#2a141c" roughness={0.38} />
      </mesh>
      <mesh position={[0.01, 0.012, 0.012]} castShadow>
        <boxGeometry args={[0.018, 0.006, 0.03]} />
        <meshStandardMaterial color="#2a141c" roughness={0.38} />
      </mesh>
      <mesh position={[0, 0.016, 0.01]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.0055, 0.0055, 0.014, 14]} />
        <meshStandardMaterial color="#3a3b44" metalness={0.55} roughness={0.28} />
      </mesh>
      <mesh position={[-0.02, 0.002, 0.004]}>
        <boxGeometry args={[0.005, 0.012, 0.014]} />
        <meshStandardMaterial color="#1a1b22" roughness={0.55} />
      </mesh>
      <mesh position={[0, -0.018, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.018, 0.0018, 8, 22]} />
        <meshStandardMaterial ref={led} color="#ef4444" emissive="#f43f5e" emissiveIntensity={0.9} />
      </mesh>
    </group>
  );
}
