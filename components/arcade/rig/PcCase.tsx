"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { RoundedBox } from "@react-three/drei";
import {
  CatmullRomCurve3,
  Color,
  TubeGeometry,
  Vector3,
  type MeshPhysicalMaterial,
  type MeshStandardMaterial,
} from "three";
import { PC_POS, PC_YAW } from "@/lib/arcade/layout";
import { CoolingFan } from "./CoolingFan";
import { braidAlbedo } from "./textures";
import { pcBrushedMetal, pcHexMesh, pcPcbMaps } from "./pcTextures";

function makeCable(pts: [number, number, number][], radius: number) {
  const curve = new CatmullRomCurve3(pts.map((p) => new Vector3(...p)));
  return new TubeGeometry(curve, 32, radius, 10, false);
}

const CABLE_AIO_L = makeCable(
  [
    [0.008, 0.112, -0.1],
    [-0.04, 0.16, -0.08],
    [-0.05, 0.21, -0.05],
    [-0.04, 0.238, -0.04],
  ],
  0.0058,
);
const CABLE_AIO_R = makeCable(
  [
    [0.032, 0.112, -0.1],
    [0.06, 0.16, -0.07],
    [0.07, 0.21, -0.04],
    [0.06, 0.238, 0.0],
  ],
  0.0058,
);
const CABLE_24 = makeCable(
  [
    [0.055, 0.055, 0.06],
    [0.08, 0.02, 0.08],
    [0.09, -0.12, 0.1],
    [0.06, -0.16, 0.08],
  ],
  0.0048,
);
const CABLE_GPU = makeCable(
  [
    [0.08, 0.0275, 0.095],
    [0.098, -0.02, 0.1],
    [0.08, -0.14, 0.1],
    [0.04, -0.16, 0.06],
  ],
  0.0044,
);
const CABLE_EPS = makeCable(
  [
    [-0.008, 0.056, -0.16],
    [-0.06, 0.04, -0.14],
    [-0.08, -0.1, -0.1],
    [-0.04, -0.16, -0.06],
  ],
  0.0038,
);

function Screw({ position }: { position: [number, number, number] }) {
  return (
    <mesh position={position}>
      <cylinderGeometry args={[0.0032, 0.0032, 0.004, 12]} />
      <meshStandardMaterial color="#7d8492" metalness={0.85} roughness={0.26} />
    </mesh>
  );
}

function HeatsinkFins({
  count,
  span,
  height,
  depth,
  color = "#8f96a2",
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
          <meshStandardMaterial color={color} metalness={0.85} roughness={0.2} />
        </mesh>
      ))}
    </>
  );
}

/** Shared brand ARGB palette cycle (cyan → blue → purple → pink). */
const CYCLE = ["#22d3ee", "#3b82f6", "#a855f7", "#e879f9", "#22d3ee"].map((c) => new Color(c));
const WHITE = new Color("#ffffff");

function paletteRgb(u: number, out: Color) {
  const t = ((u % 1) + 1) % 1;
  const s = t * (CYCLE.length - 1);
  const i = Math.floor(s);
  return out.lerpColors(CYCLE[i], CYCLE[Math.min(i + 1, CYCLE.length - 1)], s - i);
}

/** One DDR5 module: brushed metal spreader + frosted ARGB diffuser cap. */
function RamModule({
  position,
  phase = 0,
  reduced,
}: {
  position: [number, number, number];
  phase?: number;
  reduced?: boolean;
}) {
  const spreader = useMemo(() => pcBrushedMetal(), []);
  const capMat = useRef<MeshPhysicalMaterial>(null);
  useFrame((state) => {
    const m = capMat.current;
    if (!m) return;
    if (reduced) return;
    const t = state.clock.elapsedTime;
    paletteRgb(t * 0.11 + phase, m.emissive);
    m.color.copy(m.emissive).lerp(WHITE, 0.35);
    m.emissiveIntensity = 1.5 * (0.82 + 0.26 * Math.sin(t * 1.5 + phase * 7));
  });
  return (
    <group position={position}>
      {/* PCB tongue into the slot */}
      <mesh position={[-0.001, -0.03, 0]}>
        <boxGeometry args={[0.0035, 0.016, 0.0275]} />
        <meshStandardMaterial color="#17533a" roughness={0.55} metalness={0.12} />
      </mesh>
      {/* aluminium heat spreader */}
      <RoundedBox args={[0.01, 0.05, 0.027]} radius={0.0022} smoothness={3} castShadow>
        <meshStandardMaterial map={spreader} color="#c2c7d1" metalness={0.85} roughness={0.3} />
      </RoundedBox>
      {/* chamfered top plate */}
      <mesh position={[0, 0.0255, 0]}>
        <boxGeometry args={[0.0108, 0.007, 0.0272]} />
        <meshStandardMaterial color="#aab0bc" metalness={0.88} roughness={0.24} />
      </mesh>
      {/* spreader side grooves */}
      {[-0.009, 0, 0.009].map((dz) => (
        <mesh key={dz} position={[0.0052, -0.004, dz]}>
          <boxGeometry args={[0.0014, 0.034, 0.0035]} />
          <meshStandardMaterial color="#8f95a1" metalness={0.7} roughness={0.42} />
        </mesh>
      ))}
      {/* frosted translucent RGB diffuser cap */}
      <RoundedBox args={[0.0112, 0.009, 0.0278]} radius={0.0038} smoothness={4} position={[0, 0.0305, 0]}>
        <meshPhysicalMaterial
          ref={capMat}
          color="#22d3ee"
          emissive="#22d3ee"
          emissiveIntensity={0.9}
          roughness={0.3}
          metalness={0}
        />
      </RoundedBox>
    </group>
  );
}

