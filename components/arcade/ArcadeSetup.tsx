"use client";

import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";
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

function ArcadeFallback({ onEnter }: { onEnter: () => void }) {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-4 px-6 text-center">
      <p className="max-w-md text-sm text-muted">
        The 3D rig could not start in this browser. You can still open the arcade.
      </p>
      <button type="button" className="arcade-enter" onClick={onEnter}>
        Enter the Arcade
      </button>
    </div>
  );
}

export function ArcadeSetup() {
  const router = useRouter();
  const webgl = useWebGLSupport();
  const [entering, setEntering] = useState(false);

  const enter = useCallback(() => {
    trackEvent("arcade_open", undefined, { onceKey: "arcade_open" });
    router.push("/arcade");
  }, [router]);

  const start = useCallback(() => {
    setEntering(true);
  }, []);

  return (
    <div className="arcade-rig relative h-[min(72vh,38rem)] min-h-[24rem] overflow-hidden">
      {webgl === false ? (
        <ArcadeFallback onEnter={enter} />
      ) : webgl === null ? (
        <div className="flex h-full items-center justify-center">
          <p className="text-xs text-muted" role="status">
            Loading rig…
          </p>
        </div>
      ) : (
        <SceneErrorBoundary fallback={<ArcadeFallback onEnter={enter} />}>
          <ArcadeScene entering={entering} onEntered={enter} />
        </SceneErrorBoundary>
      )}
      {webgl && (
        <div className="pointer-events-none absolute inset-x-0 top-[38%] z-10 flex justify-center">
          <button
            type="button"
            className="arcade-enter pointer-events-auto"
            onClick={start}
            disabled={entering}
          >
            Enter the Arcade
          </button>
        </div>
      )}
    </div>
  );
}
