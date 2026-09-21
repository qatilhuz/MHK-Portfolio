"use client";

import { CoolingFan } from "./CoolingFan";

export function PcCase({ reduced }: { reduced?: boolean }) {
  return (
    <group position={[0.72, 0.29, -0.06]} rotation={[0, -0.18, 0]}>
      <mesh castShadow receiveShadow>
        <boxGeometry args={[0.28, 0.56, 0.46]} />
        <meshStandardMaterial color="#15161c" metalness={0.68} roughness={0.36} />
      </mesh>
      <mesh position={[-0.142, 0.02, 0]}>
        <boxGeometry args={[0.006, 0.5, 0.42]} />
        <meshPhysicalMaterial
          color="#b8dcff"
          metalness={0.04}
          roughness={0.06}
          transmission={0.78}
          thickness={0.03}
          transparent
          opacity={0.42}
          ior={1.45}
        />
      </mesh>
      <group position={[0.142, 0.1, 0.08]} rotation={[0, Math.PI / 2, 0]}>
        <CoolingFan radius={0.058} speed={7.2} reduced={reduced} />
      </group>
      <group position={[0.142, -0.08, 0.08]} rotation={[0, Math.PI / 2, 0]}>
        <CoolingFan radius={0.058} speed={8.4} reduced={reduced} />
      </group>
      <mesh position={[0.145, -0.22, 0.08]}>
        <boxGeometry args={[0.01, 0.05, 0.08]} />
        <meshStandardMaterial color="#050608" emissive="#22d3ee" emissiveIntensity={0.35} />
      </mesh>
      <mesh position={[0.02, 0.06, -0.02]}>
        <boxGeometry args={[0.2, 0.26, 0.3]} />
        <meshStandardMaterial color="#0f2418" roughness={0.72} metalness={0.12} />
      </mesh>
      <mesh position={[0.04, 0.14, 0.04]}>
        <boxGeometry args={[0.012, 0.07, 0.03]} />
        <meshStandardMaterial color="#c9c9d1" metalness={0.45} roughness={0.35} />
      </mesh>
      <mesh position={[0.04, 0.14, 0.08]}>
        <boxGeometry args={[0.012, 0.07, 0.03]} />
        <meshStandardMaterial color="#c9c9d1" metalness={0.45} roughness={0.35} />
      </mesh>
      <group position={[0.0, -0.04, 0.02]}>
        <mesh>
          <boxGeometry args={[0.22, 0.05, 0.28]} />
          <meshStandardMaterial color="#0c0d12" metalness={0.5} roughness={0.4} />
        </mesh>
        <group position={[0.08, 0.03, 0.04]} rotation={[Math.PI / 2, 0, 0]}>
          <CoolingFan radius={0.026} speed={12} reduced={reduced} />
        </group>
      </group>
      <mesh position={[0, -0.22, 0]}>
        <boxGeometry args={[0.26, 0.1, 0.42]} />
        <meshStandardMaterial color="#101114" metalness={0.45} roughness={0.5} />
      </mesh>
      <mesh position={[0.02, 0.29, -0.16]}>
        <cylinderGeometry args={[0.004, 0.004, 0.12, 8]} />
        <meshStandardMaterial color="#1a1b20" />
      </mesh>
      <mesh position={[-0.02, 0.29, -0.16]}>
        <cylinderGeometry args={[0.004, 0.004, 0.12, 8]} />
        <meshStandardMaterial color="#1a1b20" />
      </mesh>
      <pointLight position={[0, 0.05, 0]} intensity={0.7} distance={0.8} color="#c084fc" />
      <pointLight position={[0.1, 0.08, 0.1]} intensity={0.45} distance={0.6} color="#22d3ee" />
    </group>
  );
}