/** AIO CPU block: brushed body + infinity-mirror nested LED rings. */
function AioPump({
  position,
  reduced,
}: {
  position: [number, number, number];
  reduced?: boolean;
}) {
  const ringA = useRef<MeshStandardMaterial>(null);
  const ringB = useRef<MeshStandardMaterial>(null);
  const ringC = useRef<MeshStandardMaterial>(null);
  const ringSide = useRef<MeshStandardMaterial>(null);
  useFrame((state) => {
    if (reduced) return;
    const t = state.clock.elapsedTime;
    const pa = 0.9 + 0.4 * Math.sin(t * 1.9);
    const pb = 0.85 + 0.4 * Math.sin(t * 1.9 + 1.6);
    const pc = 0.8 + 0.4 * Math.sin(t * 1.9 + 3.2);
    if (ringA.current) {
      paletteRgb(t * 0.09, ringA.current.emissive);
      ringA.current.color.copy(ringA.current.emissive);
      ringA.current.emissiveIntensity = 1.25 * pa;
    }
    if (ringB.current) {
      paletteRgb(t * 0.09 + 0.16, ringB.current.emissive);
      ringB.current.color.copy(ringB.current.emissive);
      ringB.current.emissiveIntensity = 1.0 * pb;
    }
    if (ringC.current) {
      paletteRgb(t * 0.09 + 0.34, ringC.current.emissive);
      ringC.current.color.copy(ringC.current.emissive);
      ringC.current.emissiveIntensity = 0.9 * pc;
    }
    if (ringSide.current) {
      paletteRgb(t * 0.09 + 0.5, ringSide.current.emissive);
      ringSide.current.color.copy(ringSide.current.emissive);
      ringSide.current.emissiveIntensity = 1.15 * pa;
    }
  });
  return (
    <group position={position}>
      {/* cylindrical pump body */}
      <mesh position={[0, -0.021, 0]}>
        <cylinderGeometry args={[0.026, 0.028, 0.042, 44]} />
        <meshStandardMaterial color="#2c3038" metalness={0.6} roughness={0.3} />
      </mesh>
      {/* brushed collar */}
      <mesh position={[0, 0.0008, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.0185, 0.0022, 12, 48]} />
        <meshStandardMaterial color="#8a919e" metalness={0.9} roughness={0.3} />
      </mesh>
      {/* side LED ring around the body — reads through the glass */}
      <mesh position={[0, -0.014, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.0272, 0.0012, 10, 56]} />
        <meshStandardMaterial ref={ringSide} color="#22d3ee" emissive="#22d3ee" emissiveIntensity={1.15} roughness={0.3} />
      </mesh>
      {/* glossy black mirror window */}
      <mesh position={[0, 0.001, 0]}>
        <cylinderGeometry args={[0.0178, 0.0178, 0.0035, 40]} />
        <meshPhysicalMaterial color="#0c0e13" metalness={0.4} roughness={0.1} clearcoat={1} clearcoatRoughness={0.06} />
      </mesh>
      {/* nested LED rings — infinity-mirror illusion */}
      <mesh position={[0, 0.0032, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.0152, 0.00105, 10, 48]} />
        <meshStandardMaterial ref={ringA} color="#22d3ee" emissive="#22d3ee" emissiveIntensity={1.25} roughness={0.3} />
      </mesh>
      <mesh position={[0, 0.0042, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.011, 0.0009, 10, 44]} />
        <meshStandardMaterial ref={ringB} color="#a855f7" emissive="#a855f7" emissiveIntensity={1} roughness={0.3} />
      </mesh>
      <mesh position={[0, 0.0052, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.0068, 0.0008, 10, 40]} />
        <meshStandardMaterial ref={ringC} color="#e879f9" emissive="#e879f9" emissiveIntensity={0.9} roughness={0.3} />
      </mesh>
      {/* center logo pip */}
      <mesh position={[0, 0.0062, 0]}>
        <cylinderGeometry args={[0.0024, 0.0024, 0.0016, 20]} />
        <meshStandardMaterial color="#f4f6ff" emissive="#dbe4ff" emissiveIntensity={0.5} roughness={0.25} metalness={0.5} />
      </mesh>
    </group>
  );
}

