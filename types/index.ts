export type ProjectType =
  | "interactive-web"
  | "video"
  | "mobile"
  | "case-study";

export type PreviewMode = "iframe" | "video" | "gallery" | "none";

export interface ProjectMedia {
  src: string;
  alt: string;
}

export interface Project {
  id: string;
  title: string;
  slug: string;
  shortDescription: string;
  description: string;
  category: string;
  technologies: string[];
  projectType: ProjectType;
  thumbnail: string;
  thumbnailAlt: string;
  screenshots: ProjectMedia[];
  video?: string;
  videoPoster?: string;
  githubUrl?: string;
  liveUrl?: string;
  localPreviewPath?: string;
  features: string[];
  role: string;
  previewMode: PreviewMode;
}

export type SkillCategory =
  | "Development"
  | "Frontend"
  | "Backend"
  | "Mobile"
  | "QA"
  | "Tools";

export interface Skill {
  id: string;
  name: string;
  category: SkillCategory;
}

export interface Experience {
  id: string;
  company: string;
  role: string;
  startDate: string;
  endDate: string | null;
  description: string;
  technologies: string[];
  achievements: string[];
}

export type SocialPlatform =
  | "github"
  | "linkedin"
  | "email"
  | "twitter"
  | "website";

export interface SocialLink {
  platform: SocialPlatform;
  label: string;
  url: string;
  icon: SocialPlatform;
}

export type FaqCategory =
  | "about"
  | "skills"
  | "experience"
  | "projects"
  | "qa"
  | "contact";

export interface FAQ {
  id: string;
  question: string;
  answer: string;
  category: FaqCategory;
  relatedSection?: string;
  relatedProject?: string;
}

export interface NavItem {
  href: string;
  label: string;
}
