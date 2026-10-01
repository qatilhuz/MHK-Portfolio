"use client";

import { Suspense, useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState, type MutableRefObject, type RefObject } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { ContactShadows, OrbitControls, Text } from "@react-three/drei";
import { Color, type Camera, type Group, type MeshBasicMaterial, type MeshStandardMaterial, type PointLight } from "three";
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
import {
  attachArcadeSpatialZoom,
  clearArcadeSpatialZoom,
  getArcadeSpatialRoot,
  releaseArcadeSpatialInputLock,
} from "@/lib/arcade/spatialZoom";
import { ARCADE_ENTER_EVENT, ARCADE_EXIT_FLAG } from "@/lib/arcade/session";
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
const STUDIO_WALL_COLOR = "#e3e4e1";
const BACK_WALL_COLOR = "#2f312b";
const ARCADE_TEXT_FONT = "/fonts/ArcadeText-Bold.ttf";

type LookRef = ArcadePortalPoint;
type ArcadeTransitionMode = "idle" | "enter" | "exit";
type ArcadeTransitionRequest = (mode: Exclude<ArcadeTransitionMode, "idle">) => void;

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
  controls.enableDamping = enabled;
  controls.target.set(view.look.x, view.look.y, view.look.z);
  controls.update();
  controls.saveState();
}

function CameraRig({
  initialMode,
  controlsRef,
  transitionApiRef,
  onEnterComplete,
  onExitComplete,
}: {
  initialMode: "idle" | "exit";
  controlsRef: RefObject<OrbitControlsImpl | null>;
  transitionApiRef: MutableRefObject<ArcadeTransitionRequest | null>;
  onEnterComplete: () => void;
  onExitComplete: () => void;
}) {
  const { camera, gl } = useThree();
  const look = useRef({
    x: DEFAULT_LOOK_TARGET[0],
    y: DEFAULT_LOOK_TARGET[1],
    z: DEFAULT_LOOK_TARGET[2],
  });
  const phase = useRef<ArcadeTransitionMode>("idle");
  const originalPixelRatio = useRef<number | null>(null);
  const completionFallback = useRef<number | null>(null);
  const done = useRef(false);
  const timeline = useRef<ReturnType<typeof buildArcadePortalTimeline> | null>(null);
  const enterComplete = useRef(onEnterComplete);
  const exitComplete = useRef(onExitComplete);
  enterComplete.current = onEnterComplete;
  exitComplete.current = onExitComplete;

  useLayoutEffect(() => {
    const orientCamera = () => {
      camera.lookAt(look.current.x, look.current.y, look.current.z);
      if (phase.current !== "idle") {
        controlsRef.current?.target.set(look.current.x, look.current.y, look.current.z);
      }
    };
    const defaultView = getDefaultArcadePortalView();

    const setIdleView = () => {
      phase.current = "idle";
      camera.position.set(defaultView.position.x, defaultView.position.y, defaultView.position.z);
      look.current.x = defaultView.look.x;
      look.current.y = defaultView.look.y;
      look.current.z = defaultView.look.z;
      orientCamera();
      syncControlsToView(controlsRef.current, defaultView, true);
    };

    const startTransition: ArcadeTransitionRequest = (nextMode) => {
      timeline.current?.kill();
      timeline.current = null;
      if (completionFallback.current) {
        window.clearTimeout(completionFallback.current);
        completionFallback.current = null;
      }
      done.current = false;
      phase.current = nextMode;

      originalPixelRatio.current = gl.getPixelRatio();
      gl.setPixelRatio(1);

      const controls = controlsRef.current;
      controls?.update();
      const startView = nextMode === "enter"
        ? captureCurrentPortalView(camera, controls, look.current)
        : defaultView;

      if (controls) {
        controls.enabled = false;
        controls.enableDamping = false;
        controls.update();
      }

      const tl = buildArcadePortalTimeline(camera, look.current, startView);
      const spatialRoot = nextMode === "enter" ? attachArcadeSpatialZoom(tl, getArcadeSpatialRoot()) : null;
      timeline.current = tl;
      tl.eventCallback("onUpdate", orientCamera);
      orientCamera();

      const finish = () => {
        if (done.current) return;
        done.current = true;
        if (completionFallback.current) {
          window.clearTimeout(completionFallback.current);
          completionFallback.current = null;
        }
        timeline.current = null;
        phase.current = "idle";

        const restorePixelRatio = originalPixelRatio.current ?? Math.min(window.devicePixelRatio || 1, 2);
        gl.setPixelRatio(restorePixelRatio);
        originalPixelRatio.current = null;

        if (nextMode === "enter") {
          releaseArcadeSpatialInputLock();
          enterComplete.current();
          return;
        }

        syncControlsToView(controlsRef.current, defaultView, true);
        if (spatialRoot) {
          clearArcadeSpatialZoom(spatialRoot);
        }
        try {
          if (!document.querySelector("[data-arcade-spatial-active='true']")) {
            sessionStorage.removeItem(ARCADE_EXIT_FLAG);
          }
        } catch {
          /* ignore blocked storage */
        }
        exitComplete.current();
      };

      completionFallback.current = window.setTimeout(() => {
        if (done.current || phase.current !== nextMode) return;
        if (nextMode === "enter") tl.progress(1);
        else tl.progress(0);
        orientCamera();
        finish();
      }, (tl.duration() + 0.85) * 1000);

      if (prefersReducedMotion()) {
        if (nextMode === "enter") tl.progress(1);
        else tl.progress(0);
        orientCamera();
        finish();
        return;
      }

      if (nextMode === "enter") {
        tl.eventCallback("onComplete", finish);
        tl.play(0);
      } else {
        tl.progress(1);
        orientCamera();
        tl.eventCallback("onReverseComplete", finish);
        tl.reverse();
      }
    };

    transitionApiRef.current = startTransition;

    let exitFrame = 0;
    let settledExitFrame = 0;

    if (initialMode === "exit") {
      exitFrame = requestAnimationFrame(() => {
        settledExitFrame = requestAnimationFrame(() => startTransition("exit"));
      });
    } else {
      setIdleView();
    }

    return () => {
      cancelAnimationFrame(exitFrame);
      cancelAnimationFrame(settledExitFrame);
      transitionApiRef.current = null;
      timeline.current?.kill();
      timeline.current = null;
      if (completionFallback.current) {
        window.clearTimeout(completionFallback.current);
        completionFallback.current = null;
      }
      releaseArcadeSpatialInputLock();
    };
  }, [camera, controlsRef, gl, initialMode, transitionApiRef]);

  return null;
}

