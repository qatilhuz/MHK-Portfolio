import type { Project } from "@/types";
import { hasRunnablePreview } from "@/lib/projects";
import { BrowserPreview } from "./BrowserPreview";
import { MediaPending } from "./MediaPending";
import { PhonePreview } from "./PhonePreview";
import { VideoPreview } from "./VideoPreview";

export function ProjectPreview({ project }: { project: Project }) {
  if (project.mediaStatus === "coming-soon" && !hasRunnablePreview(project)) {
    if (project.projectType === "mobile") {
      return <PhonePreview project={project} />;
    }
    return (
      <div className="overflow-hidden rounded-[var(--radius-lg)] border border-border">
        <MediaPending
          label={
            project.projectType === "case-study"
              ? "Case study"
              : "Project preview"
          }
          note="Project media coming soon"
        />
      </div>
    );
  }

  if (project.previewMode === "none") {
    return (
      <div className="overflow-hidden rounded-[var(--radius-lg)] border border-border">
        <MediaPending
          label="Preview"
          note="This project is documented as a case study."
        />
      </div>
    );
  }

  switch (project.projectType) {
    case "interactive-web":
      return hasRunnablePreview(project) ? (
        <BrowserPreview project={project} />
      ) : (
        <div className="overflow-hidden rounded-[var(--radius-lg)] border border-border">
          <MediaPending
            label="Browser preview"
            note="No live or local preview is available."
          />
        </div>
      );
    case "mobile":
      return <PhonePreview project={project} />;
    case "video":
      return <VideoPreview project={project} />;
    default:
      if (project.video) return <VideoPreview project={project} />;
      if (project.screenshots.length === 0) {
        return (
          <div className="overflow-hidden rounded-[var(--radius-lg)] border border-border">
            <MediaPending label="Case study" note="Project media coming soon" />
          </div>
        );
      }
      return null;
  }
}
