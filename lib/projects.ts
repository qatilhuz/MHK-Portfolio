import type { Project, ProjectType } from "@/types";

export type ProjectFilterId = "all" | "web" | "mobile" | "php" | "featured";

export const projectFilters: { id: ProjectFilterId; label: string }[] = [
  { id: "all", label: "All" },
  { id: "featured", label: "Featured" },
  { id: "web", label: "Web" },
  { id: "mobile", label: "Mobile" },
  { id: "php", label: "PHP" },
];

export function isProjectFilterId(value: string): value is ProjectFilterId {
  return projectFilters.some((item) => item.id === value);
}

export function matchesProjectFilter(
  project: Project,
  filter: ProjectFilterId,
): boolean {
  if (filter === "all") return true;
  if (filter === "featured") return Boolean(project.featured);
  if (filter === "mobile") return project.projectType === "mobile";
  if (filter === "php") {
    return (
      project.category === "PHP" ||
      project.technologies.some((tech) => tech.toLowerCase() === "php")
    );
  }
  return (
    project.category === "Web" ||
    project.category === "JavaScript" ||
    project.projectType === "interactive-web"
  );
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
