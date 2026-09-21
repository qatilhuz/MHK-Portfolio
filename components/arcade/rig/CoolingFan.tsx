"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import type { Group } from "three";

export function CoolingFan({
  radius = 0.046,
  speed = 8,
  reduced,
  rgb = "#22d3ee",
}: {
  radius?: number;
  speed?: number;
  reduced?: boolean;
  rgb?: string;
}) {
  const spin = useRef<Group>(null);

  useFrame((_, delta) => {
    if (reduced || !spin.current) return;
    spin.current.rotation.z += delta * speed;
  });

  const blades = 9;
  const housing = radius + 0.007;

  return (
    <group>
      <mesh>
        <cylinderGeometry args={[housing, housing, 0.016, 28, 1, true]} />
        <meshStandardMaterial color="#1a1b22" metalness={0.55} roughness={0.4} />
      </mesh>
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[radius * 0.92, 0.0038, 12, 32]} />
        <meshStandardMaterial color={rgb} emissive={rgb} emissiveIntensity={1.05} metalness={0.4} roughness={0.3} />
      </mesh>
      <mesh>
        <cylinderGeometry args={[radius * 0.22, radius * 0.22, 0.014, 18]} />
        <meshStandardMaterial color="#22232b" metalness={0.65} roughness={0.28} />
      </mesh>
      <group ref={spin}>
        {Array.from({ length: blades }, (_, i) => (
          <mesh
            key={i}
            rotation={[0.22, 0.35, (i / blades) * Math.PI * 2]}
            position={[radius * 0.46, 0, 0]}
          >
            <boxGeometry args={[radius * 0.78, 0.0024, radius * 0.28]} />
            <meshStandardMaterial color="#3a3c46" metalness={0.35} roughness={0.42} />
          </mesh>
        ))}
      </group>
    </group>
  );
}
