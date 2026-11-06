import { education } from "@/data/education";
import { experience } from "@/data/experience";
import { faq } from "@/data/faq";
import { projects } from "@/data/projects";
import { coreStrengths, skills } from "@/data/skills";
import { siteConfig } from "@/data/site";
import { getActiveSocialLinks } from "@/data/social";
import type { AssistantReply } from "@/types";
import {
  buildLinkDirectory,
  huzaifaAge,
  HUZAIFA_DOB_LABEL,
  karachiSentence,
  karachiSentenceUrdu,
  linkChips,
} from "./context";
import type { AvatarEmotion } from "./emotion";
import {
  detectLanguage,
  pickLine,
  type AssistantLanguage,
  type Bilingual,
  FACT_LEAD_IN,
  FAREWELL,
  GREETING,
  HOW_ARE_YOU,
  JOKE,
  ROLEPLAY,
  THANKS,
  UNKNOWN_REPLY,
  WHO_ARE_YOU,
} from "./language";

export const unknownReply: AssistantReply = {
  text: UNKNOWN_REPLY.en[0],
  emotion: "sad",
};

/** Same meaning, in whichever language the visitor used. */
export function unknownReplyFor(language: AssistantLanguage): AssistantReply {
  return { text: UNKNOWN_REPLY[language][0], emotion: "sad" };
}

/** True for the "I don't know" reply in any supported language. */
export function isUnknownReply(text: string): boolean {
  return UNKNOWN_REPLY.en.includes(text) || UNKNOWN_REPLY["ur-Latn"].includes(text);
}

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
  /\b(act|acts|acting|be|being|look|looks|show|shows|get|gets|go|turn|turns|pretend|pretends|seem|seems|make|makes|give|feel|feels|feeling|try|calm|chill|relax|settle|cheer|lighten|ho|hoja|hojao|hojaye|kar|karo|kro|karke|dikhao|dikha|dikhaao|bano|ban|banja|raho|rakho|jao|jaao)\b/;

/**
 * A bare mood with no verb ("Calm down", "angrier!") is still a request to
 * perform it. Only accepted for very short messages that are not questions,
 * so "What is his mood like?" and "Is he happy at Techcose?" stay lookups.
 */
const ROLEPLAY_NOT_IMPERATIVE =
  /\b(is|are|was|were|do|does|did|why|what|whats|who|when|where|how|which|his|he|him|her|she|they|huzaifa|about|tell)\b/;

const EMOTION_WORDS: ReadonlyArray<readonly [RegExp, AvatarEmotion]> = [
  [/\b(angry|anger|mad|furious|fury|rage|raging|annoyed|irritated|grumpy|cross|gussa|ghussa|gusse|naraz)\b/, "angry"],
  [/\b(happy|happier|joy|joyful|excited|cheerful|glad|smile|smiling|delighted|thrilled|khush|khushi|khushh|hansi)\b/, "happy"],
  // Bare "down" is too ambiguous - it made "calm down" register as sad,
  // beating the neutral rule below it. Only the explicit phrases count.
  [/\b(sad|sadder|upset|unhappy|gloomy|depressed|feeling down|feel down|let down|cry|crying|miserable|sorrow|udaas|dukhi|ghamgeen|pareshan)\b/, "sad"],
  [/\b(neutral|calm|normal|relax|relaxed|serious|composed|poker face|aam|seedha)\b/, "neutral"],
];



/**
 * Greetings and chit-chat.
 *
 * Matching "hello" against a CV corpus scores zero and lands on the unknown
 * reply, which is how a greeting used to be answered with "that is not in my
 * records". Small talk is a conversation, so it is handled before any lookup.
 */
const SMALL_TALK: ReadonlyArray<readonly [RegExp, AvatarEmotion, Bilingual]> = [
  [
    /\b(hello|hi|hey|yo|hiya|howdy|greetings|salam|assalam|asalam|aslam|adab|khush aamdeed|good (morning|afternoon|evening))\b/,
    "happy",
    GREETING,
  ],
  [
    /\b(how are you|how r u|hows it going|how is it going|how do you do|whats up|what s up|sup|kaise ho|kaisay ho|kese ho|kesay ho|kaise hain|kaisay hain|kese hain|kaise hon|kya haal|kya hal|kia haal|kya haal hai|sab theek|sab thik)\b/,
    "happy",
    HOW_ARE_YOU,
  ],
  [
    /\b(thank you|thanks|thx|appreciate it|cheers|shukriya|shukria|mehrbani|bohat shukriya)\b/,
    "happy",
    THANKS,
  ],
  [
    /\b(bye|goodbye|see you|see ya|later|good night|take care|khuda hafiz|allah hafiz|khudahafiz|shab bakhair|phir milte)\b/,
    "happy",
    FAREWELL,
  ],
  [
    /\b(who are you|what are you|your name|are you (a )?(bot|robot|ai|human|real)|tum kaun|tum kon|aap kaun|aap kon|tumhara naam|aap ka naam|apka naam|kaun ho tum)\b/,
    "neutral",
    WHO_ARE_YOU,
  ],
  [
    /\b(joke|funny|make me laugh|pun|mazaak|mazak|latifa|hansao|hasao)\b/,
    "happy",
    JOKE,
  ],
];

/** A greeting or other chit-chat, or null for a real question. */
export function detectSmallTalk(
  question: string,
  language: AssistantLanguage = detectLanguage(question),
): AssistantReply | null {
  const q = normalize(question);
  // Long messages are questions that merely open with a greeting.
  if (q.split(" ").length > 12) return null;

  for (const [pattern, emotion, bank] of SMALL_TALK) {
    if (pattern.test(q)) return { text: pickLine(bank, language), emotion };
  }
  return null;
}

