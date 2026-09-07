import type { Project } from "@/types";

/**
 * Real project entries will be added when verified content is available.
 * Do not present placeholder work as shipped projects.
 */
export const projects: Project[] = [];

export function getProjectBySlug(slug: string): Project | undefined {
  return projects.find((project) => project.slug === slug);
}
