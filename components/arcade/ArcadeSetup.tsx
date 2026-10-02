"use client";

import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { Suspense, useCallback, useEffect, useRef, useState } from "react";
import { SceneErrorBoundary } from "@/components/three/SceneErrorBoundary";
import { useWebGLSupport } from "@/hooks/useWebGLSupport";
import { trackEvent } from "@/lib/analytics/client";
import { ARCADE_ENTER_EVENT, ARCADE_EXIT_FLAG, ARCADE_TRANSITION_LOCK_CLASS } from "@/lib/arcade/session";

const ArcadeScene = dynamic(
  () => import("./rig/ArcadeScene").then((mod) => mod.ArcadeScene),
  {
    ssr: false,
    loading: () => <ArcadeRigLoader label="Streaming arcade rig…" />,
  },
);

function ArcadeRigLoader({ label = "Preparing arcade rig…" }: { label?: string }) {
  return (
    <div className="arcade-loader" role="status" aria-live="polite">
      <div className="arcade-loader-card">
        <span className="arcade-loader-orb" aria-hidden="true" />
        <span className="arcade-loader-copy">{label}</span>
        <span className="arcade-loader-bar" aria-hidden="true">
          <span />
        </span>
      </div>
    </div>
  );
}

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
  const rigRef = useRef<HTMLDivElement>(null);
  const initialModeRef = useRef<"idle" | "exit">(getInitialMode());
  const [sceneRequested, setSceneRequested] = useState(initialModeRef.current === "exit");
  const [sceneInteractive, setSceneInteractive] = useState(false);
  const [sceneNearViewport, setSceneNearViewport] = useState(initialModeRef.current === "exit");
  const [pageVisible, setPageVisible] = useState(true);

  useEffect(() => {
    router.prefetch("/arcade");

    if (initialModeRef.current !== "exit") {
      document.body.classList.remove(ARCADE_TRANSITION_LOCK_CLASS);
    }
  }, [router]);

  useEffect(() => {
    const updateVisibility = () => setPageVisible(document.visibilityState !== "hidden");
    updateVisibility();
    document.addEventListener("visibilitychange", updateVisibility);
    return () => document.removeEventListener("visibilitychange", updateVisibility);
  }, []);

  useEffect(() => {
    if (webgl !== true) return;
    const node = rigRef.current;
    let cancelled = false;
    let idleId: number | null = null;
    let timeoutId: ReturnType<typeof setTimeout> | null = null;

    const requestScene = () => {
      if (cancelled) return;
      setSceneRequested(true);
    };
    const scheduleScene = () => {
      if (sceneRequested) return;
      timeoutId = globalThis.setTimeout(requestScene, 700);
      const requestIdle = (window as typeof window & { requestIdleCallback?: typeof window.requestIdleCallback }).requestIdleCallback;
      if (typeof requestIdle === "function") {
        idleId = requestIdle(requestScene, { timeout: 500 });
      }
    };

    if (initialModeRef.current === "exit" || window.location.hash === "#arcade") {
      setSceneNearViewport(true);
      requestAnimationFrame(scheduleScene);
    }

    if (!node) {
      scheduleScene();
      return () => {
        cancelled = true;
      };
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        const near = entry.isIntersecting;
        setSceneNearViewport(near);
        if (near) scheduleScene();
      },
      { rootMargin: "900px 0px", threshold: 0.01 },
    );
    observer.observe(node);

    return () => {
      cancelled = true;
      observer.disconnect();
      if (idleId !== null) window.cancelIdleCallback(idleId);
      if (timeoutId !== null) globalThis.clearTimeout(timeoutId);
    };
  }, [sceneRequested, webgl]);

  const goArcade = useCallback(() => {
    trackEvent("arcade_open", undefined, { onceKey: "arcade_open" });
    router.push("/arcade");
  }, [router]);

  const requestArcadeEnter = useCallback((event: React.MouseEvent<HTMLButtonElement>) => {
    if (!sceneInteractive) {
      setSceneRequested(true);
      return;
    }

    event.currentTarget.style.pointerEvents = "none";
    const handledByScene = !window.dispatchEvent(new CustomEvent(ARCADE_ENTER_EVENT, { cancelable: true }));

    if (!handledByScene) {
      goArcade();
    }
  }, [goArcade, sceneInteractive]);

  const sceneActive = sceneInteractive && sceneNearViewport && pageVisible;
  const handleSceneReady = useCallback(() => setSceneInteractive(true), []);
  const showLoadingOverlay = !sceneInteractive && initialModeRef.current !== "exit";

  return (
    <div ref={rigRef} className="arcade-rig relative h-[min(72vh,38rem)] min-h-[24rem] overflow-hidden">
      {webgl === false ? (
        <ArcadeFallback onEnter={goArcade} />
      ) : webgl === null ? (
        <ArcadeRigLoader label="Checking WebGL support…" />
      ) : (
        <>
          {sceneRequested ? (
            <SceneErrorBoundary fallback={<ArcadeFallback onEnter={goArcade} />}>
              <Suspense fallback={<ArcadeRigLoader label="Streaming arcade rig…" />}>
                <ArcadeScene
                  active={sceneActive}
                  initialMode={initialModeRef.current}
                  onEnter={goArcade}
                  onReady={handleSceneReady}
                />
              </Suspense>
            </SceneErrorBoundary>
          ) : null}
          {showLoadingOverlay ? <ArcadeRigLoader /> : null}
          {sceneInteractive ? (
            <button
              type="button"
              className="arcade-enter-hotspot"
              aria-label="Enter the Arcade"
              title="Enter the Arcade"
              onClick={requestArcadeEnter}
            >
              Enter the Arcade
            </button>
          ) : null}
        </>
      )}
    </div>
  );
}
