"use client";

import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { useCallback } from "react";
import { SceneErrorBoundary } from "@/components/three/SceneErrorBoundary";
import { useWebGLSupport } from "@/hooks/useWebGLSupport";
import { trackEvent } from "@/lib/analytics/client";

const ArcadeScene = dynamic(
  () => import("./rig/ArcadeScene").then((mod) => mod.ArcadeScene),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-full items-center justify-center">
        <p className="text-xs text-muted" role="status">
          Loading rig…
        </p>
      </div>
    ),
  },
);

export function ArcadeSetup() {
  const router = useRouter();
  const webgl = useWebGLSupport();

  const enter = useCallback(() => {
    trackEvent("arcade_open", undefined, { onceKey: "arcade_open" });
    router.push("/arcade");
  }, [router]);

  return (
    <div className="arcade-rig relative h-[min(72vh,36rem)] min-h-[22rem] overflow-hidden">
      {webgl === false ? (
        <div className="flex h-full flex-col items-center justify-center gap-4 px-6 text-center">
          <p className="max-w-md text-sm text-muted">
            WebGL is unavailable, so the 3D rig is skipped.
          </p>
          <button type="button" className="arcade-enter" onClick={enter}>
            Enter the Arcade
          </button>
        </div>
      ) : webgl === null ? (
        <div className="flex h-full items-center justify-center">
          <p className="text-xs text-muted" role="status">
            Loading rig…
          </p>
        </div>
      ) : (
        <SceneErrorBoundary>
          <ArcadeScene onEntered={enter} />
        </SceneErrorBoundary>
      )}
    </div>
  );
}
