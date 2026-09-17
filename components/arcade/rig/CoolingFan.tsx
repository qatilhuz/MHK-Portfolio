"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import type { Group } from "three";

export function CoolingFan({
  radius = 0.046,
  speed = 8,
  reduced,
}: {
  radius?: number;
  speed?: number;
  reduced?: boolean;
}) {
  const spin = useRef<Group>(null);

  useFrame((_, delta) => {
    if (reduced || !spin.current) return;
    spin.current.rotation.z += delta * speed;
  });

  const blades = 7;

  return (
    <group>
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[radius, 0.0045, 10, 28]} />
        <meshStandardMaterial
          color="#14151a"
          emissive="#22d3ee"
          emissiveIntensity={0.85}
          roughness={0.35}
          metalness={0.6}
        />
      </mesh>
      <mesh>
        <cylinderGeometry args={[0.012, 0.012, 0.012, 16]} />
        <meshStandardMaterial color="#1c1d24" metalness={0.7} roughness={0.3} />
      </mesh>
      <group ref={spin}>
        {Array.from({ length: blades }, (_, i) => (
          <mesh key={i} rotation={[0.18, 0, (i / blades) * Math.PI * 2]} position={[radius * 0.42, 0, 0]}>
            <boxGeometry args={[radius * 0.72, 0.003, 0.016]} />
            <meshStandardMaterial color="#2a2c34" metalness={0.4} roughness={0.45} />
          </mesh>
        ))}
      </group>
    </group>
  );
}
