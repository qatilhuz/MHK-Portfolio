"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import type { Group } from "three";
import { materials } from "@/components/three/materials";
import type { GuidePose } from "@/lib/guide/types";

export function GuideHumanoid({
  pose,
  reducedMotion,
}: {
  pose: GuidePose;
  reducedMotion: boolean;
}) {
  const root = useRef<Group>(null);
  const arm = useRef<Group>(null);
  const visor = useRef<Group>(null);

  useFrame((state) => {
    if (reducedMotion || !root.current) return;
    const t = state.clock.elapsedTime;
    const talk = pose === "talk" || pose === "greet";
    root.current.position.y = Math.sin(t * 1.5) * 0.02;
    root.current.rotation.y = Math.sin(t * 0.6) * 0.08;
    if (arm.current) {
      const wave = pose === "greet" || pose === "wave" ? Math.sin(t * 6) * 0.45 : 0.15;
      arm.current.rotation.z = -0.4 - wave;
    }
    if (visor.current) {
      visor.current.scale.y = talk ? 1 + Math.sin(t * 10) * 0.12 : 1;
    }
  });

  return (
    <group ref={root} position={[0, -0.85, 0]}>
      <mesh position={[0, 1.42, 0]} castShadow>
        <sphereGeometry args={[0.2, 24, 24]} />
        <meshStandardMaterial color={materials.figure} roughness={0.45} metalness={0.08} />
      </mesh>
      <group ref={visor} position={[0, 1.44, 0.14]}>
        <mesh>
          <boxGeometry args={[0.22, 0.045, 0.04]} />
          <meshStandardMaterial
            color={materials.accent}
            emissive={materials.accent}
            emissiveIntensity={pose === "talk" ? 0.55 : 0.18}
            roughness={0.3}
          />
        </mesh>
      </group>
      <mesh position={[0, 0.92, 0]} castShadow>
        <capsuleGeometry args={[0.22, 0.52, 6, 12]} />
        <meshStandardMaterial color={materials.plastic} roughness={0.55} />
      </mesh>
      <mesh position={[0, 1.12, 0.12]}>
        <boxGeometry args={[0.16, 0.28, 0.04]} />
        <meshStandardMaterial color={materials.accent} roughness={0.4} />
      </mesh>
      <mesh position={[-0.28, 0.95, 0]} rotation={[0, 0, 0.35]} castShadow>
        <capsuleGeometry args={[0.07, 0.38, 4, 8]} />
        <meshStandardMaterial color={materials.plastic} roughness={0.55} />
      </mesh>
      <group ref={arm} position={[0.28, 1.12, 0]}>
        <mesh rotation={[0, 0, -0.2]} castShadow>
          <capsuleGeometry args={[0.07, 0.38, 4, 8]} />
          <meshStandardMaterial color={materials.plastic} roughness={0.55} />
        </mesh>
      </group>
      <mesh position={[-0.1, 0.32, 0]} castShadow>
        <capsuleGeometry args={[0.08, 0.42, 4, 8]} />
        <meshStandardMaterial color={materials.metal} roughness={0.5} />
      </mesh>
      <mesh position={[0.1, 0.32, 0]} castShadow>
        <capsuleGeometry args={[0.08, 0.42, 4, 8]} />
        <meshStandardMaterial color={materials.metal} roughness={0.5} />
      </mesh>
    </group>
  );
}
