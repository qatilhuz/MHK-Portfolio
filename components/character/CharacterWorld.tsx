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
        <div
          data-character-world
          aria-hidden
          style={{
            position: "fixed",
            left: 0,
            right: 0,
            bottom: 0,
            width: "100vw",
            height: "38vh",
            minHeight: 260,
            zIndex: 50,
            pointerEvents: "none",
            display: "block",
            opacity: 1,
            overflow: "visible",
          }}
        >
          <Canvas
            dpr={[1, 1.35]}
            camera={{ position: [0, 1.52, 5.6], fov: 30, near: 0.1, far: 100 }}
            gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
            style={{ pointerEvents: "none", background: "transparent", display: "block", opacity: 1, width: "100%", height: "100%" }}
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
