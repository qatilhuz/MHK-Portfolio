import { education } from "@/data/education";
import { experience } from "@/data/experience";
import { projects } from "@/data/projects";
import { coreStrengths, getActiveSkillCategories, getSkillsByCategory } from "@/data/skills";
import { siteConfig } from "@/data/site";
import { getActiveSocialLinks } from "@/data/social";
import type { TerminalCommand, TerminalOutput } from "./types";

const publicCommands: TerminalCommand[] = [
  {
    name: "help",
    description: "List available commands",
    run: () => ({
      title: "Commands",
      list: publicCommands.map((item) => `${item.name} — ${item.description}`),
    }),
  },
  {
    name: "about",
    description: "Who Huzaifa is",
    run: () => ({
      title: siteConfig.legalName,
      body: [
        `${siteConfig.role} in ${siteConfig.location}, specializing in ${siteConfig.specialization}.`,
        `Also known as ${siteConfig.displayName}. Languages: ${siteConfig.spokenLanguages.join(", ")}.`,
      ],
      links: [{ href: "/about", label: "About page" }],
    }),
  },
  {
    name: "skills",
    description: "Verified skills",
    run: () => ({
      title: "Skills",
      list: [
        ...getActiveSkillCategories().map((category) => {
          const names = getSkillsByCategory(category)
            .map((skill) => skill.name)
            .join(", ");
          return `${category}: ${names}`;
        }),
        `Strengths: ${coreStrengths.join(", ")}`,
      ],
      links: [{ href: "/#skills", label: "Skills section" }],
    }),
  },
  {
    name: "projects",
    description: "CV-backed projects",
    run: () => ({
      title: "Projects",
      list: projects
        .filter((project) => !project.isDemo)
        .map(
          (project) =>
            `${project.title} — ${project.technologies.join(", ")}`,
        ),
      links: [{ href: "/projects", label: "Projects" }],
    }),
  },
  {
    name: "experience",
    description: "Professional roles",
    run: () => ({
      title: "Experience",
      list: experience.map((item) => {
        const end = item.endDate ?? "Present";
        return `${item.role} · ${item.company} · ${item.location} · ${item.startDate} – ${end}`;
      }),
      links: [{ href: "/experience", label: "Experience" }],
    }),
  },
  {
    name: "education",
    description: "Education from the CV",
    run: () => ({
      title: "Education",
      list: education.map(
        (item) =>
          `${item.credential} — ${item.institution} (${item.startYear}–${item.endYear})`,
      ),
    }),
  },
  {
    name: "arcade",
    description: "Dev Arcade games",
    run: () => ({
      title: "Dev Arcade",
      body: [
        "Portfolio demos: Rock Paper Scissors, Snake, Memory Game, Reaction Speed Test. Not commercial products.",
      ],
      links: [{ href: "/#arcade", label: "Open arcade" }],
    }),
  },
  {
    name: "qa",
    description: "QA Bug Hunt",
    run: () => ({
      title: "QA Bug Hunt",
      body: [
        "A teaching demo with deliberate defects to identify, classify, and report. Not a client defect log.",
      ],
      links: [{ href: "/#qa", label: "Open QA Bug Hunt" }],
    }),
  },
  {
    name: "assistant",
    description: "Digital portfolio assistant",
    run: () => ({
      title: "Assistant",
      body: [
        "An interactive FAQ/avatar that answers only from verified portfolio data.",
      ],
      links: [{ href: "/#avatar", label: "Open assistant" }],
    }),
  },
  {
    name: "resume",
    description: "Resume section",
    run: () => ({
      title: "Resume",
      body: [
        siteConfig.resumeAvailable
          ? `A PDF is available at ${siteConfig.resumePath}.`
          : "The resume section is ready, but the PDF is not in the repository yet. Nothing is downloadable until that file is added.",
      ],
      links: [{ href: "/#resume", label: "Resume section" }],
    }),
  },
  {
    name: "contact",
    description: "Public contact paths",
    run: () => {
      const socials = getActiveSocialLinks();
      return {
        title: "Contact",
        body: [
          socials.length
            ? socials.map((item) => `${item.label}: ${item.url}`).join(" · ")
            : "No public profiles listed.",
          "Email and LinkedIn are not listed on this site.",
        ],
        links: [{ href: "/#contact", label: "Contact" }],
      };
    },
  },
  {
    name: "clear",
    description: "Clear this session’s output",
    run: () => "clear",
  },
];

const easterEggs: TerminalCommand[] = [
  {
    name: "sudo hire-huzaifa",
    description: "Easter egg",
    hidden: true,
    run: () => ({
      title: "Permission granted (playfully)",
      body: [
        "This is not a real shell and does not grant system access. If you want to work with Huzaifa, use the contact section.",
      ],
      links: [{ href: "/#contact", label: "Contact" }],
    }),
  },
  {
    name: "whoami",
    description: "Easter egg",
    hidden: true,
    run: () => ({
      title: "whoami",
      body: [
        `${siteConfig.legalName} — visitor session on a simulated portfolio terminal.`,
      ],
    }),
  },
];

const registry: TerminalCommand[] = [...publicCommands, ...easterEggs];

export function listHelp(): TerminalCommand[] {
  return publicCommands;
}

export function runTerminalCommand(raw: string): TerminalOutput | "clear" {
  const input = raw.trim().toLowerCase().replace(/\s+/g, " ");
  const match = registry.find((item) => item.name === input);
  if (!match) {
    return {
      body: ['Command not found. Type "help" to see available commands.'],
    };
  }
  return match.run();
}
