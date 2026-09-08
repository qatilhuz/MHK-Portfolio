"use client";

import { Canvas } from "@react-three/fiber";
import { ContactShadows } from "@react-three/drei";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { materials } from "@/components/three/materials";
import type { GuidePose } from "@/lib/guide/types";
import { GuideModel } from "./GuideModel";

export function GuideCanvas({ pose }: { pose: GuidePose }) {
  const reducedMotion = useReducedMotion();

  return (
    <Canvas
      dpr={[1, 1.4]}
      camera={{ position: [0.55, 1.05, 2.35], fov: 38 }}
      gl={{ antialias: true, alpha: false, powerPreference: "high-performance" }}
      className="h-full w-full"
      aria-hidden
    >
      <color attach="background" args={[materials.sceneBg]} />
      <ambientLight intensity={0.4} />
      <directionalLight position={[2, 3, 2]} intensity={0.95} color={materials.light} />
      <pointLight position={[0, 1.2, 1]} intensity={0.35} color={materials.accent} />
      <GuideModel pose={pose} reducedMotion={reducedMotion} />
      {!reducedMotion ? (
        <ContactShadows position={[0, -0.88, 0]} opacity={0.32} scale={3.4} blur={2.1} />
      ) : null}
    </Canvas>
  );
}
