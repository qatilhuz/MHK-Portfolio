"use client";

import { useMemo } from "react";
import { grilleAlbedo, metalAlbedo } from "./textures";

export function Speaker({ position }: { position: [number, number, number] }) {
  const grille = useMemo(() => grilleAlbedo(), []);
  const metal = useMemo(() => metalAlbedo(), []);

  return (
    <group position={position}>
      <mesh castShadow>
        <boxGeometry args={[0.072, 0.16, 0.086]} />
        <meshStandardMaterial map={metal} color="#16171d" roughness={0.46} metalness={0.28} />
      </mesh>
      <mesh position={[0, 0.028, 0.044]}>
        <circleGeometry args={[0.028, 28]} />
        <meshStandardMaterial map={grille} color="#1c1d24" roughness={0.72} />
      </mesh>
      <mesh position={[0, 0.028, 0.046]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.024, 0.003, 10, 24]} />
        <meshStandardMaterial color="#a855f7" emissive="#c084fc" emissiveIntensity={1.05} />
      </mesh>
      <mesh position={[0, -0.042, 0.044]}>
        <circleGeometry args={[0.014, 20]} />
        <meshStandardMaterial map={grille} color="#22232b" roughness={0.65} />
      </mesh>
      <mesh position={[0, -0.042, 0.046]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.012, 0.0022, 8, 18]} />
        <meshStandardMaterial color="#22d3ee" emissive="#22d3ee" emissiveIntensity={0.85} />
      </mesh>
      <mesh position={[0, -0.086, 0]}>
        <boxGeometry args={[0.078, 0.01, 0.09]} />
        <meshStandardMaterial color="#0f1015" roughness={0.7} />
      </mesh>
    </group>
  );
}
