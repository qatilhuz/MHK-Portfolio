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
      {/* A dark charcoal shell needs harder, tighter speculars than a white
          one did: the form now reads from highlights rather than from
          diffuse shading. Still no HDR, so nothing is fetched. */}
      <ambientLight intensity={0.35} />
      <directionalLight position={[2.2, 3, 2.5]} intensity={2.1} />
      {/* Cool rim along the left edge carves the silhouette off the panel. */}
      <directionalLight position={[-3, 0.6, 1.2]} intensity={1.35} color="#7dd3fc" />
      {/* Warm underside bounce stops the chin going dead black. */}
      <directionalLight position={[0.4, -2.2, 1.6]} intensity={0.5} color="#fbbf24" />
      {/* Tight front kicker for the visor's glass highlight. */}
      <pointLight position={[0, 0.5, 1.5]} intensity={1.4} color="#e0f2fe" />
      <pointLight position={[-0.9, -0.3, 0.9]} intensity={0.7} color="#38bdf8" />

      <AiFaceAvatar status={status} emotion={emotion} reducedMotion={reducedMotion} />

      <ContactShadows position={[0, -0.46, 0]} opacity={0.5} scale={2.4} blur={2.8} far={1.3} />
    </Canvas>
  );
}
