import { siteConfig } from "@/data/site";
import { getActiveSocialLinks } from "@/data/social";
import type { AssistantLink } from "@/types";

/**
 * Runtime context injected into every assistant request.
 *
 * Two things live here that must not be hardcoded into the prompt string:
 * the wall clock, which changes per request, and the link directory, which
 * is derived from the portfolio data so the assistant can never hand a
 * visitor a URL the site itself does not publish.
 */

export const ASSISTANT_TIME_ZONE = "Asia/Karachi";

/** Current date and time where Huzaifa actually is, not where the server is. */
export function karachiNow(now: Date = new Date()): string {
  return now.toLocaleString("en-US", {
    timeZone: ASSISTANT_TIME_ZONE,
    dateStyle: "full",
    timeStyle: "medium",
  });
}

/** Short form for a chat reply: "8:23 PM PKT on Friday, November 6, 2026". */
export function karachiSentence(now: Date = new Date()): string {
  const time = now.toLocaleString("en-US", {
    timeZone: ASSISTANT_TIME_ZONE,
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
  const date = now.toLocaleString("en-US", {
    timeZone: ASSISTANT_TIME_ZONE,
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  return `${time} PKT on ${date}`;
}

/**
 * Huzaifa's date of birth, as calendar parts rather than a Date.
 *
 * `new Date("2007-01-20")` is parsed as UTC midnight, but getMonth()/getDate()
 * then read it back in the *server's* timezone. On any host behind UTC that
 * yields 19 January, so the birthday - and the age rollover - would fire a day
 * early. Plain numbers compared against a Karachi-local "today" have no such
 * failure mode.
 */
export const HUZAIFA_DOB = { year: 2007, month: 1, day: 20 } as const;
export const HUZAIFA_DOB_LABEL = "20 January 2007";

/** Today's calendar date where Huzaifa is, not where the server happens to run. */
function karachiDateParts(now: Date): { year: number; month: number; day: number } {
  // en-CA formats as YYYY-MM-DD, which parses without locale ambiguity.
  const [year, month, day] = new Intl.DateTimeFormat("en-CA", {
    timeZone: ASSISTANT_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  })
    .format(now)
    .split("-")
    .map(Number);

  return { year, month, day };
}

/** Exact completed years, recomputed per request so it is never stale. */
export function huzaifaAge(now: Date = new Date()): number {
  const today = karachiDateParts(now);
  let age = today.year - HUZAIFA_DOB.year;

  const beforeBirthday =
    today.month < HUZAIFA_DOB.month ||
    (today.month === HUZAIFA_DOB.month && today.day < HUZAIFA_DOB.day);

  if (beforeBirthday) age -= 1;
  return age;
}

/** True on 20 January, so the assistant can say something about it. */
export function isHuzaifaBirthday(now: Date = new Date()): boolean {
  const today = karachiDateParts(now);
  return today.month === HUZAIFA_DOB.month && today.day === HUZAIFA_DOB.day;
}

/** Roman Urdu phrasing of the same clock: "shaam 8:25 baje, Friday ...". */
export function karachiSentenceUrdu(now: Date = new Date()): string {
  const time = now.toLocaleString("en-US", {
    timeZone: ASSISTANT_TIME_ZONE,
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
  const date = now.toLocaleString("en-US", {
    timeZone: ASSISTANT_TIME_ZONE,
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  return `${time} (PKT), ${date}`;
}

export interface LinkFact {
  label: string;
  /** Absolute URL or in-site path, or null when the portfolio has no value. */
  href: string | null;
  /** What to tell a visitor when href is null. */
  note?: string;
}

/**
 * The only links the assistant may offer.
 *
 * Anything absent from the portfolio data resolves to null rather than a
 * guess. data/social.ts states the rule outright - "Social URLs must be
 * real" - and a dead LinkedIn or a 404 resume handed to a recruiter is worse
 * than an honest "not published yet, use the contact form".
 */
export function buildLinkDirectory(): LinkFact[] {
  const active = getActiveSocialLinks();
  const find = (platform: string) =>
    active.find((link) => link.platform === platform)?.url ?? null;

  const github = find("github") ?? siteConfig.githubUrl ?? null;
  const linkedin = find("linkedin");
  const email = find("email") ?? (siteConfig.email ? `mailto:${siteConfig.email}` : null);

  return [
    {
      label: "GitHub",
      href: github,
      note: github ? undefined : "not published on this portfolio",
    },
    {
      label: "LinkedIn",
      href: linkedin,
      note: linkedin ? undefined : "not published on this portfolio yet - the contact form is the way to reach him",
    },
    {
      label: "Email",
      href: email,
      note: email ? undefined : "not published publicly - the contact form at /contact reaches him directly",
    },
    {
      label: "Resume",
      href: siteConfig.resumeAvailable ? siteConfig.resumePath : null,
      note: siteConfig.resumeAvailable
        ? undefined
        : "no downloadable file published yet - the resume summary is in the resume section at /#resume",
    },
    { label: "Contact form", href: "/contact" },
  ];
}

/** Plain-text rendering of the directory for the system prompt. */
export function describeLinkDirectory(): string {
  return buildLinkDirectory()
    .map((item) =>
      item.href ? `- ${item.label}: ${item.href}` : `- ${item.label}: ${item.note}`,
    )
    .join("\n");
}

/** Clickable chips for a reply, skipping anything the portfolio lacks. */
export function linkChips(labels: string[]): AssistantLink[] | undefined {
  const directory = buildLinkDirectory();
  const chips = labels.flatMap((label) => {
    const item = directory.find((entry) => entry.label === label);
    return item?.href ? [{ href: item.href, label: item.label }] : [];
  });
  return chips.length > 0 ? chips : undefined;
}
