import type { NavItem } from "@/types";

export const siteConfig = {
  legalName: "Muhammad Huzaifa Khan",
  name: "Huzaifa Khan",
  displayName: "Huzaifa Khan",
  shortName: "HK",
  role: "Full-Stack Developer",
  specialization: "Next.js, React & .NET",
  location: "Karachi, Pakistan",
  spokenLanguages: ["Urdu", "English"] as const,
  tagline: "Full-stack development with Next.js, React, and .NET.",
  description:
    "Portfolio of Huzaifa Khan, a full-stack developer in Karachi specializing in Next.js, React, and .NET.",
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
