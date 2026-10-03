"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import type { Group } from "three";
import { materials } from "@/components/three/materials";
import type { AssistantStatus } from "@/types";

export const AVATAR_GLB = "/models/avatar.glb";

export function AvatarModel({
  status,
  reducedMotion,
}: {
  status: AssistantStatus;
  reducedMotion: boolean;
}) {
  const group = useRef<Group>(null);

  useFrame((state) => {
    if (!group.current || reducedMotion) return;
    const t = state.clock.elapsedTime;
    const breathe = status === "idle" ? Math.sin(t * 1.4) * 0.015 : 0;
    const think = status === "thinking" ? Math.sin(t * 6) * 0.02 : 0;
    const speak = status === "speaking" ? Math.sin(t * 10) * 0.03 : 0;
    group.current.position.y = breathe;
    group.current.rotation.y = think;
    group.current.scale.setScalar(1 + speak * 0.15);
  });

  return (
    <group ref={group}>
      <mesh position={[0, 0.85, 0]} castShadow>
        <sphereGeometry args={[0.22, 16, 16]} />
        <meshStandardMaterial color={materials.figure} roughness={0.65} />
      </mesh>
      <mesh position={[0, 0.28, 0]} castShadow>
        <capsuleGeometry args={[0.2, 0.42, 4, 10]} />
        <meshStandardMaterial color={materials.plastic} roughness={0.7} />
      </mesh>
      <mesh position={[0, 1.02, 0.18]}>
        <boxGeometry args={[0.12, 0.03, 0.04]} />
        <meshStandardMaterial
          color={materials.accent}
          emissive={materials.accent}
          emissiveIntensity={status === "speaking" ? 0.6 : 0.15}
        />
      </mesh>
    </group>
  );
}
