"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { RoundedBox } from "@react-three/drei";
import { Color, MeshStandardMaterial, type Group } from "three";

/** Brand ARGB cycle — cyan → blue → purple → pink, like a premium fan controller. */
const FAN_RGB = [
  new Color("#22d3ee"),
  new Color("#3b82f6"),
  new Color("#a855f7"),
  new Color("#e879f9"),
  new Color("#22d3ee"),
];

function fanRgb(u: number, out: Color) {
  const t = ((u % 1) + 1) % 1;
  const s = t * (FAN_RGB.length - 1);
  const i = Math.floor(s);
  return out.lerpColors(FAN_RGB[i], FAN_RGB[Math.min(i + 1, FAN_RGB.length - 1)], s - i);
}

/**
 * Premium ARGB case fan (Lian-Li / Corsair class):
 * - square bevelled frame with rubber corner pads
 * - dual diffused LED rings (outer + inner)
 * - frosted semi-translucent blades that glow with the ring color
 * - machined hub with concentric detail + logo dot
 * - animated color cycle + breathing intensity (static under reduced motion)
 */
export function CoolingFan({
  radius = 0.046,
  speed = 8,
  reduced,
  rgb = "#22d3ee",
  depth = 0.018,
  frame = true,
}: {
  radius?: number;
  speed?: number;
  reduced?: boolean;
  rgb?: string;
  depth?: number;
  /** Square bezel frame — disable for GPUs / radiator layouts. */
  frame?: boolean;
}) {
  const spin = useRef<Group>(null);
  const ringOut = useRef<MeshStandardMaterial>(null);
  const ringIn = useRef<MeshStandardMaterial>(null);
  const hubLed = useRef<MeshStandardMaterial>(null);
  const staticColor = useMemo(() => new Color(rgb), [rgb]);
  const liveColor = useMemo(() => new Color(rgb), [rgb]);
  // frosted blade material shared by all nine blades
  const bladeMat = useMemo(
    () =>
      new MeshStandardMaterial({
        color: "#6d7484",
        emissive: new Color(rgb),
        emissiveIntensity: 0.2,
        metalness: 0.06,
        roughness: 0.42,
      }),
    [rgb],
  );
  // per-instance phase so fans never blink in unison
  const phase = useMemo(() => Math.abs(speed) * 0.17 + radius * 3.1, [speed, radius]);

  useFrame((state, delta) => {
    if (spin.current && !reduced) spin.current.rotation.y += delta * speed;
    if (reduced) return;
    const t = state.clock.elapsedTime;
    fanRgb(t * 0.06 + phase, liveColor);
    const pulse = 0.75 + 0.3 * Math.sin(t * 1.7 + phase);
    if (ringOut.current) {
      ringOut.current.emissive.copy(liveColor);
      ringOut.current.color.copy(liveColor);
      ringOut.current.emissiveIntensity = 1.05 * pulse;
    }
    if (ringIn.current) {
      ringIn.current.emissive.copy(liveColor);
      ringIn.current.color.copy(liveColor);
      ringIn.current.emissiveIntensity = 0.8 * pulse;
    }
    if (hubLed.current) {
      hubLed.current.emissive.copy(liveColor);
      hubLed.current.color.copy(liveColor);
      hubLed.current.emissiveIntensity = 0.6 * pulse;
    }
    bladeMat.emissive.copy(liveColor);
    bladeMat.emissiveIntensity = 0.22 * pulse;
  });

  const bladesCount = 9;
  const inner = radius * 0.9;
  const hubR = radius * 0.2;
  const bladeLen = inner - hubR - radius * 0.04;
  const housing = radius + 0.007;
  const frameHalf = housing + 0.007;
  const corner = housing + 0.0035;

  return (
    <group>
      {/* square bevelled frame — four bars, keeps the circular bore */}
      {frame ? (
      <>
      {[housing + 0.0035, -housing - 0.0035].map((z) => (
        <RoundedBox
          key={`h${z}`}
          args={[frameHalf * 2, depth + 0.006, 0.007]}
          radius={0.0022}
          smoothness={3}
          position={[0, 0, z]}
        >
          <meshStandardMaterial color="#2a2d36" metalness={0.3} roughness={0.55} />
        </RoundedBox>
      ))}
      {[housing + 0.0035, -housing - 0.0035].map((x) => (
        <RoundedBox
          key={`v${x}`}
          args={[0.007, depth + 0.006, frameHalf * 2 - 0.014]}
          radius={0.0022}
          smoothness={3}
          position={[x, 0, 0]}
        >
          <meshStandardMaterial color="#2a2d36" metalness={0.3} roughness={0.55} />
        </RoundedBox>
      ))}
      {/* rubber corner pads */}
      {([-1, 1] as const).flatMap((sx) =>
        ([-1, 1] as const).flatMap((sz) =>
          ([-1, 1] as const).map((sy) => (
            <mesh key={`${sx}${sz}${sy}`} position={[sx * corner, (sy * (depth + 0.006)) / 2, sz * corner]}>
              <cylinderGeometry args={[0.0055, 0.0055, 0.0018, 14]} />
              <meshStandardMaterial color="#181a20" roughness={0.92} metalness={0.02} />
            </mesh>
          )),
        ),
      )}
      </>
      ) : null}

      {/* circular housing */}
      <mesh>
        <cylinderGeometry args={[housing, housing, depth, 40, 1, true]} />
        <meshStandardMaterial color="#2f333c" metalness={0.38} roughness={0.46} />
      </mesh>
      <mesh>
        <cylinderGeometry args={[radius, radius, depth * 0.92, 36, 1, true]} />
        <meshStandardMaterial color="#24272f" metalness={0.32} roughness={0.5} />
      </mesh>

      {/* struts */}
      {[0, 1, 2, 3].map((i) => (
        <mesh key={i} rotation={[0, (i * Math.PI) / 2, 0]} position={[housing * 0.82, 0, 0]}>
          <boxGeometry args={[0.0055, depth * 0.65, 0.007]} />
          <meshStandardMaterial color="#4a4e58" metalness={0.45} roughness={0.4} />
        </mesh>
      ))}

      {/* DUAL diffused ARGB rings */}
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, -depth * 0.16, 0]}>
        <torusGeometry args={[radius * 0.96, 0.003, 12, 48]} />
        <meshStandardMaterial
          ref={ringOut}
          color={rgb}
          emissive={rgb}
          emissiveIntensity={1.0}
          roughness={0.24}
          metalness={0.1}
        />
      </mesh>
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, depth * 0.1, 0]}>
        <torusGeometry args={[radius * 0.8, 0.0024, 12, 44]} />
        <meshStandardMaterial
          ref={ringIn}
          color={rgb}
          emissive={rgb}
          emissiveIntensity={0.8}
          roughness={0.26}
          metalness={0.1}
        />
      </mesh>

      {/* hub — machined cap + logo dot */}
      <mesh>
        <cylinderGeometry args={[hubR, hubR * 1.05, depth * 0.85, 24]} />
        <meshStandardMaterial color="#2a2d35" metalness={0.55} roughness={0.32} />
      </mesh>
      <mesh position={[0, depth * 0.34, 0]}>
        <cylinderGeometry args={[hubR * 0.72, hubR * 0.72, 0.0024, 24]} />
        <meshStandardMaterial color="#3a3f4a" metalness={0.7} roughness={0.28} />
      </mesh>
      <mesh position={[0, depth * 0.35, 0]}>
        <cylinderGeometry args={[hubR * 0.4, hubR * 0.4, 0.0026, 20]} />
        <meshStandardMaterial ref={hubLed} color={rgb} emissive={rgb} emissiveIntensity={0.6} roughness={0.3} />
      </mesh>

      {/* frosted glowing blades */}
      <group ref={spin}>
        {Array.from({ length: bladesCount }, (_, i) => {
          const a = (i / bladesCount) * Math.PI * 2;
          return (
            <group key={i} rotation={[0, a, 0]}>
              <mesh position={[hubR + bladeLen * 0.5, 0, 0]} rotation={[0.5, 0, 0]} material={bladeMat}>
                <boxGeometry args={[bladeLen, 0.0016, radius * 0.17]} />
              </mesh>
            </group>
          );
        })}
      </group>
      {/* static fallback color for reduced motion */}
      {reduced ? (
        <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, -depth * 0.16, 0]}>
          <torusGeometry args={[radius * 0.96, 0.003, 8, 40]} />
          <meshStandardMaterial color={staticColor.getStyle()} emissive={staticColor.getStyle()} emissiveIntensity={0.9} roughness={0.24} />
        </mesh>
      ) : null}
    </group>
  );
}
