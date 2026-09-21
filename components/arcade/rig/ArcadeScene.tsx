"use client";

import { useEffect, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { ContactShadows } from "@react-three/drei";
import gsap from "gsap";
import { prefersReducedMotion } from "@/lib/motion/engine";
import { Keyboard } from "./Keyboard";
import { Monitor, Speaker } from "./Monitor";
import { Mouse, MousePad } from "./Mouse";
import { PcCase } from "./PcCase";

function CameraRig({
  entering,
  onArrived,
}: {
  entering: boolean;
  onArrived: () => void;
}) {
  const { camera } = useThree();
  const look = useRef({ x: 0.08, y: 0.28, z: 0.02 });
  const done = useRef(false);

  useEffect(() => {
    camera.position.set(0.12, 1.05, 1.72);
    camera.lookAt(0.08, 0.28, 0.02);
  }, [camera]);

  useEffect(() => {
    if (!entering) return;
    done.current = false;
    if (prefersReducedMotion()) {
      onArrived();
      return;
    }
    const tl = gsap.timeline({
      defaults: { ease: "power2.inOut" },
      onComplete: () => {
        if (!done.current) {
          done.current = true;
          onArrived();
        }
      },
    });
    tl.to(camera.position, { x: 0.02, y: 0.55, z: 0.85, duration: 0.7 }, 0);
    tl.to(look.current, { x: 0.02, y: 0.42, z: -0.16, duration: 0.7 }, 0);
    tl.to(camera.position, { x: 0.02, y: 0.43, z: 0.18, duration: 0.9 }, 0.55);
    tl.to(look.current, { z: -0.5, duration: 0.9 }, 0.55);
    tl.to(camera.position, { z: -0.05, duration: 0.55, ease: "power3.in" }, 1.35);
    return () => {
      tl.kill();
    };
  }, [camera, entering, onArrived]);

  useFrame(() => {
    camera.lookAt(look.current.x, look.current.y, look.current.z);
  });

  return null;
}

function Room() {
  return (
    <>
      <mesh position={[0, 0.9, -1.35]} receiveShadow>
        <planeGeometry args={[8, 4]} />
        <meshStandardMaterial color="#2a2a2c" roughness={0.95} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0.12]} receiveShadow>
        <boxGeometry args={[2.6, 1.5, 0.06]} />
        <meshStandardMaterial color="#c9ae86" roughness={0.78} metalness={0.04} />
      </mesh>
    </>
  );
}

export function ArcadeScene({
  entering,
  onEntered,
}: {
  entering: boolean;
  onEntered: () => void;
}) {
  const reduced = prefersReducedMotion();

  return (
    <Canvas
      shadows
      dpr={[1, 1.5]}
      gl={{ antialias: true, alpha: false, powerPreference: "high-performance" }}
      camera={{ fov: 36, near: 0.05, far: 16, position: [0.12, 1.05, 1.72] }}
      style={{ width: "100%", height: "100%" }}
    >
      <color attach="background" args={["#1c1c1e"]} />
      <hemisphereLight args={["#c8c4bc", "#3a3228", 0.55]} />
      <directionalLight
        position={[0.6, 2.4, 1.4]}
        intensity={1.25}
        castShadow
        shadow-mapSize={[1024, 1024]}
      />
      <ambientLight intensity={0.22} />
      <Room />
      <PcCase reduced={reduced} />
      <Monitor reduced={reduced} />
      <Speaker position={[-0.48, 0.1, -0.08]} />
      <Speaker position={[0.52, 0.1, -0.08]} />
      <Keyboard reduced={reduced} />
      <MousePad />
      <Mouse reduced={reduced} />
      <ContactShadows position={[0, 0.032, 0.12]} opacity={0.35} scale={3.4} blur={2.6} far={1.6} />
      <CameraRig entering={entering} onArrived={onEntered} />
    </Canvas>
  );
}
