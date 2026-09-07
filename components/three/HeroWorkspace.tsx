"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useWebGLSupport } from "@/hooks/useWebGLSupport";
import { workspaceObjects } from "@/data/workspace";
import { SceneErrorBoundary } from "./SceneErrorBoundary";
import { WorkspaceFallback } from "./WorkspaceFallback";

const WorkspaceCanvas = dynamic(
  () => import("./WorkspaceCanvas").then((mod) => mod.WorkspaceCanvas),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-full items-center justify-center">
        <p className="text-xs text-muted" role="status">
          Loading workspace…
        </p>
      </div>
    ),
  },
);

export function HeroWorkspace() {
  const webgl = useWebGLSupport();

  return (
    <div className="flex h-full min-h-[280px] flex-col">
      <div className="relative min-h-[280px] flex-1 lg:min-h-[420px]">
        {webgl === null ? (
          <div className="flex h-full items-center justify-center">
            <p className="text-xs text-muted" role="status">
              Loading workspace…
            </p>
          </div>
        ) : webgl === false ? (
          <WorkspaceFallback />
        ) : (
          <SceneErrorBoundary>
            <WorkspaceCanvas />
          </SceneErrorBoundary>
        )}
      </div>
      <nav aria-label="Workspace objects">
        <ul className="flex flex-wrap gap-x-4 gap-y-2 border-t border-border px-4 py-3 text-xs text-muted">
          {workspaceObjects.map((item) => (
            <li key={item.id}>
              <Link href={item.href} className="hover:text-foreground">
                {item.label}
                <span className="text-muted"> · {item.caption}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
}
