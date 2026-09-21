"use client";

import { useMemo } from "react";
import { CoolingFan } from "./CoolingFan";
import { metalAlbedo, pcbAlbedo } from "./textures";

export function PcCase({ reduced }: { reduced?: boolean }) {
  const metal = useMemo(() => metalAlbedo(), []);
  const pcb = useMemo(() => pcbAlbedo(), []);

  return (
    <group position={[0.96, 0.312, 0.02]} rotation={[0, 0.42, 0]}>
      <mesh position={[0, -0.258, 0]} castShadow>
        <boxGeometry args={[0.3, 0.036, 0.48]} />
        <meshStandardMaterial map={metal} color="#101114" metalness={0.72} roughness={0.32} />
      </mesh>
      <mesh position={[0, 0.262, 0]}>
        <boxGeometry args={[0.3, 0.028, 0.48]} />
        <meshStandardMaterial map={metal} color="#101114" metalness={0.72} roughness={0.32} />
      </mesh>
      <mesh position={[0.142, 0.01, 0]}>
        <boxGeometry args={[0.018, 0.54, 0.48]} />
        <meshStandardMaterial map={metal} color="#0c0d12" metalness={0.74} roughness={0.3} />
      </mesh>
      <mesh position={[0, 0.01, -0.232]}>
        <boxGeometry args={[0.28, 0.52, 0.018]} />
        <meshStandardMaterial map={metal} color="#121318" metalness={0.68} roughness={0.36} />
      </mesh>
      <mesh position={[0.11, 0.04, 0.236]}>
        <boxGeometry args={[0.07, 0.46, 0.012]} />
        <meshStandardMaterial map={metal} color="#15161c" metalness={0.6} roughness={0.4} />
      </mesh>
      <mesh position={[-0.142, 0.012, 0]}>
        <boxGeometry args={[0.006, 0.5, 0.44]} />
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
      <mesh position={[-0.02, 0.012, 0.236]}>
        <boxGeometry args={[0.2, 0.5, 0.005]} />
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
      {[-0.12, 0.12].flatMap((x) =>
        [-0.2, 0.2].map((z) => (
          <mesh key={`${x}${z}`} position={[x, -0.282, z]}>
            <cylinderGeometry args={[0.011, 0.013, 0.014, 12]} />
            <meshStandardMaterial color="#1a1b22" roughness={0.55} />
          </mesh>
        )),
      )}

      <mesh position={[0.02, 0.05, -0.09]}>
        <boxGeometry args={[0.21, 0.012, 0.26]} />
        <meshStandardMaterial map={pcb} roughness={0.58} metalness={0.14} />
      </mesh>
      <mesh position={[-0.08, 0.08, -0.18]}>
        <boxGeometry args={[0.04, 0.05, 0.08]} />
        <meshStandardMaterial color="#1f2937" metalness={0.45} roughness={0.4} />
      </mesh>
      {[-0.04, 0.0, 0.04].map((z) => (
        <mesh key={z} position={[0.08, 0.068, -0.14 + z]}>
          <boxGeometry args={[0.028, 0.02, 0.028]} />
          <meshStandardMaterial color="#374151" metalness={0.55} roughness={0.35} />
        </mesh>
      ))}
      <mesh position={[0.02, 0.07, -0.12]}>
        <boxGeometry args={[0.048, 0.016, 0.048]} />
        <meshStandardMaterial color="#111827" metalness={0.5} roughness={0.38} />
      </mesh>
      <mesh position={[0.02, 0.12, -0.12]}>
        <cylinderGeometry args={[0.03, 0.03, 0.07, 18]} />
        <meshStandardMaterial color="#2a2c34" metalness={0.58} roughness={0.32} />
      </mesh>
      <group position={[0.02, 0.12, -0.08]} rotation={[Math.PI / 2, 0, 0]}>
        <CoolingFan radius={0.03} speed={9.5} reduced={reduced} rgb="#c084fc" />
      </group>
      <mesh position={[0.085, 0.09, -0.02]}>
        <boxGeometry args={[0.014, 0.07, 0.032]} />
        <meshStandardMaterial color="#e5e7eb" metalness={0.4} roughness={0.28} emissive="#7c3aed" emissiveIntensity={0.3} />
      </mesh>
      <mesh position={[0.085, 0.09, 0.018]}>
        <boxGeometry args={[0.014, 0.07, 0.032]} />
        <meshStandardMaterial color="#e5e7eb" metalness={0.4} roughness={0.28} emissive="#22d3ee" emissiveIntensity={0.28} />
      </mesh>
      <mesh position={[-0.06, 0.062, -0.02]}>
        <boxGeometry args={[0.04, 0.01, 0.06]} />
        <meshStandardMaterial color="#1e293b" metalness={0.5} roughness={0.4} />
      </mesh>

      <group position={[0.01, -0.02, 0.05]}>
        <mesh>
          <boxGeometry args={[0.22, 0.05, 0.3]} />
          <meshStandardMaterial map={metal} color="#0b0c10" metalness={0.6} roughness={0.34} />
        </mesh>
        <mesh position={[0, -0.016, 0]}>
          <boxGeometry args={[0.22, 0.012, 0.3]} />
          <meshStandardMaterial color="#14532d" roughness={0.5} />
        </mesh>
        {[-0.08, 0, 0.08].map((z) => (
          <group key={z} position={[0.06, 0.028, z]} rotation={[Math.PI / 2, 0, 0]}>
            <CoolingFan radius={0.028} speed={11.5 + z * 6} reduced={reduced} />
          </group>
        ))}
        <mesh position={[-0.118, 0.0, 0.1]}>
          <boxGeometry args={[0.01, 0.055, 0.09]} />
          <meshStandardMaterial color="#9ca3af" metalness={0.75} roughness={0.28} />
        </mesh>
        <mesh position={[-0.1, 0.01, 0.12]} rotation={[0, 0, 0.4]}>
          <cylinderGeometry args={[0.004, 0.004, 0.08, 8]} />
          <meshStandardMaterial color="#1f2937" roughness={0.65} />
        </mesh>
      </group>

      <mesh position={[0, -0.2, 0]}>
        <boxGeometry args={[0.26, 0.085, 0.42]} />
        <meshStandardMaterial map={metal} color="#101114" metalness={0.52} roughness={0.4} />
      </mesh>
      <mesh position={[0.08, -0.16, 0.12]}>
        <boxGeometry args={[0.05, 0.02, 0.04]} />
        <meshStandardMaterial color="#111827" />
      </mesh>

      <group position={[-0.02, 0.09, 0.18]} rotation={[Math.PI / 2, 0, 0]}>
        <CoolingFan radius={0.05} speed={7.1} reduced={reduced} />
      </group>
      <group position={[-0.02, -0.07, 0.18]} rotation={[Math.PI / 2, 0, 0]}>
        <CoolingFan radius={0.05} speed={8.0} reduced={reduced} rgb="#c084fc" />
      </group>
      <group position={[0.02, 0.1, -0.208]} rotation={[Math.PI / 2, 0, 0]}>
        <CoolingFan radius={0.042} speed={-6.6} reduced={reduced} />
      </group>

      <mesh position={[0.03, 0.288, -0.14]}>
        <cylinderGeometry args={[0.004, 0.004, 0.09, 8]} />
        <meshStandardMaterial color="#1a1b20" />
      </mesh>
      <mesh position={[-0.03, 0.288, -0.14]}>
        <cylinderGeometry args={[0.004, 0.004, 0.09, 8]} />
        <meshStandardMaterial color="#1a1b20" />
      </mesh>

      <pointLight position={[-0.04, 0.04, 0.04]} intensity={0.9} distance={0.95} color="#c084fc" />
      <pointLight position={[0.06, 0.0, 0.1]} intensity={0.5} distance={0.7} color="#22d3ee" />
    </group>
  );
}
