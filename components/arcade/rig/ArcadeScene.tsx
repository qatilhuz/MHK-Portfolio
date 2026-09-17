"use client";

import { useEffect, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { ContactShadows } from "@react-three/drei";
import gsap from "gsap";
import { prefersReducedMotion } from "@/lib/motion/engine";
import { Keyboard } from "./Keyboard";
import { Monitor } from "./Monitor";
import { Mouse } from "./Mouse";
import { PcCase } from "./PcCase";

function CameraRig({
  entering,
  onArrived,
}: {
  entering: boolean;
  onArrived: () => void;
}) {
  const { camera } = useThree();
  const look = useRef({ x: 0.05, y: 0.32, z: 0 });
  const done = useRef(false);

  useEffect(() => {
    camera.position.set(1.05, 0.92, 1.45);
    camera.lookAt(0.05, 0.32, 0);
  }, [camera]);

  useEffect(() => {
    if (!entering) return;
    done.current = false;
    if (prefersReducedMotion()) {
      onArrived();
      return;
    }
    const tl = gsap.timeline({
      defaults: { ease: "power3.inOut" },
      onComplete: () => {
        if (!done.current) {
          done.current = true;
          onArrived();
        }
      },
    });
    tl.to(camera.position, { x: 0.2, y: 0.42, z: 0.22, duration: 0.55 }, 0);
    tl.to(look.current, { x: 0.2, y: 0.4, z: -0.2, duration: 0.55 }, 0);
    tl.to(camera.position, { x: 0.2, y: 0.4, z: 0.04, duration: 0.85 }, 0.45);
    tl.to(look.current, { x: 0.2, y: 0.4, z: -0.4, duration: 0.85 }, 0.45);
    tl.to(camera.position, { z: -0.12, duration: 0.55, ease: "power2.in" }, 1.2);
    return () => {
      tl.kill();
    };
  }, [camera, entering, onArrived]);

  useFrame(() => {
    camera.lookAt(look.current.x, look.current.y, look.current.z);
  });

  return null;
}

function Desk() {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow position={[0, 0, 0.05]}>
      <planeGeometry args={[2.4, 1.35]} />
      <meshStandardMaterial color="#1b1611" roughness={0.82} metalness={0.08} />
    </mesh>
  );
}

export function ArcadeScene({ onEntered }: { onEntered: () => void }) {
  const [entering, setEntering] = useState(false);
  const reduced = prefersReducedMotion();

  return (
    <Canvas
      shadows
      dpr={[1, 1.5]}
      gl={{ antialias: true, alpha: false }}
      camera={{ fov: 38, near: 0.05, far: 12, position: [1.05, 0.92, 1.45] }}
      style={{ width: "100%", height: "100%" }}
    >
      <color attach="background" args={["#07080c"]} />
      <hemisphereLight args={["#8ba4c8", "#1a120c", 0.45]} />
      <directionalLight
        position={[1.4, 2.2, 1.1]}
        intensity={1.15}
        castShadow
        shadow-mapSize={[1024, 1024]}
      />
      <ambientLight intensity={0.18} />
      <Desk />
      <PcCase reduced={reduced} />
      <Monitor onEnter={() => setEntering(true)} disabled={entering} reduced={reduced} />
      <Keyboard reduced={reduced} />
      <Mouse reduced={reduced} />
      <ContactShadows position={[0, 0.001, 0]} opacity={0.45} scale={3.2} blur={2.4} far={1.4} />
      <CameraRig entering={entering} onArrived={onEntered} />
    </Canvas>
  );
}
