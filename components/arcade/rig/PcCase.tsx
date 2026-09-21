"use client";

import { useMemo } from "react";
import { PC_POS, PC_YAW } from "@/lib/arcade/layout";
import { CoolingFan } from "./CoolingFan";
import { metalAlbedo, pcbAlbedo } from "./textures";

export function PcCase({ reduced }: { reduced?: boolean }) {
  const metal = useMemo(() => metalAlbedo(), []);
  const pcb = useMemo(() => pcbAlbedo(), []);

  return (
    <group position={PC_POS} rotation={[0, PC_YAW, 0]}>
      <mesh position={[0, -0.258, 0]} castShadow>
        <boxGeometry args={[0.28, 0.036, 0.46]} />
        <meshStandardMaterial map={metal} color="#101114" metalness={0.72} roughness={0.32} />
      </mesh>
      <mesh position={[0, 0.262, 0]}>
        <boxGeometry args={[0.28, 0.028, 0.46]} />
        <meshStandardMaterial map={metal} color="#101114" metalness={0.72} roughness={0.32} />
      </mesh>
      <mesh position={[0.134, 0.01, 0]}>
        <boxGeometry args={[0.016, 0.54, 0.46]} />
        <meshStandardMaterial map={metal} color="#0c0d12" metalness={0.74} roughness={0.3} />
      </mesh>
      <mesh position={[0, 0.01, -0.224]}>
        <boxGeometry args={[0.26, 0.52, 0.016]} />
        <meshStandardMaterial map={metal} color="#121318" metalness={0.68} roughness={0.36} />
      </mesh>
      <mesh position={[0.1, 0.04, 0.228]}>
        <boxGeometry args={[0.06, 0.46, 0.012]} />
        <meshStandardMaterial map={metal} color="#15161c" metalness={0.6} roughness={0.4} />
      </mesh>
      <mesh position={[-0.134, 0.012, 0]}>
        <boxGeometry args={[0.006, 0.5, 0.42]} />
        <meshPhysicalMaterial
          color="#e8f4ff"
          metalness={0.02}
          roughness={0.04}
          transmission={0.84}
          thickness={0.045}
          transparent
          opacity={0.28}
          ior={1.52}
        />
      </mesh>
      <mesh position={[-0.02, 0.012, 0.228]}>
        <boxGeometry args={[0.18, 0.5, 0.005]} />
        <meshPhysicalMaterial
          color="#e8f4ff"
          metalness={0.02}
          roughness={0.05}
          transmission={0.8}
          thickness={0.03}
          transparent
          opacity={0.24}
          ior={1.5}
        />
      </mesh>
      {[-0.11, 0.11].flatMap((x) =>
        [-0.18, 0.18].map((z) => (
          <mesh key={`${x}${z}`} position={[x, -0.28, z]}>
            <cylinderGeometry args={[0.01, 0.012, 0.012, 12]} />
            <meshStandardMaterial color="#1a1b22" roughness={0.55} />
          </mesh>
        )),
      )}

      <mesh position={[0.02, 0.048, -0.08]}>
        <boxGeometry args={[0.2, 0.01, 0.24]} />
        <meshStandardMaterial map={pcb} roughness={0.55} metalness={0.14} />
      </mesh>
      <mesh position={[-0.07, 0.072, -0.16]}>
        <boxGeometry args={[0.036, 0.04, 0.07]} />
        <meshStandardMaterial color="#1f2937" metalness={0.48} roughness={0.38} />
      </mesh>
      {[-0.03, 0.01, 0.05].map((z) => (
        <mesh key={z} position={[0.07, 0.062, -0.12 + z]}>
          <boxGeometry args={[0.026, 0.018, 0.026]} />
          <meshStandardMaterial color="#4b5563" metalness={0.58} roughness={0.32} />
        </mesh>
      ))}
      <mesh position={[0.02, 0.062, -0.1]}>
        <boxGeometry args={[0.044, 0.014, 0.044]} />
        <meshStandardMaterial color="#111827" metalness={0.5} roughness={0.36} />
      </mesh>
      <mesh position={[0.02, 0.1, -0.1]}>
        <cylinderGeometry args={[0.028, 0.028, 0.055, 18]} />
        <meshStandardMaterial color="#2a2c34" metalness={0.58} roughness={0.3} />
      </mesh>
      <group position={[0.02, 0.1, -0.06]} rotation={[Math.PI / 2, 0, 0]}>
        <CoolingFan radius={0.028} speed={9.4} reduced={reduced} rgb="#c084fc" />
      </group>
      <mesh position={[0.08, 0.082, -0.02]}>
        <boxGeometry args={[0.013, 0.068, 0.03]} />
        <meshStandardMaterial color="#e5e7eb" metalness={0.42} roughness={0.28} emissive="#7c3aed" emissiveIntensity={0.32} />
      </mesh>
      <mesh position={[0.08, 0.082, 0.016]}>
        <boxGeometry args={[0.013, 0.068, 0.03]} />
        <meshStandardMaterial color="#e5e7eb" metalness={0.42} roughness={0.28} emissive="#22d3ee" emissiveIntensity={0.3} />
      </mesh>
      <mesh position={[-0.05, 0.058, 0.0]}>
        <boxGeometry args={[0.038, 0.008, 0.055]} />
        <meshStandardMaterial color="#1e293b" metalness={0.5} roughness={0.4} />
      </mesh>

      <group position={[0.01, -0.018, 0.04]}>
        <mesh>
          <boxGeometry args={[0.21, 0.048, 0.28]} />
          <meshStandardMaterial map={metal} color="#0b0c10" metalness={0.6} roughness={0.34} />
        </mesh>
        {Array.from({ length: 8 }, (_, i) => (
          <mesh key={i} position={[0.02, 0.01, -0.1 + i * 0.028]}>
            <boxGeometry args={[0.12, 0.028, 0.004]} />
            <meshStandardMaterial color="#6b7280" metalness={0.7} roughness={0.28} />
          </mesh>
        ))}
        {[-0.07, 0, 0.07].map((z) => (
          <group key={z} position={[0.055, 0.028, z]} rotation={[Math.PI / 2, 0, 0]}>
            <CoolingFan radius={0.026} speed={11.2 + z * 5} reduced={reduced} />
          </group>
        ))}
        <mesh position={[-0.112, 0, 0.09]}>
          <boxGeometry args={[0.01, 0.05, 0.08]} />
          <meshStandardMaterial color="#9ca3af" metalness={0.75} roughness={0.28} />
        </mesh>
      </group>

      <mesh position={[0.02, 0.24, -0.02]}>
        <boxGeometry args={[0.22, 0.012, 0.12]} />
        <meshStandardMaterial color="#1f2937" metalness={0.55} roughness={0.4} />
      </mesh>
      <group position={[-0.04, 0.255, -0.02]} rotation={[0, 0, Math.PI / 2]}>
        <CoolingFan radius={0.032} speed={8.2} reduced={reduced} />
      </group>
      <group position={[0.06, 0.255, -0.02]} rotation={[0, 0, Math.PI / 2]}>
        <CoolingFan radius={0.032} speed={7.6} reduced={reduced} rgb="#c084fc" />
      </group>

      <mesh position={[0, -0.2, 0]}>
        <boxGeometry args={[0.24, 0.08, 0.4]} />
        <meshStandardMaterial map={metal} color="#101114" metalness={0.52} roughness={0.4} />
      </mesh>

      <group position={[-0.02, 0.08, 0.175]} rotation={[Math.PI / 2, 0, 0]}>
        <CoolingFan radius={0.048} speed={7.1} reduced={reduced} />
      </group>
      <group position={[-0.02, -0.07, 0.175]} rotation={[Math.PI / 2, 0, 0]}>
        <CoolingFan radius={0.048} speed={8} reduced={reduced} rgb="#c084fc" />
      </group>
      <group position={[0.02, 0.1, -0.2]} rotation={[Math.PI / 2, 0, 0]}>
        <CoolingFan radius={0.04} speed={-6.6} reduced={reduced} />
      </group>

      <mesh position={[0.03, 0.288, -0.12]}>
        <cylinderGeometry args={[0.004, 0.004, 0.08, 8]} />
        <meshStandardMaterial color="#1a1b20" />
      </mesh>
      <mesh position={[-0.03, 0.288, -0.12]}>
        <cylinderGeometry args={[0.004, 0.004, 0.08, 8]} />
        <meshStandardMaterial color="#1a1b20" />
      </mesh>

      <pointLight position={[-0.04, 0.04, 0.04]} intensity={0.9} distance={0.95} color="#c084fc" />
      <pointLight position={[0.06, 0, 0.1]} intensity={0.5} distance={0.7} color="#22d3ee" />
    </group>
  );
}
