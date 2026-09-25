"use client";

import { useMemo } from "react";
import { CatmullRomCurve3, TubeGeometry, Vector3 } from "three";
import { PC_POS, PC_YAW } from "@/lib/arcade/layout";
import { CoolingFan } from "./CoolingFan";
import { pcBrushedMetal, pcHexMesh, pcPcbMaps } from "./pcTextures";

function makeCable(pts: [number, number, number][], radius: number) {
  const curve = new CatmullRomCurve3(pts.map((p) => new Vector3(...p)));
  return new TubeGeometry(curve, 28, radius, 8, false);
}

const CABLE_AIO_L = makeCable(
  [
    [0.008, 0.112, -0.1],
    [-0.04, 0.16, -0.08],
    [-0.05, 0.21, -0.05],
    [-0.04, 0.238, -0.04],
  ],
  0.005,
);
const CABLE_AIO_R = makeCable(
  [
    [0.032, 0.112, -0.1],
    [0.06, 0.16, -0.07],
    [0.07, 0.21, -0.04],
    [0.06, 0.238, 0.0],
  ],
  0.005,
);
const CABLE_24 = makeCable(
  [
    [0.055, 0.055, 0.06],
    [0.08, 0.02, 0.08],
    [0.09, -0.12, 0.1],
    [0.06, -0.16, 0.08],
  ],
  0.0045,
);
const CABLE_GPU = makeCable(
  [
    [0.085, 0.01, 0.05],
    [0.1, -0.04, 0.08],
    [0.08, -0.14, 0.1],
    [0.04, -0.16, 0.06],
  ],
  0.004,
);
const CABLE_EPS = makeCable(
  [
    [-0.008, 0.056, -0.16],
    [-0.06, 0.04, -0.14],
    [-0.08, -0.1, -0.1],
    [-0.04, -0.16, -0.06],
  ],
  0.0035,
);

function Screw({ position }: { position: [number, number, number] }) {
  return (
    <mesh position={position}>
      <cylinderGeometry args={[0.0032, 0.0032, 0.004, 10]} />
      <meshStandardMaterial color="#6b7280" metalness={0.8} roughness={0.28} />
    </mesh>
  );
}

function HeatsinkFins({
  count,
  span,
  height,
  depth,
  color = "#8b919c",
}: {
  count: number;
  span: number;
  height: number;
  depth: number;
  color?: string;
}) {
  return (
    <>
      {Array.from({ length: count }, (_, i) => (
        <mesh key={i} position={[-span / 2 + (i / (count - 1)) * span, 0, 0]}>
          <boxGeometry args={[0.0014, height, depth]} />
          <meshStandardMaterial color={color} metalness={0.82} roughness={0.22} />
        </mesh>
      ))}
    </>
  );
}

