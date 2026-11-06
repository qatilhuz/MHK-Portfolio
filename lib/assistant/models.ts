/**
 * Live model discovery for OpenAI-compatible providers (Groq in particular).
 *
 * Groq decommissions model ids on a rolling basis, so a value pinned in
 * .env.local goes stale and every chat completion starts returning 400
 * `model_decommissioned` or 404 `model_not_found`. Rather than making the
 * operator chase release notes, we ask `GET /models` for the live list and
 * retry once with an id that actually exists.
 *
 * SECURITY: server-only. The key is used for the discovery request and is
 * never logged or returned - only the resolved model id is surfaced.
 */

/**
 * Ids that answer `/models` but cannot serve a chat completion: speech to
 * text, text to speech, safety classifiers, embeddings, rerankers, image
 * models. Taking `data[0]` blindly tends to land on one of these - Groq lists
 * `whisper-large-v3` and `llama-guard-*` alongside the chat models.
 */
const NOT_CHAT =
  /whisper|tts|guard|embed|rerank|moderation|dall-?e|sora|transcribe|speech|playai|distil|vision-only|image/i;

/**
 * Preference order, best first. Favour a large instruct model, fall back to a
 * fast small one, then anything plausible. Without this the "first" id is
 * arbitrary and may be a tiny or preview model that handles JSON badly.
 */
const PREFERRED: RegExp[] = [
  /^llama-3\.3-70b-versatile$/i,
  /^llama-3\.1-8b-instant$/i,
  /^meta-llama\/llama-4-\w+/i,
  /llama-3\.3/i,
  /llama-3\.1/i,
  /llama-4/i,
  /^gpt-4o-mini$/i,
  /^gpt-4o$/i,
  /gpt-oss/i,
  /qwen/i,
  /kimi/i,
  /mixtral|mistral/i,
  /gemma/i,
  /llama/i,
];

export interface ModelListEntry {
  id?: unknown;
  active?: unknown;
  object?: unknown;
}

/**
 * Choose the best chat-capable id from a `/models` payload. Exported so the
 * selection rules can be tested without a network call.
 */
export function pickChatModel(entries: ModelListEntry[]): string | null {
  const ids = entries
    .filter((entry) => entry && entry.active !== false)
    .map((entry) => (typeof entry.id === "string" ? entry.id : ""))
    .filter((id) => id !== "" && !NOT_CHAT.test(id));

  if (ids.length === 0) return null;

  for (const pattern of PREFERRED) {
    const match = ids.find((id) => pattern.test(id));
    if (match) return match;
  }

  // Nothing recognised, but it is at least not a speech or guard model.
  return ids[0];
}

interface CacheEntry {
  model: string;
  at: number;
}

const DISCOVERY_TTL_MS = 10 * 60 * 1000;
const cache = new Map<string, CacheEntry>();

/** A model id already proven to work for this base, if still fresh. */
export function getWorkingModel(base: string): string | null {
  const hit = cache.get(base);
  if (!hit) return null;
  if (Date.now() - hit.at > DISCOVERY_TTL_MS) {
    cache.delete(base);
    return null;
  }
  return hit.model;
}

export function rememberWorkingModel(base: string, model: string): void {
  cache.set(base, { model, at: Date.now() });
}

/** Test seam - discovery caches in module scope, which persists across calls. */
export function clearModelCache(): void {
  cache.clear();
}

/**
 * Does this upstream error mean "that model id is no longer valid"? Only
 * those are worth re-trying with a different model; an auth or quota failure
 * would just fail again.
 */
export function isModelAvailabilityError(status: number, detail: string): boolean {
  if (status !== 400 && status !== 404) return false;
  return /decommission|model_not_found|does not exist|no longer (available|supported)|unknown model|invalid model|not found/i.test(
    detail,
  );
}

/**
 * Ask the provider which models are live and return the best chat id.
 * Returns null when the list cannot be read, so the caller can fall back.
 */
export async function discoverChatModel(
  base: string,
  apiKey: string,
  signal: AbortSignal,
): Promise<string | null> {
  const response = await fetch(`${base}/models`, {
    method: "GET",
    signal,
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) return null;

  const payload = (await response.json()) as { data?: unknown };
  if (!Array.isArray(payload.data)) return null;

  return pickChatModel(payload.data as ModelListEntry[]);
}
