"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { RoundedBox } from "@react-three/drei";
import type { ShaderMaterial } from "three";
import { metalAlbedo } from "./textures";

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
  p.y *= 0.9;
  float d = length(p - vec2(0.0, 0.06));
  float ring = smoothstep(0.05, 0.018, abs(d - 0.36));
  float glow = exp(-d * 1.8);
  vec3 deep = vec3(0.04, 0.015, 0.1);
  vec3 mag = vec3(1.0, 0.16, 0.78);
  vec3 cyan = vec3(0.28, 0.62, 1.0);
  vec3 col = mix(deep, mag, glow * 0.9);
  col += cyan * ring * 1.2;
  col += mag * ring * 0.45;
  float floorLine = smoothstep(0.025, 0.0, abs(p.y + 0.58)) * (1.0 - abs(p.x));
  col += vec3(0.75, 0.22, 0.95) * floorLine * 0.4;
  float hud = step(0.86, vUv.x) * step(vUv.y, 0.22) * 0.12;
  col += vec3(0.4, 0.8, 1.0) * hud;
  float scan = 0.94 + 0.06 * sin(vUv.y * 110.0 + uTime * 3.2);
  float pulse = 0.88 + 0.12 * sin(uTime * 1.35);
  gl_FragColor = vec4(col * scan * pulse, 1.0);
}
`;

export function Monitor({ reduced }: { reduced?: boolean }) {
  const mat = useRef<ShaderMaterial>(null);
  const uniforms = useMemo(() => ({ uTime: { value: 0 } }), []);
  const metal = useMemo(() => metalAlbedo(), []);

  useFrame((state) => {
    if (mat.current) mat.current.uniforms.uTime.value = reduced ? 0 : state.clock.elapsedTime;
  });

  return (
    <group position={[0.02, 0.445, -0.16]}>
      <RoundedBox args={[0.96, 0.56, 0.032]} radius={0.007} smoothness={4} castShadow receiveShadow>
        <meshStandardMaterial map={metal} color="#474c59" metalness={0.66} roughness={0.26} />
      </RoundedBox>
      <mesh position={[0, 0.012, 0.0175]}>
        <planeGeometry args={[0.9, 0.5]} />
        <shaderMaterial ref={mat} vertexShader={vertex} fragmentShader={fragment} uniforms={uniforms} />
      </mesh>
      <mesh position={[0, 0.012, 0.019]}>
        <planeGeometry args={[0.9, 0.5]} />
        <meshPhysicalMaterial color="#9ecfff" transparent opacity={0.07} roughness={0.04} metalness={0} clearcoat={1} clearcoatRoughness={0.02} />
      </mesh>
      <RoundedBox args={[0.9, 0.5, 0.04]} radius={0.008} smoothness={4} position={[0, 0.01, -0.028]}>
        <meshStandardMaterial map={metal} color="#3c414d" metalness={0.55} roughness={0.4} />
      </RoundedBox>
      <mesh position={[0, -0.248, 0.0178]}>
        <planeGeometry args={[0.9, 0.03]} />
        <meshStandardMaterial color="#1e2129" />
      </mesh>
      <RoundedBox args={[0.07, 0.16, 0.045]} radius={0.007} smoothness={4} position={[0, -0.36, 0.01]} castShadow>
        <meshStandardMaterial map={metal} color="#474c59" metalness={0.58} roughness={0.36} />
      </RoundedBox>
      <RoundedBox args={[0.3, 0.02, 0.16]} radius={0.008} smoothness={4} position={[0, -0.445, 0.05]} castShadow>
        <meshStandardMaterial map={metal} color="#525763" metalness={0.52} roughness={0.38} />
      </RoundedBox>
      <pointLight position={[0, 0.04, 0.32]} intensity={0.6} distance={1.7} color="#c026d3" />
    </group>
  );
}
