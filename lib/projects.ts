import type { Project, ProjectType } from "@/types";

export type ProjectFilterId = "all" | "web" | "mobile" | "video" | "case-study";

export const projectFilters: { id: ProjectFilterId; label: string }[] = [
  { id: "all", label: "All" },
  { id: "web", label: "Web" },
  { id: "mobile", label: "Mobile" },
  { id: "video", label: "Video" },
  { id: "case-study", label: "Case Study" },
];

export function isProjectFilterId(value: string): value is ProjectFilterId {
  return projectFilters.some((item) => item.id === value);
}

export function matchesProjectFilter(
  project: Project,
  filter: ProjectFilterId,
): boolean {
  if (filter === "all") return true;
  if (filter === "web") return project.projectType === "interactive-web";
  if (filter === "mobile") return project.projectType === "mobile";
  if (filter === "video") return project.projectType === "video";
  return project.projectType === "case-study";
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
