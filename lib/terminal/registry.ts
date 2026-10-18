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
    description: "Show available commands",
    run: () => ({
      title: "Commands",
      list: publicCommands.map((item) => item.name),
      body: ["Use any command label to explore the portfolio."],
    }),
  },
  {
    name: "about",
    description: "Learn about Huzaifa",
    run: () => ({
      title: siteConfig.legalName,
      body: [
        `${siteConfig.role} in ${siteConfig.location}, specializing in ${siteConfig.specialization}.`,
        siteConfig.heroDescription,
      ],
      links: [{ href: "/about", label: "About page" }],
    }),
  },
  {
    name: "skills",
    description: "View skills",
    run: () => ({
      title: "Skills & Technologies",
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
    description: "View projects",
    run: () => ({
      title: "Selected Work",
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
    description: "View experience",
    run: () => ({
      title: "Experience in Practice",
      list: experience.map((item) => {
        const end = item.endDate ?? "Present";
        return `${item.role} · ${item.company} · ${item.location} · ${item.startDate} – ${end}`;
      }),
      links: [{ href: "/experience", label: "Experience" }],
    }),
  },
  {
    name: "contact",
    description: "Contact information",
    run: () => {
      const socials = getActiveSocialLinks();
      return {
        title: "Contact",
        body: [
          socials.length
            ? socials.map((item) => `${item.label}: ${item.url}`).join(" · ")
            : "Use the contact form on this portfolio.",
          "Open to relevant opportunities.",
        ],
        links: [{ href: "/contact", label: "Contact" }],
      };
    },
  },
  {
    name: "clear",
    description: "Clear the terminal",
    run: () => "clear",
  },
];

const extraCommands: TerminalCommand[] = [
  {
    name: "welcome",
    description: "Show the welcome message",
    hidden: true,
    run: () => ({
      title: "Welcome",
      body: ["Welcome to HuzaifaOS. Type “help” to explore available commands."],
    }),
  },
  {
    name: "education",
    description: "Education details",
    hidden: true,
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
    hidden: true,
    run: () => ({
      title: "Dev Arcade",
      body: [
        "Interactive portfolio demos: Rock Paper Scissors, Snake, Memory Game, and a Reaction Speed Test.",
      ],
      links: [{ href: "/#arcade", label: "Dev Arcade" }],
    }),
  },
  {
    name: "qa",
    description: "QA Bug Hunt",
    hidden: true,
    run: () => ({
      title: "QA Bug Hunt",
      body: [
        "An interactive testing challenge with deliberate defects to identify, classify, and report.",
      ],
      links: [{ href: "/#qa", label: "QA Bug Hunt" }],
    }),
  },
  {
    name: "assistant",
    description: "Portfolio assistant",
    hidden: true,
    run: () => ({
      title: "Portfolio Assistant",
      body: [
        "An interactive assistant that answers from the portfolio’s provided content.",
      ],
      links: [{ href: "/#avatar", label: "Assistant" }],
    }),
  },
  {
    name: "resume",
    description: "Resume section",
    hidden: true,
    run: () => ({
      title: "Resume",
      body: [
        siteConfig.resumeAvailable
          ? `A PDF is available at ${siteConfig.resumePath}.`
          : "The resume section is ready, and the PDF will become available when the file is published on this site.",
      ],
      links: [{ href: "/#resume", label: "Resume section" }],
    }),
  },
  {
    name: "sudo hire-huzaifa",
    description: "Easter egg",
    hidden: true,
    run: () => ({
      title: "Permission granted (playfully)",
      body: [
        "This simulated terminal cannot grant system access. If you want to work with Huzaifa, use the contact section.",
      ],
      links: [{ href: "/contact", label: "Contact" }],
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

const registry: TerminalCommand[] = [...publicCommands, ...extraCommands];

export function listHelp(): TerminalCommand[] {
  return publicCommands;
}

export function runTerminalCommand(raw: string): TerminalOutput | "clear" {
  const input = raw.trim().toLowerCase().replace(/\s+/g, " ");
  const match = registry.find((item) => item.name === input);
  if (!match) {
    return {
      body: ["Command not found. Type “help” to see available commands."],
    };
  }
  return match.run();
}
