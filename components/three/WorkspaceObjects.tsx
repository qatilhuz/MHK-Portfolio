"use client";

import { workspaceObjects } from "@/data/workspace";
import type { WorkspaceBreakpoint } from "@/types/workspace";
import { InteractiveObject } from "./interactions/InteractiveObject";
import { Desk } from "./objects/Desk";
import { ObjectMesh } from "./objects/WorkspaceMeshes";

interface WorkspaceObjectsProps {
  breakpoint: WorkspaceBreakpoint;
  reducedMotion: boolean;
}

export function WorkspaceObjects({
  breakpoint,
  reducedMotion,
}: WorkspaceObjectsProps) {
  const showLabel = breakpoint === "desktop";

  return (
    <group>
      <Desk />
      {workspaceObjects
        .filter((item) => breakpoint !== "mobile" || item.showOnMobile)
        .map((item) => (
          <InteractiveObject
            key={item.id}
            config={item}
            reducedMotion={reducedMotion}
            showLabel={showLabel}
          >
            <ObjectMesh id={item.id} />
          </InteractiveObject>
        ))}
    </group>
  );
}
