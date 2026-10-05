"use client";

import { Suspense, useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { PointMaterial, Points, Preload } from "@react-three/drei";
import type { Points as ThreePoints } from "three";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { useWebGLSupport } from "@/hooks/useWebGLSupport";

function createStarPositions(count: number) {
  const positions = new Float32Array(count * 3);
  let seed = 0x51f15e;
  const random = () => {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    return seed / 4294967296;
  };

  for (let index = 0; index < count; index += 1) {
    let x = 0;
    let y = 0;
    let z = 0;
    let lengthSq = 0;
    do {
      x = random() * 2 - 1;
      y = random() * 2 - 1;
      z = random() * 2 - 1;
      lengthSq = x * x + y * y + z * z;
    } while (lengthSq === 0 || lengthSq > 1);

    const radius = 0.45 + Math.cbrt(random()) * 1.05;
    const scale = radius / Math.sqrt(lengthSq);
    const offset = index * 3;
    positions[offset] = x * scale;
    positions[offset + 1] = y * scale;
    positions[offset + 2] = z * scale;
  }

  return positions;
}

function StarField({ reducedMotion }: { reducedMotion: boolean }) {
  const points = useRef<ThreePoints>(null);
  const positions = useMemo(
    () => createStarPositions(reducedMotion ? 900 : 1800),
    [reducedMotion],
  );

  useFrame((_, delta) => {
    if (!points.current || reducedMotion) return;
    points.current.rotation.x -= delta / 10;
    points.current.rotation.y -= delta / 15;
  });

  return (
    <group rotation={[0, 0, Math.PI / 4]}>
      <Points ref={points} positions={positions} stride={3} frustumCulled>
        <PointMaterial
          color="#f7a8cf"
          transparent
          opacity={0.88}
          depthWrite={false}
          size={0.006}
          sizeAttenuation
        />
      </Points>
    </group>
  );
}

function StarsFallback() {
  return (
    <div
      className="pointer-events-none absolute inset-0 z-[1] bg-[radial-gradient(circle_at_14%_18%,rgba(255,255,255,0.72)_0_1px,transparent_1.5px),radial-gradient(circle_at_72%_34%,rgba(247,168,207,0.68)_0_1px,transparent_1.5px),radial-gradient(circle_at_38%_78%,rgba(147,197,253,0.55)_0_1px,transparent_1.5px)] bg-[size:72px_72px,96px_96px,128px_128px] opacity-60"
      aria-hidden="true"
    />
  );
}

export function StarsCanvas() {
  const webgl = useWebGLSupport();
  const reducedMotion = useReducedMotion();

  if (webgl !== true) return <StarsFallback />;

  return (
    <div className="pointer-events-none absolute inset-0 z-[1] h-full w-full" aria-hidden="true">
      <Canvas
        dpr={[1, 1.15]}
        frameloop={reducedMotion ? "demand" : "always"}
        camera={{ position: [0, 0, 1], fov: 60, near: 0.01, far: 10 }}
        gl={{ antialias: false, alpha: true, powerPreference: "high-performance" }}
        className="h-full w-full !bg-transparent"
        style={{ pointerEvents: "none", background: "transparent" }}
      >
        <Suspense fallback={null}>
          <StarField reducedMotion={reducedMotion} />
          <Preload all />
        </Suspense>
      </Canvas>
    </div>
  );
}
