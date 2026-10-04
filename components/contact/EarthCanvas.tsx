"use client";

import { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Preload, useGLTF } from "@react-three/drei";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { useWebGLSupport } from "@/hooks/useWebGLSupport";

const PLANET_MODEL = "/models/planet/scene.gltf";

function Earth() {
  const earth = useGLTF(PLANET_MODEL);

  return (
    <primitive
      object={earth.scene}
      scale={2.5}
      position={[0, 0, 0]}
      rotation={[0, 0, 0]}
    />
  );
}

function EarthScene({ reducedMotion }: { reducedMotion: boolean }) {
  return (
    <>
      <ambientLight intensity={0.8} />
      <directionalLight position={[-4, 3, 5]} intensity={2.2} color="#f4f8ff" />
      <pointLight position={[4, -2, 3]} intensity={7} color="#3b82f6" distance={12} />
      <pointLight position={[-3, 1, -3]} intensity={4} color="#f0a7ba" distance={10} />
      <Suspense fallback={null}>
        <Earth />
        <Preload all />
      </Suspense>
      <OrbitControls
        autoRotate={!reducedMotion}
        autoRotateSpeed={0.55}
        enablePan={false}
        enableZoom={false}
        minPolarAngle={Math.PI / 2}
        maxPolarAngle={Math.PI / 2}
      />
    </>
  );
}

export function EarthCanvas() {
  const webgl = useWebGLSupport();
  const reducedMotion = useReducedMotion();

  if (webgl === false) {
    return (
      <div className="grid h-full w-full place-items-center" role="img" aria-label="3D Earth unavailable">
        <p className="text-xs uppercase tracking-[0.22em] text-muted">3D view unavailable</p>
      </div>
    );
  }

  if (webgl === null) return null;

  return (
    <Canvas
      dpr={[1, 1.5]}
      frameloop={reducedMotion ? "demand" : "always"}
      camera={{ position: [0, 0, 6], fov: 45, near: 0.1, far: 200 }}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      onCreated={({ gl }) => {
        gl.toneMappingExposure = 1.1;
      }}
      shadows
      className="h-full w-full !bg-transparent"
      style={{ background: "transparent" }}
      aria-label="Rotating 3D Earth"
    >
      <EarthScene reducedMotion={reducedMotion} />
    </Canvas>
  );
}

useGLTF.preload(PLANET_MODEL);
