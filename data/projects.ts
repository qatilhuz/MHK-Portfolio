import type { Project } from "@/types";

/**
 * Entries with isDemo: true are UI placeholders only.
 * They are not real client work. Replace or delete freely.
 */
export const projects: Project[] = [
  {
    id: "demo-interactive-web",
    title: "Interactive Web Experience Demo",
    slug: "interactive-web-experience-demo",
    shortDescription:
      "Placeholder used to demonstrate the portfolio’s browser-preview layout. Not a shipped product.",
    description:
      "This is a labelled demo entry so the interactive-web card, detail page, and browser chrome can be reviewed. It is not a real project by Huzaifa Khan. Replace this record with verified work.",
    category: "Demo",
    technologies: ["HTML", "CSS", "JavaScript"],
    projectType: "interactive-web",
    thumbnail: "",
    thumbnailAlt: "Demo preview placeholder for an interactive web project",
    screenshots: [],
    features: [],
    role: "",
    previewMode: "iframe",
    isDemo: true,
  },
  {
    id: "demo-flutter",
    title: "Flutter Mobile App Demo",
    slug: "flutter-mobile-app-demo",
    shortDescription:
      "Placeholder used to demonstrate the phone-frame preview. Not a published app.",
    description:
      "This labelled demo exists so the mobile project type can be inspected in the UI. It is not a real Flutter application. Replace with verified mobile work when available.",
    category: "Demo",
    technologies: ["Flutter"],
    projectType: "mobile",
    thumbnail: "",
    thumbnailAlt: "Demo preview placeholder for a Flutter app",
    screenshots: [],
    features: [],
    role: "",
    previewMode: "gallery",
    isDemo: true,
  },
  {
    id: "demo-php",
    title: "PHP Web Application Demo",
    slug: "php-web-application-demo",
    shortDescription:
      "Placeholder used to demonstrate video and screenshot presentation for PHP work that is not run inside Next.js.",
    description:
      "This labelled demo shows how PHP projects will be presented with media instead of executing PHP in the portfolio. It is not a real application. Replace with verified PHP work later.",
    category: "Demo",
    technologies: ["PHP"],
    projectType: "video",
    thumbnail: "",
    thumbnailAlt: "Demo preview placeholder for a PHP application",
    screenshots: [],
    features: [],
    role: "",
    previewMode: "video",
    isDemo: true,
  },
];

export function getProjectBySlug(slug: string): Project | undefined {
  return projects.find((project) => project.slug === slug);
}

export function getPublishedProjects(): Project[] {
  return projects.filter((project) => !project.isDemo);
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
