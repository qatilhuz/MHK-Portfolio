"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { RoundedBox } from "@react-three/drei";
import { CanvasTexture, Color, RepeatWrapping, SRGBColorSpace, type MeshStandardMaterial, type PointLight } from "three";

const RGB_STOPS = [
  new Color("#22d3ee"),
  new Color("#3b82f6"),
  new Color("#a855f7"),
  new Color("#e879f9"),
  new Color("#22d3ee"),
];

function speakerConeMap() {
  const size = 1024;
  const node = document.createElement("canvas");
  node.width = size;
  node.height = size;
  const ctx = node.getContext("2d");
  if (!ctx) throw new Error("2d");
  const g = ctx.createRadialGradient(size / 2, size / 2, 20, size / 2, size / 2, size / 2);
  g.addColorStop(0, "#3a3d46");
  g.addColorStop(0.35, "#252830");
  g.addColorStop(0.72, "#1a1c22");
  g.addColorStop(1, "#121318");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, size, size);
  ctx.strokeStyle = "rgba(90,96,110,0.28)";
  ctx.lineWidth = 1.2;
  for (let r = 40; r < 500; r += 18) {
    ctx.beginPath();
    ctx.arc(size / 2, size / 2, r, 0, Math.PI * 2);
    ctx.stroke();
  }
  const tex = new CanvasTexture(node);
  tex.colorSpace = SRGBColorSpace;
  tex.anisotropy = 8;
  tex.wrapS = RepeatWrapping;
  tex.wrapT = RepeatWrapping;
  tex.needsUpdate = true;
  return tex;
}

function rgbAt(t: number, out: Color) {
  const u = ((t % 1) + 1) % 1;
  const scaled = u * (RGB_STOPS.length - 1);
  const i = Math.floor(scaled);
  return out.lerpColors(RGB_STOPS[i], RGB_STOPS[i + 1], scaled - i);
}

