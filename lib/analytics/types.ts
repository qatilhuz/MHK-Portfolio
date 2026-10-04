export const ANALYTICS_EVENT_NAMES = [
  "page_view",
  "section_view",
  "project_view",
  "project_demo_open",
  "project_github_click",
  "resume_view",
  "resume_download",
  "arcade_open",
  "arcade_game_start",
  "arcade_game_complete",
  "qa_open",
  "qa_bug_found",
  "terminal_command_used",
  "assistant_open",
  "assistant_question_category",
  "contact_start",
  "contact_submit_success",
  "contact_submit_error",
  "project_media_open",
  "guided_intro_start",
  "guided_intro_skip",
  "guided_intro_complete",
] as const;

export type AnalyticsEventName = (typeof ANALYTICS_EVENT_NAMES)[number];

export type AssistantCategory =
  | "about"
  | "skills"
  | "projects"
  | "experience"
  | "education"
  | "arcade"
  | "qa"
  | "terminal"
  | "resume"
  | "unknown";

export type TerminalCommandId =
  | "help"
  | "about"
  | "skills"
  | "projects"
  | "experience"
  | "education"
  | "arcade"
  | "qa"
  | "assistant"
  | "resume"
  | "contact"
  | "clear"
  | "easter_egg"
  | "unknown_command";

export interface SessionContext {
  referrerSource: "direct" | "search" | "social" | "other";
  deviceCategory: "mobile" | "tablet" | "desktop";
  browserCategory: "chrome" | "firefox" | "safari" | "edge" | "other";
  osCategory: "ios" | "android" | "mac" | "windows" | "linux" | "other";
  viewportCategory: "sm" | "md" | "lg";
}

export interface AnalyticsEvent {
  name: AnalyticsEventName;
  path?: string;
  meta?: Record<string, string | number | boolean>;
}

export interface AnalyticsBatch {
  sessionId: string;
  context: SessionContext;
  events: AnalyticsEvent[];
}
