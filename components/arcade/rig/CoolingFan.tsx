"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import type { Group } from "three";

/**
 * Fan axis is +Y (cylinder default). Blades live in XZ and spin around Y
 * so they stay inside the ring after any parent orientation.
 */
export function CoolingFan({
  radius = 0.046,
  speed = 8,
  reduced,
  rgb = "#22d3ee",
  depth = 0.018,
}: {
  radius?: number;
  speed?: number;
  reduced?: boolean;
  rgb?: string;
  depth?: number;
}) {
  const spin = useRef<Group>(null);

  useFrame((_, delta) => {
    if (reduced || !spin.current) return;
    spin.current.rotation.y += delta * speed;
  });

  const blades = 7;
  const inner = radius * 0.9;
  const hubR = radius * 0.2;
  const bladeLen = inner - hubR - radius * 0.04;
  const housing = radius + 0.007;

  return (
    <group>
      <mesh>
        <cylinderGeometry args={[housing, housing, depth, 36, 1, true]} />
        <meshStandardMaterial color="#3a3d46" metalness={0.38} roughness={0.48} />
      </mesh>
      <mesh>
        <cylinderGeometry args={[radius, radius, depth * 0.92, 32, 1, true]} />
        <meshStandardMaterial color="#2c2f38" metalness={0.32} roughness={0.5} />
      </mesh>
      {[-1, 1].map((s) => (
        <mesh key={s} position={[0, (depth / 2) * s * 0.98, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[radius * 0.98, 0.0024, 8, 32]} />
          <meshStandardMaterial color="#4b5060" metalness={0.55} roughness={0.32} />
        </mesh>
      ))}
      {[0, 1, 2, 3].map((i) => (
        <mesh key={i} rotation={[0, (i * Math.PI) / 2, 0]} position={[housing * 0.82, 0, 0]}>
          <boxGeometry args={[0.0055, depth * 0.65, 0.007]} />
          <meshStandardMaterial color="#4a4e58" metalness={0.45} roughness={0.4} />
        </mesh>
      ))}
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, -depth * 0.12, 0]}>
        <torusGeometry args={[radius * 0.78, 0.0028, 10, 36]} />
        <meshStandardMaterial color={rgb} emissive={rgb} emissiveIntensity={1.05} roughness={0.22} metalness={0.15} />
      </mesh>
      <mesh>
        <cylinderGeometry args={[hubR, hubR * 1.05, depth * 0.85, 20]} />
        <meshStandardMaterial color="#2a2d35" metalness={0.5} roughness={0.34} />
      </mesh>
      <mesh position={[0, depth * 0.32, 0]}>
        <cylinderGeometry args={[hubR * 0.55, hubR * 0.55, 0.0024, 16]} />
        <meshStandardMaterial color={rgb} emissive={rgb} emissiveIntensity={0.55} roughness={0.28} />
      </mesh>
      <group ref={spin}>
        {Array.from({ length: blades }, (_, i) => {
          const a = (i / blades) * Math.PI * 2;
          return (
            <group key={i} rotation={[0, a, 0]}>
              <mesh
                position={[hubR + bladeLen * 0.5, 0, 0]}
                rotation={[0.45, 0, 0]}
              >
                <boxGeometry args={[bladeLen, 0.0014, radius * 0.16]} />
                <meshStandardMaterial color="#4b5160" metalness={0.12} roughness={0.55} />
              </mesh>
            </group>
          );
        })}
      </group>
    </group>
  );
}
