import { normalize } from "@/lib/assistant/knowledge";
import type { AssistantCategory, TerminalCommandId } from "./types";

export function classifyAssistantQuestion(question: string): AssistantCategory {
  const q = normalize(question);
  if (q.includes("educat") || q.includes("aptech") || q.includes("college")) {
    return "education";
  }
  if (q.includes("arcade") || q.includes("snake") || q.includes("memory")) {
    return "arcade";
  }
  if (q.includes("bug") || q.includes("qa")) return "qa";
  if (q.includes("terminal") || q.includes("cli")) return "terminal";
  if (q.includes("resume") || q.includes("cv")) return "resume";
  if (q.includes("project") || q.includes("flutter") || q.includes("weather")) {
    return "projects";
  }
  if (q.includes("experience") || q.includes("job") || q.includes("techcose")) {
    return "experience";
  }
  if (q.includes("skill") || q.includes("stack") || q.includes("next")) {
    return "skills";
  }
  if (q.includes("who") || q.includes("about") || q.includes("huzaifa")) {
    return "about";
  }
  return "unknown";
}

const COMMANDS: TerminalCommandId[] = [
  "help",
  "about",
  "skills",
  "projects",
  "experience",
  "education",
  "arcade",
  "qa",
  "assistant",
  "resume",
  "contact",
  "clear",
];

export function identifyTerminalCommand(raw: string): TerminalCommandId {
  const input = raw.trim().toLowerCase().replace(/\s+/g, " ");
  if (input === "sudo hire-huzaifa" || input === "whoami") return "easter_egg";
  if ((COMMANDS as string[]).includes(input)) {
    return input as TerminalCommandId;
  }
  return "unknown_command";
}
