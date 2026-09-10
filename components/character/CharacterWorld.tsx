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
        <div className="pointer-events-none fixed inset-x-0 bottom-0 z-[45] h-[26vh]">
          <Canvas
            dpr={[1, 1.35]}
            camera={{ position: [0, 0.55, 4.4], fov: 32 }}
            gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
            className="h-full w-full !bg-transparent"
            style={{ pointerEvents: "none", background: "transparent" }}
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
