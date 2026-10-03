"use client";

import { ContactShadows } from "@react-three/drei";
import type { WorkspaceBreakpoint } from "@/types/workspace";
import { WorkspaceCamera } from "./WorkspaceCamera";
import { WorkspaceLights } from "./WorkspaceLights";
import { materials } from "./materials";
import { WorkspaceObjects } from "./WorkspaceObjects";

interface WorkspaceSceneProps {
  breakpoint: WorkspaceBreakpoint;
  reducedMotion: boolean;
}

export function WorkspaceScene({
  breakpoint,
  reducedMotion,
}: WorkspaceSceneProps) {
  return (
    <>
      <color attach="background" args={[materials.sceneBg]} />
      <WorkspaceCamera breakpoint={breakpoint} reducedMotion={reducedMotion} />
      <WorkspaceLights />
      <WorkspaceObjects
        breakpoint={breakpoint}
        reducedMotion={reducedMotion}
      />
      <ContactShadows
        position={[0, -0.12, 0]}
        opacity={0.35}
        scale={6}
        blur={2.2}
        far={2.5}
      />
    </>
  );
}
