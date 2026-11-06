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
