import type { NavItem } from "@/types";

export const siteConfig = {
  name: "MHK",
  displayName: "Huzaifa Khan",
  legalName: "Muhammad Huzaifa Khan",
  seoTitle: "Huzaifa Khan | Full-Stack & Next.js Developer",
  role: "Full-Stack Developer",
  specialization: "Next.js · React · Web Development",
  company: "Techcose Solutions",
  location: "Karachi, Pakistan",
  region: "Sindh",
  country: "PK",
  spokenLanguages: ["Urdu", "English"] as const,
  email: "",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "",
  resumePath: "/resume/huzaifa-resume.pdf",
  resumeAvailable: false,
  resumeVersion: "",
  openToWork: true,
  availabilityLabel: "Open to Relevant Opportunities",
  experienceSummary: "1.5+ Years of Development Experience",
  focusSummary: "Web Development · Software Testing",
  heroTitle: "I BUILD DIGITAL SYSTEMS.",
  heroDescription:
    "I am a full-stack developer who specializes in Next.js, React, TypeScript, and modern web development. I build scalable, user-focused applications and currently work as a .NET Developer at Techcose Solutions.",
  tagline:
    "Full-stack development with software testing awareness — building focused, scalable, user-friendly products that work reliably.",
  description:
    "Explore the portfolio of Huzaifa Khan, a full-stack developer specializing in Next.js, React, TypeScript, and modern web development, with hands-on software testing experience.",
  footerDescription:
    "Full-stack developer based in Karachi, Pakistan, focused on building modern web applications and continuing to grow through hands-on development experience.",
  narrativeIntro:
    "Full-stack developer specializing in Next.js, React, TypeScript, and modern web experiences, with hands-on software testing experience.",
  githubUrl: "https://github.com/qatilhuz",
};

export const navigation: NavItem[] = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/projects", label: "Work" },
  { href: "/#skills", label: "Skills" },
  { href: "/experience", label: "Experience" },
  { href: "/contact", label: "Contact" },
];

export const footerNavigation: NavItem[] = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/projects", label: "Work" },
  { href: "/#skills", label: "Skills" },
  { href: "/experience", label: "Experience" },
  { href: "/contact", label: "Contact" },
];

export const coreValues = [
  "User-first thinking",
  "Reliable delivery",
  "Continuous learning",
];