function StrictOrbitControls({
  controlsRef,
}: {
  controlsRef: RefObject<OrbitControlsImpl | null>;
}) {
  return (
    <OrbitControls
      ref={controlsRef}
      makeDefault
      enabled
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
  const alternate = accent === "cyan" ? "#a855f7" : "#22d3ee";
  const panel = useRef<MeshStandardMaterial>(null);
  const edgeMats = useRef<Array<MeshStandardMaterial | null>>([]);
  const crossMats = useRef<Array<MeshStandardMaterial | null>>([]);
  const tileLight = useRef<PointLight>(null);
  const baseColor = useMemo(() => new Color(glow), [glow]);
  const altColor = useMemo(() => new Color(alternate), [alternate]);
  const liveColor = useMemo(() => new Color(), []);
  const phase = position[0] * 1.7 + position[1] * 2.3;

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    const wave = 0.5 + 0.5 * Math.sin(t * 1.05 + phase);
    const runner = 0.5 + 0.5 * Math.sin(t * 2.15 + phase * 1.4);
    liveColor.lerpColors(baseColor, altColor, 0.18 + runner * 0.28);

    if (panel.current) {
      panel.current.color.copy(liveColor);
      panel.current.emissive.copy(liveColor);
      panel.current.emissiveIntensity = 0.14 + wave * 0.22;
      panel.current.opacity = 0.30 + wave * 0.22;
    }
    edgeMats.current.forEach((mat, index) => {
      if (!mat) return;
      const chase = 0.5 + 0.5 * Math.sin(t * 2.6 + phase + index * 1.18);
      mat.color.copy(liveColor);
      mat.emissive.copy(liveColor);
      mat.emissiveIntensity = 0.42 + chase * 0.78;
    });
    crossMats.current.forEach((mat, index) => {
      if (!mat) return;
      const flicker = 0.5 + 0.5 * Math.sin(t * 1.65 + phase + index * 0.85);
      mat.color.copy(liveColor);
      mat.emissive.copy(liveColor);
      mat.emissiveIntensity = 0.22 + flicker * 0.48;
    });
    if (tileLight.current) {
      tileLight.current.color.copy(liveColor);
      tileLight.current.intensity = 0.11 + wave * 0.18;
    }
  });

  return (
    <group position={position}>
      <mesh position={[0, 0, -0.014]} receiveShadow>
        <boxGeometry args={[0.248, 0.248, 0.01]} />
        <meshStandardMaterial ref={panel} color={glow} emissive={glow} emissiveIntensity={0.25} transparent opacity={0.42} roughness={0.4} />
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
          <meshStandardMaterial
            ref={(material) => {
              edgeMats.current[i] = material;
            }}
            color={glow}
            emissive={glow}
            emissiveIntensity={0.72}
            roughness={0.22}
            toneMapped={false}
          />
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
        <meshStandardMaterial
          ref={(material) => {
            crossMats.current[0] = material;
          }}
          color={dimGlow}
          emissive={glow}
          emissiveIntensity={0.36}
          roughness={0.36}
          toneMapped={false}
        />
      </mesh>
      <mesh position={[0, 0, 0.032]} rotation={[0, 0, -Math.PI / 4]}>
        <boxGeometry args={[0.12, 0.006, 0.005]} />
        <meshStandardMaterial
          ref={(material) => {
            crossMats.current[1] = material;
          }}
          color={dimGlow}
          emissive={glow}
          emissiveIntensity={0.36}
          roughness={0.36}
          toneMapped={false}
        />
      </mesh>
      <pointLight ref={tileLight} position={[0, 0, 0.12]} intensity={0.18} distance={0.32} color={glow} />
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


function NeonWallTitle() {
  const titleGroup = useRef<Group>(null);
  const titleMat = useRef<MeshStandardMaterial>(null);
  const plateMat = useRef<MeshBasicMaterial>(null);
  const barMats = useRef<Array<MeshStandardMaterial | null>>([]);
  const titleLight = useRef<PointLight>(null);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    const breath = 0.5 + 0.5 * Math.sin(t * 1.15);
    const chase = 0.5 + 0.5 * Math.sin(t * 2.35);
    if (titleGroup.current) {
      const s = 1 + breath * 0.012;
      titleGroup.current.scale.set(s, s, 1);
    }
    if (titleMat.current) {
      titleMat.current.emissiveIntensity = 1.85 + breath * 1.05;
    }
    if (plateMat.current) {
      plateMat.current.opacity = 0.045 + breath * 0.07;
    }
    barMats.current.forEach((mat, index) => {
      if (!mat) return;
      mat.emissiveIntensity = 0.55 + (index === 0 ? chase : 1 - chase) * 0.78;
    });
    if (titleLight.current) titleLight.current.intensity = 0.42 + breath * 0.28;
  });

  return (
    <group ref={titleGroup}>
      <mesh position={[0.04, 0.842, -1.061]}>
        <planeGeometry args={[0.86, 0.19]} />
        <meshBasicMaterial ref={plateMat} color="#22d3ee" transparent opacity={0.075} depthWrite={false} />
      </mesh>
      <mesh position={[0.04, 0.952, -1.052]}>
        <boxGeometry args={[0.7, 0.006, 0.006]} />
        <meshStandardMaterial
          ref={(material) => {
            barMats.current[0] = material;
          }}
          color="#67e8f9"
          emissive="#22d3ee"
          emissiveIntensity={0.95}
          roughness={0.24}
          toneMapped={false}
        />
      </mesh>
      <mesh position={[0.04, 0.73, -1.052]}>
        <boxGeometry args={[0.62, 0.006, 0.006]} />
        <meshStandardMaterial
          ref={(material) => {
            barMats.current[1] = material;
          }}
          color="#c084fc"
          emissive="#c084fc"
          emissiveIntensity={0.78}
          roughness={0.24}
          toneMapped={false}
        />
      </mesh>
      <Suspense fallback={null}>
        <Text
          font={ARCADE_TEXT_FONT}
          position={[0.04, 0.84, -1.045]}
          fontSize={0.118}
          letterSpacing={0.115}
          anchorX="center"
          anchorY="middle"
          outlineWidth={0.0045}
          outlineColor="#38bdf8"
          outlineOpacity={0.7}
        >
          HUZAIFA
          <meshStandardMaterial
            ref={titleMat}
            color="#ecfeff"
            emissive="#22d3ee"
            emissiveIntensity={2.35}
            roughness={0.18}
            metalness={0.04}
            toneMapped={false}
          />
        </Text>
      </Suspense>
      <pointLight ref={titleLight} position={[0.04, 0.84, -0.78]} intensity={0.5} distance={0.8} color="#22d3ee" />
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

      <NeonWallTitle />

      <pointLight position={[-1.15, 0.88, -0.78]} intensity={1.75} distance={1.05} color="#22d3ee" />
      <pointLight position={[-0.72, 1.12, -0.8]} intensity={1.55} distance={0.95} color="#c084fc" />
      <pointLight position={[0.96, 1.04, -0.78]} intensity={1.7} distance={1.08} color="#22d3ee" />
      <pointLight position={[0.06, 0.72, -0.74]} intensity={1.15} distance={1.35} color="#a855f7" />
    </group>
  );
}


