"use client";

import { Suspense, useEffect, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Preload, useGLTF } from "@react-three/drei";
import {
  BackSide,
  ClampToEdgeWrapping,
  RepeatWrapping,
  SRGBColorSpace,
  TextureLoader,
  type Texture,
} from "three";
import { SceneErrorBoundary } from "@/components/three/SceneErrorBoundary";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { useWebGLSupport } from "@/hooks/useWebGLSupport";

const PLANET_MODEL = "/models/planet/scene.gltf";
const PLANET_TEXTURE = "/models/planet/Planet_baseColor.png";
const CLOUD_TEXTURE = "/models/planet/Clouds_baseColor.png";

let modelProbe: Promise<boolean> | null = null;

function probePlanetModel() {
  if (!modelProbe) {
    modelProbe = fetch(PLANET_MODEL, { method: "HEAD" })
      .then((response) => response.ok)
      .catch(() => false);
  }
  return modelProbe;
}

function useOptionalTexture(path: string) {
  const [texture, setTexture] = useState<Texture | null>(null);

  useEffect(() => {
    let live = true;
    let loaded: Texture | null = null;

    fetch(path, { method: "HEAD" })
      .then((response) => {
        if (!response.ok) return;
        new TextureLoader().load(
          path,
          (next) => {
            next.colorSpace = SRGBColorSpace;
            next.wrapS = RepeatWrapping;
            next.wrapT = ClampToEdgeWrapping;
            next.anisotropy = 4;
            loaded = next;
            if (live) setTexture(next);
            else next.dispose();
          },
          undefined,
          () => undefined,
        );
      })
      .catch(() => undefined);

    return () => {
      live = false;
      loaded?.dispose();
    };
  }, [path]);

  return texture;
}

function ProceduralEarth() {
  const planetTexture = useOptionalTexture(PLANET_TEXTURE);
  const cloudTexture = useOptionalTexture(CLOUD_TEXTURE);

  return (
    <group rotation={[0.08, 0, -0.18]}>
      <mesh castShadow receiveShadow>
        <sphereGeometry args={[1.5, 96, 96]} />
        <meshStandardMaterial
          map={planetTexture}
          color={planetTexture ? "#ffffff" : "#123560"}
          metalness={0.08}
          roughness={0.78}
        />
      </mesh>
      <mesh scale={1.014}>
        <sphereGeometry args={[1.5, 96, 96]} />
        <meshStandardMaterial
          map={cloudTexture}
          alphaMap={cloudTexture}
          color="#edf7ff"
          transparent
          opacity={cloudTexture ? 0.62 : 0.08}
          depthWrite={false}
          roughness={0.9}
        />
      </mesh>
      <mesh scale={1.075}>
        <sphereGeometry args={[1.5, 64, 64]} />
        <meshBasicMaterial color="#4ea5ff" transparent opacity={0.09} side={BackSide} depthWrite={false} />
      </mesh>
    </group>
  );
}

function GltfEarth() {
  const earth = useGLTF(PLANET_MODEL);
  return <primitive object={earth.scene} scale={2.5} position={[0, 0, 0]} rotation={[0, 0, 0]} />;
}

function EarthScene() {
  const reducedMotion = useReducedMotion();
  const [hasModel, setHasModel] = useState(false);

  useEffect(() => {
    let live = true;
    void probePlanetModel().then((available) => {
      if (live) setHasModel(available);
    });
    return () => {
      live = false;
    };
  }, []);

  const fallback = <ProceduralEarth />;

  return (
    <>
      <ambientLight intensity={0.5} />
      <directionalLight position={[-4, 3, 5]} intensity={2.4} color="#f4f8ff" />
      <pointLight position={[4, -2, 3]} intensity={8} color="#3b82f6" distance={12} />
      <pointLight position={[-3, 1, -3]} intensity={5} color="#f0a7ba" distance={10} />
      {hasModel ? (
        <SceneErrorBoundary fallback={fallback}>
          <Suspense fallback={fallback}>
            <GltfEarth />
          </Suspense>
        </SceneErrorBoundary>
      ) : (
        fallback
      )}
      <OrbitControls
        autoRotate={!reducedMotion}
        autoRotateSpeed={0.55}
        enablePan={false}
        enableZoom={false}
        minPolarAngle={Math.PI / 2}
        maxPolarAngle={Math.PI / 2}
      />
      <Preload all />
    </>
  );
}

function EarthFallback() {
  return (
    <div className="relative h-full w-full overflow-hidden" aria-hidden="true">
      <div className="absolute left-1/2 top-1/2 aspect-square w-[min(72%,28rem)] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle_at_35%_28%,#d9f1ff_0%,#3269a2_12%,#123560_36%,#07182f_72%)] shadow-[0_0_90px_rgba(59,130,246,0.3)]" />
    </div>
  );
}

export function EarthCanvas() {
  const webgl = useWebGLSupport();
  const reducedMotion = useReducedMotion();

  if (webgl !== true) return <EarthFallback />;

  return (
    <Canvas
      dpr={[1, 1.5]}
      frameloop={reducedMotion ? "demand" : "always"}
      camera={{ position: [0, 0, 6], fov: 45, near: 0.1, far: 200 }}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      shadows
      className="h-full w-full !bg-transparent"
      style={{ background: "transparent" }}
      aria-label="Rotating 3D Earth"
    >
      <EarthScene />
    </Canvas>
  );
}
