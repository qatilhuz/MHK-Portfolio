import type { GuidePose } from "@/lib/guide/types";

export type CharacterClip =
  | "Idle"
  | "Greet"
  | "Wave"
  | "Nod"
  | "Point"
  | "Talk"
  | "Think"
  | "Walk"
  | "Run"
  | "Turn"
  | "LookAround"
  | "Curious"
  | "Surprise"
  | "Stagger"
  | "Fall"
  | "Recover"
  | "GetUp"
  | "Playful"
  | "Annoyed"
  | "Interaction"
  | "Backflip"
  | "Jump"
  | "ThumbsUp"
  | "Clap"
  | "Laugh"
  | "Celebrate"
  | "Sad"
  | "Shrug"
  | "Victory"
  | "Facepalm"
  | "Bow"
  | "Dance"
  | "Sit"
  | "Relax"
  | "Sleep"
  | "Wake";

export type CharacterHit = "head" | "hand" | "body" | "shoulder";

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
  arcade: "Playful",
  terminal: "Curious",
  assistant: "Wave",
  resume: "Talk",
  contact: "Greet",
};

export const hitReactions: Record<CharacterHit, { clip: CharacterClip; message: string }> = {
  head: { clip: "Nod", message: "Still here — ask anything on the page." },
  hand: { clip: "Wave", message: "Hey." },
  body: { clip: "Talk", message: "I can walk you through the sections, or skip anytime." },
  shoulder: { clip: "Curious", message: "That tickles the plating." },
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
  Run: "Run",
  Turn: "Turn",
  LookAround: "LookAround",
  lookaround: "LookAround",
  Curious: "Curious",
  Surprise: "Surprise",
  Stagger: "Stagger",
  Fall: "Fall",
  Recover: "Recover",
  GetUp: "GetUp",
  Playful: "Playful",
  Annoyed: "Annoyed",
  Interaction: "Interaction",
  Backflip: "Backflip",
  Jump: "Jump",
  ThumbsUp: "ThumbsUp",
  Clap: "Clap",
  Laugh: "Laugh",
  Celebrate: "Celebrate",
  Sad: "Sad",
  Shrug: "Shrug",
  Victory: "Victory",
  Facepalm: "Facepalm",
  Bow: "Bow",
  Dance: "Dance",
  Sit: "Sit",
  Relax: "Relax",
  Sleep: "Sleep",
  Wake: "Wake",
};