export function Speaker({ position }: { position: [number, number, number] }) {
  const cone = useMemo(() => speakerConeMap(), []);
  const ringMat = useRef<MeshStandardMaterial>(null);
  const stripMat = useRef<MeshStandardMaterial>(null);
  const glowA = useRef<PointLight>(null);
  const glowB = useRef<PointLight>(null);
  const color = useMemo(() => new Color(), []);

  useFrame((state) => {
    rgbAt(state.clock.elapsedTime * 0.12, color);
    if (ringMat.current) {
      ringMat.current.emissive.copy(color);
      ringMat.current.color.copy(color);
      ringMat.current.emissiveIntensity = 0.85 + 0.2 * Math.sin(state.clock.elapsedTime * 1.1);
    }
    if (stripMat.current) {
      stripMat.current.emissive.copy(color);
      stripMat.current.emissiveIntensity = 0.55 + 0.15 * Math.sin(state.clock.elapsedTime * 1.1);
    }
    if (glowA.current) {
      glowA.current.color.copy(color);
      glowA.current.intensity = 0.38 + 0.1 * Math.sin(state.clock.elapsedTime * 1.1);
    }
    if (glowB.current) {
      glowB.current.color.copy(color);
      glowB.current.intensity = 0.16;
    }
  });

  return (
    <group position={position}>
      <RoundedBox args={[0.086, 0.168, 0.096]} radius={0.008} smoothness={4} castShadow>
        <meshStandardMaterial color="#3a3d46" roughness={0.62} metalness={0.14} />
      </RoundedBox>
      <mesh position={[0.043, 0, 0]}>
        <boxGeometry args={[0.002, 0.15, 0.08]} />
        <meshStandardMaterial color="#4a4e58" roughness={0.4} metalness={0.2} />
      </mesh>
      <mesh position={[0, 0, 0.046]}>
        <boxGeometry args={[0.078, 0.156, 0.008]} />
        <meshStandardMaterial color="#2c2f38" roughness={0.48} metalness={0.22} />
      </mesh>
      {[-0.032, 0.032].map((x) =>
        [-0.068, 0.068].map((y) => (
          <mesh key={`${x}${y}`} position={[x, y, 0.05]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.0022, 0.0022, 0.003, 8]} />
            <meshStandardMaterial color="#6b7280" metalness={0.7} roughness={0.3} />
          </mesh>
        )),
      )}
      {/*
        Front of cabinet is +Z. TorusGeometry already lives in XY (hole along Z),
        so rings must NOT be rotated 90° — that put them edge-on, half in / half out.
        Cones/cylinders default along Y, so they take +X 90° to aim down +Z.
      */}
      <group position={[0, 0.018, 0.05]}>
        <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0, -0.004]}>
          <cylinderGeometry args={[0.034, 0.034, 0.008, 36]} />
          <meshStandardMaterial color="#1c1e24" roughness={0.7} />
        </mesh>
        <mesh position={[0, 0, -0.001]}>
          <torusGeometry args={[0.03, 0.0024, 10, 36]} />
          <meshStandardMaterial color="#5b6170" metalness={0.55} roughness={0.32} />
        </mesh>
        <mesh position={[0, 0, 0]}>
          <torusGeometry args={[0.024, 0.0044, 12, 36]} />
          <meshStandardMaterial color="#1a1b20" roughness={0.88} metalness={0.02} />
        </mesh>
        {/* RGB channel nested in the surround inner lip — XY torus, hole +Z */}
        <mesh position={[0, 0, -0.0008]}>
          <torusGeometry args={[0.0206, 0.0016, 12, 48]} />
          <meshStandardMaterial
            ref={ringMat}
            color="#22d3ee"
            emissive="#22d3ee"
            emissiveIntensity={0.95}
            roughness={0.2}
            metalness={0.08}
            transparent
            opacity={0.9}
          />
        </mesh>
        <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0, -0.005]}>
          <coneGeometry args={[0.019, 0.01, 36]} />
          <meshStandardMaterial map={cone} color="#2a2d35" roughness={0.68} metalness={0.08} />
        </mesh>
        <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0, -0.002]}>
          <coneGeometry args={[0.01, 0.005, 24]} />
          <meshStandardMaterial color="#3a3d46" roughness={0.5} metalness={0.12} />
        </mesh>
        <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0, 0.001]}>
          <sphereGeometry args={[0.0062, 18, 12, 0, Math.PI * 2, 0, Math.PI / 2]} />
          <meshStandardMaterial color="#4a4e58" roughness={0.38} metalness={0.28} />
        </mesh>
        <pointLight ref={glowA} position={[0, 0, -0.018]} distance={0.2} intensity={0.32} color="#22d3ee" />
      </group>

      <group position={[0, -0.052, 0.051]}>
        <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0, -0.002]}>
          <cylinderGeometry args={[0.016, 0.016, 0.005, 24]} />
          <meshStandardMaterial color="#1c1e24" roughness={0.65} />
        </mesh>
        <mesh>
          <torusGeometry args={[0.011, 0.0022, 8, 24]} />
          <meshStandardMaterial color="#4b5160" metalness={0.45} roughness={0.35} />
        </mesh>
        <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0, -0.001]}>
          <coneGeometry args={[0.0075, 0.004, 20]} />
          <meshStandardMaterial color="#2a2d35" roughness={0.48} />
        </mesh>
        <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0, 0.001]}>
          <sphereGeometry args={[0.0034, 12, 10, 0, Math.PI * 2, 0, Math.PI / 2]} />
          <meshStandardMaterial color="#6b7280" metalness={0.4} roughness={0.3} />
        </mesh>
      </group>

      {/* bottom light strip — flush in the plinth, not floating */}
      <mesh position={[0, -0.082, 0.04]}>
        <boxGeometry args={[0.062, 0.003, 0.006]} />
        <meshStandardMaterial ref={stripMat} color="#22d3ee" emissive="#22d3ee" emissiveIntensity={0.6} roughness={0.25} />
      </mesh>
      <pointLight ref={glowB} position={[0, -0.09, 0.02]} distance={0.2} intensity={0.16} color="#22d3ee" />

      <mesh position={[0, -0.09, 0]}>
        <boxGeometry args={[0.088, 0.012, 0.098]} />
        <meshStandardMaterial color="#2a2d35" roughness={0.78} />
      </mesh>
      {[-0.028, 0.028].map((x) =>
        [-0.03, 0.03].map((z) => (
          <mesh key={`${x}${z}`} position={[x, -0.099, z]}>
            <cylinderGeometry args={[0.006, 0.007, 0.008, 12]} />
            <meshStandardMaterial color="#1c1e24" roughness={0.82} />
          </mesh>
        )),
      )}
    </group>
  );
}
