"use client";

import { Component, useCallback, useState, type ReactNode } from "react";
import { Canvas } from "@react-three/fiber";
import { useWebGLSupport } from "@/hooks/useWebGLSupport";
import { useGuide } from "@/lib/guide/context";
import { characterConfig } from "@/data/characterConfig";
import { CharacterHud } from "./CharacterHud";
import { CharacterScene } from "./CharacterScene";
import { CharacterFallback } from "./CharacterFallback";

class CharacterCanvasBoundary extends Component<
  { children: ReactNode; fallback: ReactNode },
  { failed: boolean }
> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch(error: unknown) {
    console.error("Character canvas failed; showing fallback bot.", error);
  }

  render() {
    return this.state.failed ? this.props.fallback : this.props.children;
  }
}

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

  const fallback = <CharacterFallback label={webgl === false ? "Guide fallback" : "Guide loading"} />;

  return (
    <>
      {webgl !== false ? (
        <CharacterCanvasBoundary fallback={<CharacterFallback label="Guide fallback" />}>
          <div
            className="pointer-events-none fixed inset-x-0 bottom-0 z-[90] h-[min(70vh,680px)] min-h-[360px] opacity-100"
            data-character-world
            aria-hidden
            style={{ display: "block", opacity: 1, overflow: "visible" }}
          >
            <Canvas
              dpr={[1, 1.35]}
              camera={{ position: [0, 1.52, 5.6], fov: 30 }}
              gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
              className="h-full w-full !bg-transparent"
              style={{ pointerEvents: "none", background: "transparent", display: "block", opacity: 1, width: "100%", height: "100%" }}
              aria-hidden
            >
              <CharacterScene onScreen={onScreen} onLine={setLine} />
            </Canvas>
          </div>
        </CharacterCanvasBoundary>
      ) : (
        fallback
      )}
      <CharacterHud x={screen.x} y={screen.y} line={line} />
    </>
  );
}
