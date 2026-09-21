"use client";

import { useMemo } from "react";
import { CoolingFan } from "./CoolingFan";
import { metalAlbedo, pcbAlbedo } from "./textures";

function Cable({
  from,
  to,
  color,
}: {
  from: [number, number, number];
  to: [number, number, number];
  color: string;
}) {
  const mid: [number, number, number] = [
    (from[0] + to[0]) / 2,
    (from[1] + to[1]) / 2 - 0.02,
    (from[2] + to[2]) / 2,
  ];
  const len = Math.hypot(to[0] - from[0], to[1] - from[1], to[2] - from[2]);
  return (
    <mesh position={mid}>
      <cylinderGeometry args={[0.0035, 0.0035, Math.max(len, 0.04), 6]} />
      <meshStandardMaterial color={color} roughness={0.7} />
    </mesh>
  );
}

export function PcCase({ reduced }: { reduced?: boolean }) {
  const metal = useMemo(() => metalAlbedo(), []);
  const pcb = useMemo(() => pcbAlbedo(), []);

  return (
    <group position={[0.86, 0.31, -0.04]} rotation={[0, -0.22, 0]}>
      <mesh position={[0, -0.255, 0]} castShadow>
        <boxGeometry args={[0.28, 0.04, 0.46]} />
        <meshStandardMaterial map={metal} color="#101114" metalness={0.7} roughness={0.34} />
      </mesh>
      <mesh position={[0, 0.255, 0]}>
        <boxGeometry args={[0.28, 0.03, 0.46]} />
        <meshStandardMaterial map={metal} color="#101114" metalness={0.7} roughness={0.34} />
      </mesh>
      <mesh position={[0.132, 0, 0]}>
        <boxGeometry args={[0.016, 0.52, 0.46]} />
        <meshStandardMaterial map={metal} color="#0e0f14" metalness={0.72} roughness={0.32} />
      </mesh>
      <mesh position={[0, 0, -0.222]}>
        <boxGeometry args={[0.26, 0.5, 0.016]} />
        <meshStandardMaterial map={metal} color="#121318" metalness={0.65} roughness={0.38} />
      </mesh>
      <mesh position={[0.12, 0.04, 0.228]}>
        <boxGeometry args={[0.04, 0.44, 0.01]} />
        <meshStandardMaterial map={metal} color="#15161c" metalness={0.6} roughness={0.4} />
      </mesh>
      <mesh position={[-0.132, 0.01, 0]} castShadow>
        <boxGeometry args={[0.005, 0.48, 0.42]} />
        <meshPhysicalMaterial
          color="#d7ecff"
          metalness={0.02}
          roughness={0.045}
          transmission={0.82}
          thickness={0.04}
          transparent
          opacity={0.32}
          ior={1.5}
        />
      </mesh>
      <mesh position={[0, 0.01, 0.228]}>
        <boxGeometry args={[0.22, 0.48, 0.005]} />
        <meshPhysicalMaterial
          color="#d7ecff"
          metalness={0.02}
          roughness={0.05}
          transmission={0.78}
          thickness={0.03}
          transparent
          opacity={0.28}
          ior={1.5}
        />
      </mesh>
      {[-0.12, 0.12].map((x) =>
        [-0.2, 0.2].map((z) => (
          <mesh key={`${x}${z}`} position={[x, -0.278, z]}>
            <cylinderGeometry args={[0.01, 0.012, 0.012, 10]} />
            <meshStandardMaterial color="#1a1b22" roughness={0.6} />
          </mesh>
        )),
      )}

      <mesh position={[0.01, 0.04, -0.08]} rotation={[0, 0, 0]}>
        <boxGeometry args={[0.2, 0.28, 0.22]} />
        <meshStandardMaterial map={pcb} roughness={0.62} metalness={0.12} />
      </mesh>
      <mesh position={[0.06, 0.16, -0.06]}>
        <boxGeometry args={[0.05, 0.018, 0.05]} />
        <meshStandardMaterial color="#1f2933" metalness={0.5} roughness={0.4} />
      </mesh>
      <mesh position={[0.06, 0.2, -0.06]}>
        <cylinderGeometry args={[0.028, 0.028, 0.05, 16]} />
        <meshStandardMaterial color="#2a2c34" metalness={0.55} roughness={0.35} />
      </mesh>
      <group position={[0.06, 0.2, -0.02]} rotation={[Math.PI / 2, 0, 0]}>
        <CoolingFan radius={0.028} speed={10} reduced={reduced} rgb="#c084fc" />
      </group>
      <mesh position={[0.09, 0.14, 0.02]}>
        <boxGeometry args={[0.012, 0.072, 0.03]} />
        <meshStandardMaterial color="#e2e2ea" metalness={0.45} roughness={0.3} emissive="#7c3aed" emissiveIntensity={0.25} />
      </mesh>
      <mesh position={[0.09, 0.14, 0.055]}>
        <boxGeometry args={[0.012, 0.072, 0.03]} />
        <meshStandardMaterial color="#e2e2ea" metalness={0.45} roughness={0.3} emissive="#22d3ee" emissiveIntensity={0.22} />
      </mesh>

      <group position={[0.0, -0.04, 0.04]}>
        <mesh>
          <boxGeometry args={[0.2, 0.042, 0.28]} />
          <meshStandardMaterial map={metal} color="#0c0d12" metalness={0.58} roughness={0.36} />
        </mesh>
        <mesh position={[0, -0.012, 0]}>
          <boxGeometry args={[0.2, 0.01, 0.28]} />
          <meshStandardMaterial color="#14532d" roughness={0.55} />
        </mesh>
        {[-0.07, 0, 0.07].map((z) => (
          <group key={z} position={[0.07, 0.024, z]} rotation={[Math.PI / 2, 0, 0]}>
            <CoolingFan radius={0.026} speed={11 + z * 4} reduced={reduced} />
          </group>
        ))}
        <mesh position={[-0.108, 0, 0.08]}>
          <boxGeometry args={[0.008, 0.05, 0.08]} />
          <meshStandardMaterial color="#9ca3af" metalness={0.7} roughness={0.3} />
        </mesh>
      </group>

      <mesh position={[0, -0.2, 0]}>
        <boxGeometry args={[0.24, 0.08, 0.4]} />
        <meshStandardMaterial map={metal} color="#101114" metalness={0.5} roughness={0.42} />
      </mesh>

      <group position={[0.0, 0.08, 0.175]} rotation={[Math.PI / 2, 0, 0]}>
        <CoolingFan radius={0.048} speed={7.4} reduced={reduced} />
      </group>
      <group position={[0.0, -0.08, 0.175]} rotation={[Math.PI / 2, 0, 0]}>
        <CoolingFan radius={0.048} speed={8.2} reduced={reduced} rgb="#c084fc" />
      </group>
      <group position={[0.0, 0.12, -0.2]} rotation={[Math.PI / 2, 0, 0]}>
        <CoolingFan radius={0.04} speed={-6.8} reduced={reduced} />
      </group>

      <mesh position={[0.02, 0.285, -0.14]}>
        <cylinderGeometry args={[0.004, 0.004, 0.1, 8]} />
        <meshStandardMaterial color="#1a1b20" />
      </mesh>
      <mesh position={[-0.02, 0.285, -0.14]}>
        <cylinderGeometry args={[0.004, 0.004, 0.1, 8]} />
        <meshStandardMaterial color="#1a1b20" />
      </mesh>

      <Cable from={[0.08, 0.02, 0.04]} to={[0.02, -0.16, 0.05]} color="#111827" />
      <Cable from={[0.05, 0.1, -0.04]} to={[0.02, -0.16, -0.08]} color="#7f1d1d" />

      <pointLight position={[0, 0.05, 0.05]} intensity={0.85} distance={0.9} color="#c084fc" />
      <pointLight position={[0.08, 0.0, 0.1]} intensity={0.45} distance={0.7} color="#22d3ee" />
    </group>
  );
}
