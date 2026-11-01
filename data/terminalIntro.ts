/**
 * The terminal's opening performance.
 *
 * Everything quoted here is real: the versions come from package.json and the
 * subsystems are the ones this site actually boots. A fake changelog would be
 * the one thing in a developer terminal a developer would check.
 */

export type BootStatus = "ok" | "info" | "warn";

export interface BootStep {
  kind: "boot";
  id: string;
  /** Subsystem being brought up. */
  label: string;
  /** What it reported back. */
  value: string;
  status: BootStatus;
  /** Milliseconds to hold before the next step. */
  delay: number;
}

export interface CommandStep {
  kind: "command";
  id: string;
  text: string;
  /** Milliseconds per character. */
  speed: number;
  /** Beat held after the last character, before the output lands. */
  pause: number;
}

export interface OutputStep {
  kind: "output";
  id: string;
  render: "stack" | "stats";
  delay: number;
}

export interface NoteStep {
  kind: "note";
  id: string;
  text: string;
  delay: number;
}

export type IntroStep = BootStep | CommandStep | OutputStep | NoteStep;

/* ------------------------------------------------------------------ *
 * Boot
 * ------------------------------------------------------------------ */

const boot = (
  id: string,
  label: string,
  value: string,
  delay: number,
  status: BootStatus = "ok",
): BootStep => ({ kind: "boot", id, label, value, status, delay });

/* ------------------------------------------------------------------ *
 * The script
 * ------------------------------------------------------------------ */

export const terminalIntro: readonly IntroStep[] = [
  boot("kernel", "HuzaifaOS kernel", "mounted", 190, "info"),
  boot("next", "Next.js 15.5 · app router", "online", 130),
  boot("react", "React 19.1 · concurrent renderer", "online", 120),
  boot("gsap", "GSAP 3.15 · ScrollTrigger", "armed", 130),
  boot("lenis", "Lenis 1.3 · smooth scroll", "engaged", 120),
  boot("three", "Three.js r185 · WebGL context", "allocated", 140),
  boot("tailwind", "Tailwind v4 · design tokens", "linked", 120),
  boot("handover", "Handing control to operator", "done", 420, "warn"),

  {
    kind: "command",
    id: "cmd-stack",
    text: "cat stack.json",
    speed: 42,
    pause: 460,
  },
  { kind: "output", id: "out-stack", render: "stack", delay: 900 },

  {
    kind: "command",
    id: "cmd-status",
    text: "./status --live",
    speed: 42,
    pause: 420,
  },
  { kind: "output", id: "out-stats", render: "stats", delay: 700 },

  {
    kind: "note",
    id: "handoff",
    text: "Prompt is live — type help for the command list.",
    delay: 200,
  },
] as const;

/* ------------------------------------------------------------------ *
 * stack.json
 * ------------------------------------------------------------------ */

export interface StackRow {
  key: string;
  items: string[];
}

export const stackMatrix: readonly StackRow[] = [
  { key: "runtime", items: ["Next.js 15.5", "React 19.1", "TypeScript 5"] },
  { key: "motion", items: ["GSAP 3.15", "ScrollTrigger", "Lenis"] },
  { key: "3d", items: ["Three.js r185", "React Three Fiber", "drei"] },
  { key: "styling", items: ["Tailwind CSS v4", "CSS custom properties"] },
  { key: "testing", items: ["Manual QA", "Cross-browser", "Bug reporting"] },
] as const;
