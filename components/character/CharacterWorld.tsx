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

const CANVAS_DPR: [number, number] = [1, 1.35];
// R3F otherwise aims a newly configured camera at world origin. Keeping the
// camera level makes world Y = 0 coincide with the bottom of the 38vh stage.
const CANVAS_CAMERA = {
  position: [0, 1.52, 5.6] as [number, number, number],
  rotation: [0, 0, 0] as [number, number, number],
  fov: 30,
};
const CANVAS_GL = { antialias: true, alpha: true, powerPreference: "high-performance" as const };
const CANVAS_STYLE = { pointerEvents: "none" as const, background: "transparent" };

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
        <div className="pointer-events-none fixed inset-x-0 bottom-0 z-[45] h-[38vh]">
          <Canvas
            dpr={CANVAS_DPR}
            camera={CANVAS_CAMERA}
            gl={CANVAS_GL}
            className="h-full w-full !bg-transparent"
            style={CANVAS_STYLE}
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
