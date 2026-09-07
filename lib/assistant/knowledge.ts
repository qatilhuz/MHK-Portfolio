import { education } from "@/data/education";
import { experience } from "@/data/experience";
import { faq } from "@/data/faq";
import { projects } from "@/data/projects";
import { coreStrengths, skills } from "@/data/skills";
import { siteConfig } from "@/data/site";
import { getActiveSocialLinks } from "@/data/social";
import type { AssistantReply } from "@/types";

export const unknownReply: AssistantReply = {
  text: "I don't have verified information about that in Huzaifa's portfolio.",
};

export const suggestedQuestions = [
  "Who is Huzaifa?",
  "What does he specialize in?",
  "Tell me about his experience",
  "What projects has he built?",
  "What is his tech stack?",
  "What is the Dev Arcade?",
  "What is QA Bug Hunt?",
  "Do you have a terminal?",
];

export function normalize(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9\s+.#]/g, " ").replace(/\s+/g, " ").trim();
}

export function scoreFaq(question: string): { faqId: string; score: number } | null {
  const q = normalize(question);
  let best: { faqId: string; score: number } | null = null;
  for (const item of faq) {
    const words = normalize(item.question).split(" ").filter((w) => w.length > 2);
    const hits = words.filter((word) => q.includes(word)).length;
    if (!best || hits > best.score) {
      best = { faqId: item.id, score: hits };
    }
  }
  if (!best || best.score < 2) return null;
  return best;
}

export function replyFromKnowledge(question: string): AssistantReply {
  const q = normalize(question);
  const match = scoreFaq(question);
  if (match) {
    const item = faq.find((entry) => entry.id === match.faqId);
    if (item) {
      const links = item.relatedSection
        ? [
            {
              href: item.relatedProject
                ? `/projects/${item.relatedProject}`
                : item.relatedSection,
              label: item.relatedProject ? "Open project" : "Open section",
            },
          ]
        : undefined;
      return { text: item.answer, links };
    }
  }

  if (q.includes("laptop") || q.includes("flutter app") || q.includes("mobile app")) {
    const project = projects.find((item) => item.id === "laptop-app");
    if (project) {
      return {
        text: `${project.title}: ${project.description}`,
        links: [{ href: `/projects/${project.slug}`, label: "Laptop app" }],
      };
    }
  }

  if (
    q.includes("arcade") ||
    q.includes("snake") ||
    q.includes("rock paper") ||
    q.includes("memory game") ||
    q.includes("reaction")
  ) {
    return {
      text: "Dev Arcade is an interactive portfolio section with Rock Paper Scissors, Snake, Memory Game, and a Reaction Speed Test. They demonstrate browser interaction, not commercial games.",
      links: [{ href: "/#arcade", label: "Dev Arcade" }],
    };
  }

  if (
    q.includes("terminal") ||
    q.includes("command") ||
    q.includes("cli")
  ) {
    return {
      text: "The Developer Terminal is a simulated command UI on this site. Try help, about, skills, projects, experience, education, arcade, qa, assistant, resume, contact, and clear. It cannot run real shell commands.",
      links: [{ href: "/#terminal", label: "Developer Terminal" }],
    };
  }

  if (q.includes("bug hunt") || (q.includes("qa") && q.includes("bug"))) {
    return {
      text: "QA Bug Hunt is a teaching demo where visitors find deliberately introduced bugs and classify them. It is not a client defect log.",
      links: [{ href: "/#qa", label: "QA Bug Hunt" }],
    };
  }

  if (q.includes("weather")) {
    const project = projects.find((item) => item.id === "weather-app");
    if (project) {
      return {
        text: `${project.title}: ${project.description}`,
        links: [{ href: `/projects/${project.slug}`, label: "Weather app" }],
      };
    }
  }

  if (q.includes("game") || q.includes("gta") || q.includes("tekken")) {
    const project = projects.find((item) => item.id === "gaming-showcase");
    if (project) {
      return {
        text: `${project.title}: ${project.description}`,
        links: [{ href: `/projects/${project.slug}`, label: "Gaming showcase" }],
      };
    }
  }

  if (q.includes("e-commerce") || q.includes("ecommerce") || q.includes("php")) {
    const project = projects.find((item) => item.id === "php-ecommerce");
    if (project) {
      return {
        text: `${project.title}: ${project.description}`,
        links: [{ href: `/projects/${project.slug}`, label: "E-commerce web app" }],
      };
    }
  }

  if (
    q.includes("live demo") ||
    q.includes("live url") ||
    (q.includes("demo") && q.includes("live"))
  ) {
    const live = projects.filter((item) => item.liveUrl);
    if (live.length === 0) {
      return {
        text: "No public live demo URLs are listed for Huzaifa’s projects on this site.",
        links: [{ href: "/projects", label: "Projects" }],
      };
    }
    return {
      text: `Live demos listed: ${live.map((item) => item.title).join("; ")}.`,
      links: [{ href: "/projects", label: "Projects" }],
    };
  }

  if (q.includes("project")) {
    return {
      text: `Verified projects: ${projects.filter((item) => !item.isDemo).map((item) => item.title).join("; ")}.`,
      links: [{ href: "/projects", label: "Explore projects" }],
    };
  }

  if (q.includes("experience") || q.includes("work") || q.includes("job")) {
    const lines = experience.map((item) => {
      const end = item.endDate ?? "Present";
      return `${item.role} at ${item.company} (${item.startDate} – ${end})`;
    });
    return {
      text: lines.join(". "),
      links: [{ href: "/experience", label: "Experience" }],
    };
  }

  if (q.includes("stack") || q.includes("skill") || q.includes("technolog")) {
    return {
      text: `Skills: ${skills.map((item) => item.name).join(", ")}. Strengths: ${coreStrengths.join(", ")}.`,
      links: [{ href: "/#skills", label: "Skills" }],
    };
  }

  if (q.includes("educat") || q.includes("school") || q.includes("college") || q.includes("aptech")) {
    return {
      text: education
        .map(
          (item) =>
            `${item.credential} — ${item.institution} (${item.startYear}–${item.endYear})`,
        )
        .join("; "),
    };
  }

  if (q.includes("contact") || q.includes("github") || q.includes("email")) {
    const github = getActiveSocialLinks()
      .map((link) => `${link.label}: ${link.url}`)
      .join(". ");
    return {
      text: github
        ? `${github}. Email and LinkedIn are not listed on this site yet.`
        : "Contact details beyond this portfolio are not listed.",
      links: [{ href: "/contact", label: "Contact" }],
    };
  }

  if (q.includes("where") && (q.includes("live") || q.includes("based") || q.includes("from") || q.includes("karachi"))) {
    return { text: `${siteConfig.displayName} is based in ${siteConfig.location}.` };
  }

  if (q.includes("who") || q.includes("huzaifa") || q.includes("about")) {
    return {
      text: `${siteConfig.legalName} is a ${siteConfig.role} in ${siteConfig.location}, specializing in ${siteConfig.specialization}.`,
      links: [{ href: "/about", label: "About" }],
    };
  }

  if (q.includes("special")) {
    return {
      text: `He specializes in ${siteConfig.specialization}.`,
      links: [{ href: "/about", label: "About" }],
    };
  }

  if (
    q.includes("salary") ||
    q.includes("age") ||
    q.includes("phone") ||
    q.includes("married") ||
    q.includes("religion")
  ) {
    return unknownReply;
  }

  return unknownReply;
}
