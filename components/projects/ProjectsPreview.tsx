import { CinemaReel } from "./cinema/CinemaReel";

/**
 * Home-page Projects section.
 *
 * Rebuilt as a scroll-driven cinematic reel: a sticky stage, a sticky category
 * switcher, and cards that dolly in from the back of the room, hold on their
 * mark, and push past the lens. The /projects route keeps the classic grid and
 * the per-project case studies.
 */
export function ProjectsPreview() {
  return <CinemaReel />;
}
