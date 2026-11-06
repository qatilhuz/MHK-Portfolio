import { education } from "@/data/education";
import { experience } from "@/data/experience";
import { faq } from "@/data/faq";
import { projects } from "@/data/projects";
import { coreStrengths, skills } from "@/data/skills";
import { siteConfig } from "@/data/site";
import { getActiveSocialLinks } from "@/data/social";
import type { AssistantReply } from "@/types";
import { buildLinkDirectory, karachiSentence, linkChips } from "./context";
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

/**
 * Greetings and chit-chat.
 *
 * Matching "hello" against a CV corpus scores zero and lands on the unknown
 * reply, which is how a greeting used to be answered with "that is not in my
 * records". Small talk is a conversation, so it is handled before any lookup.
 */
const SMALL_TALK: ReadonlyArray<readonly [RegExp, AvatarEmotion, readonly string[]]> = [
  [
    /\b(hello|hi|hey|yo|hiya|howdy|greetings|salam|assalam|asalam|good (morning|afternoon|evening))\b/,
    "happy",
    [
      "Hello. Good to have you here — I am Huzaifa's portfolio assistant, and I have read everything on this site so you do not have to. What would you like to know?",
      "Hey there. You have reached Huzaifa's assistant, fully booted and unreasonably enthusiastic about his tech stack. Where shall we start?",
      "Hi. Welcome in. Ask me about Huzaifa's experience, his projects, or how he built the 3D parts of this site — I enjoy that last one most.",
    ],
  ],
  [
    /\b(how are you|how r u|hows it going|how is it going|how do you do|whats up|what s up|sup)\b/,
    "happy",
    [
      "Running beautifully, thank you for asking — sixty frames a second and not a single dropped promise. How can I help you?",
      "Very well indeed. All systems nominal, eyes glowing, no memory leaks today. What brings you to Huzaifa's portfolio?",
    ],
  ],
  [
    /\b(thank you|thanks|thx|appreciate it|cheers)\b/,
    "happy",
    [
      "My pleasure entirely. Ask me anything else — I am literally here for this.",
      "Any time. That is what I am for.",
    ],
  ],
  [
    /\b(bye|goodbye|see you|see ya|later|good night|take care)\b/,
    "happy",
    [
      "Goodbye, and thanks for stopping by. The contact form is right there if you would like to reach Huzaifa properly.",
      "Take care. Do come back — the arcade is more fun the second time.",
    ],
  ],
  [
    /\b(who are you|what are you|your name|are you (a )?(bot|robot|ai|human|real))\b/,
    "neutral",
    [
      "I am the portfolio assistant Huzaifa built: a 3D face wired to a language model, grounded on his real CV, with eyes that change to match my mood. Not human, but reasonably good company.",
    ],
  ],
  [
    /\b(joke|funny|make me laugh|pun)\b/,
    "happy",
    [
      "A developer's wife asks him to go to the shop and buy a loaf of bread, and if they have eggs, get six. He came back with six loaves of bread. … I am contractually obliged to tell that one.",
      "There are only two hard problems in computer science: cache invalidation, naming things, and off-by-one errors. I will see myself out.",
    ],
  ],
];

function pick(options: readonly string[]): string {
  return options[Math.floor(Math.random() * options.length)];
}

/** A greeting or other chit-chat, or null for a real question. */
export function detectSmallTalk(question: string): AssistantReply | null {
  const q = normalize(question);
  // Long messages are questions that merely open with a greeting.
  if (q.split(" ").length > 12) return null;

  for (const [pattern, emotion, lines] of SMALL_TALK) {
    if (pattern.test(q)) return { text: pick(lines), emotion };
  }
  return null;
}

/**
 * "What time is it?" - answered from the live Karachi clock.
 * Guarded against biographical phrasing like "what time did he work there".
 */
const TIME_QUESTION = /\b(time|date|day|today|clock)\b/;
const TIME_INTENT = /\b(what|whats|which|current|currently|right now|now|tell me|is it)\b/;
const BIOGRAPHICAL = /\b(he|his|him|huzaifa|experience|job|role|project|company|employer|start|end|year|graduat)\b/;

export function detectTimeQuestion(question: string): AssistantReply | null {
  const q = normalize(question);
  if (!TIME_QUESTION.test(q) || !TIME_INTENT.test(q)) return null;
  if (BIOGRAPHICAL.test(q) && !/karachi|pakistan|pkt|your (time|clock)/.test(q)) return null;

  return {
    text: `It is ${karachiSentence()} in Karachi, where Huzaifa is based.`,
    emotion: "neutral",
  };
}

/** Requests for GitHub, LinkedIn, email, the resume, or "your links". */
const LINK_TARGETS: ReadonlyArray<readonly [RegExp, string]> = [
  [/\b(github|git hub|repo|repository|repos|source code)\b/, "GitHub"],
  [/\b(linkedin|linked in)\b/, "LinkedIn"],
  [/\b(resume|cv|curriculum vitae)\b/, "Resume"],
  [/\b(email|e mail|mail|contact|reach him|reach out|get in touch|hire|availability)\b/, "Email"],
];

export function detectLinkRequest(question: string): AssistantReply | null {
  const q = normalize(question);
  const wantsEverything = /\b(links?|socials?|profiles?|where can i find)\b/.test(q);
  const wanted = LINK_TARGETS.filter(([pattern]) => pattern.test(q)).map(([, label]) => label);

  if (wanted.length === 0 && !wantsEverything) return null;

  const directory = buildLinkDirectory();
  const labels = wanted.length > 0 ? wanted : ["GitHub", "LinkedIn", "Email", "Resume"];
  const parts: string[] = [];

  for (const label of labels) {
    const item = directory.find((entry) => entry.label === label);
    if (!item) continue;
    parts.push(item.href ? `${item.label}: ${item.href}` : `${item.label} is ${item.note}.`);
  }

  if (parts.length === 0) return null;

  const chips = linkChips([...labels, "Contact form"]);
  return { text: parts.join(" "), emotion: "neutral", links: chips };
}

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

  // Conversation before lookup: none of these are questions about the CV,
  // and matching them against the FAQ corpus produces nonsense.
  const performance = detectRoleplay(question);
  if (performance) return performance;

  const chat = detectSmallTalk(question);
  if (chat) return chat;

  const clock = detectTimeQuestion(question);
  if (clock) return clock;

  const links = detectLinkRequest(question);
  if (links) return links;

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
