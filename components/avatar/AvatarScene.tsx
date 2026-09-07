"use client";

import { Canvas } from "@react-three/fiber";
import { ContactShadows } from "@react-three/drei";
import { materials } from "@/components/three/materials";
import type { AssistantStatus } from "@/types";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { AvatarController } from "./AvatarController";

export function AvatarScene({ status }: { status: AssistantStatus }) {
  const reducedMotion = useReducedMotion();

  return (
    <Canvas
      dpr={[1, 1.5]}
      camera={{ position: [0.6, 1.1, 2.4], fov: 40 }}
      gl={{ antialias: true, alpha: false }}
      className="h-full w-full"
      aria-label="Portfolio assistant avatar placeholder"
    >
      <color attach="background" args={[materials.sceneBg]} />
      <ambientLight intensity={0.4} />
      <directionalLight position={[2, 3, 2]} intensity={0.9} />
      <AvatarController status={status} reducedMotion={reducedMotion} />
      <ContactShadows position={[0, -0.05, 0]} opacity={0.35} scale={4} blur={2} />
    </Canvas>
  );
}