function DeskAmbientLoops() {
  const edgeMat = useRef<MeshStandardMaterial>(null);
  const runnerMat = useRef<MeshStandardMaterial>(null);
  const runner = useRef<Group>(null);
  const cyanLight = useRef<PointLight>(null);
  const magentaLight = useRef<PointLight>(null);
  const cyan = useMemo(() => new Color("#22d3ee"), []);
  const magenta = useMemo(() => new Color("#c084fc"), []);
  const live = useMemo(() => new Color(), []);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    const breath = 0.5 + 0.5 * Math.sin(t * 0.82);
    const chase = (Math.sin(t * 0.62) + 1) * 0.5;
    live.lerpColors(cyan, magenta, chase);

    if (edgeMat.current) {
      edgeMat.current.color.copy(live);
      edgeMat.current.emissive.copy(live);
      edgeMat.current.emissiveIntensity = 0.24 + breath * 0.32;
    }
    if (runner.current) {
      runner.current.position.x = DESK_CENTER_X - 1.04 + ((t * 0.22) % 1) * 2.08;
    }
    if (runnerMat.current) {
      runnerMat.current.color.copy(live);
      runnerMat.current.emissive.copy(live);
      runnerMat.current.emissiveIntensity = 0.9 + breath * 0.72;
    }
    if (cyanLight.current) {
      cyanLight.current.color.copy(cyan);
      cyanLight.current.intensity = 0.7 + breath * 0.32;
    }
    if (magentaLight.current) {
      magentaLight.current.color.copy(magenta);
      magentaLight.current.intensity = 0.42 + (1 - breath) * 0.26;
    }
  });

  return (
    <>
      <mesh position={[DESK_CENTER_X, 0.056, DESK_CENTER_Z + DESK_SIZE[2] / 2 + 0.004]}>
        <boxGeometry args={[DESK_SIZE[0] - 0.12, 0.006, 0.006]} />
        <meshStandardMaterial ref={edgeMat} color="#22d3ee" emissive="#22d3ee" emissiveIntensity={0.32} roughness={0.28} toneMapped={false} />
      </mesh>
      <group ref={runner} position={[DESK_CENTER_X - 1.04, 0.0615, DESK_CENTER_Z + DESK_SIZE[2] / 2 + 0.010]}>
        <mesh>
          <boxGeometry args={[0.24, 0.004, 0.004]} />
          <meshStandardMaterial
            ref={runnerMat}
            color="#c084fc"
            emissive="#c084fc"
            emissiveIntensity={1.2}
            transparent
            opacity={0.82}
            roughness={0.18}
            toneMapped={false}
          />
        </mesh>
      </group>
      <pointLight ref={cyanLight} position={[0, 0.08, 0.68]} intensity={0.9} distance={2.3} color="#22d3ee" />
      <pointLight ref={magentaLight} position={[0.72, 0.12, 0.42]} intensity={0.55} distance={1.2} color="#c084fc" />
    </>
  );
}

