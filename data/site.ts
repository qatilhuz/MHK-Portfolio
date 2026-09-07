import type { NavItem } from "@/types";

/**
 * Central site identity. Only values confirmed from project context.
 * Do not invent companies, emails, or achievements here.
 */
export const siteConfig = {
  name: "Huzaifa",
  displayName: "Huzaifa",
  shortName: "MHK",
  role: "Developer",
  tagline: "Building software and checking that it actually works.",
  description:
    "Huzaifa is a developer working across web, backend, and mobile, with practical QA and testing experience.",
  email: "",
  resumePath: "/resume/huzaifa-resume.pdf",
  url: "",
} as const;

export const navigation: NavItem[] = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/#skills", label: "Skills" },
  { href: "/experience", label: "Experience" },
  { href: "/projects", label: "Projects" },
  { href: "/contact", label: "Contact" },
];
