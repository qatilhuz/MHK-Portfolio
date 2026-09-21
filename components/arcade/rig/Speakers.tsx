"use client";

import { useMemo } from "react";
import { grilleAlbedo, metalAlbedo } from "./textures";

export function Speaker({ position }: { position: [number, number, number] }) {
  const grille = useMemo(() => grilleAlbedo(), []);
  const metal = useMemo(() => metalAlbedo(), []);

  return (
    <group position={position}>
      <mesh castShadow position={[0, 0.01, -0.006]} scale={[1, 1, 0.92]}>
        <boxGeometry args={[0.08, 0.168, 0.092]} />
        <meshStandardMaterial map={metal} color="#17181e" roughness={0.5} metalness={0.22} />
      </mesh>
      <mesh position={[0, 0.034, 0.046]}>
        <circleGeometry args={[0.03, 32]} />
        <meshStandardMaterial map={grille} color="#1b1c22" roughness={0.78} />
      </mesh>
      <mesh position={[0, 0.034, 0.047]}>
        <circleGeometry args={[0.012, 20]} />
        <meshStandardMaterial color="#111827" roughness={0.55} />
      </mesh>
      <mesh position={[0, 0.034, 0.048]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.026, 0.0028, 10, 28]} />
        <meshStandardMaterial color="#a855f7" emissive="#c084fc" emissiveIntensity={0.95} />
      </mesh>
      <mesh position={[0, -0.038, 0.046]}>
        <circleGeometry args={[0.015, 24]} />
        <meshStandardMaterial map={grille} color="#22232a" roughness={0.7} />
      </mesh>
      <mesh position={[0, -0.038, 0.048]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.013, 0.002, 8, 20]} />
        <meshStandardMaterial color="#22d3ee" emissive="#22d3ee" emissiveIntensity={0.7} />
      </mesh>
      <mesh position={[0, -0.09, 0]}>
        <boxGeometry args={[0.086, 0.012, 0.096]} />
        <meshStandardMaterial color="#0b0c10" roughness={0.82} />
      </mesh>
      {[-0.028, 0.028].map((x) => (
        <mesh key={x} position={[x, -0.098, 0.02]}>
          <cylinderGeometry args={[0.006, 0.007, 0.008, 10]} />
          <meshStandardMaterial color="#111827" roughness={0.7} />
        </mesh>
      ))}
    </group>
  );
}
