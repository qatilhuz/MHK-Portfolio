"use client";

import { materials } from "../materials";

export function Desk() {
  return (
    <group>
      <mesh position={[0, -0.08, 0.1]} receiveShadow>
        <boxGeometry args={[4.2, 0.08, 2.1]} />
        <meshStandardMaterial color={materials.desk} roughness={0.72} metalness={0.08} />
      </mesh>
      <mesh position={[0, -0.55, 0.85]}>
        <boxGeometry args={[4.2, 0.9, 0.08]} />
        <meshStandardMaterial color={materials.metal} roughness={0.8} />
      </mesh>
    </group>
  );
}
