"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import type { ShaderMaterial } from "three";

const vertex = `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

const fragment = `
uniform float uTime;
varying vec2 vUv;
void main() {
  vec2 p = vUv * 2.0 - 1.0;
  p.y *= 0.92;
  float d = length(p - vec2(0.02, 0.04));
  float ring = smoothstep(0.055, 0.02, abs(d - 0.34));
  float glow = exp(-d * 2.2);
  vec3 deep = vec3(0.05, 0.02, 0.12);
  vec3 mag = vec3(0.95, 0.18, 0.85);
  vec3 cyan = vec3(0.25, 0.55, 1.0);
  vec3 col = mix(deep, mag, glow * 0.85);
  col += cyan * ring * 1.15;
  col += mag * ring * 0.55;
  float floorLine = smoothstep(0.02, 0.0, abs(p.y + 0.55)) * (1.0 - abs(p.x));
  col += vec3(0.7, 0.25, 0.9) * floorLine * 0.35;
  float scan = 0.94 + 0.06 * sin(vUv.y * 90.0 + uTime * 3.0);
  float pulse = 0.85 + 0.15 * sin(uTime * 1.4);
  gl_FragColor = vec4(col * scan * pulse, 1.0);
}
`;

export function Monitor({ reduced }: { reduced?: boolean }) {
  const mat = useRef<ShaderMaterial>(null);
  const uniforms = useMemo(() => ({ uTime: { value: 0 } }), []);

  useFrame((state) => {
    if (mat.current) mat.current.uniforms.uTime.value = reduced ? 0 : state.clock.elapsedTime;
  });

  return (
    <group position={[0.02, 0.42, -0.16]}>
      <mesh castShadow>
        <boxGeometry args={[0.86, 0.5, 0.03]} />
        <meshStandardMaterial color="#111216" metalness={0.55} roughness={0.3} />
      </mesh>
      <mesh position={[0, 0.01, 0.0165]}>
        <planeGeometry args={[0.8, 0.44]} />
        <shaderMaterial ref={mat} vertexShader={vertex} fragmentShader={fragment} uniforms={uniforms} />
      </mesh>
      <mesh position={[0, -0.22, 0.0168]}>
        <planeGeometry args={[0.8, 0.028]} />
        <meshStandardMaterial color="#1b1c24" />
      </mesh>
      <mesh position={[0, -0.32, 0.01]}>
        <boxGeometry args={[0.06, 0.14, 0.04]} />
        <meshStandardMaterial color="#1a1b22" metalness={0.5} roughness={0.4} />
      </mesh>
      <mesh position={[0, -0.4, 0.04]} castShadow>
        <boxGeometry args={[0.26, 0.018, 0.14]} />
        <meshStandardMaterial color="#2a2b32" metalness={0.45} roughness={0.42} />
      </mesh>
      <pointLight position={[0, 0.05, 0.28]} intensity={0.55} distance={1.6} color="#c026d3" />
    </group>
  );
}

export function Speaker({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      <mesh castShadow>
        <boxGeometry args={[0.07, 0.12, 0.07]} />
        <meshStandardMaterial color="#121318" roughness={0.5} metalness={0.25} />
      </mesh>
      <mesh position={[0, 0.01, 0.036]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.018, 0.003, 8, 20]} />
        <meshStandardMaterial color="#22d3ee" emissive="#a855f7" emissiveIntensity={1.1} />
      </mesh>
    </group>
  );
}
