"use client";

import { Canvas } from "@react-three/fiber";
import { Stars } from "@react-three/drei";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { useWebGLSupport } from "@/hooks/useWebGLSupport";

function StarsFallback() {
  return (
    <div
      className="absolute inset-0 bg-[radial-gradient(circle_at_14%_18%,rgba(255,255,255,0.55)_0_1px,transparent_1.5px),radial-gradient(circle_at_72%_34%,rgba(147,197,253,0.45)_0_1px,transparent_1.5px),radial-gradient(circle_at_38%_78%,rgba(255,255,255,0.35)_0_1px,transparent_1.5px)] bg-[size:72px_72px,96px_96px,128px_128px] opacity-40"
      aria-hidden="true"
    />
  );
}

export function StarsCanvas() {
  const webgl = useWebGLSupport();
  const reducedMotion = useReducedMotion();

  if (webgl !== true) return <StarsFallback />;

  return (
    <div className="pointer-events-none absolute inset-0 z-0" aria-hidden="true">
      <Canvas
        dpr={[1, 1.15]}
        frameloop={reducedMotion ? "demand" : "always"}
        camera={{ position: [0, 0, 1], fov: 60, near: 0.1, far: 100 }}
        gl={{ antialias: false, alpha: true, powerPreference: "high-performance" }}
        className="h-full w-full !bg-transparent"
        style={{ pointerEvents: "none", background: "transparent" }}
      >
        <Stars
          radius={60}
          depth={45}
          count={reducedMotion ? 900 : 2200}
          factor={3.2}
          saturation={0.18}
          fade
          speed={reducedMotion ? 0 : 0.32}
        />
      </Canvas>
    </div>
  );
}
