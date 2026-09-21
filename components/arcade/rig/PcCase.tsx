"use client";

import { useMemo } from "react";
import { CoolingFan } from "./CoolingFan";
import { metalAlbedo } from "./textures";

export function PcCase({ reduced }: { reduced?: boolean }) {
  const metal = useMemo(() => metalAlbedo(), []);
  return (
    <group position={[0.68, 0.3, -0.05]} rotation={[0, -0.16, 0]}>
      <mesh castShadow receiveShadow>
        <boxGeometry args={[0.26, 0.54, 0.44]} />
        <meshStandardMaterial map={metal} color="#16171d" metalness={0.74} roughness={0.32} />
      </mesh>
      {[
        [0.13, 0.26, 0.21],
        [-0.13, 0.26, 0.21],
        [0.13, -0.26, 0.21],
        [-0.13, -0.26, 0.21],
      ].map((p) => (
        <mesh key={p.join(",")} position={p as [number, number, number]}>
          <sphereGeometry args={[0.006, 8, 8]} />
          <meshStandardMaterial color="#3a3b44" metalness={0.8} roughness={0.25} />
        </mesh>
      ))}
      <mesh position={[-0.132, 0.02, 0]}>
        <boxGeometry args={[0.006, 0.48, 0.4]} />
        <meshPhysicalMaterial
          color="#c5e4ff"
          metalness={0.04}
          roughness={0.05}
          transmission={0.8}
          thickness={0.035}
          transparent
          opacity={0.4}
          ior={1.45}
        />
      </mesh>
      <group position={[0.132, 0.1, 0.07]} rotation={[0, Math.PI / 2, 0]}>
        <CoolingFan radius={0.056} speed={7.2} reduced={reduced} />
      </group>
      <group position={[0.132, -0.08, 0.07]} rotation={[0, Math.PI / 2, 0]}>
        <CoolingFan radius={0.056} speed={8.4} reduced={reduced} />
      </group>
      <mesh position={[0.135, -0.22, 0.07]}>
        <boxGeometry args={[0.01, 0.048, 0.075]} />
        <meshStandardMaterial color="#050608" emissive="#22d3ee" emissiveIntensity={0.4} />
      </mesh>
      <mesh position={[0.02, 0.05, -0.02]}>
        <boxGeometry args={[0.18, 0.24, 0.28]} />
        <meshStandardMaterial color="#102418" roughness={0.7} metalness={0.14} />
      </mesh>
      <mesh position={[0.05, 0.12, 0.04]}>
        <boxGeometry args={[0.012, 0.068, 0.028]} />
        <meshStandardMaterial color="#d0d0d8" metalness={0.5} roughness={0.32} />
      </mesh>
      <mesh position={[0.05, 0.12, 0.078]}>
        <boxGeometry args={[0.012, 0.068, 0.028]} />
        <meshStandardMaterial color="#d0d0d8" metalness={0.5} roughness={0.32} />
      </mesh>
      <group position={[0.0, -0.05, 0.02]}>
        <mesh>
          <boxGeometry args={[0.2, 0.048, 0.26]} />
          <meshStandardMaterial map={metal} color="#0c0d12" metalness={0.55} roughness={0.38} />
        </mesh>
        <group position={[0.07, 0.028, 0.03]} rotation={[Math.PI / 2, 0, 0]}>
          <CoolingFan radius={0.024} speed={12} reduced={reduced} />
        </group>
      </group>
      <mesh position={[0, -0.21, 0]}>
        <boxGeometry args={[0.24, 0.1, 0.4]} />
        <meshStandardMaterial map={metal} color="#101114" metalness={0.5} roughness={0.45} />
      </mesh>
      <mesh position={[0.02, 0.28, -0.15]}>
        <cylinderGeometry args={[0.004, 0.004, 0.11, 8]} />
        <meshStandardMaterial color="#1a1b20" />
      </mesh>
      <mesh position={[-0.02, 0.28, -0.15]}>
        <cylinderGeometry args={[0.004, 0.004, 0.11, 8]} />
        <meshStandardMaterial color="#1a1b20" />
      </mesh>
      <pointLight position={[0, 0.04, 0]} intensity={0.75} distance={0.85} color="#c084fc" />
      <pointLight position={[0.1, 0.08, 0.1]} intensity={0.5} distance={0.65} color="#22d3ee" />
    </group>
  );
}
