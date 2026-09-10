import type { CharacterClip } from "@/data/character";

export type EmoteId =
  | "hello"
  | "backflip"
  | "jump"
  | "thumbsUp"
  | "point"
  | "clap"
  | "think"
  | "laugh"
  | "celebrate"
  | "surprise"
  | "annoyed"
  | "sad"
  | "shrug"
  | "victory"
  | "facepalm"
  | "bow"
  | "dance"
  | "idle"
  | "lookAround"
  | "sit";

export type EmoteDef = {
  id: EmoteId;
  label: string;
  icon: string;
  clip: CharacterClip;
  durationMs: number;
  cooldownMs: number;
  fullBody: boolean;
  loops: boolean;
  reducedClip: CharacterClip;
};

export const EMOTES: EmoteDef[] = [
  { id: "hello", label: "Hello", icon: "👋", clip: "Wave", durationMs: 2600, cooldownMs: 2800, fullBody: false, loops: false, reducedClip: "Nod" },
  { id: "backflip", label: "Backflip", icon: "🔄", clip: "Backflip", durationMs: 1700, cooldownMs: 3200, fullBody: true, loops: false, reducedClip: "Nod" },
  { id: "jump", label: "Jump", icon: "⬆️", clip: "Jump", durationMs: 1100, cooldownMs: 1600, fullBody: true, loops: false, reducedClip: "Nod" },
  { id: "thumbsUp", label: "Thumbs up", icon: "👍", clip: "ThumbsUp", durationMs: 1800, cooldownMs: 2000, fullBody: false, loops: false, reducedClip: "Nod" },
  { id: "point", label: "Point", icon: "👉", clip: "Point", durationMs: 2000, cooldownMs: 1800, fullBody: false, loops: false, reducedClip: "Point" },
  { id: "clap", label: "Clap", icon: "👏", clip: "Clap", durationMs: 1800, cooldownMs: 2000, fullBody: false, loops: false, reducedClip: "Nod" },
  { id: "think", label: "Think", icon: "🤔", clip: "Think", durationMs: 2200, cooldownMs: 2200, fullBody: false, loops: false, reducedClip: "Think" },
  { id: "laugh", label: "Laugh", icon: "😄", clip: "Laugh", durationMs: 1800, cooldownMs: 2000, fullBody: false, loops: false, reducedClip: "Playful" },
  { id: "celebrate", label: "Celebrate", icon: "🎉", clip: "Celebrate", durationMs: 2000, cooldownMs: 2400, fullBody: true, loops: false, reducedClip: "Playful" },
  { id: "surprise", label: "Surprised", icon: "😲", clip: "Surprise", durationMs: 900, cooldownMs: 1600, fullBody: false, loops: false, reducedClip: "Surprise" },
  { id: "annoyed", label: "Annoyed", icon: "😤", clip: "Annoyed", durationMs: 1800, cooldownMs: 2000, fullBody: false, loops: false, reducedClip: "Annoyed" },
  { id: "sad", label: "Sad", icon: "🙁", clip: "Sad", durationMs: 2000, cooldownMs: 2000, fullBody: false, loops: false, reducedClip: "Nod" },
  { id: "shrug", label: "Shrug", icon: "🤷", clip: "Shrug", durationMs: 1600, cooldownMs: 1800, fullBody: false, loops: false, reducedClip: "Nod" },
  { id: "victory", label: "Victory", icon: "✌️", clip: "Victory", durationMs: 2000, cooldownMs: 2200, fullBody: false, loops: false, reducedClip: "Playful" },
  { id: "facepalm", label: "Facepalm", icon: "🤦", clip: "Facepalm", durationMs: 1800, cooldownMs: 2000, fullBody: false, loops: false, reducedClip: "Annoyed" },
  { id: "bow", label: "Bow", icon: "🙇", clip: "Bow", durationMs: 1800, cooldownMs: 2000, fullBody: true, loops: false, reducedClip: "Nod" },
  { id: "dance", label: "Dance", icon: "💃", clip: "Dance", durationMs: 3200, cooldownMs: 3600, fullBody: true, loops: true, reducedClip: "Playful" },
  { id: "idle", label: "Relax", icon: "😌", clip: "Idle", durationMs: 800, cooldownMs: 800, fullBody: false, loops: true, reducedClip: "Idle" },
  { id: "lookAround", label: "Look around", icon: "👀", clip: "LookAround", durationMs: 2600, cooldownMs: 2200, fullBody: false, loops: false, reducedClip: "LookAround" },
  { id: "sit", label: "Rest", icon: "🪑", clip: "Sit", durationMs: 2800, cooldownMs: 2800, fullBody: true, loops: false, reducedClip: "Idle" },
];

export function emoteById(id: string) {
  return EMOTES.find((item) => item.id === id) ?? null;
}
