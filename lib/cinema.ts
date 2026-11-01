import { cinemaCategories, cinemaProjects } from "@/data/cinemaProjects";
import type { CinemaCategoryId, CinemaProject } from "@/types";

export const DEFAULT_CINEMA_CATEGORY: CinemaCategoryId = "hudasoft";

export function isCinemaCategoryId(value: string): value is CinemaCategoryId {
  return cinemaCategories.some((category) => category.id === value);
}

/** Cards for one tab, in authored order. */
export function cinemaProjectsFor(category: CinemaCategoryId): CinemaProject[] {
  return cinemaProjects.filter((project) => project.category === category);
}

/** Pre-grouped lookup so the reel never re-filters during a scrub. */
export function groupCinemaProjects(): Record<CinemaCategoryId, CinemaProject[]> {
  return cinemaCategories.reduce(
    (groups, category) => {
      groups[category.id] = cinemaProjectsFor(category.id);
      return groups;
    },
    {} as Record<CinemaCategoryId, CinemaProject[]>,
  );
}

/**
 * The longest reel across all tabs.
 *
 * The scroll track is sized once from this so switching tabs never changes
 * document height — no layout jump, no ScrollTrigger re-measure, no fight with
 * Lenis. Shorter reels simply spread their cards across the same range.
 */
export function maxCinemaReelLength(): number {
  return cinemaCategories.reduce(
    (longest, category) => Math.max(longest, cinemaProjectsFor(category.id).length),
    0,
  );
}

/** Outbound link for a card, if it has one. */
export function cinemaLiveUrl(project: CinemaProject): string | undefined {
  if (project.liveUrl) return project.liveUrl;
  if (project.mediaType === "embed" && !project.pending) return project.mediaUrl;
  return undefined;
}

/** Hostname shown in the card's fake browser chrome. */
export function cinemaDisplayHost(project: CinemaProject): string {
  const url = cinemaLiveUrl(project);
  if (!url) return project.pending ? "media pending" : "local capture";
  try {
    return new URL(url).host.replace(/^www\./, "");
  } catch {
    return url;
  }
}
