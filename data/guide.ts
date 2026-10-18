import type { GuidedSection } from "@/lib/guide/types";

export const GUIDE_MODEL_PATH = "/models/portfolio-guide.glb";
export const GUIDE_SKIP_KEY = "mhk-guide-skipped";

export const guidedSections: GuidedSection[] = [
  {
    id: "hero",
    target: "hero",
    message:
      "Welcome — I’m Huzaifa Khan, a full-stack developer who builds digital systems with Next.js, React, TypeScript, and modern web technologies.",
    voiceText:
      "Welcome — I’m Huzaifa Khan, a full-stack developer who builds digital systems with Next.js, React, TypeScript, and modern web technologies.",
    pose: "greet",
    readingMs: 5200,
  },
  {
    id: "about",
    target: "about",
    message:
      "I’m based in Karachi, Pakistan, and I care about both how software looks and how reliably it works.",
    voiceText:
      "I’m based in Karachi, Pakistan, and I care about both how software looks and how reliably it works.",
    pose: "talk",
    readingMs: 4200,
  },
  {
    id: "skills",
    target: "skills",
    message:
      "My toolkit spans frontend development, backend development, mobile apps, software testing, and practical developer tools.",
    voiceText:
      "My toolkit spans frontend development, backend development, mobile apps, software testing, and practical developer tools.",
    pose: "present",
    readingMs: 4200,
  },
  {
    id: "experience",
    target: "experience",
    message:
      "I currently work as a .NET Developer at Techcose Solutions, after building Next.js and React applications at Hudasoft.",
    voiceText:
      "I currently work as a .NET Developer at Techcose Solutions, after building Next.js and React applications at Hudasoft.",
    pose: "talk",
    readingMs: 5000,
  },
  {
    id: "projects",
    target: "projects",
    message:
      "Explore selected projects across web development, mobile apps, and frontend interfaces.",
    voiceText:
      "Explore selected projects across web development, mobile apps, and frontend interfaces.",
    pose: "present",
    readingMs: 5200,
  },
  {
    id: "qa",
    target: "qa",
    message:
      "QA Bug Hunt is an interactive testing challenge — inspect the scenarios, report the bugs, and compare expected with actual behavior.",
    voiceText:
      "QA Bug Hunt is an interactive testing challenge — inspect the scenarios, report the bugs, and compare expected with actual behavior.",
    pose: "talk",
    readingMs: 4500,
  },
  {
    id: "arcade",
    target: "arcade",
    message:
      "The Dev Arcade offers quick interactive challenges built as part of the portfolio experience.",
    voiceText:
      "The Dev Arcade offers quick interactive challenges built as part of the portfolio experience.",
    pose: "present",
    readingMs: 3800,
  },
  {
    id: "terminal",
    target: "terminal",
    message:
      "The Developer Terminal is a simulated HuzaifaOS experience. Type help to explore available commands.",
    voiceText:
      "The Developer Terminal is a simulated HuzaifaOS experience. Type help to explore available commands.",
    pose: "talk",
    readingMs: 3800,
  },
  {
    id: "assistant",
    target: "avatar",
    message:
      "The Portfolio Assistant can answer questions about my experience, skills, projects, and tech stack.",
    voiceText:
      "The Portfolio Assistant can answer questions about my experience, skills, projects, and tech stack.",
    pose: "wave",
    readingMs: 4000,
  },
  {
    id: "resume",
    target: "resume",
    message:
      "Use this section to download my resume or view it in your browser when the PDF is published.",
    voiceText:
      "Use this section to download my resume or view it in your browser when the PDF is published.",
    pose: "talk",
    readingMs: 4000,
  },
  {
    id: "contact",
    target: "contact",
    message:
      "Have an opportunity in mind? Send me a message — I’m open to relevant development and software engineering work.",
    voiceText:
      "Have an opportunity in mind? Send me a message — I’m open to relevant development and software engineering work.",
    pose: "wave",
    readingMs: 4500,
  },
];
