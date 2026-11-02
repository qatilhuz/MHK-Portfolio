"use client";

import { Canvas } from "@react-three/fiber";
import { ContactShadows } from "@react-three/drei";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import type { AvatarEmotion } from "@/lib/assistant/emotion";
import type { AssistantStatus } from "@/types";
import { AiFaceAvatar } from "./AiFaceAvatar";

export function AvatarScene({
  status,
  emotion,
}: {
  status: AssistantStatus;
  emotion: AvatarEmotion;
}) {
  const reducedMotion = useReducedMotion();

  return (
    <Canvas
      dpr={[1, 1.75]}
      camera={{ position: [0, 0.03, 1.22], fov: 38 }}
      // alpha so the glassmorphism panel behind the canvas shows through.
      gl={{ antialias: true, alpha: true }}
      className="h-full w-full"
      aria-label="Portfolio assistant avatar"
    >
      <ambientLight intensity={0.55} />
      {/* Key, cool rim and a cyan kicker from the front: enough specular
          structure to sell the clearcoat without loading an HDR. */}
      <directionalLight position={[2, 3, 2.5]} intensity={1.6} />
      <directionalLight position={[-2.6, -0.4, 1.4]} intensity={0.55} color="#38bdf8" />
      <pointLight position={[0, 0.55, 1.7]} intensity={1.1} color="#67e8f9" />

      <AiFaceAvatar status={status} emotion={emotion} reducedMotion={reducedMotion} />

      <ContactShadows position={[0, -0.42, 0]} opacity={0.4} scale={2.2} blur={2.6} far={1.2} />
    </Canvas>
  );
}