export function PcCase({ reduced }: { reduced?: boolean }) {
  const metal = useMemo(() => pcBrushedMetal(), []);
  const hex = useMemo(() => pcHexMesh(), []);
  const pcb = useMemo(() => pcPcbMaps(), []);

  return (
    <group position={PC_POS} rotation={[0, PC_YAW, 0]}>
      {/* chassis rails */}
      <mesh position={[0, -0.258, 0]} castShadow>
        <boxGeometry args={[0.28, 0.036, 0.46]} />
        <meshStandardMaterial map={metal} color="#3a3d46" metalness={0.74} roughness={0.3} />
      </mesh>
      <mesh position={[0, 0.262, 0]}>
        <boxGeometry args={[0.28, 0.028, 0.46]} />
        <meshStandardMaterial map={metal} color="#3a3d46" metalness={0.74} roughness={0.3} />
      </mesh>
      <mesh position={[0.134, 0.01, 0]}>
        <boxGeometry args={[0.016, 0.54, 0.46]} />
        <meshStandardMaterial map={metal} color="#2c2f38" metalness={0.64} roughness={0.34} />
      </mesh>
      <mesh position={[0, 0.01, -0.224]}>
        <boxGeometry args={[0.26, 0.52, 0.016]} />
        <meshStandardMaterial map={hex} color="#3a3d46" metalness={0.5} roughness={0.44} />
      </mesh>
      <mesh position={[0.1, 0.04, 0.228]}>
        <boxGeometry args={[0.06, 0.46, 0.012]} />
        <meshStandardMaterial map={metal} color="#4a4e58" metalness={0.55} roughness={0.4} />
      </mesh>
      {/* front I/O */}
      <mesh position={[0.1, 0.22, 0.236]}>
        <boxGeometry args={[0.04, 0.018, 0.008]} />
        <meshStandardMaterial color="#111827" roughness={0.45} />
      </mesh>
      <mesh position={[0.1, 0.2, 0.236]}>
        <cylinderGeometry args={[0.005, 0.005, 0.008, 12]} />
        <meshStandardMaterial color="#22d3ee" emissive="#22d3ee" emissiveIntensity={0.55} />
      </mesh>

      {/* tempered glass — side + front */}
      <mesh position={[-0.136, 0.012, 0]}>
        <boxGeometry args={[0.005, 0.5, 0.42]} />
        <meshPhysicalMaterial
          color="#dbeafe"
          metalness={0}
          roughness={0.06}
          transmission={0.88}
          thickness={0.05}
          transparent
          opacity={0.22}
          ior={1.5}
          envMapIntensity={1.1}
        />
      </mesh>
      <mesh position={[-0.139, 0.012, 0]}>
        <boxGeometry args={[0.0014, 0.504, 0.424]} />
        <meshStandardMaterial color="#94a3b8" metalness={0.7} roughness={0.25} transparent opacity={0.18} />
      </mesh>
      <mesh position={[-0.02, 0.012, 0.23]}>
        <boxGeometry args={[0.18, 0.5, 0.0045]} />
        <meshPhysicalMaterial
          color="#e0f2fe"
          metalness={0}
          roughness={0.07}
          transmission={0.85}
          thickness={0.04}
          transparent
          opacity={0.2}
          ior={1.5}
        />
      </mesh>

      {[-0.11, 0.11].flatMap((x) =>
        [-0.18, 0.18].map((z) => (
          <mesh key={`${x}${z}`} position={[x, -0.282, z]}>
            <cylinderGeometry args={[0.011, 0.013, 0.014, 14]} />
            <meshStandardMaterial color="#1a1b22" roughness={0.6} />
          </mesh>
        )),
      )}
      <Screw position={[-0.12, 0.248, 0.2]} />
      <Screw position={[0.12, 0.248, 0.2]} />
      <Screw position={[-0.12, -0.236, 0.2]} />
      <Screw position={[0.12, -0.236, 0.2]} />

      {/* motherboard tray */}
      <mesh position={[0.078, 0.05, -0.04]}>
        <boxGeometry args={[0.008, 0.28, 0.32]} />
        <meshStandardMaterial color="#09090b" metalness={0.4} roughness={0.5} />
      </mesh>
      <mesh position={[0.03, 0.05, -0.05]}>
        <boxGeometry args={[0.09, 0.006, 0.28]} />
        <meshStandardMaterial map={pcb.albedo} roughnessMap={pcb.roughness} roughness={0.58} metalness={0.12} />
      </mesh>
      {/* PCB thickness edge */}
      <mesh position={[0.03, 0.046, -0.05]}>
        <boxGeometry args={[0.091, 0.002, 0.282]} />
        <meshStandardMaterial color="#0f172a" roughness={0.7} />
      </mesh>

      {/* rear I/O shroud */}
      <mesh position={[-0.01, 0.14, -0.188]}>
        <boxGeometry args={[0.07, 0.055, 0.028]} />
        <meshStandardMaterial map={metal} color="#1f2937" metalness={0.62} roughness={0.34} />
      </mesh>
      {[-0.02, 0, 0.02].map((x) => (
        <mesh key={x} position={[x, 0.138, -0.204]}>
          <boxGeometry args={[0.012, 0.01, 0.008]} />
          <meshStandardMaterial color="#111827" roughness={0.4} />
        </mesh>
      ))}

      {/* VRM heatsinks */}
      {[-0.04, -0.01, 0.02].map((z) => (
        <group key={z} position={[-0.008, 0.068, z - 0.12]}>
          <HeatsinkFins count={10} span={0.028} height={0.016} depth={0.018} />
        </group>
      ))}
      {/* chipset */}
      <mesh position={[0.04, 0.06, 0.02]}>
        <boxGeometry args={[0.028, 0.01, 0.032]} />
        <meshStandardMaterial color="#374151" metalness={0.7} roughness={0.28} />
      </mesh>
      {/* M.2 */}
      <mesh position={[-0.01, 0.056, 0.04]}>
        <boxGeometry args={[0.042, 0.006, 0.018]} />
        <meshStandardMaterial color="#4b5563" metalness={0.65} roughness={0.3} />
      </mesh>
      <Screw position={[-0.026, 0.061, 0.04]} />

      {/* 24-pin */}
      <mesh position={[0.055, 0.062, 0.06]}>
        <boxGeometry args={[0.018, 0.014, 0.028]} />
        <meshStandardMaterial color="#f8fafc" roughness={0.45} />
      </mesh>
      {/* EPS 8-pin */}
      <mesh position={[-0.008, 0.062, -0.16]}>
        <boxGeometry args={[0.012, 0.012, 0.016]} />
        <meshStandardMaterial color="#111827" roughness={0.42} />
      </mesh>

      {/* capacitors */}
      {Array.from({ length: 8 }, (_, i) => (
        <mesh key={i} position={[0.055, 0.062, -0.14 + i * 0.018]}>
          <cylinderGeometry args={[0.0034, 0.0034, 0.01, 10]} />
          <meshStandardMaterial color="#111827" metalness={0.5} roughness={0.35} />
        </mesh>
      ))}

      {/* CPU socket + AIO pump */}
      <mesh position={[0.02, 0.056, -0.1]}>
        <boxGeometry args={[0.038, 0.004, 0.038]} />
        <meshStandardMaterial color="#1e293b" metalness={0.4} roughness={0.45} />
      </mesh>
      <mesh position={[0.02, 0.062, -0.1]}>
        <boxGeometry args={[0.028, 0.004, 0.028]} />
        <meshStandardMaterial color="#64748b" metalness={0.7} roughness={0.25} />
      </mesh>
      <mesh position={[0.02, 0.09, -0.1]}>
        <cylinderGeometry args={[0.026, 0.028, 0.042, 24]} />
        <meshStandardMaterial color="#27272a" metalness={0.55} roughness={0.32} />
      </mesh>
      <mesh position={[0.02, 0.112, -0.1]}>
        <cylinderGeometry args={[0.018, 0.018, 0.006, 18]} />
        <meshStandardMaterial color="#c084fc" emissive="#c084fc" emissiveIntensity={0.55} roughness={0.28} />
      </mesh>
      <group position={[0.02, 0.092, -0.068]} rotation={[Math.PI / 2, 0, 0]}>
        <CoolingFan radius={0.026} speed={9.4} reduced={reduced} rgb="#c084fc" depth={0.014} />
      </group>
      {[-0.018, 0.018].flatMap((x) =>
        [-0.018, 0.018].map((z) => (
          <mesh key={`${x}${z}`} position={[0.02 + x, 0.07, -0.1 + z]}>
            <cylinderGeometry args={[0.0024, 0.0024, 0.018, 8]} />
            <meshStandardMaterial color="#9ca3af" metalness={0.75} roughness={0.3} />
          </mesh>
        )),
      )}

      {/* DIMM + RGB RAM */}
      {[-0.018, 0.0, 0.018, 0.036].map((z, i) => (
        <mesh key={z} position={[0.068, 0.062, -0.12 + z]}>
          <boxGeometry args={[0.008, 0.012, 0.01]} />
          <meshStandardMaterial color={i % 2 ? "#1e3a5f" : "#0f172a"} roughness={0.4} />
        </mesh>
      ))}
      {[0, 1].map((i) => (
        <group key={i} position={[0.072, 0.09, -0.12 + i * 0.036]}>
          <mesh>
            <boxGeometry args={[0.01, 0.052, 0.028]} />
            <meshStandardMaterial color="#e5e7eb" metalness={0.45} roughness={0.28} />
          </mesh>
          <mesh position={[0.0052, 0.004, 0]}>
            <boxGeometry args={[0.002, 0.04, 0.024]} />
            <meshPhysicalMaterial
              color={i ? "#c084fc" : "#22d3ee"}
              emissive={i ? "#c084fc" : "#22d3ee"}
              emissiveIntensity={0.85}
              roughness={0.2}
              transmission={0.35}
              thickness={0.01}
              transparent
              opacity={0.85}
            />
          </mesh>
          <mesh position={[-0.003, -0.02, 0]}>
            <boxGeometry args={[0.006, 0.012, 0.026]} />
            <meshStandardMaterial color="#14532d" roughness={0.55} metalness={0.1} />
          </mesh>
        </group>
      ))}

      {/* PCIe slot */}
      <mesh position={[0.02, 0.056, 0.055]}>
        <boxGeometry args={[0.09, 0.006, 0.012]} />
        <meshStandardMaterial color="#1e3a8a" roughness={0.4} />
      </mesh>

      {/* GPU */}
      <group position={[0.0, -0.01, 0.055]}>
        <mesh position={[0, 0.008, 0]}>
          <boxGeometry args={[0.2, 0.042, 0.1]} />
          <meshStandardMaterial map={metal} color="#2c2f38" metalness={0.52} roughness={0.38} />
        </mesh>
        <mesh position={[0, -0.016, 0]}>
          <boxGeometry args={[0.2, 0.006, 0.1]} />
          <meshStandardMaterial color="#27272a" metalness={0.7} roughness={0.28} />
        </mesh>
        <group position={[0.02, 0.02, 0]}>
          <HeatsinkFins count={22} span={0.16} height={0.028} depth={0.078} color="#9aa0ab" />
        </group>
        {[-0.062, 0, 0.062].map((z, i) => (
          <group key={z} position={[0.055, 0.03, z]} rotation={[Math.PI / 2, 0, 0]}>
            <CoolingFan radius={0.024} speed={10.4 + i} reduced={reduced} rgb={i === 1 ? "#c084fc" : "#22d3ee"} depth={0.012} />
          </group>
        ))}
        <mesh position={[-0.108, 0.004, 0.03]}>
          <boxGeometry args={[0.012, 0.048, 0.078]} />
          <meshStandardMaterial color="#d4d4d8" metalness={0.82} roughness={0.22} />
        </mesh>
        {/* gold fingers */}
        <mesh position={[0.01, -0.012, -0.056]}>
          <boxGeometry args={[0.08, 0.004, 0.008]} />
          <meshStandardMaterial color="#d4af37" metalness={0.9} roughness={0.18} />
        </mesh>
        {/* 8-pin */}
        <mesh position={[0.085, 0.01, 0.04]}>
          <boxGeometry args={[0.014, 0.012, 0.018]} />
          <meshStandardMaterial color="#0f172a" roughness={0.4} />
        </mesh>
        <mesh position={[0.085, 0.01, 0.058]}>
          <boxGeometry args={[0.014, 0.012, 0.018]} />
          <meshStandardMaterial color="#0f172a" roughness={0.4} />
        </mesh>
        <mesh position={[0.0, 0.03, 0.052]}>
          <boxGeometry args={[0.16, 0.004, 0.003]} />
          <meshStandardMaterial color="#22d3ee" emissive="#22d3ee" emissiveIntensity={0.55} roughness={0.25} />
        </mesh>
      </group>

      {/* top 240 AIO radiator */}
      <group position={[0.01, 0.238, -0.02]}>
        <mesh>
          <boxGeometry args={[0.22, 0.018, 0.11]} />
          <meshStandardMaterial color="#1f2937" metalness={0.5} roughness={0.4} />
        </mesh>
        <group position={[0, 0, 0]}>
          <HeatsinkFins count={28} span={0.2} height={0.014} depth={0.1} color="#6b7280" />
        </group>
        {/* Fans lie in XZ (axis +Y) on the radiator — not standing on edge. */}
        <group position={[-0.048, 0.02, 0]}>
          <CoolingFan radius={0.03} speed={8.2} reduced={reduced} depth={0.016} />
        </group>
        <group position={[0.048, 0.02, 0]}>
          <CoolingFan radius={0.03} speed={7.6} reduced={reduced} rgb="#c084fc" depth={0.016} />
        </group>
      </group>

      {/* AIO tubes pump → radiator */}
      <mesh geometry={CABLE_AIO_L}>
        <meshStandardMaterial color="#1f2937" roughness={0.72} metalness={0.08} />
      </mesh>
      <mesh geometry={CABLE_AIO_R}>
        <meshStandardMaterial color="#1f2937" roughness={0.72} metalness={0.08} />
      </mesh>

      {/* PSU shroud + PSU */}
      <mesh position={[0, -0.2, 0]}>
        <boxGeometry args={[0.24, 0.08, 0.4]} />
        <meshStandardMaterial map={metal} color="#32353e" metalness={0.5} roughness={0.42} />
      </mesh>
      <mesh position={[0.1, -0.2, -0.12]}>
        <boxGeometry args={[0.05, 0.07, 0.14]} />
        <meshStandardMaterial map={hex} color="#18181b" metalness={0.45} roughness={0.45} />
      </mesh>
      <mesh position={[0.12, -0.2, 0.16]}>
        <cylinderGeometry args={[0.028, 0.028, 0.01, 20]} />
        <meshStandardMaterial color="#111827" roughness={0.4} />
      </mesh>

      {/* intake / exhaust */}
      <group position={[-0.02, 0.08, 0.175]} rotation={[Math.PI / 2, 0, 0]}>
        <CoolingFan radius={0.046} speed={7.1} reduced={reduced} />
      </group>
      <group position={[-0.02, -0.07, 0.175]} rotation={[Math.PI / 2, 0, 0]}>
        <CoolingFan radius={0.046} speed={8} reduced={reduced} rgb="#c084fc" />
      </group>
      <group position={[0.02, 0.1, -0.2]} rotation={[Math.PI / 2, 0, 0]}>
        <CoolingFan radius={0.038} speed={-6.6} reduced={reduced} />
      </group>

      {/* sleeved cables */}
      <mesh geometry={CABLE_24}>
        <meshStandardMaterial color="#e5e7eb" roughness={0.72} metalness={0.08} />
      </mesh>
      <mesh geometry={CABLE_GPU}>
        <meshStandardMaterial color="#f97316" roughness={0.68} metalness={0.08} />
      </mesh>
      <mesh geometry={CABLE_EPS}>
        <meshStandardMaterial color="#111827" roughness={0.72} metalness={0.08} />
      </mesh>

      <pointLight position={[-0.04, 0.05, 0.04]} intensity={1.05} distance={0.95} color="#c084fc" />
      <pointLight position={[0.05, 0.0, 0.08]} intensity={0.55} distance={0.72} color="#22d3ee" />
      <pointLight position={[0.02, 0.1, -0.1]} intensity={0.35} distance={0.4} color="#a78bfa" />
    </group>
  );
}
