import type { Project } from "@/types";
import { BrowserPreview } from "./BrowserPreview";
import { MediaPending } from "./MediaPending";
import { PhonePreview } from "./PhonePreview";
import { VideoPreview } from "./VideoPreview";

export function ProjectPreview({ project }: { project: Project }) {
  if (project.previewMode === "none") {
    return (
      <div className="overflow-hidden rounded-[var(--radius-lg)] border border-border">
        <MediaPending label="Preview" note="This project is documented as a case study." />
      </div>
    );
  }

  switch (project.projectType) {
    case "interactive-web":
      return <BrowserPreview project={project} />;
    case "mobile":
      return <PhonePreview project={project} />;
    case "video":
      return <VideoPreview project={project} />;
    default:
      if (project.video) return <VideoPreview project={project} />;
      return (
        <div className="overflow-hidden rounded-[var(--radius-lg)] border border-border">
          <MediaPending label="Case study" />
        </div>
      );
  }
}
