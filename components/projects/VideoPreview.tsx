import type { Project } from "@/types";
import { MediaPending } from "./MediaPending";

export function VideoPreview({ project }: { project: Project }) {
  if (!project.video) {
    return (
      <div className="overflow-hidden rounded-[var(--radius-lg)] border border-border">
        <MediaPending label="Video preview" />
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-[var(--radius-lg)] border border-border bg-surface">
      <video
        className="aspect-video w-full"
        controls
        preload="none"
        poster={project.videoPoster || project.thumbnail || undefined}
        aria-label={`${project.title} demo video`}
      >
        <source src={project.video} />
        Your browser does not support embedded video.
      </video>
    </div>
  );
}
