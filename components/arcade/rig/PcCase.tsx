"use client";

import { CoolingFan } from "./CoolingFan";

export function PcCase({ reduced }: { reduced?: boolean }) {
  return (
    <group position={[-0.58, 0.27, -0.08]}>
      <mesh castShadow receiveShadow>
        <boxGeometry args={[0.3, 0.52, 0.44]} />
        <meshStandardMaterial color="#17181e" metalness={0.72} roughness={0.38} />
      </mesh>
      <mesh position={[0.152, 0.02, 0]} castShadow>
        <boxGeometry args={[0.006, 0.46, 0.4]} />
        <meshPhysicalMaterial
          color="#9ecfff"
          metalness={0.05}
          roughness={0.04}
          transmission={0.72}
          thickness={0.04}
          transparent
          opacity={0.55}
          ior={1.45}
        />
      </mesh>
      <mesh position={[0, 0.255, 0]}>
        <boxGeometry args={[0.3, 0.012, 0.44]} />
        <meshStandardMaterial color="#101114" metalness={0.8} roughness={0.32} />
      </mesh>
      <group position={[0, -0.24, 0.18]} rotation={[Math.PI / 2, 0, 0]}>
        <CoolingFan radius={0.05} speed={7} reduced={reduced} />
      </group>
      <group position={[0, -0.02, 0.18]} rotation={[Math.PI / 2, 0, 0]}>
        <CoolingFan radius={0.05} speed={9} reduced={reduced} />
      </group>
      <group position={[0, 0.2, -0.2]} rotation={[Math.PI / 2, 0, 0]}>
        <CoolingFan radius={0.042} speed={-6.5} reduced={reduced} />
      </group>

      <mesh position={[0.02, 0.02, -0.02]}>
        <boxGeometry args={[0.22, 0.28, 0.28]} />
        <meshStandardMaterial color="#102418" roughness={0.7} metalness={0.15} />
      </mesh>
      <mesh position={[0.08, 0.12, -0.02]}>
        <boxGeometry args={[0.018, 0.08, 0.12]} />
        <meshStandardMaterial color="#3b82f6" emissive="#2563eb" emissiveIntensity={0.35} />
      </mesh>
      <mesh position={[0.1, 0.12, 0.04]}>
        <boxGeometry args={[0.012, 0.07, 0.028]} />
        <meshStandardMaterial color="#c4c4cc" metalness={0.4} roughness={0.4} />
      </mesh>
      <mesh position={[0.1, 0.12, 0.075]}>
        <boxGeometry args={[0.012, 0.07, 0.028]} />
        <meshStandardMaterial color="#c4c4cc" metalness={0.4} roughness={0.4} />
      </mesh>

      <group position={[0.02, -0.06, 0.02]}>
        <mesh>
          <boxGeometry args={[0.24, 0.05, 0.3]} />
          <meshStandardMaterial color="#0d0e12" metalness={0.55} roughness={0.4} />
        </mesh>
        <group position={[0.08, 0.028, 0.04]} rotation={[Math.PI / 2, 0, 0]}>
          <CoolingFan radius={0.028} speed={11} reduced={reduced} />
        </group>
        <group position={[0.08, 0.028, -0.05]} rotation={[Math.PI / 2, 0, 0]}>
          <CoolingFan radius={0.028} speed={10} reduced={reduced} />
        </group>
      </group>

      <mesh position={[0, -0.2, 0]}>
        <boxGeometry args={[0.28, 0.08, 0.4]} />
        <meshStandardMaterial color="#121318" metalness={0.5} roughness={0.5} />
      </mesh>
      <mesh position={[0, 0.02, 0.221]}>
        <boxGeometry args={[0.22, 0.008, 0.004]} />
        <meshStandardMaterial color="#22d3ee" emissive="#22d3ee" emissiveIntensity={1.2} />
      </mesh>
      <pointLight position={[0.08, 0.04, 0]} intensity={0.55} distance={0.7} color="#22d3ee" />
      <pointLight position={[-0.04, -0.04, 0.05]} intensity={0.35} distance={0.55} color="#c084fc" />
    </group>
  );
}