function Room({ lite = false }: { lite?: boolean }) {
  const wood = useMemo(() => (lite ? null : woodAlbedo()), [lite]);
  const concrete = useMemo(() => (lite ? null : concreteAlbedo()), [lite]);
  const legX = DESK_SIZE[0] / 2 - 0.2;
  const frontZ = DESK_CENTER_Z + DESK_SIZE[2] / 2 - 0.11;
  const backZ = DESK_CENTER_Z - DESK_SIZE[2] / 2 + 0.18;

  return (
    <>
      <mesh position={[0, 0.83, -1.16]} receiveShadow>
        <planeGeometry args={[6, 3.2]} />
        <meshStandardMaterial color={BACK_WALL_COLOR} roughness={0.94} metalness={0.02} />
      </mesh>
      <mesh position={[-1.62, 0.83, -0.18]} rotation={[0, Math.PI / 2, 0]} receiveShadow>
        <planeGeometry args={[2.04, 3.2]} />
        <meshStandardMaterial map={concrete ?? undefined} color={STUDIO_WALL_COLOR} roughness={0.9} metalness={0.03} />
      </mesh>
      <mesh position={[1.62, 0.83, -0.18]} rotation={[0, -Math.PI / 2, 0]} receiveShadow>
        <planeGeometry args={[2.04, 3.2]} />
        <meshStandardMaterial map={concrete ?? undefined} color={STUDIO_WALL_COLOR} roughness={0.9} metalness={0.03} />
      </mesh>
      {lite ? null : <ReferenceWall />}
      <mesh position={[DESK_CENTER_X, 0.025, DESK_CENTER_Z]} receiveShadow castShadow>
        <boxGeometry args={DESK_SIZE} />
        <meshStandardMaterial map={wood ?? undefined} color="#7d8491" roughness={0.68} metalness={0.04} />
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
      {lite ? null : <DeskAmbientLoops />}
    </>
  );
}

