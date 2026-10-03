"use client";

import { useCallback, useRef, useState } from "react";
import type { Project } from "@/types";
import { MediaPending } from "./MediaPending";

export function BrowserPreview({ project }: { project: Project }) {
  const frame = useRef<HTMLDivElement>(null);
  const [failed, setFailed] = useState(false);
  const src = project.liveUrl ?? project.localPreviewPath;

  const fullscreen = useCallback(() => {
    const node = frame.current;
    if (!node) return;
    if (document.fullscreenElement) {
      void document.exitFullscreen();
      return;
    }
    void node.requestFullscreen();
  }, []);

  return (
    <div
      ref={frame}
      className="overflow-hidden rounded-[var(--radius-lg)] border border-border bg-surface"
    >
      <div className="flex items-center gap-2 border-b border-border bg-surface-secondary px-3 py-2">
        <span className="h-2.5 w-2.5 rounded-full bg-border" aria-hidden />
        <span className="h-2.5 w-2.5 rounded-full bg-border" aria-hidden />
        <span className="h-2.5 w-2.5 rounded-full bg-accent/70" aria-hidden />
        <p className="ml-2 min-w-0 flex-1 truncate rounded-md border border-border bg-background px-2 py-1 font-mono text-xs text-muted">
          {src ?? "preview unavailable"}
        </p>
        {src ? (
          <button
            type="button"
            className="text-xs text-muted hover:text-foreground"
            onClick={fullscreen}
          >
            Fullscreen
          </button>
        ) : null}
      </div>
      {src && !failed ? (
        <iframe
          title={`${project.title} live preview`}
          src={src}
          className="aspect-video w-full bg-background"
          sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
          loading="lazy"
          referrerPolicy="no-referrer"
          onError={() => setFailed(true)}
        />
      ) : (
        <MediaPending
          label="Browser preview"
          note={
            failed
              ? "The live preview could not be loaded."
              : "No live URL or local preview is configured."
          }
        />
      )}
    </div>
  );
}
