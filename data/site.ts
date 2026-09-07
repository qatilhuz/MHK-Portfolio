import type { NavItem } from "@/types";

/**
 * Central site identity. Only values confirmed from project context.
 */
export const siteConfig = {
  name: "Huzaifa Khan",
  displayName: "Huzaifa Khan",
  shortName: "HK",
  role: "Full Stack Developer & QA",
  tagline: "Building web and mobile software with a testing mindset.",
  description:
    "Portfolio of Huzaifa Khan, a full stack developer and QA practitioner working with Next.js, React, Flutter, and modern web development.",
  email: "",
  resumePath: "/resume/huzaifa-resume.pdf",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "",
} as const;

export const navigation: NavItem[] = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/#skills", label: "Skills" },
  { href: "/experience", label: "Experience" },
  { href: "/projects", label: "Projects" },
  { href: "/contact", label: "Contact" },
];
