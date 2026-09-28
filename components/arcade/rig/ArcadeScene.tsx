"use client";

import { Suspense, useEffect, useMemo, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { ContactShadows, Text } from "@react-three/drei";
import { prefersReducedMotion } from "@/lib/motion/engine";
import { buildArcadePortalTimeline } from "@/lib/arcade/portal";
import { DESK_SIZE, SPEAKER_LEFT, SPEAKER_RIGHT } from "@/lib/arcade/layout";
import { Keyboard } from "./Keyboard";
import { Monitor } from "./Monitor";
import { Mouse, MousePad } from "./Mouse";
import { PcCase } from "./PcCase";
import { DeskAccessories } from "./DeskAccessories";
import { HeadsetStand } from "./HeadsetStand";
import { Speaker } from "./Speakers";
import { concreteAlbedo, woodAlbedo } from "./textures";

type Vec3 = [number, number, number];

function CameraRig({
  mode,
  onArrived,
}: {
  mode: "idle" | "enter" | "exit";
  onArrived: () => void;
}) {
  const { camera } = useThree();
  const look = useRef({ x: 0.03, y: 0.42, z: -0.08 });
  const done = useRef(false);
  const arrived = useRef(onArrived);
  arrived.current = onArrived;

  useEffect(() => {
    done.current = false;
    const reduced = prefersReducedMotion();
    const tl = buildArcadePortalTimeline(camera, look.current);

    if (mode === "idle") {
      tl.progress(0);
      return () => tl.kill();
    }

    if (reduced) {
      if (mode === "enter") tl.progress(1);
      else tl.progress(0);
      arrived.current();
      return () => tl.kill();
    }

    const finish = () => {
      if (!done.current) {
        done.current = true;
        arrived.current();
      }
    };

    if (mode === "enter") {
      tl.eventCallback("onComplete", finish);
      tl.play(0);
    } else {
      tl.progress(1);
      tl.eventCallback("onReverseComplete", finish);
      tl.reverse();
    }

    return () => {
      tl.kill();
    };
  }, [camera, mode]);

  useFrame(() => {
    camera.lookAt(look.current.x, look.current.y, look.current.z);
  });

  return null;
}

function AcousticTile({
  position,
  accent,
}: {
  position: Vec3;
  accent: "cyan" | "magenta";
}) {
  const glow = accent === "cyan" ? "#22d3ee" : "#c084fc";
  return (
    <group position={position}>
      <mesh receiveShadow>
        <boxGeometry args={[0.22, 0.22, 0.025]} />
        <meshStandardMaterial color="#11131b" roughness={0.92} metalness={0.02} />
      </mesh>
      <mesh position={[-0.034, 0.034, 0.016]} rotation={[0, 0, Math.PI / 4]}>
        <boxGeometry args={[0.128, 0.018, 0.012]} />
        <meshStandardMaterial color="#1d2030" roughness={0.88} />
      </mesh>
      <mesh position={[0.034, -0.034, 0.017]} rotation={[0, 0, Math.PI / 4]}>
        <boxGeometry args={[0.128, 0.018, 0.012]} />
        <meshStandardMaterial color="#080a10" roughness={0.95} />
      </mesh>
      <mesh position={[0, 0, -0.004]}>
        <boxGeometry args={[0.24, 0.24, 0.006]} />
        <meshStandardMaterial color={glow} emissive={glow} emissiveIntensity={0.28} roughness={0.5} />
      </mesh>
    </group>
  );
}

function MiniArcade({ position, color }: { position: Vec3; color: string }) {
  return (
    <group position={position}>
      <mesh castShadow>
        <boxGeometry args={[0.075, 0.15, 0.052]} />
        <meshStandardMaterial color="#202431" roughness={0.52} metalness={0.18} />
      </mesh>
      <mesh position={[0, 0.025, 0.028]}>
        <planeGeometry args={[0.048, 0.04]} />
        <meshStandardMaterial color="#061018" emissive={color} emissiveIntensity={0.75} roughness={0.25} />
      </mesh>
      <mesh position={[0, -0.045, 0.029]}>
        <boxGeometry args={[0.055, 0.018, 0.004]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.5} roughness={0.35} />
      </mesh>
    </group>
  );
}

function ReferenceWall() {
  const leftTiles: Vec3[] = [
    [-1.05, 0.58, -1.108],
    [-0.8, 0.58, -1.108],
    [-1.05, 0.84, -1.108],
    [-0.8, 0.84, -1.108],
    [-0.8, 1.1, -1.108],
    [-0.55, 1.1, -1.108],
  ];
  const rightTiles: Vec3[] = [
    [0.78, 0.64, -1.108],
    [1.03, 0.64, -1.108],
    [0.78, 0.9, -1.108],
    [1.03, 0.9, -1.108],
    [0.78, 1.16, -1.108],
    [1.03, 1.16, -1.108],
  ];

  return (
    <group>
      {leftTiles.map((p, i) => (
        <AcousticTile key={`left-${p.join("-")}`} position={p} accent={i < 4 ? "cyan" : "magenta"} />
      ))}
      {rightTiles.map((p) => (
        <AcousticTile key={`right-${p.join("-")}`} position={p} accent="cyan" />
      ))}

      <mesh position={[0.02, 0.98, -1.075]} castShadow>
        <boxGeometry args={[0.78, 0.026, 0.07]} />
        <meshStandardMaterial color="#08090e" roughness={0.55} metalness={0.35} />
      </mesh>
      <mesh position={[0.02, 0.998, -1.035]}>
        <boxGeometry args={[0.8, 0.006, 0.01]} />
        <meshStandardMaterial color="#111827" emissive="#c084fc" emissiveIntensity={0.22} roughness={0.4} />
      </mesh>
      <MiniArcade position={[-0.26, 1.08, -1.045]} color="#22d3ee" />
      <MiniArcade position={[-0.14, 1.08, -1.045]} color="#84cc16" />
      {[0.02, 0.12, 0.23, 0.36].map((x, i) => (
        <mesh key={x} position={[x, 1.045, -1.035]} castShadow>
          <boxGeometry args={[0.062, 0.09, 0.035]} />
          <meshStandardMaterial
            color={i % 2 ? "#303548" : "#4a2d46"}
            emissive={i % 2 ? "#22d3ee" : "#c084fc"}
            emissiveIntensity={0.08}
            roughness={0.58}
            metalness={0.12}
          />
        </mesh>
      ))}

      <Text
        position={[-0.31, 0.845, -1.055]}
        fontSize={0.07}
        lineHeight={0.82}
        letterSpacing={0.03}
        color="#f0abfc"
        anchorX="center"
        anchorY="middle"
      >
        {"INSERT\nCOIN"}
      </Text>
      <Text
        position={[0.39, 0.85, -1.055]}
        fontSize={0.07}
        lineHeight={0.82}
        letterSpacing={0.03}
        color="#67e8f9"
        anchorX="center"
        anchorY="middle"
      >
        {"GAME\nOVER"}
      </Text>

      <pointLight position={[-0.96, 0.78, -0.78]} intensity={1.6} distance={1.0} color="#22d3ee" />
      <pointLight position={[-0.65, 1.1, -0.8]} intensity={1.25} distance={0.95} color="#c084fc" />
      <pointLight position={[0.9, 0.92, -0.78]} intensity={1.55} distance={1.05} color="#22d3ee" />
      <pointLight position={[0.02, 0.64, -0.74]} intensity={1.1} distance={1.35} color="#a855f7" />
    </group>
  );
}

function Room() {
  const wood = useMemo(() => woodAlbedo(), []);
  const concrete = useMemo(() => concreteAlbedo(), []);
  return (
    <>
      <mesh position={[0, 0.83, -1.16]} receiveShadow>
        <planeGeometry args={[6, 3.2]} />
        <meshStandardMaterial map={concrete} color="#33384d" roughness={0.92} metalness={0.03} />
      </mesh>
      <ReferenceWall />
      <mesh position={[0, 0.025, 0.12]} receiveShadow castShadow>
        <boxGeometry args={DESK_SIZE} />
        <meshStandardMaterial map={wood} color="#7d8491" roughness={0.68} metalness={0.04} />
      </mesh>
      {[
        [-1.08, -0.12, 0.5],
        [1.08, -0.12, 0.5],
        [-1.08, -0.12, -0.3],
        [1.08, -0.12, -0.3],
      ].map((p) => (
        <mesh key={p.join(",")} position={p as Vec3}>
          <boxGeometry args={[0.052, 0.24, 0.052]} />
          <meshStandardMaterial color="#151822" roughness={0.78} metalness={0.18} />
        </mesh>
      ))}
      <mesh position={[0, -0.01, 0.12]}>
        <boxGeometry args={[2.38, 0.026, 0.98]} />
        <meshStandardMaterial color="#161923" roughness={0.82} metalness={0.12} />
      </mesh>
      <pointLight position={[0, 0.08, 0.62]} intensity={0.7} distance={1.8} color="#22d3ee" />
      <pointLight position={[0.6, 0.11, 0.42]} intensity={0.45} distance={1.0} color="#c084fc" />
    </>
  );
}

export function ArcadeScene({
  mode,
  onArrived,
}: {
  mode: "idle" | "enter" | "exit";
  onArrived: () => void;
}) {
  const reduced = prefersReducedMotion();

  return (
    <Canvas
      shadows
      dpr={[1, 2]}
      gl={{ antialias: true, alpha: false, powerPreference: "high-performance" }}
      camera={{ fov: 40, near: 0.05, far: 16, position: [0, 0.9, 1.95] }}
      style={{ width: "100%", height: "100%" }}
    >
      <color attach="background" args={["#111522"]} />
      <hemisphereLight args={["#dbeafe", "#15101f", 0.42]} />
      <directionalLight
        position={[0.42, 2.35, 1.55]}
        intensity={0.92}
        castShadow
        shadow-mapSize={[2048, 2048]}
      />
      <ambientLight intensity={0.16} />
      <Suspense fallback={null}>
        <Room />
        <PcCase reduced={reduced} />
        <Monitor reduced={reduced} />
        <Speaker position={SPEAKER_LEFT} />
        <Speaker position={SPEAKER_RIGHT} />
        <Keyboard reduced={reduced} />
        <MousePad />
        <Mouse reduced={reduced} />
        <DeskAccessories />
        <HeadsetStand reduced={reduced} />
        <ContactShadows position={[0, 0.052, 0.12]} opacity={0.42} scale={2.75} blur={2.75} far={1.35} />
      </Suspense>
      <CameraRig mode={mode} onArrived={onArrived} />
    </Canvas>
  );
}
