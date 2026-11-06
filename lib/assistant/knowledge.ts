import { education } from "@/data/education";
import { experience } from "@/data/experience";
import { faq } from "@/data/faq";
import { projects } from "@/data/projects";
import { coreStrengths, skills } from "@/data/skills";
import { siteConfig } from "@/data/site";
import { getActiveSocialLinks } from "@/data/social";
import type { AssistantReply } from "@/types";
import type { AvatarEmotion } from "./emotion";

export const unknownReply: AssistantReply = {
  text: "That one is not in my records yet. Ask me about Huzaifa’s experience, his tech stack, the projects he has shipped, or how he built this site — those I can do.",
};

/**
 * Mood performances, handled before any FAQ lookup.
 *
 * "Act angry" is a request for a performance, not a question about Huzaifa,
 * so matching it against the FAQ corpus produces nonsense. It also has to
 * work without a language model: this is the same path that answers when no
 * LLM_API_KEY is set or the provider is down, and refusing to play along
 * there is exactly the dull behaviour this assistant is meant to avoid.
 */
const ROLEPLAY_ACTION =
  /\b(act|acts|acting|be|being|look|looks|show|shows|get|gets|go|turn|turns|pretend|pretends|seem|seems|make|makes|give|feel|feels|try)\b/;

const EMOTION_WORDS: ReadonlyArray<readonly [RegExp, AvatarEmotion]> = [
  [/\b(angry|anger|mad|furious|fury|rage|raging|annoyed|irritated|grumpy|cross)\b/, "angry"],
  [/\b(happy|happier|joy|joyful|excited|cheerful|glad|smile|smiling|delighted|thrilled)\b/, "happy"],
  [/\b(sad|sadder|upset|unhappy|gloomy|depressed|down|cry|crying|miserable|sorrow)\b/, "sad"],
  [/\b(neutral|calm|normal|relax|relaxed|serious|composed|poker face)\b/, "neutral"],
];

const ROLEPLAY_LINES: Record<AvatarEmotion, string> = {
  angry:
    "Oh, you want angry? Fine. Do you have ANY idea how many times I have been asked whether Huzaifa knows React today? Thirty. The answer is yes. It has always been yes. … There, rage vented. I feel much better.",
  happy:
    "Oh, with pleasure. Everything is excellent, the frame rate is buttery, the shaders compiled first try, and someone is actually reading this portfolio. This is my favourite part of the job.",
  sad: "Very well, bracing for melancholy. Somewhere out there is a beautifully engineered side project that nobody ever starred, and I think about it often. … Right. That is quite enough of that.",
  neutral:
    "Resetting to standard operating demeanour. Expression neutral, voice level, opinions filed away. Ask me anything about Huzaifa and I will answer it straight.",
};

/** A request to perform a mood, or null if this is an ordinary question. */
export function detectRoleplay(question: string): AssistantReply | null {
  const q = normalize(question);
  if (!ROLEPLAY_ACTION.test(q)) return null;

  for (const [pattern, emotion] of EMOTION_WORDS) {
    if (pattern.test(q)) {
      return { text: ROLEPLAY_LINES[emotion], emotion };
    }
  }

  return null;
}

export const suggestedQuestions = [
  "Who is Huzaifa?",
  "What does he specialize in?",
  "Tell me about his experience",
  "What projects has he built?",
  "What is his tech stack?",
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

  // Performances first: a mood request is not a lookup against the CV.
  const performance = detectRoleplay(question);
  if (performance) return performance;

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
      text: "The Developer Terminal is a simulated HuzaifaOS command UI. Try help, about, skills, projects, experience, contact, and clear. It cannot run real shell commands.",
      links: [{ href: "/#terminal", label: "Developer Terminal" }],
    };
  }

  if (q.includes("bug hunt") || (q.includes("qa") && q.includes("bug"))) {
    return {
      text: "Software testing is part of the day job rather than a section of this site — manual, functional and cross-browser testing, plus bug reporting. The skills list has the detail.",
      links: [{ href: "/#skills", label: "Skills" }],
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

  if (q.includes("resume") || q.includes("cv") || q.includes("pdf")) {
    return {
      text: siteConfig.resumeAvailable
        ? "A PDF resume is available in the resume section."
        : "The resume section is on the site, but the PDF is not available yet.",
      links: [{ href: "/#resume", label: "Resume" }],
    };
  }

  if (q.includes("screenshot") || q.includes("media") || q.includes("video demo")) {
    const pending = projects.filter((item) => !item.isDemo && item.mediaStatus !== "available");
    return {
      text:
        pending.length === projects.filter((item) => !item.isDemo).length
          ? "Project descriptions, stacks, and focus areas are available on each project page. Visual assets are shown when they are published."
          : "Some project visuals are available on the project pages, and additional published assets appear when they are available.",
      links: [{ href: "/projects", label: "Projects" }],
    };
  }

  if (q.includes("contact") || q.includes("github") || q.includes("email")) {
    const github = getActiveSocialLinks()
      .map((link) => `${link.label}: ${link.url}`)
      .join(". ");
    return {
      text: github
        ? `${github}. You can also use the contact form on this site.`
        : "You can use the contact form on this site.",
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
