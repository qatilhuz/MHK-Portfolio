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
    answer: `${siteConfig.legalName} (portfolio name ${siteConfig.displayName}) is a ${siteConfig.role} in ${siteConfig.location}, specializing in ${siteConfig.specialization}.`,
    category: "about",
    relatedSection: "/about",
  },
  {
    id: "what",
    question: "What does Huzaifa do?",
    answer: `He works in full-stack development with emphasis on Next.js, React, and .NET. Core strengths include ${coreStrengths.join(", ")}.`,
    category: "about",
    relatedSection: "/about",
  },
  {
    id: "tech",
    question: "What technologies does Huzaifa work with?",
    answer: `Verified skills: ${skillNames}.`,
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
    answer: `Verified projects: ${projectTitles}.`,
    category: "projects",
    relatedSection: "/projects",
  },
  {
    id: "nextjs",
    question: "Does Huzaifa work with Next.js?",
    answer:
      "Yes. Next.js is listed in his skills and he was a Next.js & React Developer at Hudasoft (Jun 2025 – May 2026).",
    category: "skills",
    relatedSection: "/#skills",
  },
  {
    id: "dotnet",
    question: "Does Huzaifa work with .NET?",
    answer:
      "Yes. .NET and C# are listed in his skills, and his current role is .NET Developer at Techcose Solutions (Jun 2026 – Present).",
    category: "skills",
    relatedSection: "/experience",
  },
  {
    id: "flutter",
    question: "Does Huzaifa work with Flutter?",
    answer:
      "Yes. Flutter and Dart are listed in his skills. He built a Laptop E-Commerce Mobile App with a Flutter frontend, .NET backend, and SQL Server.",
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
      "SQL Server and MySQL are listed. The e-commerce web app uses MySQL; the laptop mobile app uses SQL Server.",
    category: "skills",
    relatedSection: "/#skills",
  },
  {
    id: "frontend",
    question: "What frontend technologies does Huzaifa use?",
    answer:
      "HTML, CSS, JavaScript, TypeScript, React, Next.js, Angular, and GSAP are listed, plus Flutter for mobile UI.",
    category: "skills",
    relatedSection: "/#skills",
  },
  {
    id: "live-demo",
    question: "Does he have a live demo?",
    answer:
      "No public live demo URLs are listed for these projects on the portfolio.",
    category: "projects",
    relatedSection: "/projects",
  },
  {
    id: "view-projects",
    question: "Can I view Huzaifa's projects?",
    answer: "Yes. Open the projects section of this portfolio.",
    category: "projects",
    relatedSection: "/projects",
  },
  {
    id: "arcade",
    question: "What is the Dev Arcade?",
    answer:
      "An interactive portfolio section with Rock Paper Scissors, Snake, Memory Game, and a Reaction Speed Test. They are coding demonstrations, not commercial games.",
    category: "about",
    relatedSection: "/#arcade",
  },
  {
    id: "qa-hunt",
    question: "What is QA Bug Hunt?",
    answer:
      "An interactive demonstration of QA concepts. Visitors inspect deliberately buggy UI, classify the issue, and see expected vs actual results. It is not a client project.",
    category: "qa",
    relatedSection: "/#qa",
  },
  {
    id: "terminal",
    question: "Do you have a terminal?",
    answer:
      "Yes. The Developer Terminal is a simulated portfolio CLI. Type help for commands. It is not a real system shell.",
    category: "about",
    relatedSection: "/#terminal",
  },
  {
    id: "contact",
    question: "How can I contact Huzaifa?",
    answer:
      "Use the contact page. GitHub is https://github.com/qatilhuz. Email and LinkedIn are not listed on this site yet.",
    category: "contact",
    relatedSection: "/contact",
  },
];
