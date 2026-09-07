import type { Project } from "@/types";

/**
 * Real project entries will be added when verified content is available.
 * Do not present placeholder work as shipped projects.
 */
export const projects: Project[] = [];

export function getProjectBySlug(slug: string): Project | undefined {
  return projects.find((project) => project.slug === slug);
}

export function getRelatedProjects(slug: string, limit = 3): Project[] {
  const current = getProjectBySlug(slug);
  if (!current) return [];
  return projects
    .filter((project) => project.slug !== slug)
    .filter(
      (project) =>
        project.projectType === current.projectType ||
        project.technologies.some((tech) =>
          current.technologies.includes(tech),
        ),
    )
    .slice(0, limit);
}
