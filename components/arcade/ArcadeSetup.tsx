"use client";

import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef } from "react";
import { SceneErrorBoundary } from "@/components/three/SceneErrorBoundary";
import { useWebGLSupport } from "@/hooks/useWebGLSupport";
import { trackEvent } from "@/lib/analytics/client";
import { ARCADE_EXIT_FLAG } from "@/lib/arcade/session";

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

function getInitialMode(): "idle" | "exit" {
  if (typeof window === "undefined") return "idle";
  return sessionStorage.getItem(ARCADE_EXIT_FLAG) === "exit" ? "exit" : "idle";
}

export function ArcadeSetup() {
  const router = useRouter();
  const webgl = useWebGLSupport();
  const initialModeRef = useRef<"idle" | "exit">(getInitialMode());

  useEffect(() => {
    router.prefetch("/arcade");
  }, [router]);

  const goArcade = useCallback(() => {
    trackEvent("arcade_open", undefined, { onceKey: "arcade_open" });
    router.push("/arcade");
  }, [router]);

  return (
    <div className="arcade-rig relative h-[min(72vh,38rem)] min-h-[24rem] overflow-hidden">
      {webgl === false ? (
        <ArcadeFallback onEnter={goArcade} />
      ) : webgl === null ? (
        <div className="flex h-full items-center justify-center">
          <p className="text-xs text-muted" role="status">
            Loading rig…
          </p>
        </div>
      ) : (
        <SceneErrorBoundary fallback={<ArcadeFallback onEnter={goArcade} />}>
          <ArcadeScene initialMode={initialModeRef.current} onEnter={goArcade} />
        </SceneErrorBoundary>
      )}
    </div>
  );
}
