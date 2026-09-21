"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import type { MeshStandardMaterial } from "three";
import { hexPadAlbedo } from "./textures";

export function MousePad() {
  const hex = useMemo(() => hexPadAlbedo(), []);
  return (
    <mesh position={[0.34, 0.052, 0.28]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
      <planeGeometry args={[0.34, 0.26]} />
      <meshStandardMaterial map={hex} roughness={0.9} metalness={0.03} />
    </mesh>
  );
}

export function Mouse({ reduced }: { reduced?: boolean }) {
  const led = useRef<MeshStandardMaterial>(null);

  useFrame((state) => {
    if (!led.current || reduced) return;
    led.current.emissiveIntensity = 0.65 + 0.45 * (0.5 + 0.5 * Math.sin(state.clock.elapsedTime * 2));
  });

  return (
    <group position={[0.34, 0.078, 0.27]} rotation={[0.16, -0.42, 0.04]} scale={1.9}>
      <mesh castShadow>
        <sphereGeometry args={[0.028, 20, 16, 0, Math.PI * 2, 0, Math.PI * 0.62]} />
        <meshStandardMaterial color="#1a1218" roughness={0.52} metalness={0.12} />
      </mesh>
      <mesh position={[0, 0.004, 0.01]} scale={[1.05, 0.55, 1.35]} castShadow>
        <sphereGeometry args={[0.022, 18, 14]} />
        <meshStandardMaterial color="#24141c" roughness={0.48} metalness={0.1} />
      </mesh>
      <mesh position={[-0.011, 0.012, 0.012]}>
        <boxGeometry args={[0.018, 0.005, 0.028]} />
        <meshStandardMaterial color="#2c1820" roughness={0.36} />
      </mesh>
      <mesh position={[0.011, 0.012, 0.012]}>
        <boxGeometry args={[0.018, 0.005, 0.028]} />
        <meshStandardMaterial color="#2c1820" roughness={0.36} />
      </mesh>
      <mesh position={[0, 0.016, 0.01]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.006, 0.006, 0.016, 16]} />
        <meshStandardMaterial color="#3f414c" metalness={0.58} roughness={0.26} />
      </mesh>
      {[-0.022, -0.022].map((x, i) => (
        <mesh key={i} position={[x, 0.002, 0.002 - i * 0.012]}>
          <boxGeometry args={[0.005, 0.01, 0.01]} />
          <meshStandardMaterial color="#1a1b22" roughness={0.6} />
        </mesh>
      ))}
      <mesh position={[0, -0.012, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.02, 0.002, 8, 24]} />
        <meshStandardMaterial ref={led} color="#fb7185" emissive="#fb7185" emissiveIntensity={0.95} />
      </mesh>
    </group>
  );
}
