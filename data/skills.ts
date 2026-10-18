import type { Skill, SkillCategory } from "@/types";

export const skills: Skill[] = [
  { id: "html", name: "HTML", category: "Frontend Development" },
  { id: "css", name: "CSS", category: "Frontend Development" },
  { id: "javascript", name: "JavaScript", category: "Frontend Development" },
  { id: "typescript", name: "TypeScript", category: "Frontend Development" },
  { id: "react", name: "React", category: "Frontend Development" },
  { id: "nextjs", name: "Next.js", category: "Frontend Development" },
  { id: "angular", name: "Angular", category: "Frontend Development" },
  { id: "gsap", name: "GSAP", category: "Frontend Development" },

  { id: "csharp", name: "C#", category: "Backend Development" },
  { id: "dotnet", name: ".NET", category: "Backend Development" },
  { id: "php", name: "PHP", category: "Backend Development" },
  { id: "rest", name: "REST APIs", category: "Backend Development" },
  { id: "mysql", name: "MySQL", category: "Backend Development" },
  { id: "sqlserver", name: "SQL Server", category: "Backend Development" },

  { id: "flutter", name: "Flutter", category: "Mobile Development" },
  { id: "dart", name: "Dart", category: "Mobile Development" },

  { id: "manual-testing", name: "Manual Testing", category: "Software Testing" },
  { id: "functional-testing", name: "Functional Testing", category: "Software Testing" },
  { id: "bug-reporting", name: "Bug Reporting", category: "Software Testing" },
  { id: "test-case-execution", name: "Test Case Execution", category: "Software Testing" },
  { id: "cross-browser-testing", name: "Cross-Browser Testing", category: "Software Testing" },

  { id: "git", name: "Git", category: "Tools & Platforms" },
  { id: "github", name: "GitHub", category: "Tools & Platforms" },
  { id: "vscode", name: "VS Code", category: "Tools & Platforms" },
  { id: "visual-studio", name: "Visual Studio", category: "Tools & Platforms" },
];

export const coreStrengths = [
  "Next.js & React",
  "Modern Web Development",
  "Full-Stack Applications",
  "Software Testing",
  "Responsive User Experiences",
] as const;

export const skillCategories: SkillCategory[] = [
  "Frontend Development",
  "Backend Development",
  "Mobile Development",
  "Software Testing",
  "Tools & Platforms",
];

export function getSkillsByCategory(category: SkillCategory): Skill[] {
  return skills.filter((skill) => skill.category === category);
}

export function getActiveSkillCategories(): SkillCategory[] {
  return skillCategories.filter(
    (category) => getSkillsByCategory(category).length > 0,
  );
}
