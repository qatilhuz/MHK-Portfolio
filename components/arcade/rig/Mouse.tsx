"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import type { MeshStandardMaterial } from "three";
import { hexPadAlbedo } from "./textures";

export function MousePad() {
  const hex = useMemo(() => hexPadAlbedo(), []);
  return (
    <mesh position={[0.34, 0.052, 0.28]} rotation={[-Math.PI / 2, 0, 0.08]} receiveShadow>
      <planeGeometry args={[0.34, 0.26]} />
      <meshStandardMaterial map={hex} roughness={0.9} metalness={0.03} />
    </mesh>
  );
}

export function Mouse({ reduced }: { reduced?: boolean }) {
  const led = useRef<MeshStandardMaterial>(null);

  useFrame((state) => {
    if (!led.current || reduced) return;
    led.current.emissiveIntensity = 0.4 + 0.3 * (0.5 + 0.5 * Math.sin(state.clock.elapsedTime * 1.5));
  });

  return (
    <group position={[0.34, 0.068, 0.27]} rotation={[0.06, -0.32, 0]} scale={1.2}>
      <mesh castShadow position={[0, 0.01, -0.01]} scale={[0.88, 0.58, 1.42]}>
        <sphereGeometry args={[0.033, 28, 20]} />
        <meshStandardMaterial color="#1c1d24" roughness={0.64} metalness={0.07} />
      </mesh>
      <mesh castShadow position={[0.001, 0.02, -0.022]} scale={[0.72, 0.5, 0.68]}>
        <sphereGeometry args={[0.032, 24, 18]} />
        <meshStandardMaterial color="#15161c" roughness={0.6} metalness={0.06} />
      </mesh>
      <mesh position={[0, 0.008, 0.02]} scale={[0.7, 0.34, 0.52]}>
        <sphereGeometry args={[0.03, 20, 16]} />
        <meshStandardMaterial color="#22232b" roughness={0.5} metalness={0.09} />
      </mesh>
      <mesh position={[-0.02, 0.002, -0.002]} scale={[0.32, 0.4, 0.9]} rotation={[0, 0, 0.42]}>
        <sphereGeometry args={[0.03, 18, 14]} />
        <meshStandardMaterial color="#101114" roughness={0.78} metalness={0.03} />
      </mesh>
      <mesh position={[-0.013, 0.017, 0.012]} rotation={[0.18, 0.02, -0.06]}>
        <boxGeometry args={[0.021, 0.0055, 0.034]} />
        <meshStandardMaterial color="#2a2b33" roughness={0.4} />
      </mesh>
      <mesh position={[0.013, 0.017, 0.012]} rotation={[0.18, -0.02, 0.06]}>
        <boxGeometry args={[0.021, 0.0055, 0.034]} />
        <meshStandardMaterial color="#2a2b33" roughness={0.4} />
      </mesh>
      <mesh position={[0, 0.021, 0.01]} rotation={[1.2, 0, 0]}>
        <cylinderGeometry args={[0.0062, 0.0062, 0.015, 20]} />
        <meshStandardMaterial color="#4b5563" metalness={0.42} roughness={0.28} />
      </mesh>
      {[0, 0.4, 0.8, 1.2].map((a) => (
        <mesh key={a} position={[0, 0.021, 0.01]} rotation={[1.2, a, 0]}>
          <boxGeometry args={[0.011, 0.001, 0.002]} />
          <meshStandardMaterial color="#9ca3af" metalness={0.5} roughness={0.25} />
        </mesh>
      ))}
      <mesh position={[-0.026, 0.006, 0.002]}>
        <boxGeometry args={[0.006, 0.011, 0.013]} />
        <meshStandardMaterial color="#111827" roughness={0.55} />
      </mesh>
      <mesh position={[-0.026, 0.006, -0.012]}>
        <boxGeometry args={[0.006, 0.01, 0.01]} />
        <meshStandardMaterial color="#111827" roughness={0.55} />
      </mesh>
      <mesh position={[0, -0.01, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.017, 0.0015, 8, 24]} />
        <meshStandardMaterial ref={led} color="#fb7185" emissive="#fb7185" emissiveIntensity={0.55} />
      </mesh>
      {[
        [-0.012, -0.016, 0.018],
        [0.012, -0.016, 0.018],
        [-0.012, -0.016, -0.022],
        [0.012, -0.016, -0.022],
      ].map((p) => (
        <mesh key={p.join(",")} position={p as [number, number, number]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.0042, 0.0042, 0.0014, 12]} />
          <meshStandardMaterial color="#e5e7eb" roughness={0.32} metalness={0.18} />
        </mesh>
      ))}
    </group>
  );
}
