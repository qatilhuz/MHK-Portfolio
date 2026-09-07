import {
  ANALYTICS_EVENT_NAMES,
  type AnalyticsBatch,
  type AnalyticsEventName,
} from "./types";

const UUID =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const META_ALLOW: Record<AnalyticsEventName, string[]> = {
  page_view: [],
  section_view: ["section"],
  project_view: ["slug", "projectType"],
  project_demo_open: ["slug"],
  project_github_click: ["slug"],
  resume_view: [],
  resume_download: [],
  arcade_open: [],
  arcade_game_start: ["game"],
  arcade_game_complete: ["game"],
  qa_open: [],
  qa_bug_found: ["scenario", "type", "severity"],
  terminal_command_used: ["commandId"],
  assistant_open: [],
  assistant_question_category: ["category"],
  contact_start: [],
  contact_submit_success: [],
  contact_submit_error: [],
  project_media_open: ["slug", "kind"],
};

export function parseAnalyticsBatch(input: unknown): AnalyticsBatch | null {
  if (!input || typeof input !== "object") return null;
  const data = input as Record<string, unknown>;
  if (typeof data.sessionId !== "string" || !UUID.test(data.sessionId)) {
    return null;
  }
  if (!data.context || typeof data.context !== "object") return null;
  if (!Array.isArray(data.events) || data.events.length === 0 || data.events.length > 20) {
    return null;
  }

  const context = data.context as Record<string, unknown>;
  const events = [];
  for (const item of data.events) {
    if (!item || typeof item !== "object") return null;
    const event = item as Record<string, unknown>;
    if (
      typeof event.name !== "string" ||
      !(ANALYTICS_EVENT_NAMES as readonly string[]).includes(event.name)
    ) {
      return null;
    }
    const name = event.name as AnalyticsEventName;
    const allowed = META_ALLOW[name];
    const meta: Record<string, string | number | boolean> = {};
    if (event.meta && typeof event.meta === "object") {
      for (const [key, value] of Object.entries(event.meta as Record<string, unknown>)) {
        if (!allowed.includes(key)) continue;
        if (
          typeof value === "string" ||
          typeof value === "number" ||
          typeof value === "boolean"
        ) {
          if (typeof value === "string" && value.length > 80) continue;
          meta[key] = value;
        }
      }
    }
    events.push({
      name,
      path: typeof event.path === "string" ? event.path.slice(0, 120) : undefined,
      meta,
    });
  }

  return {
    sessionId: data.sessionId,
    context: {
      referrerSource: pick(context.referrerSource, ["direct", "search", "social", "other"], "other"),
      deviceCategory: pick(context.deviceCategory, ["mobile", "tablet", "desktop"], "desktop"),
      browserCategory: pick(
        context.browserCategory,
        ["chrome", "firefox", "safari", "edge", "other"],
        "other",
      ),
      osCategory: pick(
        context.osCategory,
        ["ios", "android", "mac", "windows", "linux", "other"],
        "other",
      ),
      viewportCategory: pick(context.viewportCategory, ["sm", "md", "lg"], "lg"),
    },
    events,
  };
}

function pick<T extends string>(value: unknown, allowed: T[], fallback: T): T {
  return typeof value === "string" && (allowed as string[]).includes(value)
    ? (value as T)
    : fallback;
}
