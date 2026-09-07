import type { Project, ProjectType } from "@/types";

export type ProjectFilterId = "all" | "web" | "mobile" | "php" | "frontend" | "other";

export const projectFilters: { id: ProjectFilterId; label: string }[] = [
  { id: "all", label: "All" },
  { id: "web", label: "Web" },
  { id: "mobile", label: "Mobile" },
  { id: "php", label: "PHP" },
  { id: "frontend", label: "Frontend" },
  { id: "other", label: "Other" },
];

export function matchesProjectFilter(
  project: Project,
  filter: ProjectFilterId,
): boolean {
  if (filter === "all") return true;
  const haystack = [
    project.category,
    project.projectType,
    ...project.technologies,
  ]
    .join(" ")
    .toLowerCase();

  if (filter === "web") {
    return (
      project.projectType === "interactive-web" ||
      haystack.includes("web") ||
      haystack.includes("react") ||
      haystack.includes("next")
    );
  }
  if (filter === "mobile") {
    return project.projectType === "mobile" || haystack.includes("flutter");
  }
  if (filter === "php") {
    return haystack.includes("php") || haystack.includes("laravel");
  }
  if (filter === "frontend") {
    return (
      haystack.includes("html") ||
      haystack.includes("css") ||
      haystack.includes("frontend")
    );
  }
  return (
    project.projectType === "case-study" || project.projectType === "video"
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
