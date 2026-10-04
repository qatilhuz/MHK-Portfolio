"use client";

import { Component, useCallback, useState, type ReactNode } from "react";
import { Canvas } from "@react-three/fiber";
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
  const [screen, setScreen] = useState({ x: 0, y: 0 });
  const [line, setLine] = useState<string | null>(null);
  const onScreen = useCallback((x: number, y: number) => {
    setScreen((prev) => (Math.abs(prev.x - x) + Math.abs(prev.y - y) > 2 ? { x, y } : prev));
  }, []);

  if (!characterConfig.enabled || !characterConfig.is3DModelEnabled) return null;

  return (
    <>
      <CharacterCanvasBoundary fallback={<CharacterFallback label="Guide fallback" />}>
        <div className="pointer-events-none fixed inset-x-0 bottom-0 z-[45] h-[38vh]" data-character-world aria-hidden>
          <Canvas
            dpr={[1, 1.35]}
            camera={{ position: [0, 1.52, 5.6], fov: 30 }}
            gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
            className="h-full w-full !bg-transparent"
            style={{ pointerEvents: "none", background: "transparent" }}
            aria-hidden
          >
            <CharacterScene onScreen={onScreen} onLine={setLine} />
          </Canvas>
        </div>
      </CharacterCanvasBoundary>
      <CharacterHud x={screen.x} y={screen.y} line={line} />
    </>
  );
}
