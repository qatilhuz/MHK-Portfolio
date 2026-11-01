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
  mediaFolder: string;
  seoTitle: string;
  seoDescription: string;
  screenshots: ProjectMedia[];
  video?: string;
  videoPoster?: string;
  githubUrl?: string;
  liveUrl?: string;
  localPreviewPath?: string;
  features: string[];
  role: string;
  previewMode: PreviewMode;
  isDemo: boolean;
  mediaStatus: "available" | "coming-soon";
  featured?: boolean;
}

/* ------------------------------------------------------------------ *
 * Cinematic project reel (home page #projects)
 *
 * Deliberately separate from `Project` above: the reel is a presentation
 * surface driven by media, while `Project` stays the canonical record that
 * feeds /projects, /projects/[slug], the sitemap, the assistant and the
 * terminal registry.
 * ------------------------------------------------------------------ */

/** Which renderer the card uses for its media slot. */
export type CinemaMediaType = "embed" | "video";

export type CinemaCategoryId = "personal" | "hudasoft" | "techcose";

export interface CinemaCategory {
  id: CinemaCategoryId;
  /** Tab label. */
  label: string;
  /** Short line shown under the reel heading while the tab is active. */
  tagline: string;
}

export interface CinemaProject {
  id: string;
  title: string;
  description: string;
  category: CinemaCategoryId;
  /** `embed` renders an <iframe>, `video` renders a <video>. */
  mediaType: CinemaMediaType;
  /** Live site URL for `embed`, video file URL for `video`. */
  mediaUrl: string;
  techStack: string[];
  /** Outbound "open live site" link. Falls back to `mediaUrl` for embeds. */
  liveUrl?: string;
  /** Internal case-study route, when the project has one. */
  caseStudyHref?: string;
  /** Poster frame for video cards, also used as fallback art. */
  poster?: string;
  /**
   * Set when a site refuses to be framed (X-Frame-Options / CSP
   * frame-ancestors). The card then shows `poster` — or a branded slate — in
   * place of the iframe, and keeps the outbound link. There is no reliable
   * way to detect a refused frame from script, so this stays a manual flag.
   */
  embedBlocked?: boolean;
  /** Delivery year or range, printed in the card slate. */
  year?: string;
  /** One-line role credit, printed in the card slate. */
  role?: string;
  /**
   * `true` while `mediaUrl` is still a placeholder. The card renders a branded
   * "media pending" slate with the expected path instead of a broken element,
   * so dropping the real file in and flipping this flag is the only edit
   * needed later.
   */
  pending?: boolean;
}

export type SkillCategory =
  | "Frontend Development"
  | "Backend Development"
  | "Mobile Development"
  | "Software Testing"
  | "Tools & Platforms";

export interface Skill {
  id: string;
  name: string;
  category: SkillCategory;
}

export interface Experience {
  id: string;
  company: string;
  role: string;
  location: string;
  startDate: string;
  endDate: string | null;
  description: string;
  responsibilities: string[];
  technologies: string[];
  achievements: string[];
}

export interface Education {
  id: string;
  credential: string;
  institution: string;
  startYear: string;
  endYear: string;
}

export type AssistantStatus =
  | "idle"
  | "listening"
  | "thinking"
  | "speaking"
  | "error"
  | "unavailable";

export interface AssistantLink {
  href: string;
  label: string;
}

export interface AssistantMessage {
  id: string;
  role: "visitor" | "assistant";
  text: string;
  links?: AssistantLink[];
}

export interface AssistantReply {
  text: string;
  links?: AssistantLink[];
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