/**
 * "How old is he?" - computed, never stored, so it cannot go stale.
 *
 * Runs before the clock detector on purpose: "what is his date of birth"
 * contains "date", which the time matcher would otherwise answer with the
 * wall clock.
 */
const AGE_QUESTION =
  /\b(age|how old|years old|yrs old|born|birthday|birth date|date of birth|dob|umar|umr|umer|kitne saal|kitni umar|paida|paidaish|janam|salgirah|saalgirah)\b/;

export function detectAgeQuestion(
  question: string,
  language: AssistantLanguage = detectLanguage(question),
): AssistantReply | null {
  const q = normalize(question);
  if (!AGE_QUESTION.test(q)) return null;

  const age = huzaifaAge();
  const text =
    language === "ur-Latn"
      ? `Huzaifa ${age} saal ke hain \u2014 unki paidaish ${HUZAIFA_DOB_LABEL} ko hui thi.`
      : `Huzaifa is ${age} years old \u2014 born on ${HUZAIFA_DOB_LABEL}.`;

  return { text, emotion: "neutral" };
}

/**
 * "What time is it?" - answered from the live Karachi clock.
 * Guarded against biographical phrasing like "what time did he work there".
 */
const TIME_QUESTION = /\b(time|date|day|today|clock|waqt|baje|bajay|baj|tareekh|tarikh|din|ghari)\b/;
const TIME_INTENT =
  /\b(what|whats|which|current|currently|right now|now|tell me|is it|kya|kia|abhi|batao|btao|bta|bataiye|bataye|kitne|kitna|kaunsa|konsa|kon sa|raha|rahe|rhe|rha)\b/;
const BIOGRAPHICAL = /\b(he|his|him|huzaifa|experience|job|role|project|company|employer|start|end|year|graduat)\b/;

export function detectTimeQuestion(
  question: string,
  language: AssistantLanguage = detectLanguage(question),
): AssistantReply | null {
  const q = normalize(question);
  if (!TIME_QUESTION.test(q) || !TIME_INTENT.test(q)) return null;
  if (BIOGRAPHICAL.test(q) && !/karachi|pakistan|pkt|your (time|clock)/.test(q)) return null;

  const text =
    language === "ur-Latn"
      ? `Karachi mein abhi ${karachiSentenceUrdu()} ho rahe hain \u2014 wahin Huzaifa rehte hain.`
      : `It is ${karachiSentence()} in Karachi, where Huzaifa is based.`;

  return { text, emotion: "neutral" };
}

/** Requests for GitHub, LinkedIn, email, the resume, or "your links". */
const LINK_TARGETS: ReadonlyArray<readonly [RegExp, string]> = [
  [/\b(github|git hub|repo|repository|repos|source code)\b/, "GitHub"],
  [/\b(linkedin|linked in)\b/, "LinkedIn"],
  [/\b(resume|cv|curriculum vitae)\b/, "Resume"],
  [/\b(email|e mail|mail|contact|reach him|reach out|get in touch|hire|availability|rabta)\b/, "Email"],
];

export function detectLinkRequest(
  question: string,
  language: AssistantLanguage = detectLanguage(question),
): AssistantReply | null {
  const q = normalize(question);
  const wantsEverything = /\b(links?|socials?|profiles?|where can i find|kahan milega|kahan milay)\b/.test(q);
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
  const lead = language === "ur-Latn" ? "Yeh lijiye \u2014 " : "";
  return { text: `${lead}${parts.join(" ")}`, emotion: "neutral", links: chips };
}

/** A request to perform a mood, or null if this is an ordinary question. */
export function detectRoleplay(
  question: string,
  language: AssistantLanguage = detectLanguage(question),
): AssistantReply | null {
  const q = normalize(question);
  const imperative =
    ROLEPLAY_ACTION.test(q) ||
    (q.split(" ").length <= 3 && !ROLEPLAY_NOT_IMPERATIVE.test(q));
  if (!imperative) return null;

  for (const [pattern, emotion] of EMOTION_WORDS) {
    if (pattern.test(q)) {
      return { text: pickLine(ROLEPLAY[emotion], language), emotion };
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
  // Detected once and handed to every detector so a single message cannot be
  // scored as English by one and Roman Urdu by the next.
  const language = detectLanguage(question);

  // Conversation before lookup: none of these are questions about the CV,
  // and matching them against the FAQ corpus produces nonsense.
  const performance = detectRoleplay(question, language);
  if (performance) return performance;

  const chat = detectSmallTalk(question, language);
  if (chat) return chat;

  // Before the clock: "date of birth" contains "date".
  const age = detectAgeQuestion(question, language);
  if (age) return age;

  const clock = detectTimeQuestion(question, language);
  if (clock) return clock;

  const links = detectLinkRequest(question, language);
  if (links) return links;

  // Every CV fact below is stored in English. Answer, then adapt the wrapper
  // to the visitor's language in one place rather than at each return site.
  const fact = factReply(q, question);
  if (language !== "ur-Latn") return fact;
  if (isUnknownReply(fact.text)) return unknownReplyFor(language);
  return { ...fact, text: `${FACT_LEAD_IN}${fact.text}` };
}

/**
 * The English fact lookup: FAQ corpus first, then the hand-written branches.
 * Always returns English - `replyFromKnowledge` handles the language wrapper.
 */
function factReply(q: string, question: string): AssistantReply {

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
