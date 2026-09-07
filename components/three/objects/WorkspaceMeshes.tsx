"use client";

import { materials } from "../materials";
import type { WorkspaceObjectId } from "@/types/workspace";

export function ObjectMesh({ id }: { id: WorkspaceObjectId }) {
  switch (id) {
    case "monitor":
      return (
        <group>
          <mesh position={[0, 0.55, 0]} castShadow>
            <boxGeometry args={[1.35, 0.82, 0.08]} />
            <meshStandardMaterial color={materials.metal} roughness={0.45} />
          </mesh>
          <mesh position={[0, 0.55, 0.045]}>
            <boxGeometry args={[1.18, 0.66, 0.02]} />
            <meshStandardMaterial
              color={materials.screen}
              emissive={materials.accent}
              emissiveIntensity={0.22}
              roughness={0.2}
            />
          </mesh>
          <mesh position={[0, 0.08, 0]} castShadow>
            <boxGeometry args={[0.16, 0.28, 0.12]} />
            <meshStandardMaterial color={materials.plastic} />
          </mesh>
        </group>
      );
    case "laptop":
      return (
        <group>
          <mesh rotation={[-0.18, 0, 0]} position={[0, 0.28, -0.12]} castShadow>
            <boxGeometry args={[0.78, 0.5, 0.04]} />
            <meshStandardMaterial color={materials.metal} />
          </mesh>
          <mesh rotation={[-0.18, 0, 0]} position={[0, 0.28, -0.1]}>
            <boxGeometry args={[0.68, 0.4, 0.01]} />
            <meshStandardMaterial
              color={materials.screen}
              emissive={materials.accent}
              emissiveIntensity={0.12}
            />
          </mesh>
          <mesh position={[0, 0.02, 0.08]} castShadow>
            <boxGeometry args={[0.78, 0.04, 0.5]} />
            <meshStandardMaterial color={materials.plastic} />
          </mesh>
        </group>
      );
    case "phone":
      return (
        <mesh rotation={[-1.15, 0, 0.15]} position={[0, 0.08, 0]} castShadow>
          <boxGeometry args={[0.18, 0.36, 0.03]} />
          <meshStandardMaterial
            color={materials.metal}
            emissive={materials.accent}
            emissiveIntensity={0.08}
          />
        </mesh>
      );
    case "arcade":
      return (
        <group>
          <mesh position={[0, 0.35, 0]} castShadow>
            <boxGeometry args={[0.42, 0.7, 0.32]} />
            <meshStandardMaterial color={materials.plastic} />
          </mesh>
          <mesh position={[0, 0.62, 0.08]}>
            <boxGeometry args={[0.32, 0.22, 0.02]} />
            <meshStandardMaterial
              color={materials.screen}
              emissive={materials.accent}
              emissiveIntensity={0.18}
            />
          </mesh>
        </group>
      );
    case "terminal":
      return (
        <mesh position={[0, 0.05, 0]} castShadow>
          <boxGeometry args={[0.55, 0.08, 0.38]} />
          <meshStandardMaterial color={materials.metal} roughness={0.35} />
        </mesh>
      );
    case "folder":
      return (
        <mesh rotation={[-0.15, 0.2, 0]} position={[0, 0.06, 0]} castShadow>
          <boxGeometry args={[0.28, 0.04, 0.36]} />
          <meshStandardMaterial color={materials.paper} roughness={0.9} />
        </mesh>
      );
    case "avatar":
      return (
        <group>
          <mesh position={[0, 0.42, 0]} castShadow>
            <capsuleGeometry args={[0.16, 0.28, 4, 8]} />
            <meshStandardMaterial color={materials.figure} roughness={0.7} />
          </mesh>
          <mesh position={[0, 0.78, 0]} castShadow>
            <sphereGeometry args={[0.14, 16, 16]} />
            <meshStandardMaterial color={materials.figure} />
          </mesh>
        </group>
      );
    default:
      return null;
  }
}
