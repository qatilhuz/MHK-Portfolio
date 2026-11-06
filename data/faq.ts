import type { FAQ } from "@/types";
import { education } from "./education";
import { experience } from "./experience";
import { projects } from "./projects";
import { coreStrengths, skills } from "./skills";
import { siteConfig } from "./site";

const current = experience.find((item) => item.endDate === null);
const previous = experience.find((item) => item.id === "hudasoft");
const skillNames = skills.map((skill) => skill.name).join(", ");
const projectTitles = projects.map((project) => project.title).join("; ");
const educationLines = education
  .map(
    (item) =>
      `${item.credential} — ${item.institution} (${item.startYear}–${item.endYear})`,
  )
  .join("; ");

export const faq: FAQ[] = [
  {
    id: "who",
    question: "Who is Huzaifa?",
    answer: `${siteConfig.legalName}, also known as ${siteConfig.displayName}, is a full-stack developer in ${siteConfig.location} specializing in ${siteConfig.specialization}.`,
    category: "about",
    relatedSection: "/about",
  },
  {
    id: "what",
    question: "What does Huzaifa do?",
    answer: `He builds full-stack applications and modern web experiences, with practical software testing experience. Core strengths include ${coreStrengths.join(", ")}.`,
    category: "about",
    relatedSection: "/about",
  },
  {
    id: "tech",
    question: "What technologies does Huzaifa work with?",
    answer: `His toolkit includes ${skillNames}.`,
    category: "skills",
    relatedSection: "/#skills",
  },
  {
    id: "current-role",
    question: "What is Huzaifa's current role?",
    answer: current
      ? `${current.role} at ${current.company} in ${current.location} (${current.startDate} – Present).`
      : "Current role is not listed.",
    category: "experience",
    relatedSection: "/experience",
  },
  {
    id: "current-company",
    question: "Where does Huzaifa currently work?",
    answer: current
      ? `${current.company}, ${current.location}, since ${current.startDate}.`
      : "Current employer is not listed.",
    category: "experience",
    relatedSection: "/experience",
  },
  {
    id: "previous-role",
    question: "What was Huzaifa's previous role?",
    answer: previous
      ? `${previous.role} at ${previous.company} in ${previous.location} (${previous.startDate} – ${previous.endDate}).`
      : "Previous role is not listed.",
    category: "experience",
    relatedSection: "/experience",
  },
  {
    id: "projects",
    question: "What projects has Huzaifa built?",
    answer: `Selected projects include ${projectTitles}.`,
    category: "projects",
    relatedSection: "/projects",
  },
  {
    id: "nextjs",
    question: "Does Huzaifa work with Next.js?",
    answer:
      "Yes. Next.js is part of his frontend toolkit, and he previously worked as a Next.js & React Developer at Hudasoft (June 2025 – May 2026).",
    category: "skills",
    relatedSection: "/#skills",
  },
  {
    id: "dotnet",
    question: "Does Huzaifa work with .NET?",
    answer:
      "Yes. .NET and C# are part of his backend toolkit, and his current role is .NET Developer at Techcose Solutions (June 2026 – Present).",
    category: "skills",
    relatedSection: "/experience",
  },
  {
    id: "flutter",
    question: "Does Huzaifa work with Flutter?",
    answer:
      "Yes. Flutter and Dart appear in his mobile toolkit, including the Laptop E-Commerce Mobile App.",
    category: "skills",
    relatedSection: "/projects",
    relatedProject: "laptop-ecommerce-mobile-app",
  },
  {
    id: "education",
    question: "What is Huzaifa's education?",
    answer: educationLines,
    category: "about",
  },
  {
    id: "databases",
    question: "What databases has Huzaifa worked with?",
    answer:
      "SQL Server and MySQL appear in his backend toolkit, including the mobile e-commerce app and PHP e-commerce project.",
    category: "skills",
    relatedSection: "/#skills",
  },
  {
    id: "frontend",
    question: "What frontend technologies does Huzaifa use?",
    answer:
      "HTML, CSS, JavaScript, TypeScript, React, Next.js, Angular, and GSAP are included in his frontend development toolkit.",
    category: "skills",
    relatedSection: "/#skills",
  },
  {
    id: "live-demo",
    question: "Does he have a live demo?",
    answer:
      "No public live project URLs are currently listed. The project pages include descriptions, stacks, and focus areas.",
    category: "projects",
    relatedSection: "/projects",
  },
  {
    id: "view-projects",
    question: "Can I view Huzaifa's projects?",
    answer: "Yes. Open the selected work section to browse the project cards and case-study pages.",
    category: "projects",
    relatedSection: "/projects",
  },
  {
    id: "arcade",
    question: "What is the Dev Arcade?",
    answer:
      "An interactive portfolio section with quick challenges and browser-based game mechanics.",
    category: "about",
    relatedSection: "/#arcade",
  },
  {
    id: "terminal",
    question: "Do you have a terminal?",
    answer:
      "Yes. The Developer Terminal is a simulated HuzaifaOS command-line experience. Type help for the available commands.",
    category: "about",
    relatedSection: "/#terminal",
  },
  {
    id: "resume",
    question: "Can I download Huzaifa's resume?",
    answer: siteConfig.resumeAvailable
      ? "Yes. View or download the PDF from the resume section."
      : "The resume section is ready, and the PDF will become downloadable when the file is published on this site.",
    category: "about",
    relatedSection: "/#resume",
  },
  {
    id: "project-media",
    question: "Are there screenshots or live demos?",
    answer:
      "Project details and focus areas are available now. Project visuals and live links are shown when published assets are available.",
    category: "projects",
    relatedSection: "/projects",
  },
  {
    id: "site-creator",
    question: "Who built this website?",
    answer: `${siteConfig.legalName} built this entire portfolio himself, from the design to the 3D work - no template underneath it. It is a Next.js and React app in TypeScript, with Three.js and React Three Fiber driving the 3D, GSAP handling the animation and Tailwind CSS for styling.`,
    category: "about",
    relatedSection: "/about",
  },
  {
    id: "site-stack",
    question: "What technology is this website built with?",
    answer:
      "Next.js and React with TypeScript, Three.js and React Three Fiber for the 3D scenes, GSAP for scroll and timeline animation, and Tailwind CSS for styling. Huzaifa also ships mobile apps with Flutter and Dart.",
    category: "about",
    relatedSection: "/#skills",
  },
  {
    id: "site-features",
    question: "What can I do on this site?",
    answer:
      "Beyond the usual sections there is a 3D Arcade Mode, a Developer Terminal you can type real commands into, a cinematic projects reel, and this assistant - a procedural 3D face whose eyes react to the mood of each answer. Huzaifa built every one of them.",
    category: "about",
    relatedSection: "/#arcade",
  },
  {
    id: "site-assistant",
    question: "Who made you, and how do you work?",
    answer:
      "Huzaifa built me. I am this portfolio's assistant: a Next.js API route talking to a language model, grounded on his real CV data, returning both an answer and an emotion that drives the React Three Fiber face you are looking at.",
    category: "about",
    relatedSection: "/#avatar",
  },
  {
    id: "contact",
    question: "How can I contact Huzaifa?",
    answer:
      "Use the contact form on this site. Huzaifa’s public GitHub profile is also linked in the footer and contact section.",
    category: "contact",
    relatedSection: "/contact",
  },
];