/** Realistic tempered glass — clear body, blue-grey attenuation, clearcoat. */
function TemperedGlass({
  args,
  position,
}: {
  args: [number, number, number];
  position: [number, number, number];
}) {
  return (
    <mesh position={position}>
      <boxGeometry args={args} />
      <meshPhysicalMaterial
        color="#e9f1fc"
        metalness={0}
        roughness={0.035}
        transmission={0.93}
        thickness={0.055}
        ior={1.52}
        attenuationColor="#c2d5ee"
        attenuationDistance={0.62}
        clearcoat={1}
        clearcoatRoughness={0.04}
        specularIntensity={1}
        envMapIntensity={1.2}
      />
    </mesh>
  );
}

export function PcCase({ reduced }: { reduced?: boolean }) {
  const metal = useMemo(() => pcBrushedMetal(), []);
  const hex = useMemo(() => pcHexMesh(), []);
  const pcb = useMemo(() => pcPcbMaps(), []);
  const braid = useMemo(() => {
    const t = braidAlbedo();
    t.repeat.set(7, 1.5);
    return t;
  }, []);

  return (
    <group position={PC_POS} rotation={[0, PC_YAW, 0]}>
      {/* ── chassis frame: bevelled gunmetal rails ─────────────────── */}
      <RoundedBox args={[0.28, 0.036, 0.46]} radius={0.008} smoothness={4} position={[0, -0.258, 0]} castShadow receiveShadow>
        <meshStandardMaterial map={metal} color="#474d59" metalness={0.46} roughness={0.34} />
      </RoundedBox>
      <RoundedBox args={[0.28, 0.028, 0.46]} radius={0.006} smoothness={4} position={[0, 0.262, 0]} castShadow>
        <meshStandardMaterial map={metal} color="#474d59" metalness={0.46} roughness={0.34} />
      </RoundedBox>
      <RoundedBox args={[0.016, 0.54, 0.46]} radius={0.005} smoothness={4} position={[0.134, 0.01, 0]} castShadow>
        <meshStandardMaterial map={metal} color="#3c414d" metalness={0.48} roughness={0.38} />
      </RoundedBox>
      {/* hex mesh rear panel */}
      <RoundedBox args={[0.26, 0.52, 0.016]} radius={0.005} smoothness={4} position={[0, 0.01, -0.224]}>
        <meshStandardMaterial map={hex} color="#474d59" metalness={0.4} roughness={0.48} />
      </RoundedBox>
      {/* front pillar beside glass */}
      <RoundedBox args={[0.06, 0.46, 0.012]} radius={0.004} smoothness={4} position={[0.1, 0.04, 0.228]}>
        <meshStandardMaterial map={metal} color="#535966" metalness={0.45} roughness={0.44} />
      </RoundedBox>

      {/* front I/O — dual USB + power */}
      <mesh position={[0.1, 0.222, 0.236]}>
        <boxGeometry args={[0.034, 0.012, 0.008]} />
        <meshStandardMaterial color="#1e2129" roughness={0.5} />
      </mesh>
      {[0.093, 0.107].map((x) => (
        <mesh key={x} position={[x, 0.2215, 0.2405]}>
          <boxGeometry args={[0.009, 0.004, 0.002]} />
          <meshStandardMaterial color="#4f8dc9" roughness={0.45} />
        </mesh>
      ))}
      <mesh position={[0.1, 0.2, 0.236]}>
        <cylinderGeometry args={[0.005, 0.005, 0.008, 16]} />
        <meshStandardMaterial color="#22d3ee" emissive="#22d3ee" emissiveIntensity={0.55} />
      </mesh>

      {/* ── tempered glass: side + front ───────────────────────────── */}
      <TemperedGlass args={[0.005, 0.5, 0.42]} position={[-0.136, 0.012, 0]} />
      {/* glass edge tint (lamination read on the pane edge) */}
      <mesh position={[-0.139, 0.012, 0]}>
        <boxGeometry args={[0.0014, 0.504, 0.424]} />
        <meshStandardMaterial color="#8fb4cf" metalness={0.6} roughness={0.22} transparent opacity={0.14} />
      </mesh>
      <TemperedGlass args={[0.18, 0.5, 0.0045]} position={[-0.02, 0.012, 0.23]} />

      {/* tempered-glass mounting thumb screws */}
      {[-0.225, 0.245].flatMap((y) =>
        [0.195, -0.195].map((z) => (
          <mesh key={`gs${y}${z}`} position={[-0.14, y, z]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.0052, 0.0052, 0.007, 16]} />
            <meshStandardMaterial color="#868da0" metalness={0.9} roughness={0.22} />
          </mesh>
        )),
      )}
      {[-0.225, 0.245].flatMap((y) =>
        [-0.09, 0.05].map((x) => (
          <mesh key={`fs${y}${x}`} position={[x, y, 0.234]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.0052, 0.0052, 0.007, 16]} />
            <meshStandardMaterial color="#868da0" metalness={0.9} roughness={0.22} />
          </mesh>
        )),
      )}

      {/* feet */}
      {[-0.11, 0.11].flatMap((x) =>
        [-0.18, 0.18].map((z) => (
          <mesh key={`${x}${z}`} position={[x, -0.282, z]}>
            <cylinderGeometry args={[0.011, 0.013, 0.014, 18]} />
            <meshStandardMaterial color="#23262d" roughness={0.65} />
          </mesh>
        )),
      )}
      <Screw position={[-0.12, 0.248, 0.2]} />
      <Screw position={[0.12, 0.248, 0.2]} />
      <Screw position={[-0.12, -0.236, 0.2]} />
      <Screw position={[0.12, -0.236, 0.2]} />

      {/* ── motherboard tray + standoffs ───────────────────────────── */}
      <mesh position={[0.078, 0.05, -0.04]} receiveShadow>
        <boxGeometry args={[0.008, 0.28, 0.32]} />
        <meshStandardMaterial color="#1b1e25" metalness={0.45} roughness={0.5} />
      </mesh>
      <mesh position={[0.03, 0.05, -0.05]} receiveShadow>
        <boxGeometry args={[0.09, 0.006, 0.28]} />
        <meshStandardMaterial map={pcb.albedo} roughnessMap={pcb.roughness} roughness={0.58} metalness={0.12} />
      </mesh>
      {/* board-mount micro components: ICs + CMOS cell */}
      {[
        [-0.005, 0.1],
        [0.04, 0.1],
        [0.055, -0.02],
        [-0.01, -0.14],
        [0.03, 0.14],
      ].map(([x, z]) => (
        <mesh key={`ic-${x}${z}`} position={[x, 0.055, z]}>
          <boxGeometry args={[0.012, 0.004, 0.012]} />
          <meshStandardMaterial color="#1e2129" metalness={0.35} roughness={0.5} />
        </mesh>
      ))}
      <mesh position={[0.01, 0.057, -0.16]} rotation={[0, 0, 0]}>
        <cylinderGeometry args={[0.007, 0.007, 0.004, 24]} />
        <meshStandardMaterial color="#c8ccd4" metalness={0.85} roughness={0.25} />
      </mesh>
      {/* PCB thickness edge */}
      <mesh position={[0.03, 0.046, -0.05]}>
        <boxGeometry args={[0.091, 0.002, 0.282]} />
        <meshStandardMaterial color="#1a2733" roughness={0.68} />
      </mesh>

      {/* rear I/O shroud */}
      <RoundedBox args={[0.07, 0.055, 0.028]} radius={0.005} smoothness={4} position={[-0.01, 0.14, -0.188]} castShadow>
        <meshStandardMaterial map={metal} color="#333945" metalness={0.5} roughness={0.38} />
      </RoundedBox>
      {[-0.02, 0, 0.02].map((x) => (
        <mesh key={x} position={[x, 0.138, -0.204]}>
          <boxGeometry args={[0.012, 0.01, 0.008]} />
          <meshStandardMaterial color="#1e2129" roughness={0.45} />
        </mesh>
      ))}

      {/* VRM heatsinks with dense fins */}
      {[-0.04, -0.01, 0.02].map((z) => (
        <group key={z} position={[-0.008, 0.068, z - 0.12]}>
          <HeatsinkFins count={12} span={0.03} height={0.017} depth={0.018} />
        </group>
      ))}
      {/* chipset with micro-fin cap */}
      <mesh position={[0.04, 0.06, 0.02]} castShadow>
        <boxGeometry args={[0.028, 0.01, 0.032]} />
        <meshStandardMaterial color="#414856" metalness={0.72} roughness={0.26} />
      </mesh>
      <group position={[0.04, 0.068, 0.02]}>
        <HeatsinkFins count={7} span={0.024} height={0.006} depth={0.03} color="#9aa1ad" />
      </group>
      {/* M.2 with ridged heatsink */}
      <mesh position={[-0.01, 0.056, 0.04]}>
        <boxGeometry args={[0.042, 0.006, 0.018]} />
        <meshStandardMaterial color="#525a68" metalness={0.68} roughness={0.28} />
      </mesh>
      {[0, 1, 2, 3, 4].map((i) => (
        <mesh key={i} position={[-0.026 + i * 0.008, 0.06, 0.04]}>
          <boxGeometry args={[0.004, 0.003, 0.016]} />
          <meshStandardMaterial color="#6b7382" metalness={0.75} roughness={0.24} />
        </mesh>
      ))}
      <Screw position={[-0.026, 0.061, 0.04]} />

      {/* 24-pin + EPS headers */}
      <mesh position={[0.055, 0.062, 0.06]}>
        <boxGeometry args={[0.018, 0.014, 0.028]} />
        <meshStandardMaterial color="#e8ebf0" roughness={0.45} />
      </mesh>
      <mesh position={[-0.008, 0.062, -0.16]}>
        <boxGeometry args={[0.012, 0.012, 0.016]} />
        <meshStandardMaterial color="#1e2129" roughness={0.42} />
      </mesh>

      {/* solid capacitors */}
      {Array.from({ length: 8 }, (_, i) => (
        <mesh key={i} position={[0.055, 0.062, -0.14 + i * 0.018]}>
          <cylinderGeometry args={[0.0034, 0.0034, 0.01, 14]} />
          <meshStandardMaterial color="#2a2e37" metalness={0.55} roughness={0.32} />
        </mesh>
      ))}

      {/* ── power delivery: chokes + top VRM bank ────────────────────── */}
      {[0.01, 0.024, 0.038, 0.052].map((x) => (
        <mesh key={`ch-${x}`} position={[x, 0.058, -0.168]}>
          <boxGeometry args={[0.009, 0.008, 0.008]} />
          <meshStandardMaterial color="#4d5361" metalness={0.5} roughness={0.45} />
        </mesh>
      ))}
      <group position={[0.036, 0.066, -0.152]}>
        <HeatsinkFins count={11} span={0.044} height={0.014} depth={0.018} color="#949ba7" />
      </group>
      {/* angular I/O cover with accent light line */}
      <RoundedBox args={[0.075, 0.02, 0.03]} radius={0.005} smoothness={4} position={[-0.008, 0.078, -0.18]} castShadow>
        <meshStandardMaterial map={metal} color="#343a47" metalness={0.55} roughness={0.36} />
      </RoundedBox>
      <mesh position={[-0.008, 0.0885, -0.1745]}>
        <boxGeometry args={[0.07, 0.0018, 0.006]} />
        <meshStandardMaterial color="#22d3ee" emissive="#22d3ee" emissiveIntensity={0.7} roughness={0.3} />
      </mesh>
      {/* Q-LED debug indicator */}
      <mesh position={[0.066, 0.0565, -0.02]}>
        <boxGeometry args={[0.007, 0.0022, 0.005]} />
        <meshStandardMaterial color="#ff5f5f" emissive="#ff4545" emissiveIntensity={0.9} roughness={0.35} />
      </mesh>

      {/* ── CPU socket + AIO pump block ────────────────────────────── */}
      <mesh position={[0.02, 0.056, -0.1]}>
        <boxGeometry args={[0.038, 0.004, 0.038]} />
        <meshStandardMaterial color="#272c36" metalness={0.45} roughness={0.45} />
      </mesh>
      <mesh position={[0.02, 0.062, -0.1]}>
        <boxGeometry args={[0.028, 0.004, 0.028]} />
        <meshStandardMaterial color="#6d7684" metalness={0.75} roughness={0.24} />
      </mesh>
      <AioPump position={[0.02, 0.1115, -0.1]} reduced={reduced} />
      {/* chipset fan facing the side glass (clears the RAM sightline) */}
      <group position={[0.04, 0.086, 0.02]} rotation={[0, 0, Math.PI / 2]}>
        <CoolingFan radius={0.026} speed={9.4} reduced={reduced} rgb="#c084fc" depth={0.014} frame={false} />
      </group>
      {[-0.018, 0.018].flatMap((x) =>
        [-0.018, 0.018].map((z) => (
          <mesh key={`${x}${z}`} position={[0.02 + x, 0.07, -0.1 + z]}>
            <cylinderGeometry args={[0.0024, 0.0024, 0.018, 10]} />
            <meshStandardMaterial color="#a7aeba" metalness={0.8} roughness={0.28} />
          </mesh>
        )),
      )}

      {/* ── DIMM slots + 4× ARGB memory modules ──────────────────────── */}
      {[-0.018, 0.0, 0.018, 0.036].map((z, i) => (
        <mesh key={z} position={[0.068, 0.062, -0.12 + z]}>
          <boxGeometry args={[0.008, 0.012, 0.01]} />
          <meshStandardMaterial color={i % 2 ? "#243a56" : "#1c2434"} roughness={0.4} />
        </mesh>
      ))}
      {[-0.138, -0.12, -0.102, -0.084].map((z, i) => (
        <RamModule key={z} position={[0.072, 0.09, z]} phase={i * 0.13} reduced={reduced} />
      ))}

      {/* PCIe slot */}
      <mesh position={[0.02, 0.056, 0.055]}>
        <boxGeometry args={[0.09, 0.006, 0.012]} />
        <meshStandardMaterial color="#24407c" roughness={0.4} />
      </mesh>

      {/* ── GPU: flagship triple-fan cooler ─────────────────────────── */}
      <group position={[0.0, -0.01, 0.055]}>
        {/* premium brushed backplate */}
        <RoundedBox args={[0.2, 0.008, 0.1]} radius={0.003} smoothness={3} position={[0, -0.0175, 0]} receiveShadow>
          <meshStandardMaterial map={metal} color="#454b57" metalness={0.6} roughness={0.34} />
        </RoundedBox>
        {/* backplate vent windows */}
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <mesh key={i} position={[-0.062 + i * 0.025, -0.0216, 0]}>
            <boxGeometry args={[0.015, 0.0014, 0.058]} />
            <meshStandardMaterial color="#1a1d24" roughness={0.6} />
          </mesh>
        ))}
        {/* heat-pipe pass-throughs on the backplate */}
        {[-0.03, 0.012, 0.05].map((z) => (
          <mesh key={`bhp-${z}`} position={[0.076, -0.0216, z]}>
            <cylinderGeometry args={[0.005, 0.005, 0.0016, 16]} />
            <meshStandardMaterial color="#b57a4c" metalness={0.85} roughness={0.35} />
          </mesh>
        ))}
        {/* dense fin stack visible through the side window */}
        <group position={[0.02, 0.0005, 0]}>
          <HeatsinkFins count={30} span={0.17} height={0.03} depth={0.064} color="#a8aeb9" />
        </group>
        {/* lower + upper side rails — the gap between them is the fin window */}
        {[0.046, -0.046].map((z) => (
          <RoundedBox key={`rl${z}`} args={[0.2, 0.009, 0.012]} radius={0.003} smoothness={3} position={[0, -0.0075, z]}>
            <meshStandardMaterial map={metal} color="#424855" metalness={0.5} roughness={0.38} />
          </RoundedBox>
        ))}
        {[0.046, -0.046].map((z) => (
          <RoundedBox key={`ru${z}`} args={[0.2, 0.008, 0.012]} radius={0.0025} smoothness={3} position={[0, 0.0125, z]}>
            <meshStandardMaterial map={metal} color="#424855" metalness={0.5} roughness={0.38} />
          </RoundedBox>
        ))}
        {/* shroud top plate */}
        <RoundedBox args={[0.2, 0.015, 0.1]} radius={0.005} smoothness={4} position={[0, 0.026, 0]} castShadow receiveShadow>
          <meshStandardMaterial map={metal} color="#424855" metalness={0.5} roughness={0.38} />
        </RoundedBox>
        {/* RGB light channels along the top plate edges */}
        {[0.047, -0.047].map((z) => (
          <group key={`rg${z}`} position={[0, 0.034, z]}>
            <mesh>
              <boxGeometry args={[0.186, 0.005, 0.0065]} />
              <meshPhysicalMaterial color="#e6ecfa" roughness={0.32} transmission={0.35} thickness={0.004} metalness={0} />
            </mesh>
            <mesh>
              <boxGeometry args={[0.176, 0.003, 0.003]} />
              <meshStandardMaterial
                color={z > 0 ? "#22d3ee" : "#a855f7"}
                emissive={z > 0 ? "#22d3ee" : "#a855f7"}
                emissiveIntensity={0.85}
                roughness={0.3}
              />
            </mesh>
          </group>
        ))}
        {/* fan cutout rims */}
        {[-0.066, 0, 0.066].map((x) => (
          <mesh key={`rim${x}`} position={[x, 0.0337, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[0.0295, 0.0012, 8, 48]} />
            <meshStandardMaterial color="#2a2d36" metalness={0.4} roughness={0.5} />
          </mesh>
        ))}
        {/* three axial fans flush on the cooler top — visible through glass */}
        {[-0.066, 0, 0.066].map((x, i) => (
          <group key={x} position={[x, 0.0345, 0]}>
            <CoolingFan radius={0.026} speed={10.4 + i} reduced={reduced} rgb={i === 1 ? "#c084fc" : "#22d3ee"} depth={0.013} frame={false} />
          </group>
        ))}
        {/* end-cap heatpipe tips */}
        {[-0.028, 0, 0.028].map((z) => (
          <mesh key={`hp-${z}`} position={[-0.104, -0.002, z]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.0055, 0.0055, 0.01, 18]} />
            <meshStandardMaterial color="#c98d5a" metalness={0.88} roughness={0.3} />
          </mesh>
        ))}
        {/* I/O bracket with illuminated side logo strip */}
        <mesh position={[-0.108, 0.004, 0.03]}>
          <boxGeometry args={[0.012, 0.048, 0.078]} />
          <meshStandardMaterial color="#d6dae1" metalness={0.85} roughness={0.2} />
        </mesh>
        <mesh position={[-0.1148, 0.004, 0.028]}>
          <boxGeometry args={[0.0016, 0.006, 0.056]} />
          <meshStandardMaterial color="#22d3ee" emissive="#22d3ee" emissiveIntensity={0.8} roughness={0.3} />
        </mesh>
        {/* gold fingers */}
        <mesh position={[0.01, -0.012, -0.056]}>
          <boxGeometry args={[0.08, 0.004, 0.008]} />
          <meshStandardMaterial color="#d4af37" metalness={0.92} roughness={0.16} />
        </mesh>
        {/* dual 8-pin power on the top edge */}
        <mesh position={[0.08, 0.0375, 0.04]}>
          <boxGeometry args={[0.016, 0.011, 0.019]} />
          <meshStandardMaterial color="#1a1d24" roughness={0.42} />
        </mesh>
        <mesh position={[0.08, 0.0375, -0.042]}>
          <boxGeometry args={[0.016, 0.011, 0.019]} />
          <meshStandardMaterial color="#1a1d24" roughness={0.42} />
        </mesh>
      </group>

      {/* ── top 240 mm AIO radiator ─────────────────────────────────── */}
      <group position={[0.01, 0.238, -0.02]}>
        <RoundedBox args={[0.22, 0.018, 0.11]} radius={0.004} smoothness={4} castShadow>
          <meshStandardMaterial color="#282d37" metalness={0.52} roughness={0.4} />
        </RoundedBox>
        <HeatsinkFins count={30} span={0.2} height={0.014} depth={0.1} color="#767d8a" />
        {/* fans lie flat in XZ, mounted under the radiator */}
        <group position={[-0.048, -0.016, 0]}>
          <CoolingFan radius={0.03} speed={8.2} reduced={reduced} depth={0.016} />
        </group>
        <group position={[0.048, -0.016, 0]}>
          <CoolingFan radius={0.03} speed={7.6} reduced={reduced} rgb="#c084fc" depth={0.016} />
        </group>
      </group>

      {/* AIO tubes pump → radiator (braided sleeve) */}
      <mesh geometry={CABLE_AIO_L}>
        <meshStandardMaterial map={braid} color="#b9c0cc" roughness={0.72} metalness={0.12} />
      </mesh>
      <mesh geometry={CABLE_AIO_R}>
        <meshStandardMaterial map={braid} color="#b9c0cc" roughness={0.72} metalness={0.12} />
      </mesh>
      {/* compression fittings where the tubes enter the radiator */}
      {[
        [0.065, -0.022],
        [-0.046, -0.045],
      ].map(([x, z]) => (
        <group key={`fit${x}`} position={[x, 0.226, z]}>
          <mesh>
            <cylinderGeometry args={[0.008, 0.008, 0.014, 18]} />
            <meshStandardMaterial color="#8b919d" metalness={0.85} roughness={0.3} />
          </mesh>
          <mesh position={[0, -0.008, 0]}>
            <cylinderGeometry args={[0.0088, 0.0088, 0.003, 18]} />
            <meshStandardMaterial color="#6d737f" metalness={0.8} roughness={0.4} />
          </mesh>
        </group>
      ))}

      {/* PSU shroud + PSU */}
      <RoundedBox args={[0.24, 0.08, 0.4]} radius={0.008} smoothness={4} position={[0, -0.2, 0]} castShadow receiveShadow>
        <meshStandardMaterial map={metal} color="#3f444f" metalness={0.42} roughness={0.46} />
      </RoundedBox>
      <RoundedBox args={[0.05, 0.07, 0.14]} radius={0.005} smoothness={4} position={[0.1, -0.2, -0.12]}>
        <meshStandardMaterial map={hex} color="#2b2f38" metalness={0.4} roughness={0.48} />
      </RoundedBox>
      <mesh position={[0.12, -0.2, 0.16]}>
        <cylinderGeometry args={[0.028, 0.028, 0.01, 24]} />
        <meshStandardMaterial color="#1e2129" roughness={0.42} />
      </mesh>
      {/* grommet pass-throughs on the shroud top */}
      {[-0.01, 0.06].map((z) => (
        <RoundedBox key={`gm${z}`} args={[0.014, 0.005, 0.052]} radius={0.002} smoothness={3} position={[0.078, -0.1575, z]}>
          <meshStandardMaterial color="#15171c" roughness={0.9} metalness={0.05} />
        </RoundedBox>
      ))}
      {/* honeycomb vent section on the shroud top */}
      <mesh position={[-0.04, -0.1595, 0.06]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[0.1, 0.12]} />
        <meshStandardMaterial map={hex} color="#2b2f38" metalness={0.4} roughness={0.5} />
      </mesh>
      {/* RGB edge strip along the glass side of the shroud */}
      <mesh position={[-0.1213, -0.157, 0]}>
        <boxGeometry args={[0.004, 0.0075, 0.375]} />
        <meshPhysicalMaterial color="#e8eeff" roughness={0.32} transmission={0.35} thickness={0.004} metalness={0} />
      </mesh>
      <mesh position={[-0.1213, -0.157, 0]}>
        <boxGeometry args={[0.002, 0.0036, 0.365]} />
        <meshStandardMaterial color="#22d3ee" emissive="#22d3ee" emissiveIntensity={0.75} roughness={0.3} />
      </mesh>

      {/* intake / exhaust fans */}
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
        <meshStandardMaterial color="#dfe3ea" roughness={0.74} metalness={0.06} />
      </mesh>
      <mesh geometry={CABLE_GPU}>
        <meshStandardMaterial color="#e07a3a" roughness={0.7} metalness={0.06} />
      </mesh>
      <mesh geometry={CABLE_EPS}>
        <meshStandardMaterial color="#26292f" roughness={0.74} metalness={0.06} />
      </mesh>

      {/* ── internal RGB: soft believable wash over the hardware ───── */}
      <pointLight position={[-0.04, 0.05, 0.04]} intensity={0.85} distance={1.05} decay={1.7} color="#c084fc" />
      <pointLight position={[0.05, 0.0, 0.08]} intensity={0.42} distance={0.85} decay={1.7} color="#22d3ee" />
      <pointLight position={[0.02, 0.1, -0.1]} intensity={0.26} distance={0.5} decay={1.7} color="#a78bfa" />
      {/* neutral top fill so internals read against the glass */}
      <pointLight position={[-0.06, 0.18, 0.06]} intensity={0.32} distance={1.05} decay={1.8} color="#dfe7ff" />
      {/* dedicated light for the memory bank */}
      <pointLight position={[0.05, 0.13, -0.1]} intensity={0.2} distance={0.42} decay={1.7} color="#e8f0ff" />
    </group>
  );
}
