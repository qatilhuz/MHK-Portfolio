"use client";

import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { Suspense, useCallback, useEffect, useRef, useState } from "react";
import { SceneErrorBoundary } from "@/components/three/SceneErrorBoundary";
import { useWebGLSupport } from "@/hooks/useWebGLSupport";
import { trackEvent } from "@/lib/analytics/client";
import { ARCADE_ENTER_EVENT, ARCADE_EXIT_FLAG, ARCADE_TRANSITION_LOCK_CLASS } from "@/lib/arcade/session";

const TERMINAL_BOOT_LINES = [
  "Initializing Huzaifa's 3D workspace...",
  "Loading custom RGB fan configurations...",
  "Huzaifa is developing the arcade...",
  "Rendering ultra-realistic monitors...",
  "Compiling complex WebGL shaders...",
  "Finalizing cinematic camera angles...",
  "System Ready. Booting up...",
];

function terminalFrameAt(elapsedMs: number) {
  const typeMs = 42;
  const deleteMs = 20;
  const pauseMs = 720;
  const gapMs = 120;
  const totalMs = TERMINAL_BOOT_LINES.reduce(
    (sum, line) => sum + line.length * typeMs + pauseMs + line.length * deleteMs + gapMs,
    0,
  );
  let cursor = elapsedMs % totalMs;

  for (const line of TERMINAL_BOOT_LINES) {
    const typeDuration = line.length * typeMs;
    const deleteDuration = line.length * deleteMs;
    const segment = typeDuration + pauseMs + deleteDuration + gapMs;

    if (cursor <= segment) {
      if (cursor < typeDuration) {
        const chars = Math.min(line.length, Math.floor(cursor / typeMs));
        return line.slice(0, chars);
      }
      if (cursor < typeDuration + pauseMs) return line;
      if (cursor < typeDuration + pauseMs + deleteDuration) {
        const deleted = Math.floor((cursor - typeDuration - pauseMs) / deleteMs);
        return line.slice(0, Math.max(0, line.length - deleted));
      }
      return "";
    }

    cursor -= segment;
  }

  return TERMINAL_BOOT_LINES[0];
}

const ArcadeScene = dynamic(
  () => import("./rig/ArcadeScene").then((mod) => mod.ArcadeScene),
  {
    ssr: false,
    loading: () => <ArcadeTerminalLoader />,
  },
);

function ArcadeTerminalLoader({ exiting = false }: { exiting?: boolean }) {
  const [elapsed, setElapsed] = useState(0);
  const typedLine = terminalFrameAt(elapsed);

  useEffect(() => {
    const runtime = window as typeof window & { __arcadeTerminalBootStart?: number };
    runtime.__arcadeTerminalBootStart ??= performance.now();

    const update = () => setElapsed(performance.now() - (runtime.__arcadeTerminalBootStart ?? performance.now()));
    update();
    const interval = window.setInterval(update, 45);
    return () => window.clearInterval(interval);
  }, []);

  return (
    <div
      className={`arcade-loader arcade-terminal-loader${exiting ? " arcade-terminal-loader--exit" : ""}`}
      role="status"
      aria-live="polite"
    >
      <div className="arcade-terminal-window">
        <div className="arcade-terminal-chrome" aria-hidden="true">
          <span />
          <span />
          <span />
        </div>
        <div className="arcade-terminal-body">
          <p className="arcade-terminal-kicker">MHK_PORTFOLIO_BOOT / WEBGL_PIPELINE</p>
          <p className="arcade-terminal-line">
            <span className="arcade-terminal-prompt">dev@huzaifa:~$</span>
            <span className="arcade-terminal-text"> {typedLine}</span>
            <span className="arcade-terminal-cursor" aria-hidden="true" />
          </p>
          <div className="arcade-terminal-log" aria-hidden="true">
            <span>GPU layer primed</span>
            <span>Suspense stream active</span>
            <span>Awaiting shader warmup</span>
          </div>
        </div>
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
  const [sceneWarm, setSceneWarm] = useState(false);
  const [loaderReleaseReady, setLoaderReleaseReady] = useState(initialModeRef.current === "exit");
  const [loaderMounted, setLoaderMounted] = useState(initialModeRef.current !== "exit");
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
    if (initialModeRef.current === "exit") return;
    const releaseTimer = globalThis.setTimeout(() => setLoaderReleaseReady(true), 5200);
    return () => globalThis.clearTimeout(releaseTimer);
  }, []);

  useEffect(() => {
    if (webgl !== true) return;
    const node = rigRef.current;
    let cancelled = false;
    let timeoutId: ReturnType<typeof setTimeout> | null = null;

    const requestScene = () => {
      if (cancelled) return;
      setSceneRequested(true);
    };
    const scheduleScene = () => {
      if (sceneRequested || timeoutId !== null) return;
      timeoutId = globalThis.setTimeout(requestScene, 0);
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
      if (timeoutId !== null) globalThis.clearTimeout(timeoutId);
    };
  }, [sceneRequested, webgl]);

  const goArcade = useCallback(() => {
    trackEvent("arcade_open", undefined, { onceKey: "arcade_open" });
    router.push("/arcade");
  }, [router]);

  const sceneInteractive = sceneWarm && loaderReleaseReady;
  const sceneActive = sceneNearViewport && pageVisible;
  const handleSceneReady = useCallback(() => setSceneWarm(true), []);
  const showLoadingOverlay = !sceneInteractive && initialModeRef.current !== "exit";
  const canvasVisible = sceneInteractive || initialModeRef.current === "exit";

  useEffect(() => {
    if (initialModeRef.current === "exit") return;
    if (showLoadingOverlay) {
      setLoaderMounted(true);
      return;
    }
    const fadeTimer = globalThis.setTimeout(() => setLoaderMounted(false), 450);
    return () => globalThis.clearTimeout(fadeTimer);
  }, [showLoadingOverlay]);

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

  return (
    <div ref={rigRef} className="arcade-rig relative h-[min(72vh,38rem)] min-h-[24rem] overflow-hidden">
      {webgl === false ? (
        <ArcadeFallback onEnter={goArcade} />
      ) : webgl === null ? (
        <ArcadeTerminalLoader />
      ) : (
        <>
          {sceneRequested ? (
            <div className="arcade-scene-shell" data-visible={canvasVisible ? "true" : "false"}>
              <SceneErrorBoundary fallback={<ArcadeFallback onEnter={goArcade} />}>
                <Suspense fallback={<ArcadeTerminalLoader />}>
                  <ArcadeScene
                    active={sceneActive}
                    initialMode={initialModeRef.current}
                    onEnter={goArcade}
                    onReady={handleSceneReady}
                  />
                </Suspense>
              </SceneErrorBoundary>
            </div>
          ) : null}
          {loaderMounted ? <ArcadeTerminalLoader exiting={!showLoadingOverlay} /> : null}
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
