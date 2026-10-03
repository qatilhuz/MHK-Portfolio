"use client";

import { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { useWorkspaceBreakpoint } from "@/hooks/useWorkspaceBreakpoint";
import { WorkspaceScene } from "./WorkspaceScene";

function SceneLoading() {
  return (
    <div className="flex h-full items-center justify-center">
      <p className="text-xs text-muted" role="status">
        Loading workspace…
      </p>
    </div>
  );
}

export function WorkspaceCanvas() {
  const reducedMotion = useReducedMotion();
  const breakpoint = useWorkspaceBreakpoint();

  return (
    <Suspense fallback={<SceneLoading />}>
      <Canvas
        dpr={[1, 1.5]}
        gl={{ antialias: true, alpha: false, powerPreference: "high-performance" }}
        shadows={breakpoint !== "mobile"}
        className="h-full w-full"
        aria-label="Interactive developer workspace"
      >
        <WorkspaceScene
          breakpoint={breakpoint}
          reducedMotion={reducedMotion}
        />
      </Canvas>
    </Suspense>
  );
}
