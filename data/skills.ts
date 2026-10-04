import type { Skill, SkillCategory } from "@/types";

export const skills: Skill[] = [
  { id: "javascript", name: "JavaScript", category: "Languages" },
  { id: "typescript", name: "TypeScript", category: "Languages" },
  { id: "csharp", name: "C#", category: "Languages" },
  { id: "php", name: "PHP", category: "Languages" },
  { id: "dart", name: "Dart", category: "Languages" },
  { id: "html", name: "HTML", category: "Languages" },
  { id: "css", name: "CSS", category: "Languages" },
  { id: "sqlserver", name: "SQL Server", category: "Languages" },
  { id: "mysql", name: "MySQL", category: "Languages" },
  { id: "react", name: "React", category: "Frontend" },
  { id: "nextjs", name: "Next.js", category: "Frontend" },
  { id: "angular", name: "Angular", category: "Frontend" },
  { id: "gsap", name: "GSAP", category: "Frontend" },
  { id: "dotnet", name: ".NET", category: "Backend" },
  { id: "flutter", name: "Flutter", category: "Mobile" },
  { id: "git", name: "Git", category: "Tools" },
  { id: "vscode", name: "VS Code", category: "Tools" },
  { id: "visual-studio", name: "Visual Studio", category: "Tools" },
  { id: "rest", name: "REST APIs", category: "Tools" },
];

export const coreStrengths = [
  "Full-Stack Web Development",
  "Responsive UI/UX Implementation",
  "API Integration",
  "Cross-Browser Optimization",
  "Team Collaboration",
] as const;

export const skillCategories: SkillCategory[] = [
  "Languages",
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
