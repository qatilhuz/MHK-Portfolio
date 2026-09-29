"use client";

import { Suspense, useLayoutEffect, useMemo, useRef, type RefObject } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { ContactShadows, OrbitControls, Text } from "@react-three/drei";
import type { Camera } from "three";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";
import { prefersReducedMotion } from "@/lib/motion/engine";
import {
  PORTAL_START_LOOK,
  PORTAL_START_POS,
  buildArcadePortalTimeline,
  getDefaultArcadePortalView,
  type ArcadePortalPoint,
  type ArcadePortalView,
} from "@/lib/arcade/portal";
import { DESK_CENTER_X, DESK_CENTER_Z, DESK_SIZE, SPEAKER_LEFT, SPEAKER_RIGHT } from "@/lib/arcade/layout";
import { Keyboard } from "./Keyboard";
import { Monitor } from "./Monitor";
import { Mouse, MousePad } from "./Mouse";
import { PcCase } from "./PcCase";
import { DeskAccessories } from "./DeskAccessories";
import { HeadsetStand } from "./HeadsetStand";
import { Speaker } from "./Speakers";
import { concreteAlbedo, woodAlbedo } from "./textures";

type Vec3 = [number, number, number];

const DEFAULT_CAMERA_POSITION: Vec3 = [
  PORTAL_START_POS.x,
  PORTAL_START_POS.y,
  PORTAL_START_POS.z,
];
const DEFAULT_LOOK_TARGET: Vec3 = [
  PORTAL_START_LOOK.x,
  PORTAL_START_LOOK.y,
  PORTAL_START_LOOK.z,
];
const DEFAULT_CAMERA_VECTOR = {
  x: DEFAULT_CAMERA_POSITION[0] - DEFAULT_LOOK_TARGET[0],
  y: DEFAULT_CAMERA_POSITION[1] - DEFAULT_LOOK_TARGET[1],
  z: DEFAULT_CAMERA_POSITION[2] - DEFAULT_LOOK_TARGET[2],
};
const DEFAULT_CAMERA_DISTANCE = Math.hypot(
  DEFAULT_CAMERA_VECTOR.x,
  DEFAULT_CAMERA_VECTOR.y,
  DEFAULT_CAMERA_VECTOR.z,
);
const DEFAULT_AZIMUTH = Math.atan2(DEFAULT_CAMERA_VECTOR.x, DEFAULT_CAMERA_VECTOR.z);
const DEFAULT_POLAR = Math.acos(DEFAULT_CAMERA_VECTOR.y / DEFAULT_CAMERA_DISTANCE);
const ORBIT_VARIANCE = Math.PI / 14;
const MIN_CAMERA_DISTANCE = 0.72;

type LookRef = ArcadePortalPoint;

function captureCurrentPortalView(
  camera: Camera,
  controls: OrbitControlsImpl | null,
  fallbackLook: LookRef,
): ArcadePortalView {
  const target = controls?.target ?? fallbackLook;

  return {
    position: {
      x: camera.position.x,
      y: camera.position.y,
      z: camera.position.z,
    },
    look: {
      x: target.x,
      y: target.y,
      z: target.z,
    },
  };
}

function syncControlsToView(
  controls: OrbitControlsImpl | null,
  view: ArcadePortalView,
  enabled: boolean,
) {
  if (!controls) return;
  controls.enabled = enabled;
  controls.target.set(view.look.x, view.look.y, view.look.z);
  controls.update();
  controls.saveState();
}