export function ArcadeScene({
  initialMode = "idle",
  onEnter,
}: {
  initialMode?: "idle" | "exit";
  onEnter: () => void;
}) {
  const reduced = prefersReducedMotion();
  const controlsRef = useRef<OrbitControlsImpl | null>(null);
  const transitionApiRef = useRef<ArcadeTransitionRequest | null>(null);
  const transitionLocked = useRef(initialMode === "exit");
  const [fullRigReady, setFullRigReady] = useState(initialMode !== "exit");
  const transitionLite = !fullRigReady;
  const animationReduced = reduced || transitionLite;

  const handleEnter = useCallback(() => {
    if (transitionLocked.current) return;
    const startTransition = transitionApiRef.current;
    if (!startTransition) {
      onEnter();
      return;
    }

    transitionLocked.current = true;
    document.body.style.cursor = "";
    try {
      startTransition("enter");
    } catch (error) {
      console.error("Arcade enter transition failed", error);
      transitionLocked.current = false;
      releaseArcadeSpatialInputLock();
      onEnter();
    }
  }, [onEnter]);

  useEffect(() => {
    const requestEnter = (event: Event) => {
      event.preventDefault();
      handleEnter();
    };

    window.addEventListener(ARCADE_ENTER_EVENT, requestEnter);
    return () => window.removeEventListener(ARCADE_ENTER_EVENT, requestEnter);
  }, [handleEnter]);

  const handleExitComplete = useCallback(() => {
    transitionLocked.current = false;
    setFullRigReady(true);
  }, []);

  return (
    <Canvas
      shadows
      dpr={[1, 2]}
      gl={{ antialias: true, alpha: false, powerPreference: "high-performance" }}
      camera={{ fov: 40, near: 0.05, far: 16, position: DEFAULT_CAMERA_POSITION }}
      style={{ width: "100%", height: "100%", display: "block" }}
      onCreated={({ camera }) => {
        camera.lookAt(PORTAL_START_LOOK.x, PORTAL_START_LOOK.y, PORTAL_START_LOOK.z);
      }}
    >
      <color attach="background" args={[STUDIO_WALL_COLOR]} />
      <hemisphereLight args={["#dbeafe", "#15101f", 0.42]} />
      <directionalLight
        position={[0.42, 2.35, 1.55]}
        intensity={0.92}
        castShadow
        shadow-mapSize={[2048, 2048]}
      />
      <ambientLight intensity={0.16} />
      <Room lite={transitionLite} />
      {fullRigReady ? <PcCase reduced={reduced} /> : null}
      <Monitor reduced={animationReduced} enterEnabled={fullRigReady} transitionLite={transitionLite} onEnter={handleEnter} />
      {fullRigReady ? <Speaker position={SPEAKER_LEFT} reduced={reduced} phase={0.08} /> : null}
      {fullRigReady ? <Speaker position={SPEAKER_RIGHT} reduced={reduced} phase={0.58} /> : null}
      {fullRigReady ? <Keyboard reduced={reduced} /> : null}
      {fullRigReady ? <MousePad reduced={reduced} /> : null}
      {fullRigReady ? <Mouse reduced={reduced} /> : null}
      {fullRigReady ? <DeskAccessories /> : null}
      {fullRigReady ? <HeadsetStand reduced={reduced} /> : null}
      {fullRigReady ? <ContactShadows position={[0, 0.052, 0.12]} opacity={0.42} scale={2.75} blur={2.75} far={1.35} /> : null}
      <CameraRig
        initialMode={initialMode}
        controlsRef={controlsRef}
        transitionApiRef={transitionApiRef}
        onEnterComplete={onEnter}
        onExitComplete={handleExitComplete}
      />
      <StrictOrbitControls controlsRef={controlsRef} />
    </Canvas>
  );
}
