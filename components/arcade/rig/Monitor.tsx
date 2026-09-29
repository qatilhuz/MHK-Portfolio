"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { RoundedBox, Text } from "@react-three/drei";
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
  p.y *= 0.82;
  float d = length(p - vec2(0.0, 0.04));
  float ring = smoothstep(0.055, 0.018, abs(d - 0.34));
  float glow = exp(-d * 1.65);
  vec3 deep = vec3(0.045, 0.012, 0.105);
  vec3 mag = vec3(1.0, 0.16, 0.82);
  vec3 cyan = vec3(0.20, 0.72, 1.0);
  vec3 col = mix(deep, mag, glow * 0.82);
  col += cyan * ring * 1.2;
  col += mag * ring * 0.55;
  float floorLine = smoothstep(0.026, 0.0, abs(p.y + 0.58)) * (1.0 - abs(p.x));
  col += vec3(0.75, 0.22, 0.95) * floorLine * 0.45;
  float hud = step(0.88, vUv.x) * step(vUv.y, 0.20) * 0.1;
  col += vec3(0.4, 0.8, 1.0) * hud;
  float scan = 0.93 + 0.07 * sin(vUv.y * 128.0 + uTime * 3.2);
  float pulse = 0.9 + 0.1 * sin(uTime * 1.35);
  gl_FragColor = vec4(col * scan * pulse, 1.0);
}
`;

function PortraitScreen({ side }: { side: -1 | 1 }) {
  const accent = side < 0 ? "#22d3ee" : "#c084fc";
  const secondary = side < 0 ? "#c084fc" : "#22d3ee";
  const warm = side < 0 ? "#67e8f9" : "#f0abfc";

  return (
    <group position={[side * 0.585, 0.02, 0.036]} rotation={[0, side * -0.18, 0]}>
      <mesh castShadow>
        <boxGeometry args={[0.315, 0.595, 0.034]} />
        <meshStandardMaterial color="#0c1019" metalness={0.58} roughness={0.3} />
      </mesh>
      <mesh position={[0, 0, 0.019]}>
        <planeGeometry args={[0.272, 0.535]} />
        <meshStandardMaterial color="#06101c" emissive="#041421" emissiveIntensity={0.48} roughness={0.2} />
      </mesh>
      <mesh position={[0, 0, 0.0205]}>
        <planeGeometry args={[0.272, 0.535]} />
        <meshPhysicalMaterial color="#d6f3ff" transparent opacity={0.055} roughness={0.04} metalness={0} />
      </mesh>
      {side < 0 ? (
        <>
          {[-0.084, 0.084].map((x, i) => (
            <mesh key={`gauge-${x}`} position={[x, 0.205, 0.0235]}>
              <circleGeometry args={[0.027, 28]} />
              <meshStandardMaterial color="#111827" emissive={i ? secondary : accent} emissiveIntensity={0.28} roughness={0.32} />
            </mesh>
          ))}
          {[0.12, 0.045, -0.03].map((y, row) => (
            <group key={`chart-${y}`} position={[0, y, 0.024]}>
              <mesh>
                <boxGeometry args={[0.218, 0.044, 0.003]} />
                <meshStandardMaterial color="#0f172a" emissive="#111827" emissiveIntensity={0.16} roughness={0.42} />
              </mesh>
              {[-0.076, -0.038, 0, 0.038, 0.076].map((x, i) => (
                <mesh key={x} position={[x, -0.014 + ((i + row) % 3) * 0.012, 0.003]}>
                  <boxGeometry args={[0.022, 0.004 + ((i + row) % 3) * 0.009, 0.003]} />
                  <meshStandardMaterial color={i % 2 ? secondary : accent} emissive={i % 2 ? secondary : accent} emissiveIntensity={0.48} roughness={0.3} />
                </mesh>
              ))}
            </group>
          ))}
          {[-0.112, -0.151, -0.19, -0.229].map((y, i) => (
            <mesh key={`left-row-${y}`} position={[-0.016, y, 0.024]}>
              <boxGeometry args={[0.18 - i * 0.022, 0.007, 0.003]} />
              <meshStandardMaterial color={i % 2 ? secondary : accent} emissive={i % 2 ? secondary : accent} emissiveIntensity={0.44} roughness={0.34} />
            </mesh>
          ))}
        </>
      ) : (
        <>
          {Array.from({ length: 10 }, (_, i) => {
            const y = 0.215 - i * 0.043;
            const isAccent = i === 1 || i === 5;
            return (
              <group key={`chat-${i}`} position={[0, y, 0.024]}>
                <mesh position={[-0.106, 0, 0]}>
                  <circleGeometry args={[0.0085, 14]} />
                  <meshStandardMaterial color={isAccent ? warm : "#334155"} emissive={isAccent ? warm : "#0f172a"} emissiveIntensity={0.34} roughness={0.3} />
                </mesh>
                <mesh position={[0.005, 0.006, 0]}>
                  <boxGeometry args={[0.17 - (i % 4) * 0.018, 0.005, 0.003]} />
                  <meshStandardMaterial color="#94a3b8" emissive="#22d3ee" emissiveIntensity={0.12} roughness={0.35} />
                </mesh>
                <mesh position={[-0.008, -0.008, 0]}>
                  <boxGeometry args={[0.14 - (i % 3) * 0.018, 0.004, 0.003]} />
                  <meshStandardMaterial color={i % 2 ? secondary : accent} emissive={i % 2 ? secondary : accent} emissiveIntensity={0.32} roughness={0.35} />
                </mesh>
              </group>
            );
          })}
        </>
      )}
      {[-0.104, 0.104].map((x) => (
        <mesh key={x} position={[x, -0.242, 0.024]}>
          <boxGeometry args={[0.048, 0.006, 0.003]} />
          <meshStandardMaterial color={x < 0 ? accent : secondary} emissive={x < 0 ? accent : secondary} emissiveIntensity={0.42} roughness={0.26} />
        </mesh>
      ))}
      <mesh position={[0, -0.306, 0.011]}>
        <boxGeometry args={[0.058, 0.15, 0.04]} />
        <meshStandardMaterial color="#151923" metalness={0.56} roughness={0.38} />
      </mesh>
    </group>
  );
}

function MonitorEnterButton({
  enabled,
  onEnter,
}: {
  enabled: boolean;
  onEnter: () => void;
}) {
  const [hovered, setHovered] = useState(false);
  const active = enabled;
  const accent = hovered && active ? "#f0abfc" : "#22d3ee";
  const secondary = hovered && active ? "#22d3ee" : "#c084fc";
  const emissive = hovered && active ? 1.35 : 0.78;

  useEffect(() => {
    if (!active || !hovered) {
      document.body.style.cursor = "";
      return;
    }
    document.body.style.cursor = "pointer";
    return () => {
      document.body.style.cursor = "";
    };
  }, [active, hovered]);

  return (
    <group
      position={[0, -0.11, 0.031]}
      scale={hovered && active ? [1.035, 1.035, 1] : [1, 1, 1]}
      onPointerOver={(event) => {
        event.stopPropagation();
        if (active) setHovered(true);
      }}
      onPointerOut={(event) => {
        event.stopPropagation();
        setHovered(false);
      }}
      onPointerDown={(event) => {
        event.stopPropagation();
      }}
      onClick={(event) => {
        event.stopPropagation();
        if (active) onEnter();
      }}
    >
      <RoundedBox args={[0.39, 0.078, 0.012]} radius={0.016} smoothness={5}>
        <meshStandardMaterial
          color={hovered && active ? "#28112d" : "#071521"}
          emissive={secondary}
          emissiveIntensity={hovered && active ? 0.44 : 0.22}
          roughness={0.28}
          metalness={0.18}
          transparent
          opacity={0.94}
        />
      </RoundedBox>
      <mesh position={[0, 0, 0.008]}>
        <planeGeometry args={[0.355, 0.052]} />
        <meshStandardMaterial
          color="#020617"
          emissive={accent}
          emissiveIntensity={hovered && active ? 0.28 : 0.12}
          transparent
          opacity={0.74}
          roughness={0.2}
        />
      </mesh>
      <mesh position={[0, 0.0415, 0.011]}>
        <boxGeometry args={[0.305, 0.004, 0.004]} />
        <meshStandardMaterial color={accent} emissive={accent} emissiveIntensity={emissive} roughness={0.18} />
      </mesh>
      <mesh position={[0, -0.0415, 0.011]}>
        <boxGeometry args={[0.305, 0.004, 0.004]} />
        <meshStandardMaterial color={secondary} emissive={secondary} emissiveIntensity={emissive} roughness={0.18} />
      </mesh>
      <Text
        position={[0, 0.006, 0.018]}
        fontSize={0.026}
        letterSpacing={0.07}
        anchorX="center"
        anchorY="middle"
        color="#f8fafc"
      >
        ENTER ARCADE
      </Text>
      <Text
        position={[0, -0.023, 0.018]}
        fontSize={0.0105}
        letterSpacing={0.18}
        anchorX="center"
        anchorY="middle"
        color={accent}
      >
        PRESS START
      </Text>
      <pointLight position={[0, 0, 0.08]} intensity={hovered && active ? 0.62 : 0.32} distance={0.5} color={accent} />
    </group>
  );
}

export function Monitor({
  reduced,
  enterEnabled,
  onEnter,
}: {
  reduced?: boolean;
  enterEnabled: boolean;
  onEnter: () => void;
}) {
  const mat = useRef<ShaderMaterial>(null);
  const uniforms = useMemo(() => ({ uTime: { value: 0 } }), []);
  const metal = useMemo(() => metalAlbedo(), []);

  useFrame((state) => {
    if (mat.current) mat.current.uniforms.uTime.value = reduced ? 0 : state.clock.elapsedTime;
  });

  return (
    <group position={[0.02, 0.43, -0.17]}>
      <group>
        <mesh castShadow>
          <boxGeometry args={[1.035, 0.43, 0.036]} />
          <meshStandardMaterial map={metal} color="#11131a" metalness={0.64} roughness={0.27} />
        </mesh>
        <mesh position={[0, 0.008, 0.019]}>
          <planeGeometry args={[0.972, 0.37]} />
          <shaderMaterial ref={mat} vertexShader={vertex} fragmentShader={fragment} uniforms={uniforms} />
        </mesh>
        <mesh position={[0, 0.008, 0.0205]}>
          <planeGeometry args={[0.972, 0.37]} />
          <meshPhysicalMaterial color="#d6f3ff" transparent opacity={0.075} roughness={0.035} metalness={0} />
        </mesh>
        <MonitorEnterButton enabled={enterEnabled} onEnter={onEnter} />
        <mesh position={[0, -0.215, 0.02]}>
          <planeGeometry args={[0.99, 0.018]} />
          <meshStandardMaterial color="#222631" metalness={0.28} roughness={0.42} />
        </mesh>
        <mesh position={[0, 0.006, -0.032]}>
          <boxGeometry args={[0.985, 0.38, 0.045]} />
          <meshStandardMaterial map={metal} color="#090b11" metalness={0.48} roughness={0.43} />
        </mesh>
      </group>

      <PortraitScreen side={-1} />
      <PortraitScreen side={1} />

      <mesh position={[0, -0.335, 0.012]}>
        <boxGeometry args={[0.085, 0.18, 0.048]} />
        <meshStandardMaterial map={metal} color="#171923" metalness={0.58} roughness={0.38} />
      </mesh>
      <mesh position={[0, -0.43, 0.05]} castShadow>
        <boxGeometry args={[0.34, 0.024, 0.16]} />
        <meshStandardMaterial map={metal} color="#242733" metalness={0.52} roughness={0.38} />
      </mesh>
      <pointLight position={[0, 0.04, 0.32]} intensity={0.82} distance={1.9} color="#c026d3" />
      <pointLight position={[-0.5, 0.03, 0.24]} intensity={0.35} distance={0.7} color="#22d3ee" />
      <pointLight position={[0.5, 0.03, 0.24]} intensity={0.28} distance={0.7} color="#c084fc" />
    </group>
  );
}
