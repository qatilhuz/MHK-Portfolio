"use client";

import { useEffect, useMemo, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { ContactShadows } from "@react-three/drei";
import { prefersReducedMotion } from "@/lib/motion/engine";
import { buildArcadePortalTimeline } from "@/lib/arcade/portal";
import { Keyboard } from "./Keyboard";
import { Monitor, Speaker } from "./Monitor";
import { Mouse, MousePad } from "./Mouse";
import { PcCase } from "./PcCase";
import { concreteAlbedo, woodAlbedo } from "./textures";

function CameraRig({
  mode,
  onArrived,
}: {
  mode: "idle" | "enter" | "exit";
  onArrived: () => void;
}) {
  const { camera } = useThree();
  const look = useRef({ x: 0.08, y: 0.28, z: 0.02 });
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

function Room() {
  const wood = useMemo(() => woodAlbedo(), []);
  const concrete = useMemo(() => concreteAlbedo(), []);
  return (
    <>
      <mesh position={[0, 0.85, -1.15]} receiveShadow>
        <planeGeometry args={[6, 3.2]} />
        <meshStandardMaterial map={concrete} roughness={0.94} metalness={0.02} />
      </mesh>
      <mesh position={[0, 0.025, 0.1]} receiveShadow castShadow>
        <boxGeometry args={[1.72, 0.05, 0.92]} />
        <meshStandardMaterial map={wood} roughness={0.72} metalness={0.04} />
      </mesh>
      <mesh position={[0, -0.01, 0.1]}>
        <boxGeometry args={[1.7, 0.02, 0.9]} />
        <meshStandardMaterial color="#8a6d45" roughness={0.8} />
      </mesh>
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
      dpr={[1, 1.5]}
      gl={{ antialias: true, alpha: false, powerPreference: "high-performance" }}
      camera={{ fov: 34, near: 0.05, far: 16, position: [0.12, 1.05, 1.72] }}
      style={{ width: "100%", height: "100%" }}
    >
      <color attach="background" args={["#1c1c1e"]} />
      <hemisphereLight args={["#d2cdc4", "#3a3228", 0.5]} />
      <directionalLight
        position={[0.55, 2.2, 1.35]}
        intensity={1.2}
        castShadow
        shadow-mapSize={[1024, 1024]}
      />
      <ambientLight intensity={0.2} />
      <Room />
      <PcCase reduced={reduced} />
      <Monitor reduced={reduced} />
      <Speaker position={[-0.5, 0.12, -0.08]} />
      <Speaker position={[0.54, 0.12, -0.08]} />
      <Keyboard reduced={reduced} />
      <MousePad />
      <Mouse reduced={reduced} />
      <ContactShadows position={[0, 0.052, 0.1]} opacity={0.38} scale={2.4} blur={2.4} far={1.2} />
      <CameraRig mode={mode} onArrived={onArrived} />
    </Canvas>
  );
}
