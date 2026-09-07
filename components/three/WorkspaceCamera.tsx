"use client";

import { useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { PerspectiveCamera } from "@react-three/drei";
import type { PerspectiveCamera as PerspectiveCameraImpl } from "three";
import { workspaceCamera } from "@/data/workspace";
import type { WorkspaceBreakpoint } from "@/types/workspace";

interface WorkspaceCameraProps {
  breakpoint: WorkspaceBreakpoint;
  reducedMotion: boolean;
}

export function WorkspaceCamera({
  breakpoint,
  reducedMotion,
}: WorkspaceCameraProps) {
  const cameraRef = useRef<PerspectiveCameraImpl>(null);
  const pointer = useThree((state) => state.pointer);
  const preset = workspaceCamera[breakpoint];

  useFrame(() => {
    const camera = cameraRef.current;
    if (!camera) return;
    const parallax = reducedMotion ? 0 : breakpoint === "mobile" ? 0.08 : 0.18;
    camera.position.x +=
      (preset.position[0] + pointer.x * parallax - camera.position.x) * 0.06;
    camera.position.y +=
      (preset.position[1] + pointer.y * parallax * 0.4 - camera.position.y) *
      0.06;
    camera.position.z += (preset.position[2] - camera.position.z) * 0.06;
    camera.lookAt(0, 0.35, 0);
  });

  return (
    <PerspectiveCamera
      ref={cameraRef}
      makeDefault
      fov={preset.fov}
      position={preset.position}
      near={0.1}
      far={40}
    />
  );
}
