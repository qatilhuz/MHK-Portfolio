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
  /** Reference-driven phases (anticipation → action → recover). */
  phases: string[];
  primaryBones: string[];
  locomotionLocked: boolean;
};

export const EMOTES: EmoteDef[] = [
  {
    id: "hello",
    label: "Hello",
    icon: "👋",
    clip: "Wave",
    durationMs: 2600,
    cooldownMs: 2800,
    fullBody: false,
    loops: false,
    reducedClip: "Nod",
    phases: ["notice", "weight-shift", "arm-raise", "wave-x3", "lower", "idle"],
    primaryBones: ["RightShoulder", "RightArm", "RightForeArm", "RightHand", "Head", "Chest"],
    locomotionLocked: false,
  },
  {
    id: "backflip",
    label: "Backflip",
    icon: "🔄",
    clip: "Backflip",
    durationMs: 2600,
    cooldownMs: 3400,
    fullBody: true,
    loops: false,
    reducedClip: "Nod",
    phases: ["crouch", "arm-swing", "extend", "tuck-rotate", "extend-land", "absorb", "idle"],
    primaryBones: ["Hips", "Spine", "LeftUpLeg", "RightUpLeg", "LeftLeg", "RightLeg", "LeftArm", "RightArm"],
    locomotionLocked: true,
  },
  {
    id: "jump",
    label: "Jump",
    icon: "⬆️",
    clip: "Jump",
    durationMs: 1300,
    cooldownMs: 1800,
    fullBody: true,
    loops: false,
    reducedClip: "Nod",
    phases: ["crouch", "push", "apex", "descend", "absorb", "idle"],
    primaryBones: ["Hips", "LeftUpLeg", "RightUpLeg", "LeftLeg", "RightLeg", "LeftArm", "RightArm"],
    locomotionLocked: true,
  },
  {
    id: "thumbsUp",
    label: "Thumbs up",
    icon: "👍",
    clip: "ThumbsUp",
    durationMs: 2000,
    cooldownMs: 2200,
    fullBody: false,
    loops: false,
    reducedClip: "Nod",
    phases: ["prepare", "raise", "orient-thumb", "nod-hold", "return"],
    primaryBones: ["RightArm", "RightForeArm", "RightHand", "Chest", "Head"],
    locomotionLocked: false,
  },
  {
    id: "point",
    label: "Point",
    icon: "👉",
    clip: "Point",
    durationMs: 2200,
    cooldownMs: 2000,
    fullBody: false,
    loops: false,
    reducedClip: "Point",
    phases: ["prep-torso", "extend", "look-along", "hold", "return"],
    primaryBones: ["RightArm", "RightForeArm", "RightHand", "Chest", "Head"],
    locomotionLocked: false,
  },
  {
    id: "clap",
    label: "Clap",
    icon: "👏",
    clip: "Clap",
    durationMs: 2000,
    cooldownMs: 2200,
    fullBody: false,
    loops: false,
    reducedClip: "Nod",
    phases: ["raise", "clap", "clap", "clap", "lower"],
    primaryBones: ["LeftArm", "RightArm", "Chest", "Head"],
    locomotionLocked: false,
  },
  {
    id: "think",
    label: "Think",
    icon: "🤔",
    clip: "Think",
    durationMs: 2800,
    cooldownMs: 2400,
    fullBody: false,
    loops: false,
    reducedClip: "Think",
    phases: ["shift", "hand-to-chin", "tilt-look-up", "pause", "return"],
    primaryBones: ["LeftArm", "Head", "Chest"],
    locomotionLocked: false,
  },
  {
    id: "laugh",
    label: "Laugh",
    icon: "😄",
    clip: "Laugh",
    durationMs: 2000,
    cooldownMs: 2200,
    fullBody: false,
    loops: false,
    reducedClip: "Playful",
    phases: ["inhale", "bounce", "bounce", "settle"],
    primaryBones: ["Chest", "Head", "Hips", "LeftArm", "RightArm"],
    locomotionLocked: false,
  },
  {
    id: "celebrate",
    label: "Celebrate",
    icon: "🎉",
    clip: "Celebrate",
    durationMs: 2200,
    cooldownMs: 2600,
    fullBody: true,
    loops: false,
    reducedClip: "Playful",
    phases: ["crouch", "jump-arms-up", "pump", "land", "idle"],
    primaryBones: ["Hips", "LeftArm", "RightArm", "Chest", "Head"],
    locomotionLocked: true,
  },
  {
    id: "surprise",
    label: "Surprised",
    icon: "😲",
    clip: "Surprise",
    durationMs: 1800,
    cooldownMs: 1800,
    fullBody: false,
    loops: false,
    reducedClip: "Surprise",
    phases: ["recoil", "hands-up", "hold", "recover"],
    primaryBones: ["Head", "Spine", "LeftArm", "RightArm", "LeftShoulder", "RightShoulder"],
    locomotionLocked: false,
  },
  {
    id: "annoyed",
    label: "Annoyed",
    icon: "😤",
    clip: "Annoyed",
    durationMs: 1800,
    cooldownMs: 2000,
    fullBody: false,
    loops: false,
    reducedClip: "Annoyed",
    phases: ["tense", "head-tilt", "arms-akimbo", "hold", "release"],
    primaryBones: ["Head", "Chest", "LeftArm", "RightArm"],
    locomotionLocked: false,
  },
  {
    id: "sad",
    label: "Sad",
    icon: "🙁",
    clip: "Sad",
    durationMs: 2400,
    cooldownMs: 2200,
    fullBody: false,
    loops: false,
    reducedClip: "Nod",
    phases: ["sink", "close-posture", "hold", "lift"],
    primaryBones: ["Head", "Spine", "LeftShoulder", "RightShoulder", "Hips"],
    locomotionLocked: false,
  },
  {
    id: "shrug",
    label: "Shrug",
    icon: "🤷",
    clip: "Shrug",
    durationMs: 1800,
    cooldownMs: 2000,
    fullBody: false,
    loops: false,
    reducedClip: "Nod",
    phases: ["lift-shoulders", "palms-up", "tilt", "drop"],
    primaryBones: ["LeftShoulder", "RightShoulder", "LeftArm", "RightArm", "Head"],
    locomotionLocked: false,
  },
  {
    id: "victory",
    label: "Victory",
    icon: "✌️",
    clip: "Victory",
    durationMs: 2200,
    cooldownMs: 2400,
    fullBody: false,
    loops: false,
    reducedClip: "Playful",
    phases: ["plant", "raise-fist", "chest-open", "hold", "return"],
    primaryBones: ["RightArm", "Chest", "Hips", "Head"],
    locomotionLocked: false,
  },
  {
    id: "facepalm",
    label: "Facepalm",
    icon: "🤦",
    clip: "Facepalm",
    durationMs: 2200,
    cooldownMs: 2200,
    fullBody: false,
    loops: false,
    reducedClip: "Annoyed",
    phases: ["sigh", "hand-to-face", "cover", "drop"],
    primaryBones: ["RightArm", "RightForeArm", "Head", "Spine"],
    locomotionLocked: false,
  },
  {
    id: "bow",
    label: "Bow",
    icon: "🙇",
    clip: "Bow",
    durationMs: 2000,
    cooldownMs: 2200,
    fullBody: true,
    loops: false,
    reducedClip: "Nod",
    phases: ["prepare", "hinge-hips", "hold", "rise"],
    primaryBones: ["Spine", "Hips", "Head", "LeftArm", "RightArm"],
    locomotionLocked: true,
  },
  {
    id: "dance",
    label: "Dance",
    icon: "💃",
    clip: "Dance",
    durationMs: 3600,
    cooldownMs: 3800,
    fullBody: true,
    loops: true,
    reducedClip: "Playful",
    phases: ["step-R", "step-L", "step-R", "step-L"],
    primaryBones: ["Hips", "LeftUpLeg", "RightUpLeg", "LeftArm", "RightArm", "Chest"],
    locomotionLocked: true,
  },
  {
    id: "idle",
    label: "Relax",
    icon: "😌",
    clip: "Relax",
    durationMs: 2400,
    cooldownMs: 1800,
    fullBody: false,
    loops: false,
    reducedClip: "Idle",
    phases: ["drop-shoulders", "breathe", "settle"],
    primaryBones: ["LeftShoulder", "RightShoulder", "Chest", "Head", "Hips"],
    locomotionLocked: false,
  },
  {
    id: "lookAround",
    label: "Look around",
    icon: "👀",
    clip: "LookAround",
    durationMs: 2800,
    cooldownMs: 2400,
    fullBody: false,
    loops: false,
    reducedClip: "LookAround",
    phases: ["left", "pause", "right", "pause", "center"],
    primaryBones: ["Head", "Chest", "Neck"],
    locomotionLocked: false,
  },
  {
    id: "sit",
    label: "Rest",
    icon: "🪑",
    clip: "Sit",
    durationMs: 3000,
    cooldownMs: 3000,
    fullBody: true,
    loops: false,
    reducedClip: "Idle",
    phases: ["squat", "hold", "stand"],
    primaryBones: ["Hips", "LeftUpLeg", "RightUpLeg", "LeftLeg", "RightLeg", "Spine"],
    locomotionLocked: true,
  },
];

export function emoteById(id: string) {
  return EMOTES.find((item) => item.id === id) ?? null;
}
