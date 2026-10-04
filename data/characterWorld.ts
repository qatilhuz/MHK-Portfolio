import { guidedSections } from "@/data/guide";

/** Viewport fractions (0–1). Right gutter, away from primary copy. */
export const sectionAnchors: Record<string, { x: number; y: number }> = {
  hero: { x: 0.78, y: 0.55 },
  about: { x: 0.84, y: 0.5 },
  skills: { x: 0.86, y: 0.48 },
  experience: { x: 0.84, y: 0.52 },
  projects: { x: 0.86, y: 0.5 },
  qa: { x: 0.83, y: 0.5 },
  arcade: { x: 0.85, y: 0.52 },
  terminal: { x: 0.84, y: 0.5 },
  assistant: { x: 0.82, y: 0.5 },
  resume: { x: 0.84, y: 0.48 },
  contact: { x: 0.82, y: 0.55 },
};

export function anchorForSection(id: string): { x: number; y: number } {
  return sectionAnchors[id] ?? { x: 0.82, y: 0.52 };
}

export function guideTargetId(index: number): string {
  return guidedSections[index]?.id ?? "hero";
}

export function viewportToWorld(nx: number, ny: number) {
  const x = (nx - 0.5) * 4.4;
  const y = (0.52 - ny) * 3.1;
  return { x, y };
}
