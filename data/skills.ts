import type { Skill, SkillCategory } from "@/types";

export const skills: Skill[] = [
  { id: "nextjs", name: "Next.js", category: "Development" },
  { id: "react", name: "React", category: "Development" },
  { id: "javascript", name: "JavaScript", category: "Development" },
  { id: "typescript", name: "TypeScript", category: "Development" },
  { id: "html", name: "HTML", category: "Frontend" },
  { id: "css", name: "CSS", category: "Frontend" },
  { id: "tailwind", name: "Tailwind CSS", category: "Frontend" },
  { id: "php", name: "PHP", category: "Backend" },
  { id: "laravel", name: "Laravel", category: "Backend" },
  { id: "dotnet", name: ".NET Core", category: "Backend" },
  { id: "mysql", name: "MySQL", category: "Backend" },
  { id: "flutter", name: "Flutter", category: "Mobile" },
  { id: "manual-testing", name: "Manual Testing", category: "QA" },
  { id: "functional-testing", name: "Functional Testing", category: "QA" },
  { id: "test-cases", name: "Test Cases", category: "QA" },
  { id: "bug-reporting", name: "Bug Reporting", category: "QA" },
  { id: "sqa", name: "Software Quality Assurance", category: "QA" },
];

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

export function getActiveSkillCategories(): SkillCategory[] {
  return skillCategories.filter(
    (category) => getSkillsByCategory(category).length > 0,
  );
}
