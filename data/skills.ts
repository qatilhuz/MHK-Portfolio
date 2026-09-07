import type { Skill, SkillCategory } from "@/types";

/**
 * Skills will be populated from verified information in a later batch.
 */
export const skills: Skill[] = [];

export const skillCategories: SkillCategory[] = [
  "Development",
  "Frontend",
  "Backend",
  "Mobile",
  "QA",
  "Tools",
];

export function getSkillsByCategory(category: SkillCategory): Skill[] {
  return skills.filter((skill) => skill.category === category);
}
