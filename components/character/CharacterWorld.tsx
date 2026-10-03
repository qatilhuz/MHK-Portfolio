"use client";

import dynamic from "next/dynamic";
import { useCallback, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { useWebGLSupport } from "@/hooks/useWebGLSupport";
import { useGuide } from "@/lib/guide/context";
import { characterConfig } from "@/data/characterConfig";
import { CharacterHud } from "./CharacterHud";

const CharacterScene = dynamic(
  () => import("./CharacterScene").then((mod) => mod.CharacterScene),
  { ssr: false },
);

export function CharacterWorld() {
  const guide = useGuide();
  const webgl = useWebGLSupport();
  const [screen, setScreen] = useState({ x: 0, y: 0 });
  const [line, setLine] = useState<string | null>(null);
  const onScreen = useCallback((x: number, y: number) => {
    setScreen((prev) => (Math.abs(prev.x - x) + Math.abs(prev.y - y) > 2 ? { x, y } : prev));
  }, []);

  if (!characterConfig.enabled || !characterConfig.is3DModelEnabled) return null;
  if (!guide?.visible) return null;

  return (
    <>
      {webgl === false ? null : (
        <div
          data-character-stage
          className="pointer-events-none fixed inset-x-0 bottom-0 block h-[38vh] w-screen overflow-visible"
          style={{
            position: "fixed",
            inset: "auto 0 0",
            zIndex: 2147483000,
            width: "100vw",
            minWidth: "100vw",
            height: "38vh",
            minHeight: "38vh",
            display: "block",
            overflow: "visible",
            pointerEvents: "none",
            visibility: "visible",
            opacity: 1,
            isolation: "isolate",
            transform: "translate3d(0, 0, 0)",
          }}
        >
          <Canvas
            dpr={[1, 1.35]}
            camera={{ position: [0, 1.52, 5.6], fov: 30 }}
            gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
            className="block h-full w-full !bg-transparent"
            style={{
              position: "absolute",
              inset: 0,
              zIndex: 1,
              width: "100vw",
              height: "38vh",
              minWidth: "100vw",
              minHeight: "38vh",
              pointerEvents: "none",
              background: "transparent",
              display: "block",
              visibility: "visible",
              opacity: 1,
            }}
            aria-hidden
          >
            <CharacterScene onScreen={onScreen} onLine={setLine} />
          </Canvas>
        </div>
      )}
      <CharacterHud x={screen.x} y={screen.y} line={line} />
    </>
  );
}
