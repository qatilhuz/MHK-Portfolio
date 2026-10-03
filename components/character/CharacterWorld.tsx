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
          className="pointer-events-none fixed bottom-0 left-0 z-[10020] isolate block h-[38vh] w-screen overflow-visible"
          style={{
            position: "fixed",
            bottom: 0,
            left: 0,
            width: "100vw",
            height: "38vh",
            display: "block",
            visibility: "visible",
            opacity: 1,
          }}
        >
          <Canvas
            dpr={[1, 1.35]}
            camera={{ position: [0, 1.52, 5.6], fov: 30 }}
            gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
            className="block h-full w-full !bg-transparent"
            style={{
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
