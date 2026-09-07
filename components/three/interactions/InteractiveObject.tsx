"use client";

import { useRef, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { Html } from "@react-three/drei";
import gsap from "gsap";
import type { Group } from "three";
import type { WorkspaceObjectConfig } from "@/types/workspace";
import type { ThreeEvent } from "@react-three/fiber";

interface InteractiveObjectProps {
  config: WorkspaceObjectConfig;
  reducedMotion: boolean;
  showLabel: boolean;
  children: ReactNode;
}

export function InteractiveObject({
  config,
  reducedMotion,
  showLabel,
  children,
}: InteractiveObjectProps) {
  const group = useRef<Group>(null);
  const router = useRouter();
  const [hovered, setHovered] = useState(false);

  const animateScale = (value: number) => {
    if (!group.current || reducedMotion) return;
    gsap.to(group.current.scale, {
      x: value,
      y: value,
      z: value,
      duration: 0.28,
      ease: "power2.out",
      overwrite: true,
    });
  };

  const onPointerOver = (event: ThreeEvent<PointerEvent>) => {
    event.stopPropagation();
    setHovered(true);
    document.body.style.cursor = "pointer";
    animateScale(1.04);
  };

  const onPointerOut = () => {
    setHovered(false);
    document.body.style.cursor = "";
    animateScale(1);
  };

  const onClick = (event: ThreeEvent<MouseEvent>) => {
    event.stopPropagation();
    router.push(config.href);
  };

  return (
    <group
      ref={group}
      position={config.position}
      rotation={config.rotation}
      onPointerOver={onPointerOver}
      onPointerOut={onPointerOut}
      onClick={onClick}
    >
      {children}
      {showLabel && hovered ? (
        <Html
          position={[0, 0.85, 0]}
          center
          distanceFactor={8}
          style={{ pointerEvents: "none" }}
        >
          <div className="rounded-md border border-border bg-surface/95 px-2 py-1 text-center shadow-[var(--shadow)]">
            <p className="text-[10px] uppercase tracking-[0.14em] text-muted">
              {config.label}
            </p>
            <p className="text-xs text-foreground">{config.caption}</p>
          </div>
        </Html>
      ) : null}
    </group>
  );
}
