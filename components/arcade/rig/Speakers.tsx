"use client";

import { useMemo } from "react";
import { grilleAlbedo, metalAlbedo } from "./textures";

export function Speaker({ position }: { position: [number, number, number] }) {
  const grille = useMemo(() => grilleAlbedo(), []);
  const metal = useMemo(() => metalAlbedo(), []);

  return (
    <group position={position}>
      <mesh castShadow>
        <boxGeometry args={[0.088, 0.175, 0.1]} />
        <meshStandardMaterial map={metal} color="#18191f" roughness={0.52} metalness={0.18} />
      </mesh>
      <mesh position={[0, 0.004, 0.042]}>
        <boxGeometry args={[0.076, 0.15, 0.018]} />
        <meshStandardMaterial color="#101114" roughness={0.7} metalness={0.08} />
      </mesh>
      <mesh position={[0, 0.028, 0.052]}>
        <circleGeometry args={[0.028, 32]} />
        <meshStandardMaterial map={grille} color="#1c1d24" roughness={0.82} />
      </mesh>
      <mesh position={[0, 0.028, 0.054]} rotation={[Math.PI / 2, 0, 0]}>
        <coneGeometry args={[0.016, 0.01, 24]} />
        <meshStandardMaterial color="#111827" roughness={0.55} />
      </mesh>
      <mesh position={[0, 0.028, 0.053]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.026, 0.0024, 10, 28]} />
        <meshStandardMaterial color="#374151" metalness={0.4} roughness={0.35} />
      </mesh>
      <mesh position={[0, -0.042, 0.052]}>
        <circleGeometry args={[0.013, 24]} />
        <meshStandardMaterial map={grille} color="#25262e" roughness={0.75} />
      </mesh>
      <mesh position={[0, -0.042, 0.054]} rotation={[Math.PI / 2, 0, 0]}>
        <coneGeometry args={[0.007, 0.007, 16]} />
        <meshStandardMaterial color="#0f172a" roughness={0.5} />
      </mesh>
      <mesh position={[0, 0.078, 0.051]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.03, 0.0018, 8, 24]} />
        <meshStandardMaterial color="#a855f7" emissive="#c084fc" emissiveIntensity={0.7} />
      </mesh>
      <mesh position={[0, -0.094, 0]}>
        <boxGeometry args={[0.094, 0.012, 0.104]} />
        <meshStandardMaterial color="#0b0c10" roughness={0.85} />
      </mesh>
      {[-0.03, 0.03].map((x) =>
        [-0.03, 0.03].map((z) => (
          <mesh key={`${x}${z}`} position={[x, -0.102, z]}>
            <cylinderGeometry args={[0.006, 0.007, 0.008, 10]} />
            <meshStandardMaterial color="#111827" roughness={0.75} />
          </mesh>
        )),
      )}
    </group>
  );
}
