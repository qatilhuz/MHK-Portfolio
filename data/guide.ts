import { siteConfig } from "@/data/site";
import type { GuidedSection } from "@/lib/guide/types";

export const GUIDE_MODEL_PATH = "/models/portfolio-guide.glb";
export const GUIDE_SKIP_KEY = "mhk-guide-skipped";

export const guidedSections: GuidedSection[] = [
  {
    id: "hero",
    target: "hero",
    message: `Hi, I'm ${siteConfig.legalName}. Welcome to my portfolio. I'm a ${siteConfig.role} focused on ${siteConfig.specialization}.`,
    voiceText: `Hi, I'm ${siteConfig.legalName}. Welcome to my portfolio. I'm a ${siteConfig.role} focused on ${siteConfig.specialization}.`,
    pose: "greet",
    readingMs: 5200,
  },
  {
    id: "about",
    target: "about",
    message: `I'm based in ${siteConfig.location}. This section is a short introduction — not a biography beyond the CV.`,
    voiceText: `I'm based in ${siteConfig.location}. This section is a short introduction — not a biography beyond the CV.`,
    pose: "talk",
    readingMs: 4200,
  },
  {
    id: "skills",
    target: "skills",
    message:
      "Here are the languages, frameworks, and tools listed on my CV, including React, Next.js, and .NET.",
    voiceText:
      "Here are the languages, frameworks, and tools listed on my CV, including React, Next.js, and .NET.",
    pose: "present",
    readingMs: 4200,
  },
  {
    id: "experience",
    target: "experience",
    message:
      "These are the verified roles: .NET Developer at Techcose Solutions, and previously Next.js and React Developer at Hudasoft.",
    voiceText:
      "These are the verified roles: .NET Developer at Techcose Solutions, and previously Next.js and React Developer at Hudasoft.",
    pose: "talk",
    readingMs: 5000,
  },
  {
    id: "projects",
    target: "projects",
    message:
      "Four CV projects live here: a PHP store, a Flutter laptop app, a weather SPA, and a gaming UI showcase. Media is coming soon.",
    voiceText:
      "Four CV projects live here: a PHP store, a Flutter laptop app, a weather SPA, and a gaming UI showcase. Media is coming soon.",
    pose: "present",
    readingMs: 5200,
  },
  {
    id: "qa",
    target: "qa",
    message:
      "QA Bug Hunt is a teaching demo: find deliberate defects, classify them, and report. It is not a client defect log.",
    voiceText:
      "QA Bug Hunt is a teaching demo: find deliberate defects, classify them, and report. It is not a client defect log.",
    pose: "talk",
    readingMs: 4500,
  },
  {
    id: "arcade",
    target: "arcade",
    message:
      "Dev Arcade has four small browser games — coding demos, not commercial products.",
    voiceText:
      "Dev Arcade has four small browser games — coding demos, not commercial products.",
    pose: "present",
    readingMs: 3800,
  },
  {
    id: "terminal",
    target: "terminal",
    message:
      "The Developer Terminal is a simulated CLI. Try help. It cannot run real shell commands.",
    voiceText:
      "The Developer Terminal is a simulated CLI. Try help. It cannot run real shell commands.",
    pose: "talk",
    readingMs: 3800,
  },
  {
    id: "assistant",
    target: "avatar",
    message:
      "The portfolio assistant answers only from verified site data. It is separate from this guided intro.",
    voiceText:
      "The portfolio assistant answers only from verified site data. It is separate from this guided intro.",
    pose: "wave",
    readingMs: 4000,
  },
  {
    id: "resume",
    target: "resume",
    message:
      "The résumé section is ready. The PDF is not in the repository yet, so download stays unavailable.",
    voiceText:
      "The résumé section is ready. The PDF is not in the repository yet, so download stays unavailable.",
    pose: "talk",
    readingMs: 4000,
  },
  {
    id: "contact",
    target: "contact",
    message:
      "If you'd like to get in touch, use this form. GitHub is listed; email and LinkedIn are not public here yet.",
    voiceText:
      "If you'd like to get in touch, use this form. GitHub is listed; email and LinkedIn are not public here yet.",
    pose: "wave",
    readingMs: 4500,
  },
];
