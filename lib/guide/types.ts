export type GuidePhase =
  | "idle"
  | "greeting"
  | "speaking"
  | "waiting"
  | "transitioning"
  | "complete"
  | "skipped";

export type GuidePose = "idle" | "greet" | "talk" | "present" | "wave";

export interface GuidedSection {
  id: string;
  target: string;
  message: string;
  voiceText: string;
  pose: GuidePose;
  readingMs: number;
}
