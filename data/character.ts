import type { GuidePose } from "@/lib/guide/types";

export type CharacterClip =
  | "Idle"
  | "Greet"
  | "Wave"
  | "Nod"
  | "Point"
  | "Talk"
  | "Think"
  | "Walk";

export type CharacterHit = "head" | "hand" | "body";

export const poseClip: Record<GuidePose, CharacterClip> = {
  idle: "Idle",
  greet: "Greet",
  talk: "Talk",
  present: "Point",
  wave: "Wave",
};

export const sectionClip: Record<string, CharacterClip> = {
  hero: "Greet",
  about: "Talk",
  skills: "Point",
  experience: "Talk",
  projects: "Point",
  qa: "Think",
  arcade: "Wave",
  terminal: "Talk",
  assistant: "Wave",
  resume: "Talk",
  contact: "Greet",
};

export const hitReactions: Record<
  CharacterHit,
  { clip: CharacterClip; message: string }
> = {
  head: { clip: "Nod", message: "Still here — ask anything on the page." },
  hand: { clip: "Wave", message: "Hey." },
  body: { clip: "Talk", message: "I can walk you through the sections, or skip anytime." },
};

export const CLIP_ALIASES: Record<string, CharacterClip> = {
  idle: "Idle",
  Idle: "Idle",
  greet: "Greet",
  Greet: "Greet",
  wave: "Wave",
  Wave: "Wave",
  nod: "Nod",
  Nod: "Nod",
  point: "Point",
  Point: "Point",
  talk: "Talk",
  Talk: "Talk",
  think: "Think",
  Think: "Think",
  walk: "Walk",
  Walk: "Walk",
};