function CameraRig({
  mode,
  controlsRef,
  onArrived,
}: {
  mode: "idle" | "enter" | "exit";
  controlsRef: RefObject<OrbitControlsImpl | null>;
  onArrived: () => void;
}) {
  const { camera } = useThree();
  const look = useRef({
    x: DEFAULT_LOOK_TARGET[0],
    y: DEFAULT_LOOK_TARGET[1],
    z: DEFAULT_LOOK_TARGET[2],
  });
  const done = useRef(false);
  const arrived = useRef(onArrived);
  arrived.current = onArrived;

  useLayoutEffect(() => {
    done.current = false;
    const reduced = prefersReducedMotion();
    const controls = controlsRef.current;
    const defaultView = getDefaultArcadePortalView();

    if (mode === "idle") {
      const tl = buildArcadePortalTimeline(camera, look.current, defaultView);
      tl.progress(0);
      camera.lookAt(look.current.x, look.current.y, look.current.z);
      syncControlsToView(controls, defaultView, true);
      return () => tl.kill();
    }

    controls?.update();
    const startView = mode === "enter"
      ? captureCurrentPortalView(camera, controls, look.current)
      : defaultView;

    if (controls) {
      controls.enabled = false;
      controls.update();
    }

    const tl = buildArcadePortalTimeline(camera, look.current, startView);
    const orientCamera = () => camera.lookAt(look.current.x, look.current.y, look.current.z);
    tl.eventCallback("onUpdate", orientCamera);
    orientCamera();

    const finish = () => {
      if (!done.current) {
        done.current = true;
        arrived.current();
      }
    };

    if (reduced) {
      if (mode === "enter") tl.progress(1);
      else tl.progress(0);
      orientCamera();
      finish();
      return () => tl.kill();
    }

    if (mode === "enter") {
      tl.eventCallback("onComplete", finish);
      tl.play(0);
    } else {
      tl.progress(1);
      orientCamera();
      tl.eventCallback("onReverseComplete", finish);
      tl.reverse();
    }

    return () => {
      tl.kill();
    };
  }, [camera, controlsRef, mode]);

  useFrame(() => {
    if (mode !== "idle") {
      camera.lookAt(look.current.x, look.current.y, look.current.z);
    }
  });

  return null;
}

function StrictOrbitControls({
  mode,
  controlsRef,
}: {
  mode: "idle" | "enter" | "exit";
  controlsRef: RefObject<OrbitControlsImpl | null>;
}) {
  return (
    <OrbitControls
      ref={controlsRef}
      makeDefault
      enabled={mode === "idle"}
      target={DEFAULT_LOOK_TARGET}
      enablePan={false}
      enableZoom
      enableRotate
      enableDamping
      dampingFactor={0.08}
      rotateSpeed={0.42}
      zoomSpeed={0.72}
      minDistance={MIN_CAMERA_DISTANCE}
      maxDistance={DEFAULT_CAMERA_DISTANCE}
      minAzimuthAngle={DEFAULT_AZIMUTH - ORBIT_VARIANCE}
      maxAzimuthAngle={DEFAULT_AZIMUTH + ORBIT_VARIANCE}
      minPolarAngle={DEFAULT_POLAR - ORBIT_VARIANCE}
      maxPolarAngle={DEFAULT_POLAR + ORBIT_VARIANCE}
    />
  );
}

