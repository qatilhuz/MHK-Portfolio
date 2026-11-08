/**
 * The emotion contract shared by the LLM route and the 3D avatar.
 *
 * This module is deliberately dependency-free and secret-free: it is imported
 * by both the server route and the client avatar, so nothing here may ever
 * touch `process.env`.
 */

export const AVATAR_EMOTIONS = [
  "neutral",
  "happy",
  "sad",
  "angry",
  "thinking",
  "surprised",
  "cheeky",
] as const;

export type AvatarEmotion = (typeof AVATAR_EMOTIONS)[number];

export const DEFAULT_EMOTION: AvatarEmotion = "neutral";

export function isAvatarEmotion(value: unknown): value is AvatarEmotion {
  return (
    typeof value === "string" &&
    (AVATAR_EMOTIONS as readonly string[]).includes(value)
  );
}

/** Never throw on a surprising emotion - fall back to a neutral face. */
export function coerceEmotion(value: unknown): AvatarEmotion {
  if (isAvatarEmotion(value)) return value;
  if (typeof value === "string") {
    const normalised = value.trim().toLowerCase();
    if (isAvatarEmotion(normalised)) return normalised;
  }
  return DEFAULT_EMOTION;
}

export interface AssistantEnvelope {
  text: string;
  emotion: AvatarEmotion;
}

/**
 * Pull `{ "text": ..., "emotion": ... }` out of a raw model completion.
 *
 * Even with a provider-level JSON mode, models still occasionally wrap the
 * object in prose or a ```json fence, so this is defensive on purpose:
 * unwrap fences, then scan for the first *balanced* brace span rather than
 * using a greedy regex (an answer containing a `}` would break that).
 * Returns null when nothing usable is found, so the caller can fall back.
 */
export function parseAssistantEnvelope(raw: string): AssistantEnvelope | null {
  if (typeof raw !== "string" || raw.trim() === "") return null;

  const unfenced = raw
    .replace(/^\s*```(?:json)?\s*/i, "")
    .replace(/\s*```\s*$/, "")
    .trim();

  for (const candidate of [unfenced, extractFirstObject(unfenced)]) {
    if (!candidate) continue;

    try {
      const parsed: unknown = JSON.parse(candidate);
      if (!parsed || typeof parsed !== "object") continue;

      const record = parsed as Record<string, unknown>;
      const text = typeof record.text === "string" ? record.text.trim() : "";
      if (text === "") continue;

      return { text, emotion: coerceEmotion(record.emotion) };
    } catch {
      // try the next candidate
    }
  }

  return null;
}

function extractFirstObject(value: string): string | null {
  const start = value.indexOf("{");
  if (start === -1) return null;

  let depth = 0;
  let inString = false;
  let escaped = false;

  for (let i = start; i < value.length; i += 1) {
    const char = value[i];

    if (escaped) {
      escaped = false;
      continue;
    }
    if (char === "\\") {
      escaped = true;
      continue;
    }
    if (char === '"') {
      inString = !inString;
      continue;
    }
    if (inString) continue;

    if (char === "{") depth += 1;
    else if (char === "}") {
      depth -= 1;
      if (depth === 0) return value.slice(start, i + 1);
    }
  }

  return null;
}
