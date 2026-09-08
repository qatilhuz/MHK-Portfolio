"use client";

import { Canvas } from "@react-three/fiber";
import { ContactShadows } from "@react-three/drei";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { materials } from "@/components/three/materials";
import { useGuide } from "@/lib/guide/context";
import { CharacterHost } from "./CharacterHost";

export function GuideCanvas() {
  const guide = useGuide();
  const reducedMotion = useReducedMotion();
  if (!guide) return null;

  return (
    <Canvas
      dpr={[1, 1.4]}
      camera={{ position: [0.7, 1.15, 2.5], fov: 36 }}
      gl={{ antialias: true, alpha: false, powerPreference: "high-performance" }}
      className="h-full w-full touch-none"
      aria-label="Interactive portfolio host"
      onPointerMove={(event) => {
        const bounds = event.currentTarget.getBoundingClientRect();
        const x = ((event.clientX - bounds.left) / bounds.width) * 2 - 1;
        const y = ((event.clientY - bounds.top) / bounds.height) * 2 - 1;
        guide.setLook(x, y);
      }}
      onPointerLeave={() => guide.setLook(0, 0)}
    >
      <color attach="background" args={[materials.sceneBg]} />
      <ambientLight intensity={0.42} />
      <directionalLight position={[2.2, 3.2, 2]} intensity={1} color={materials.light} />
      <pointLight position={[0.2, 1.3, 1]} intensity={0.3} color={materials.accent} />
      <CharacterHost
        clip={guide.clip}
        look={guide.look}
        reducedMotion={reducedMotion}
        onHit={guide.react}
      />
      {!reducedMotion ? (
        <ContactShadows position={[0, -0.95, 0]} opacity={0.3} scale={3.2} blur={2} />
      ) : null}
    </Canvas>
  );
}
