import type { Project, ProjectType } from "@/types";

export type ProjectFilterId = "all" | "web" | "mobile" | "frontend";

export const projectFilters: { id: ProjectFilterId; label: string }[] = [
  { id: "all", label: "All" },
  { id: "web", label: "Web Development" },
  { id: "mobile", label: "Mobile Apps" },
  { id: "frontend", label: "UI / Frontend" },
];

export function isProjectFilterId(value: string): value is ProjectFilterId {
  return projectFilters.some((item) => item.id === value);
}

export function matchesProjectFilter(
  project: Project,
  filter: ProjectFilterId,
): boolean {
  if (filter === "all") return true;
  if (filter === "web") return project.category === "Web Development";
  if (filter === "mobile") return project.category === "Mobile Apps";
  return project.category === "UI / Frontend";
}

export function previewLabel(type: ProjectType): string {
  switch (type) {
    case "interactive-web":
      return "Browser preview";
    case "mobile":
      return "Device preview";
    case "video":
      return "Video preview";
    default:
      return "Case study";
  }
}

export function primaryActionLabel(project: Project): string {
  switch (project.projectType) {
    case "interactive-web":
      return "View Project";
    case "video":
      return "Watch Demo";
    case "mobile":
      return "View Case Study";
    default:
      return "View Case Study";
  }
}

export function hasRunnablePreview(project: Project): boolean {
  return Boolean(project.liveUrl || project.localPreviewPath);
}

export function hasProjectMedia(project: Project): boolean {
  return (
    Boolean(project.thumbnail) ||
    project.screenshots.length > 0 ||
    Boolean(project.video) ||
    hasRunnablePreview(project)
  );
}
