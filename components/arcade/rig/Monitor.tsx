"use client";

import { Suspense, useEffect, useMemo, useRef } from "react";
import { useFrame, type ThreeEvent } from "@react-three/fiber";
import { OrthographicCamera, RenderTexture, RoundedBox, Text } from "@react-three/drei";
import type { Group, Mesh, MeshStandardMaterial, PointLight, ShaderMaterial } from "three";
import { metalAlbedo } from "./textures";

const ARCADE_TEXT_FONT = "/fonts/ArcadeText-Bold.ttf";

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

float hash21(vec2 p) {
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}

float lineGlow(float value, float width) {
  return smoothstep(width, 0.0, abs(value));
}

void main() {
  vec2 uv = vUv;
  vec2 p = uv * 2.0 - 1.0;
  p.x *= 2.18;
  float t = uTime;

  vec3 deepA = vec3(0.010, 0.014, 0.035);
  vec3 deepB = vec3(0.090, 0.018, 0.135);
  vec3 col = mix(deepA, deepB, uv.y + 0.16 * sin(t * 0.18 + uv.x * 4.0));

  float horizon = lineGlow(p.y + 0.42 + 0.03 * sin(p.x * 2.2 + t * 0.7), 0.030);
  col += vec3(0.22, 0.92, 1.0) * horizon * 0.55;

  vec2 flow = vec2(uv.x * 16.0 + sin(uv.y * 6.0 + t * 0.55), uv.y * 10.0 - t * 0.62);
  vec2 cell = abs(fract(flow) - 0.5);
  float grid = smoothstep(0.034, 0.0, min(cell.x, cell.y));
  float gridMask = smoothstep(0.08, 0.82, uv.y) * (1.0 - smoothstep(0.98, 1.0, uv.y));
  col += vec3(0.06, 0.72, 1.0) * grid * gridMask * 0.20;

  float waveA = lineGlow(p.y - 0.22 * sin(p.x * 1.65 + t * 0.92), 0.030);
  float waveB = lineGlow(p.y - 0.14 * cos(p.x * 2.35 - t * 0.72) + 0.20, 0.026);
  col += vec3(0.84, 0.20, 1.0) * waveA * 0.36;
  col += vec3(0.12, 0.82, 1.0) * waveB * 0.28;

  float ring = lineGlow(length(vec2(p.x * 0.62, p.y * 1.1) - vec2(0.0, 0.03)) - (0.36 + 0.014 * sin(t * 1.4)), 0.040);
  float ringInner = smoothstep(0.72, 0.05, length(vec2(p.x * 0.68, p.y * 1.2) - vec2(0.0, 0.03)));
  col += vec3(0.95, 0.30, 1.0) * ring * 0.85;
  col += vec3(0.13, 0.78, 1.0) * ringInner * 0.12;

  for (int i = 0; i < 18; i++) {
    float fi = float(i);
    vec2 base = vec2(hash21(vec2(fi, 7.1)), hash21(vec2(11.7, fi)));
    vec2 q = vec2(fract(base.x + t * (0.018 + fi * 0.0009)), fract(base.y + t * (0.028 + fi * 0.0007)));
    vec2 d = (uv - q) * vec2(2.18, 1.0);
    float particle = smoothstep(0.040, 0.0, length(d));
    col += mix(vec3(0.10, 0.75, 1.0), vec3(0.95, 0.22, 1.0), hash21(base * 4.0)) * particle * 0.20;
  }

  float scan = 0.92 + 0.08 * sin(uv.y * 210.0 + t * 5.2);
  float vignette = smoothstep(1.28, 0.22, length(p * vec2(0.74, 1.0)));
  float glass = smoothstep(0.98, 0.08, length(p - vec2(-1.55, 0.92))) * 0.08;
  col = col * scan * vignette + vec3(0.65, 0.90, 1.0) * glass;

  gl_FragColor = vec4(col, 1.0);
}
`;


function TerminalRenderTexture({ reduced }: { reduced?: boolean }) {
  const stream = useRef<Group>(null);
  const cursor = useRef<Mesh>(null);
  const lineSpecs = useMemo(
    () =>
      Array.from({ length: 34 }, (_, i) => ({
        y: 1.58 - i * 0.145,
        x: -0.62 + ((i % 3) * 0.035),
        a: 0.36 + ((i * 7) % 9) * 0.045,
        b: 0.12 + ((i * 5) % 7) * 0.032,
        c: 0.08 + ((i * 11) % 6) * 0.034,
        tint: i % 5 === 0 ? "#c084fc" : i % 2 === 0 ? "#67e8f9" : "#8ee7d2",
      })),
    [],
  );
  const scanLines = useMemo(() => Array.from({ length: 25 }, (_, i) => -1.7 + i * 0.145), []);

  useFrame((state) => {
    const t = reduced ? 0 : state.clock.elapsedTime;
    if (stream.current) stream.current.position.y = ((t * 0.28) % 0.145) - 0.145;
    if (cursor.current) {
      cursor.current.visible = Math.sin(t * 7.5) > -0.2;
      cursor.current.position.x = -0.28 + Math.sin(t * 0.9) * 0.045;
    }
  });

  return (
    <RenderTexture attach="map" width={384} height={768} anisotropy={8} frames={Infinity}>
      <OrthographicCamera makeDefault manual left={-1} right={1} top={1.82} bottom={-1.82} near={0.1} far={10} position={[0, 0, 5]} />
      <color attach="background" args={["#020713"]} />
      <mesh position={[0, 0, -0.02]}>
        <planeGeometry args={[2, 3.64]} />
        <meshBasicMaterial color="#020713" toneMapped={false} />
      </mesh>
      <mesh position={[-0.18, 1.55, 0]}>
        <boxGeometry args={[1.18, 0.028, 0.001]} />
        <meshBasicMaterial color="#22d3ee" transparent opacity={0.55} toneMapped={false} />
      </mesh>
      <mesh position={[0.42, 1.46, 0]}>
        <boxGeometry args={[0.44, 0.016, 0.001]} />
        <meshBasicMaterial color="#c084fc" transparent opacity={0.48} toneMapped={false} />
      </mesh>
      <group ref={stream}>
        {lineSpecs.map((line, i) => (
          <group key={`terminal-line-${i}`} position={[0, line.y, 0]}>
            <mesh position={[-0.78, 0, 0]}>
              <boxGeometry args={[0.038, 0.014, 0.001]} />
              <meshBasicMaterial color={i % 4 === 0 ? "#c084fc" : "#22d3ee"} toneMapped={false} />
            </mesh>
            <mesh position={[line.x, 0, 0]}>
              <boxGeometry args={[line.a, 0.012, 0.001]} />
              <meshBasicMaterial color={line.tint} transparent opacity={0.82} toneMapped={false} />
            </mesh>
            <mesh position={[line.x + line.a * 0.5 + 0.08, 0, 0]}>
              <boxGeometry args={[line.b, 0.012, 0.001]} />
              <meshBasicMaterial color="#e0f2fe" transparent opacity={0.66} toneMapped={false} />
            </mesh>
            <mesh position={[line.x + line.a * 0.5 + line.b + 0.18, 0, 0]}>
              <boxGeometry args={[line.c, 0.012, 0.001]} />
              <meshBasicMaterial color={i % 3 === 0 ? "#f0abfc" : "#38bdf8"} transparent opacity={0.58} toneMapped={false} />
            </mesh>
          </group>
        ))}
      </group>
      <mesh ref={cursor} position={[-0.28, -1.48, 0]}>
        <boxGeometry args={[0.16, 0.02, 0.001]} />
        <meshBasicMaterial color="#67e8f9" toneMapped={false} />
      </mesh>
      {scanLines.map((y) => (
        <mesh key={`terminal-scan-${y}`} position={[0, y, 0.01]}>
          <boxGeometry args={[1.9, 0.003, 0.001]} />
          <meshBasicMaterial color="#ffffff" transparent opacity={0.035} toneMapped={false} />
        </mesh>
      ))}
    </RenderTexture>
  );
}

function DeveloperHudRenderTexture({ reduced }: { reduced?: boolean }) {
  const cube = useRef<Mesh>(null);
  const graphBars = useRef<Array<Mesh | null>>([]);
  const pulse = useRef<Group>(null);
  const bars = useMemo(() => Array.from({ length: 12 }, (_, i) => ({ x: -0.75 + i * 0.135, phase: i * 0.51 })), []);
  const nodes = useMemo(
    () => [
      [-0.62, 0.92, 0.34],
      [-0.2, 1.12, 0.5],
      [0.34, 0.94, 0.38],
      [0.62, 0.55, 0.3],
      [0.18, 0.35, 0.44],
      [-0.48, 0.42, 0.32],
    ] as [number, number, number][],
    [],
  );

  useFrame((state) => {
    const t = reduced ? 0 : state.clock.elapsedTime;
    if (cube.current) {
      cube.current.rotation.x = t * 0.42;
      cube.current.rotation.y = t * 0.58;
      cube.current.rotation.z = Math.sin(t * 0.33) * 0.12;
    }
    if (pulse.current) pulse.current.scale.setScalar(1 + Math.sin(t * 1.35) * 0.045);
    graphBars.current.forEach((bar, i) => {
      if (!bar) return;
      const h = 0.18 + 0.34 * (0.5 + 0.5 * Math.sin(t * 1.28 + bars[i].phase));
      bar.scale.y = h;
      bar.position.y = -1.32 + h * 0.5;
    });
  });

  return (
    <RenderTexture attach="map" width={384} height={768} anisotropy={8} frames={Infinity}>
      <OrthographicCamera makeDefault manual left={-1} right={1} top={1.82} bottom={-1.82} near={0.1} far={10} position={[0, 0, 5]} />
      <color attach="background" args={["#060518"]} />
      <mesh position={[0, 0, -0.02]}>
        <planeGeometry args={[2, 3.64]} />
        <meshBasicMaterial color="#060518" toneMapped={false} />
      </mesh>
      <group ref={pulse} position={[0, 0.55, 0]}>
        {nodes.map(([x, y, r], i) => (
          <mesh key={`node-${i}`} position={[x, y - 0.55, 0.01]}>
            <circleGeometry args={[0.025 + r * 0.018, 24]} />
            <meshBasicMaterial color={i % 2 ? "#c084fc" : "#22d3ee"} transparent opacity={0.92} toneMapped={false} />
          </mesh>
        ))}
        {[
          [-0.41, 0.47, 0.48, 0.018],
          [0.07, 0.47, 0.58, -0.16],
          [0.45, 0.19, 0.46, -0.67],
          [-0.13, -0.04, 0.64, -0.06],
          [-0.46, -0.01, 0.43, 0.6],
          [0.05, 0.63, 0.5, -0.43],
        ].map(([x, y, length, angle], i) => (
          <mesh key={`link-${i}`} position={[x, y, 0]} rotation={[0, 0, angle]}>
            <boxGeometry args={[length, 0.008, 0.001]} />
            <meshBasicMaterial color={i % 2 ? "#c084fc" : "#22d3ee"} transparent opacity={0.36} toneMapped={false} />
          </mesh>
        ))}
      </group>
      <mesh ref={cube} position={[0, 0.18, 0.02]} scale={0.46}>
        <boxGeometry args={[1, 1, 1]} />
        <meshBasicMaterial color="#67e8f9" wireframe transparent opacity={0.62} toneMapped={false} />
      </mesh>
      <mesh position={[0, -0.68, 0.01]}>
        <boxGeometry args={[1.54, 0.022, 0.001]} />
        <meshBasicMaterial color="#c084fc" transparent opacity={0.48} toneMapped={false} />
      </mesh>
      <group>
        {bars.map((bar, i) => (
          <mesh
            key={`perf-bar-${i}`}
            ref={(node) => {
              graphBars.current[i] = node;
            }}
            position={[bar.x, -1.2, 0.01]}
          >
            <boxGeometry args={[0.07, 1, 0.001]} />
            <meshBasicMaterial color={i % 3 === 0 ? "#f0abfc" : i % 2 === 0 ? "#22d3ee" : "#67e8f9"} transparent opacity={0.78} toneMapped={false} />
          </mesh>
        ))}
      </group>
      {[-1.56, -1.22, -0.88, -0.54, -0.2, 0.14, 0.48, 0.82, 1.16, 1.5].map((y) => (
        <mesh key={`hud-scan-${y}`} position={[0, y, 0.02]}>
          <boxGeometry args={[1.84, 0.003, 0.001]} />
          <meshBasicMaterial color="#ffffff" transparent opacity={0.03} toneMapped={false} />
        </mesh>
      ))}
    </RenderTexture>
  );
}

function PortraitScreen({ side, reduced }: { side: -1 | 1; reduced?: boolean }) {
  const accent = side < 0 ? "#22d3ee" : "#c084fc";
  const secondary = side < 0 ? "#c084fc" : "#22d3ee";

  return (
    <group position={[side * 0.706, 0.024, 0.056]} rotation={[0, side * -0.37, 0]}>
      {/* Invisible-mounted flagship side OLED: rear shell, animated display, glass, and edge trim only. */}
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

      {/* The animated RenderTexture is now the only content/display layer on each side monitor. */}
      <mesh position={[0, 0, 0.0205]}>
        <planeGeometry args={[0.316, 0.592]} />
        <meshBasicMaterial toneMapped={false}>
          {side < 0 ? <TerminalRenderTexture reduced={reduced} /> : <DeveloperHudRenderTexture reduced={reduced} />}
        </meshBasicMaterial>
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
      <pointLight position={[0, 0.02, 0.11]} intensity={0.16} distance={0.44} color={accent} />
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
      <MountRod position={[0, 0.088, -0.112]} rotation={[0, 0, Math.PI / 2]} length={1.47} radius={0.0115} />
      <MountRod position={[0, 0.032, -0.118]} rotation={[0, 0, Math.PI / 2]} length={1.22} radius={0.0075} />
      <RoundedBox args={[0.19, 0.105, 0.04]} radius={0.016} smoothness={6} position={[0, 0.09, -0.106]} castShadow receiveShadow>
        <meshStandardMaterial color="#06080d" metalness={0.86} roughness={0.21} envMapIntensity={1.25} />
      </RoundedBox>
      <MountClamp position={[0, 0.09, -0.071]} scale={1.14} />
      <MountRod position={[0, 0.09, -0.089]} rotation={[Math.PI / 2, 0, 0]} length={0.044} radius={0.0105} />
      <RoundedBox args={[0.24, 0.188, 0.014]} radius={0.012} smoothness={5} position={[0, 0.09, -0.064]} castShadow receiveShadow>
        <meshStandardMaterial color="#070a10" metalness={0.78} roughness={0.27} />
      </RoundedBox>
      {[-0.071, 0.071].map((x) =>
        [-0.047, 0.047].map((y) => (
          <mesh key={`center-vesa-${x}-${y}`} position={[x, 0.09 + y, -0.0555]} rotation={[Math.PI / 2, 0, 0]}>
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
  const active = enabled;
  const buttonGroup = useRef<Group>(null);
  const baseMat = useRef<MeshStandardMaterial>(null);
  const faceMat = useRef<MeshStandardMaterial>(null);
  const topRailMat = useRef<MeshStandardMaterial>(null);
  const bottomRailMat = useRef<MeshStandardMaterial>(null);
  const glowLight = useRef<PointLight>(null);
  const hovered = useRef(false);

  const applyHover = (nextHovered: boolean) => {
    hovered.current = active && nextHovered;
    const hot = hovered.current;
    const accent = hot ? "#f0abfc" : "#22d3ee";
    const secondary = hot ? "#22d3ee" : "#c084fc";
    const emissive = hot ? 1.35 : 0.78;

    document.body.style.cursor = hot ? "pointer" : "";
    buttonGroup.current?.scale.set(hot ? 1.035 : 1, hot ? 1.035 : 1, 1);

    if (baseMat.current) {
      baseMat.current.color.set(hot ? "#28112d" : "#071521");
      baseMat.current.emissive.set(secondary);
      baseMat.current.emissiveIntensity = hot ? 0.44 : 0.22;
    }
    if (faceMat.current) {
      faceMat.current.emissive.set(accent);
      faceMat.current.emissiveIntensity = hot ? 0.28 : 0.12;
    }
    if (topRailMat.current) {
      topRailMat.current.color.set(accent);
      topRailMat.current.emissive.set(accent);
      topRailMat.current.emissiveIntensity = emissive;
    }
    if (bottomRailMat.current) {
      bottomRailMat.current.color.set(secondary);
      bottomRailMat.current.emissive.set(secondary);
      bottomRailMat.current.emissiveIntensity = emissive;
    }
    if (glowLight.current) {
      glowLight.current.color.set(accent);
      glowLight.current.intensity = hot ? 0.62 : 0.32;
    }
  };

  const stopButtonEvent = (event: ThreeEvent<PointerEvent>) => {
    event.stopPropagation();
  };
  const activateButton = (event: ThreeEvent<MouseEvent>) => {
    event.stopPropagation();
    if (!active) return;

    applyHover(false);
    onEnter();
  };

  useEffect(() => {
    if (!active) {
      hovered.current = false;
      document.body.style.cursor = "";
    }

    return () => {
      document.body.style.cursor = "";
    };
  }, [active]);

  return (
    <group
      ref={buttonGroup}
      position={[0, -0.11, 0.031]}
      onPointerOver={(event) => {
        event.stopPropagation();
        applyHover(true);
      }}
      onPointerOut={(event) => {
        event.stopPropagation();
        applyHover(false);
      }}
      onPointerDown={stopButtonEvent}
      onClick={activateButton}
    >
      <RoundedBox args={[0.39, 0.078, 0.012]} radius={0.016} smoothness={5}>
        <meshStandardMaterial
          ref={baseMat}
          color="#071521"
          emissive="#c084fc"
          emissiveIntensity={0.22}
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
          ref={faceMat}
          emissive="#22d3ee"
          emissiveIntensity={0.12}
          transparent
          opacity={0.74}
          roughness={0.2}
        />
      </mesh>
      <mesh position={[0, 0.0415, 0.011]}>
        <boxGeometry args={[0.305, 0.004, 0.004]} />
        <meshStandardMaterial ref={topRailMat} color="#22d3ee" emissive="#22d3ee" emissiveIntensity={0.78} roughness={0.18} />
      </mesh>
      <mesh position={[0, -0.0415, 0.011]}>
        <boxGeometry args={[0.305, 0.004, 0.004]} />
        <meshStandardMaterial ref={bottomRailMat} color="#c084fc" emissive="#c084fc" emissiveIntensity={0.78} roughness={0.18} />
      </mesh>
      <mesh
        position={[0, 0, 0.028]}
        onPointerOver={(event) => {
          event.stopPropagation();
          applyHover(true);
        }}
        onPointerOut={(event) => {
          event.stopPropagation();
          applyHover(false);
        }}
        onPointerDown={stopButtonEvent}
        onClick={activateButton}
      >
        <planeGeometry args={[0.58, 0.16]} />
        <meshBasicMaterial transparent opacity={0.01} colorWrite={false} depthWrite={false} />
      </mesh>
      <Suspense fallback={null}>
        <Text
          font={ARCADE_TEXT_FONT}
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
          font={ARCADE_TEXT_FONT}
          position={[0, -0.023, 0.018]}
          fontSize={0.0105}
          letterSpacing={0.18}
          anchorX="center"
          anchorY="middle"
          color="#22d3ee"
        >
          PRESS START
        </Text>
      </Suspense>
      <pointLight ref={glowLight} position={[0, 0, 0.08]} intensity={0.32} distance={0.5} color="#22d3ee" />
    </group>
  );
}

export function Monitor({
  reduced,
  enterEnabled,
  transitionLite = false,
  onEnter,
}: {
  reduced?: boolean;
  enterEnabled: boolean;
  transitionLite?: boolean;
  onEnter: () => void;
}) {
  const mat = useRef<ShaderMaterial>(null);
  const uniforms = useMemo(() => ({ uTime: { value: 0 } }), []);
  const metal = useMemo(() => (transitionLite ? null : metalAlbedo()), [transitionLite]);

  useFrame((state) => {
    if (mat.current) mat.current.uniforms.uTime.value = reduced ? 0 : state.clock.elapsedTime;
  });

  return (
    <group position={[0.02, 0.43, -0.17]}>
      <TripleMonitorMount />
      <group position={[0, 0.09, 0]}>
        <mesh castShadow>
          <boxGeometry args={[1.035, 0.49, 0.036]} />
          <meshStandardMaterial map={metal ?? undefined} color="#11131a" metalness={0.64} roughness={0.27} />
        </mesh>
        <mesh position={[0, 0.008, 0.019]}>
          <planeGeometry args={[0.972, 0.424]} />
          <shaderMaterial ref={mat} vertexShader={vertex} fragmentShader={fragment} uniforms={uniforms} />
        </mesh>
        <mesh position={[0, 0.008, 0.0205]}>
          <planeGeometry args={[0.972, 0.424]} />
          <meshPhysicalMaterial color="#d6f3ff" transparent opacity={0.075} roughness={0.035} metalness={0} />
        </mesh>
        {transitionLite ? null : <MonitorEnterButton enabled={enterEnabled} onEnter={onEnter} />}
        <mesh position={[0, -0.245, 0.02]}>
          <planeGeometry args={[0.99, 0.018]} />
          <meshStandardMaterial color="#222631" metalness={0.28} roughness={0.42} />
        </mesh>
        <mesh position={[0, 0.006, -0.032]}>
          <boxGeometry args={[0.985, 0.434, 0.045]} />
          <meshStandardMaterial map={metal ?? undefined} color="#090b11" metalness={0.48} roughness={0.43} />
        </mesh>
      </group>

      {transitionLite ? null : <PortraitScreen side={-1} reduced={reduced} />}
      {transitionLite ? null : <PortraitScreen side={1} reduced={reduced} />}

      <pointLight position={[0, 0.04, 0.32]} intensity={0.82} distance={1.9} color="#c026d3" />
      <pointLight position={[-0.5, 0.03, 0.24]} intensity={0.35} distance={0.7} color="#22d3ee" />
      <pointLight position={[0.5, 0.03, 0.24]} intensity={0.28} distance={0.7} color="#c084fc" />
    </group>
  );
}
