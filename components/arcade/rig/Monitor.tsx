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

const sideFragment = `
uniform float uTime;
uniform float uSide;
varying vec2 vUv;
void main() {
  vec2 p = vUv * 2.0 - 1.0;
  float vignette = smoothstep(1.42, 0.18, length(p));
  float scan = 0.94 + 0.06 * sin((vUv.y + uTime * 0.035) * 190.0);
  float drift = 0.5 + 0.5 * sin(uTime * 0.38 + p.y * 2.2 + uSide * 1.1);
  vec3 base = mix(vec3(0.012, 0.019, 0.033), vec3(0.025, 0.014, 0.045), vUv.y);
  vec3 cyan = vec3(0.10, 0.72, 1.0);
  vec3 magenta = vec3(0.92, 0.24, 1.0);
  float sideGlow = smoothstep(0.72, 0.05, abs(p.x - (uSide * -0.42))) * 0.16;
  float topGlow = smoothstep(1.0, 0.1, 1.0 - vUv.y) * 0.12;
  vec3 accent = mix(cyan, magenta, drift);
  vec3 col = base + accent * (sideGlow + topGlow) * vignette;
  col *= scan;
  gl_FragColor = vec4(col, 1.0);
}
`;

function PortraitScreen({ side, reduced }: { side: -1 | 1; reduced?: boolean }) {
  const oled = useRef<ShaderMaterial>(null);
  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uSide: { value: side },
    }),
    [side],
  );
  const accent = side < 0 ? "#22d3ee" : "#c084fc";
  const secondary = side < 0 ? "#c084fc" : "#22d3ee";
  const warm = side < 0 ? "#67e8f9" : "#f0abfc";
  const chartRows = side < 0 ? [0.175, 0.095, 0.015] : [0.165, 0.09, 0.015, -0.06];

  useFrame((state) => {
    if (oled.current) oled.current.uniforms.uTime.value = reduced ? 0 : state.clock.elapsedTime;
  });

  return (
    <group position={[side * 0.706, 0.024, 0.056]} rotation={[0, side * -0.37, 0]}>
      {/* Invisible-mounted flagship side OLED: rear shell, micro edge, emissive display, and reflective glass only. */}
      <RoundedBox args={[0.334, 0.622, 0.024]} radius={0.013} smoothness={8} position={[0, 0, 0]} castShadow>
        <meshStandardMaterial color="#080c13" metalness={0.38} roughness={0.46} />
      </RoundedBox>
      <RoundedBox args={[0.124, 0.152, 0.008]} radius={0.006} smoothness={5} position={[0, 0.012, -0.018]} castShadow>
        <meshStandardMaterial color="#05070c" metalness={0.78} roughness={0.26} />
      </RoundedBox>
      {[
        [-0.041, 0.052],
        [0.041, 0.052],
        [-0.041, -0.028],
        [0.041, -0.028],
      ].map(([x, y]) => (
        <mesh key={`rear-vesa-${x}-${y}`} position={[x, y, -0.023]}>
          <circleGeometry args={[0.006, 18]} />
          <meshStandardMaterial color="#111827" metalness={0.82} roughness={0.2} />
        </mesh>
      ))}
      <RoundedBox args={[0.326, 0.612, 0.012]} radius={0.011} smoothness={8} position={[0, 0, 0.013]}>
        <meshStandardMaterial color="#020611" emissive="#020b16" emissiveIntensity={0.42} roughness={0.24} metalness={0.08} />
      </RoundedBox>
      <mesh position={[0, 0, 0.0205]}>
        <planeGeometry args={[0.316, 0.592]} />
        <shaderMaterial ref={oled} vertexShader={vertex} fragmentShader={sideFragment} uniforms={uniforms} />
      </mesh>
      <mesh position={[0, 0, 0.031]}>
        <planeGeometry args={[0.318, 0.594]} />
        <meshPhysicalMaterial
          color="#e0f2fe"
          transmission={0.82}
          thickness={0.025}
          ior={1.52}
          transparent
          opacity={0.16}
          roughness={0.01}
          metalness={0}
          clearcoat={1}
          clearcoatRoughness={0.045}
          envMapIntensity={1.8}
        />
      </mesh>
      {[
        [0, 0.302, 0.0265, 0.3, 0.0032],
        [0, -0.302, 0.0265, 0.3, 0.0032],
        [-0.162, 0, 0.0265, 0.0032, 0.58],
        [0.162, 0, 0.0265, 0.0032, 0.58],
      ].map(([x, y, z, w, h], index) => (
        <mesh key={`micro-edge-${index}`} position={[x, y, z]}>
          <boxGeometry args={[w, h, 0.0025]} />
          <meshStandardMaterial
            color="#101827"
            emissive={index % 2 ? secondary : accent}
            emissiveIntensity={0.12}
            metalness={0.6}
            roughness={0.18}
          />
        </mesh>
      ))}
      <mesh position={[-0.102, 0.266, 0.029]}>
        <boxGeometry args={[0.09, 0.005, 0.002]} />
        <meshStandardMaterial color={accent} emissive={accent} emissiveIntensity={0.36} roughness={0.28} />
      </mesh>
      <mesh position={[0.066, 0.266, 0.029]}>
        <boxGeometry args={[0.118, 0.004, 0.002]} />
        <meshStandardMaterial color="#94a3b8" emissive="#38bdf8" emissiveIntensity={0.1} roughness={0.32} />
      </mesh>
      {side < 0 ? (
        <>
          {[-0.086, 0.0, 0.086].map((x, i) => (
            <group key={`dial-${x}`} position={[x, 0.218, 0.029]}>
              <mesh>
                <ringGeometry args={[0.018, 0.023, 32]} />
                <meshStandardMaterial color={i % 2 ? secondary : accent} emissive={i % 2 ? secondary : accent} emissiveIntensity={0.44} roughness={0.22} />
              </mesh>
              <mesh position={[0.006, 0.004, 0.001]} rotation={[0, 0, i * 0.7]}>
                <boxGeometry args={[0.018, 0.002, 0.002]} />
                <meshStandardMaterial color="#f8fafc" emissive="#f8fafc" emissiveIntensity={0.18} roughness={0.3} />
              </mesh>
            </group>
          ))}
          {chartRows.map((y, row) => (
            <group key={`pro-chart-${y}`} position={[0, y - 0.01, 0.029]}>
              <mesh>
                <boxGeometry args={[0.246, 0.046, 0.002]} />
                <meshStandardMaterial color="#08111d" emissive="#0f172a" emissiveIntensity={0.14} transparent opacity={0.82} roughness={0.38} />
              </mesh>
              {Array.from({ length: 7 }, (_, i) => (
                <mesh key={i} position={[-0.09 + i * 0.03, -0.014 + ((i + row) % 4) * 0.009, 0.002]}>
                  <boxGeometry args={[0.016, 0.004 + ((i + row) % 4) * 0.0065, 0.002]} />
                  <meshStandardMaterial color={i % 2 ? secondary : accent} emissive={i % 2 ? secondary : accent} emissiveIntensity={0.42} roughness={0.3} />
                </mesh>
              ))}
            </group>
          ))}
          {[-0.155, -0.192, -0.229, -0.266].map((y, i) => (
            <mesh key={`telemetry-${y}`} position={[-0.015, y, 0.029]}>
              <boxGeometry args={[0.22 - i * 0.026, 0.0055, 0.002]} />
              <meshStandardMaterial color={i % 2 ? secondary : accent} emissive={i % 2 ? secondary : accent} emissiveIntensity={0.36} roughness={0.34} />
            </mesh>
          ))}
        </>
      ) : (
        <>
          {Array.from({ length: 11 }, (_, i) => {
            const y = 0.216 - i * 0.0415;
            const isAccent = i === 1 || i === 5 || i === 8;
            return (
              <group key={`message-${i}`} position={[0, y, 0.029]}>
                <mesh position={[-0.112, 0, 0]}>
                  <circleGeometry args={[0.008, 18]} />
                  <meshStandardMaterial color={isAccent ? warm : "#334155"} emissive={isAccent ? warm : "#0f172a"} emissiveIntensity={0.36} roughness={0.3} />
                </mesh>
                <mesh position={[0.006, 0.006, 0]}>
                  <boxGeometry args={[0.178 - (i % 4) * 0.017, 0.0045, 0.002]} />
                  <meshStandardMaterial color="#a8b3c5" emissive="#22d3ee" emissiveIntensity={0.1} roughness={0.35} />
                </mesh>
                <mesh position={[-0.006, -0.008, 0]}>
                  <boxGeometry args={[0.142 - (i % 3) * 0.018, 0.0038, 0.002]} />
                  <meshStandardMaterial color={i % 2 ? secondary : accent} emissive={i % 2 ? secondary : accent} emissiveIntensity={0.29} roughness={0.35} />
                </mesh>
              </group>
            );
          })}
        </>
      )}
      <mesh position={[-0.055, -0.276, 0.029]}>
        <boxGeometry args={[0.17, 0.005, 0.002]} />
        <meshStandardMaterial color={accent} emissive={accent} emissiveIntensity={0.34} roughness={0.26} />
      </mesh>
      <mesh position={[0.095, -0.276, 0.029]}>
        <boxGeometry args={[0.068, 0.005, 0.002]} />
        <meshStandardMaterial color={secondary} emissive={secondary} emissiveIntensity={0.34} roughness={0.26} />
      </mesh>
      <pointLight position={[0, 0.02, 0.11]} intensity={0.2} distance={0.44} color={accent} />
    </group>
  );
}
function MountRod({
  position,
  rotation,
  length,
  radius = 0.011,
}: {
  position: [number, number, number];
  rotation?: [number, number, number];
  length: number;
  radius?: number;
}) {
  return (
    <mesh position={position} rotation={rotation} castShadow receiveShadow>
      <cylinderGeometry args={[radius, radius, length, 32]} />
      <meshStandardMaterial color="#05070b" metalness={0.86} roughness={0.2} envMapIntensity={1.2} />
    </mesh>
  );
}

