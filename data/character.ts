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

export const EMOTE_DIALOGUE: Partial<Record<CharacterClip, readonly string[]>> = {
  Wave: [
    "Hello there, human! Welcome to the digital realm.",
    "Connection established. Nice to meet you!",
    "Hey! My social subroutines are online.",
  ],
  Backflip: [
    "Executing an entirely necessary production backflip.",
    "Physics engine, please do not fail me now.",
    "That maneuver passed code review somehow.",
  ],
  Jump: [
    "Increasing vertical stack space!",
    "Gravity is just another dependency.",
    "Jump routine compiled successfully.",
  ],
  ThumbsUp: [
    "Approved. Ship it before the tests change their minds.",
    "Strong types, clean build, excellent work.",
    "That implementation gets a glowing review.",
  ],
  Point: [
    "That component deserves your attention.",
    "Follow the pointer; the good code is this way.",
    "I found the feature you were looking for.",
  ],
  Clap: [
    "Applause protocol activated!",
    "Clean architecture deserves a round of applause.",
    "Excellent commit. No notes from me.",
  ],
  Think: [
    "Let me allocate a few more thought cycles.",
    "Thinking... without blocking the main thread.",
    "There is definitely an elegant abstraction for this.",
  ],
  Laugh: [
    "That bug report had an unexpected punchline!",
    "Ha! Even my exception handler enjoyed that.",
    "Humor module exceeded its render budget.",
  ],
  Celebrate: [
    "Zero errors in the console! A perfect build!",
    "Task executed flawlessly. Deploy the confetti!",
    "All systems green. This calls for a celebration!",
  ],
  Surprise: [
    "Whoa! I did not see that coming.",
    "New deployment detected!",
    "Unexpected input, surprisingly excellent result.",
  ],
  Annoyed: [
    "My patience buffer is approaching capacity.",
    "That warning has been ignored for three deployments.",
    "Please stop feeding undefined into production.",
  ],
  Sad: [
    "404: Motivation not found.",
    "I need a recharge... and perhaps a cleaner diff.",
    "The tests passed locally. That is all I can say.",
  ],
  Fall: [
    "Critical failure: dignity module unavailable.",
    "Well... that was not in the acceptance criteria.",
    "Rollback requested. Preferably before anyone notices.",
  ],
  Shrug: [
    "Works on my machine.",
    "The specification said nothing about that edge case.",
    "Could be a feature. Could be cosmic radiation.",
  ],
  Victory: [
    "Build green, tests green, victory confirmed!",
    "Task executed flawlessly.",
    "Another boss-level bug has been defeated.",
  ],
  Facepalm: [
    "Who wrote this spaghetti code?",
    "Did someone forget the semicolon again?",
    "That could have been a constant.",
  ],
  Bow: [
    "Thank you for reviewing my performance.",
    "A respectful bow to elegant engineering.",
    "At your service, fellow builder.",
  ],
  Dance: [
    "Check out my 60 FPS moves!",
    "System fully optimized for grooving.",
    "No dropped frames on this dance floor.",
  ],
  Relax: [
    "Entering low-power mode. Wake me for the next deploy.",
    "Cooling the processors for a moment.",
    "A clean idle loop is a beautiful thing.",
  ],
  LookAround: [
    "Scanning the viewport for interesting components.",
    "Just checking whether the layout shifted again.",
    "Visual regression scan in progress.",
  ],
  Sit: [
    "Even autonomous assistants need a short break.",
    "Parking my processes until the next request.",
    "Resting the servos, not the imagination.",
  ],
  Playful: [
    "A little personality improves every interface.",
    "Creative mode enabled!",
    "I promise this animation is production critical.",
  ],
};

export const RANDOM_IDLE_THOUGHTS = [
  "Scanning the repository for bugs...",
  "Huzaifa's code is looking sharp today.",
  "My optical sensors could use a polish.",
  "Counting unused imports for entertainment.",
  "I wonder whether robots dream in TypeScript.",
  "Background task complete: the vibes are immaculate.",
  "Monitoring the console. Quiet consoles are happy consoles.",
  "Refactoring imaginary code while I wait.",
  "All servos nominal. Curiosity levels remain high.",
  "Remember: cache invalidation is a personality test.",
  "Running a tiny accessibility audit in my head.",
  "No user input detected. Initiating thoughtful pose.",
] as const;

export function randomCharacterLine(lines: readonly string[]): string | null {
  if (!lines.length) return null;
  return lines[Math.floor(Math.random() * lines.length)] ?? null;
}

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
