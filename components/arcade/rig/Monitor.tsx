"use client";

import { useMemo, useRef } from "react";
import { Html } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { Color, ShaderMaterial } from "three";

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
  float wave = 0.5 + 0.5 * sin(uTime * 0.6 + p.x * 5.0 + p.y * 3.0);
  vec3 deep = vec3(0.02, 0.05, 0.12);
  vec3 cyan = vec3(0.07, 0.42, 0.72);
  vec3 mag = vec3(0.38, 0.14, 0.62);
  vec3 col = mix(deep, cyan, wave * (1.0 - abs(p.y) * 0.35));
  col = mix(col, mag, 0.25 + 0.25 * sin(uTime * 0.4 + p.y * 8.0));
  float scan = 0.92 + 0.08 * sin(vUv.y * 140.0 + uTime * 4.0);
  gl_FragColor = vec4(col * scan, 1.0);
}
`;

export function Monitor({
  onEnter,
  disabled,
  reduced,
}: {
  onEnter: () => void;
  disabled?: boolean;
  reduced?: boolean;
}) {
  const mat = useRef<ShaderMaterial>(null);
  const uniforms = useMemo(
    () => ({ uTime: { value: 0 } }),
    [],
  );

  useFrame((state) => {
    if (mat.current) mat.current.uniforms.uTime.value = reduced ? 0 : state.clock.elapsedTime;
  });

  return (
    <group position={[0.2, 0.4, -0.2]}>
      <mesh castShadow>
        <boxGeometry args={[0.78, 0.46, 0.028]} />
        <meshStandardMaterial color="#0c0d11" metalness={0.55} roughness={0.32} />
      </mesh>
      <mesh position={[0, 0, 0.016]}>
        <planeGeometry args={[0.72, 0.4]} />
        <shaderMaterial
          ref={mat}
          vertexShader={vertex}
          fragmentShader={fragment}
          uniforms={uniforms}
        />
      </mesh>
      <mesh position={[0, 0, 0.018]}>
        <planeGeometry args={[0.72, 0.4]} />
        <meshPhysicalMaterial
          color={new Color("#88c4ff")}
          transparent
          opacity={0.08}
          roughness={0.05}
          metalness={0}
          transmission={0.2}
        />
      </mesh>
      <mesh position={[0, -0.28, 0.02]}>
        <boxGeometry args={[0.05, 0.12, 0.03]} />
        <meshStandardMaterial color="#15161c" metalness={0.6} roughness={0.4} />
      </mesh>
      <mesh position={[0, -0.35, 0.04]} castShadow>
        <boxGeometry args={[0.22, 0.016, 0.12]} />
        <meshStandardMaterial color="#121318" metalness={0.5} roughness={0.45} />
      </mesh>
      <Html position={[0, -0.02, 0.03]} center transform occlude distanceFactor={1.15}>
        <div className="pointer-events-auto flex w-56 flex-col items-center gap-2 text-center">
          <p className="font-mono text-[0.55rem] uppercase tracking-[0.18em] text-sky-300">Dev Arcade</p>
          <button
            type="button"
            className="arcade-enter"
            onClick={onEnter}
            disabled={disabled}
          >
            Enter the Arcade
          </button>
        </div>
      </Html>
      <pointLight position={[0, 0, 0.2]} intensity={0.45} distance={1.4} color="#3b82f6" />
    </group>
  );
}