function MountClamp({ position, scale = 1 }: { position: [number, number, number]; scale?: number }) {
  return (
    <group position={position} scale={scale}>
      <RoundedBox args={[0.086, 0.058, 0.032]} radius={0.01} smoothness={5} castShadow receiveShadow>
        <meshStandardMaterial color="#06080d" metalness={0.82} roughness={0.22} />
      </RoundedBox>
      <mesh position={[0, 0, 0.019]}>
        <boxGeometry args={[0.058, 0.034, 0.004]} />
        <meshStandardMaterial color="#151923" metalness={0.72} roughness={0.18} />
      </mesh>
      {[-0.021, 0.021].map((x) => (
        <mesh key={x} position={[x, 0, 0.022]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.004, 0.004, 0.004, 16]} />
          <meshStandardMaterial color="#2f3542" metalness={0.9} roughness={0.18} />
        </mesh>
      ))}
    </group>
  );
}

function TripleMonitorMount() {
  return (
    <group>
      {/* Single heavy-duty black triple-monitor arm. All rods sit behind the display glass/back shells. */}
      <MountRod position={[0, -0.134, -0.112]} length={0.56} radius={0.015} />
      <MountRod position={[0, 0.052, -0.112]} rotation={[0, 0, Math.PI / 2]} length={1.47} radius={0.0115} />
      <MountRod position={[0, -0.006, -0.118]} rotation={[0, 0, Math.PI / 2]} length={1.22} radius={0.0075} />
      <RoundedBox args={[0.19, 0.105, 0.04]} radius={0.016} smoothness={6} position={[0, 0.028, -0.106]} castShadow receiveShadow>
        <meshStandardMaterial color="#06080d" metalness={0.86} roughness={0.21} envMapIntensity={1.25} />
      </RoundedBox>
      <MountClamp position={[0, 0.028, -0.071]} scale={1.14} />
      <MountRod position={[0, 0.028, -0.089]} rotation={[Math.PI / 2, 0, 0]} length={0.044} radius={0.0105} />
      <RoundedBox args={[0.24, 0.168, 0.014]} radius={0.012} smoothness={5} position={[0, 0.018, -0.064]} castShadow receiveShadow>
        <meshStandardMaterial color="#070a10" metalness={0.78} roughness={0.27} />
      </RoundedBox>
      {[-0.071, 0.071].map((x) =>
        [-0.047, 0.047].map((y) => (
          <mesh key={`center-vesa-${x}-${y}`} position={[x, 0.018 + y, -0.0555]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.006, 0.006, 0.004, 18]} />
            <meshStandardMaterial color="#1f2633" metalness={0.88} roughness={0.16} />
          </mesh>
        )),
      )}
      {[-1, 1].map((side) => (
        <group key={`side-mount-${side}`}>
          <MountClamp position={[side * 0.665, 0.052, -0.103]} scale={0.82} />
          <MountRod position={[side * 0.69, 0.052, -0.038]} rotation={[Math.PI / 2, 0, 0]} length={0.144} radius={0.0078} />
          <MountRod position={[side * 0.69, -0.006, -0.04]} rotation={[Math.PI / 2, 0, 0]} length={0.13} radius={0.0058} />
          <MountClamp position={[side * 0.704, 0.036, 0.032]} scale={0.7} />
        </group>
      ))}
      <RoundedBox args={[0.25, 0.024, 0.15]} radius={0.014} smoothness={6} position={[0, -0.405, -0.104]} castShadow receiveShadow>
        <meshStandardMaterial color="#05070b" metalness={0.84} roughness={0.24} envMapIntensity={1.05} />
      </RoundedBox>
      <mesh position={[0, -0.383, -0.104]}>
        <boxGeometry args={[0.13, 0.026, 0.088]} />
        <meshStandardMaterial color="#090c12" metalness={0.78} roughness={0.28} />
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
      <TripleMonitorMount />
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

      <pointLight position={[0, 0.04, 0.32]} intensity={0.82} distance={1.9} color="#c026d3" />
      <pointLight position={[-0.5, 0.03, 0.24]} intensity={0.35} distance={0.7} color="#22d3ee" />
      <pointLight position={[0.5, 0.03, 0.24]} intensity={0.28} distance={0.7} color="#c084fc" />
    </group>
  );
}