function AcousticTile({
  position,
  accent,
}: {
  position: Vec3;
  accent: "cyan" | "magenta";
}) {
  const glow = accent === "cyan" ? "#22d3ee" : "#c084fc";
  const dimGlow = accent === "cyan" ? "#155e75" : "#581c87";

  return (
    <group position={position}>
      <mesh position={[0, 0, -0.014]} receiveShadow>
        <boxGeometry args={[0.248, 0.248, 0.01]} />
        <meshStandardMaterial color={glow} emissive={glow} emissiveIntensity={0.25} transparent opacity={0.42} roughness={0.4} />
      </mesh>
      <mesh receiveShadow>
        <boxGeometry args={[0.22, 0.22, 0.028]} />
        <meshStandardMaterial color="#0b0d14" roughness={0.94} metalness={0.03} />
      </mesh>
      <mesh position={[0, 0, 0.0175]}>
        <boxGeometry args={[0.182, 0.182, 0.006]} />
        <meshStandardMaterial color="#11131b" roughness={0.96} metalness={0.02} />
      </mesh>
      {[
        [0, 0.113, 0.026, 0.225, 0.006],
        [0, -0.113, 0.026, 0.225, 0.006],
        [-0.113, 0, 0.026, 0.006, 0.225],
        [0.113, 0, 0.026, 0.006, 0.225],
      ].map(([x, y, z, w, h], i) => (
        <mesh key={`edge-${i}`} position={[x, y, z]}>
          <boxGeometry args={[w, h, 0.006]} />
          <meshStandardMaterial color={glow} emissive={glow} emissiveIntensity={0.72} roughness={0.22} />
        </mesh>
      ))}
      {[
        [-0.046, 0.046, 0.018, 0.082, 0.012, Math.PI / 4],
        [0.046, -0.046, 0.018, 0.082, 0.012, Math.PI / 4],
        [0.046, 0.046, 0.019, 0.082, 0.012, -Math.PI / 4],
        [-0.046, -0.046, 0.019, 0.082, 0.012, -Math.PI / 4],
      ].map(([x, y, z, w, h, r], i) => (
        <mesh key={`fold-${i}`} position={[x, y, z]} rotation={[0, 0, r]}>
          <boxGeometry args={[w, h, 0.01]} />
          <meshStandardMaterial color={i % 2 ? "#0f1118" : "#1a1d29"} roughness={0.9} metalness={0.04} />
        </mesh>
      ))}
      <mesh position={[0, 0, 0.031]} rotation={[0, 0, Math.PI / 4]}>
        <boxGeometry args={[0.12, 0.006, 0.005]} />
        <meshStandardMaterial color={dimGlow} emissive={glow} emissiveIntensity={0.36} roughness={0.36} />
      </mesh>
      <mesh position={[0, 0, 0.032]} rotation={[0, 0, -Math.PI / 4]}>
        <boxGeometry args={[0.12, 0.006, 0.005]} />
        <meshStandardMaterial color={dimGlow} emissive={glow} emissiveIntensity={0.36} roughness={0.36} />
      </mesh>
      <pointLight position={[0, 0, 0.12]} intensity={0.18} distance={0.32} color={glow} />
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
  const leftTiles: { position: Vec3; accent: "cyan" | "magenta" }[] = [
    { position: [-1.18, 0.64, -1.108], accent: "cyan" },
    { position: [-0.93, 0.64, -1.108], accent: "cyan" },
    { position: [-1.18, 0.89, -1.108], accent: "cyan" },
    { position: [-0.93, 0.89, -1.108], accent: "magenta" },
    { position: [-0.93, 1.14, -1.108], accent: "magenta" },
    { position: [-0.68, 1.14, -1.108], accent: "magenta" },
  ];
  const rightTiles: { position: Vec3; accent: "cyan" | "magenta" }[] = [
    { position: [0.83, 0.76, -1.108], accent: "cyan" },
    { position: [1.08, 0.76, -1.108], accent: "cyan" },
    { position: [0.83, 1.01, -1.108], accent: "cyan" },
    { position: [1.08, 1.01, -1.108], accent: "cyan" },
    { position: [0.83, 1.26, -1.108], accent: "cyan" },
    { position: [1.08, 1.26, -1.108], accent: "cyan" },
  ];
  const shelfItems: { x: number; w: number; h: number; color: string; accent: string }[] = [
    { x: -0.3, w: 0.07, h: 0.17, color: "#8a5f2e", accent: "#22d3ee" },
    { x: -0.18, w: 0.075, h: 0.18, color: "#263248", accent: "#84cc16" },
    { x: -0.03, w: 0.046, h: 0.105, color: "#3a3d46", accent: "#c084fc" },
    { x: 0.08, w: 0.056, h: 0.12, color: "#4a5568", accent: "#22d3ee" },
    { x: 0.22, w: 0.084, h: 0.086, color: "#2c3140", accent: "#f0abfc" },
    { x: 0.4, w: 0.12, h: 0.072, color: "#52525b", accent: "#67e8f9" },
  ];

  return (
    <group>
      {leftTiles.map(({ position, accent }) => (
        <AcousticTile key={`left-${position.join("-")}`} position={position} accent={accent} />
      ))}
      {rightTiles.map(({ position, accent }) => (
        <AcousticTile key={`right-${position.join("-")}`} position={position} accent={accent} />
      ))}

      {/* Black display shelf with collectible arcade boxes, cartridges, and a retro controller. */}
      <mesh position={[0.04, 1.075, -1.075]} castShadow>
        <boxGeometry args={[0.94, 0.028, 0.074]} />
        <meshStandardMaterial color="#07090f" roughness={0.52} metalness={0.38} />
      </mesh>
      <mesh position={[0.04, 1.095, -1.032]}>
        <boxGeometry args={[0.96, 0.006, 0.012]} />
        <meshStandardMaterial color="#111827" emissive="#c084fc" emissiveIntensity={0.26} roughness={0.4} />
      </mesh>
      <MiniArcade position={[-0.34, 1.195, -1.045]} color="#22d3ee" />
      <MiniArcade position={[-0.2, 1.195, -1.045]} color="#84cc16" />
      {shelfItems.map((item, i) => (
        <group key={item.x} position={[item.x, 1.13 + item.h / 2, -1.038]}>
          <mesh castShadow>
            <boxGeometry args={[item.w, item.h, 0.034]} />
            <meshStandardMaterial color={item.color} emissive={item.accent} emissiveIntensity={0.06} roughness={0.58} metalness={0.14} />
          </mesh>
          <mesh position={[0, item.h * 0.2, 0.019]}>
            <boxGeometry args={[item.w * 0.58, 0.01, 0.004]} />
            <meshStandardMaterial color={item.accent} emissive={item.accent} emissiveIntensity={0.52} roughness={0.28} />
          </mesh>
          {i === shelfItems.length - 1 ? (
            <>
              <mesh position={[-0.032, 0.002, 0.021]}>
                <circleGeometry args={[0.011, 16]} />
                <meshStandardMaterial color="#111827" emissive="#22d3ee" emissiveIntensity={0.38} roughness={0.36} />
              </mesh>
              <mesh position={[0.032, 0.002, 0.021]}>
                <circleGeometry args={[0.011, 16]} />
                <meshStandardMaterial color="#111827" emissive="#c084fc" emissiveIntensity={0.38} roughness={0.36} />
              </mesh>
            </>
          ) : null}
        </group>
      ))}

      <mesh position={[0.04, 0.925, -1.048]}>
        <boxGeometry args={[0.7, 0.006, 0.008]} />
        <meshStandardMaterial color="#e5e7eb" emissive="#f8fafc" emissiveIntensity={0.22} roughness={0.35} />
      </mesh>
      <mesh position={[0.04, 0.91, -1.046]}>
        <boxGeometry args={[0.46, 0.006, 0.008]} />
        <meshStandardMaterial color="#c084fc" emissive="#c084fc" emissiveIntensity={0.36} roughness={0.35} />
      </mesh>

      <Text position={[-0.315, 0.84, -1.06]} fontSize={0.074} lineHeight={0.82} letterSpacing={0.045} color="#1f2937" anchorX="center" anchorY="middle">
        {"INSERT\nCOIN"}
      </Text>
      <Text position={[-0.322, 0.847, -1.055]} fontSize={0.074} lineHeight={0.82} letterSpacing={0.045} color="#f0abfc" anchorX="center" anchorY="middle">
        {"INSERT\nCOIN"}
      </Text>
      <Text position={[-0.302, 0.833, -1.054]} fontSize={0.074} lineHeight={0.82} letterSpacing={0.045} color="#67e8f9" anchorX="center" anchorY="middle">
        {"INSERT\nCOIN"}
      </Text>
      <Text position={[0.445, 0.84, -1.06]} fontSize={0.074} lineHeight={0.82} letterSpacing={0.045} color="#1f2937" anchorX="center" anchorY="middle">
        {"GAME\nOVER"}
      </Text>
      <Text position={[0.435, 0.848, -1.055]} fontSize={0.074} lineHeight={0.82} letterSpacing={0.045} color="#67e8f9" anchorX="center" anchorY="middle">
        {"GAME\nOVER"}
      </Text>
      <Text position={[0.457, 0.833, -1.054]} fontSize={0.074} lineHeight={0.82} letterSpacing={0.045} color="#f0abfc" anchorX="center" anchorY="middle">
        {"GAME\nOVER"}
      </Text>

      <pointLight position={[-1.15, 0.88, -0.78]} intensity={1.75} distance={1.05} color="#22d3ee" />
      <pointLight position={[-0.72, 1.12, -0.8]} intensity={1.55} distance={0.95} color="#c084fc" />
      <pointLight position={[0.96, 1.04, -0.78]} intensity={1.7} distance={1.08} color="#22d3ee" />
      <pointLight position={[0.06, 0.72, -0.74]} intensity={1.15} distance={1.35} color="#a855f7" />
    </group>
  );
}

function Room() {
  const wood = useMemo(() => woodAlbedo(), []);
  const concrete = useMemo(() => concreteAlbedo(), []);
  const legX = DESK_SIZE[0] / 2 - 0.2;
  const frontZ = DESK_CENTER_Z + DESK_SIZE[2] / 2 - 0.11;
  const backZ = DESK_CENTER_Z - DESK_SIZE[2] / 2 + 0.18;

  return (
    <>
      <mesh position={[0, 0.83, -1.16]} receiveShadow>
        <planeGeometry args={[6, 3.2]} />
        <meshStandardMaterial map={concrete} color="#4b5563" roughness={0.9} metalness={0.03} />
      </mesh>
      <ReferenceWall />
      <mesh position={[DESK_CENTER_X, 0.025, DESK_CENTER_Z]} receiveShadow castShadow>
        <boxGeometry args={DESK_SIZE} />
        <meshStandardMaterial map={wood} color="#7d8491" roughness={0.68} metalness={0.04} />
      </mesh>
      {[
        [DESK_CENTER_X - legX, -0.12, frontZ],
        [DESK_CENTER_X + legX, -0.12, frontZ],
        [DESK_CENTER_X - legX, -0.12, backZ],
        [DESK_CENTER_X + legX, -0.12, backZ],
      ].map((p) => (
        <mesh key={p.join(",")} position={p as Vec3}>
          <boxGeometry args={[0.058, 0.24, 0.058]} />
          <meshStandardMaterial color="#151822" roughness={0.78} metalness={0.18} />
        </mesh>
      ))}
      <mesh position={[DESK_CENTER_X, -0.01, DESK_CENTER_Z]}>
        <boxGeometry args={[DESK_SIZE[0] - 0.06, 0.026, DESK_SIZE[2] - 0.05]} />
        <meshStandardMaterial color="#161923" roughness={0.82} metalness={0.12} />
      </mesh>
      <mesh position={[DESK_CENTER_X, 0.056, DESK_CENTER_Z + DESK_SIZE[2] / 2 + 0.004]}>
        <boxGeometry args={[DESK_SIZE[0] - 0.12, 0.006, 0.006]} />
        <meshStandardMaterial color="#22d3ee" emissive="#22d3ee" emissiveIntensity={0.32} roughness={0.28} />
      </mesh>
      <pointLight position={[0, 0.08, 0.68]} intensity={0.9} distance={2.3} color="#22d3ee" />
      <pointLight position={[0.72, 0.12, 0.42]} intensity={0.55} distance={1.2} color="#c084fc" />
    </>
  );
}

export function ArcadeScene({
  mode,
  onEnter,
  onArrived,
}: {
  mode: "idle" | "enter" | "exit";
  onEnter: () => void;
  onArrived: () => void;
}) {
  const reduced = prefersReducedMotion();
  const controlsRef = useRef<OrbitControlsImpl | null>(null);

  return (
    <Canvas
      shadows
      dpr={[1, 2]}
      gl={{ antialias: true, alpha: false, powerPreference: "high-performance" }}
      camera={{ fov: 40, near: 0.05, far: 16, position: DEFAULT_CAMERA_POSITION }}
      style={{ width: "100%", height: "100%" }}
    >
      <color attach="background" args={["#2f3748"]} />
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
        <Monitor reduced={reduced} enterEnabled={mode === "idle"} onEnter={onEnter} />
        <Speaker position={SPEAKER_LEFT} reduced={reduced} phase={0.08} />
        <Speaker position={SPEAKER_RIGHT} reduced={reduced} phase={0.58} />
        <Keyboard reduced={reduced} />
        <MousePad reduced={reduced} />
        <Mouse reduced={reduced} />
        <DeskAccessories />
        <HeadsetStand reduced={reduced} />
        <ContactShadows position={[0, 0.052, 0.12]} opacity={0.42} scale={2.75} blur={2.75} far={1.35} />
      </Suspense>
      <CameraRig mode={mode} controlsRef={controlsRef} onArrived={onArrived} />
      <StrictOrbitControls mode={mode} controlsRef={controlsRef} />
    </Canvas>
  );
}
