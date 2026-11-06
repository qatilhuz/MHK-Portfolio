import { NextResponse } from "next/server";
import { replyFromKnowledge, unknownReply } from "@/lib/assistant/knowledge";
import { buildSystemPrompt } from "@/lib/assistant/prompt";
import {
  AVATAR_EMOTIONS,
  coerceEmotion,
  parseAssistantEnvelope,
  type AvatarEmotion,
} from "@/lib/assistant/emotion";
import {
  describeLlmConfig,
  resolveLlmConfig,
  type LlmConfig,
} from "@/lib/assistant/env";
import {
  discoverChatModel,
  getWorkingModel,
  isModelAvailabilityError,
  rememberWorkingModel,
} from "@/lib/assistant/models";
import type { AssistantLink } from "@/types";

/**
 * Portfolio assistant LLM endpoint.
 *
 * SECURITY: `LLM_API_KEY` is read only here, on the server. It has no
 * NEXT_PUBLIC_ prefix, so Next will never inline it into a client bundle, and
 * the key is never echoed back in a response - upstream failures are collapsed
 * into a generic fallback so provider error bodies cannot leak either. The
 * diagnostics below go to the server log and mask the key.
 *
 * AVAILABILITY: when no key is configured, or the provider errors out, or it
 * returns something that is not the agreed JSON envelope, the route answers
 * from the local knowledge base instead of failing. The avatar always gets a
 * usable `{ text, emotion }` pair, and the site works with no key at all.
 */

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Must be at least as long as UPSTREAM_TIMEOUT_MS or the platform kills the
 * function before our own abort can fire and serve the fallback. 60 is the
 * ceiling on Vercel's Hobby plan; raise it alongside the timeout on Pro.
 */
export const maxDuration = 60;

const MAX_BYTES = 8_192;
const MAX_MESSAGE_CHARS = 1_000;
const MAX_HISTORY_TURNS = 8;
/** Gemini can be slow to first byte on a cold model; 20s was cutting it off. */
const UPSTREAM_TIMEOUT_MS = 60_000;
/** JSON mode spends tokens on syntax; too low a cap truncates mid-object. */
const MAX_OUTPUT_TOKENS = 800;

const WINDOW_MS = 60_000;
const MAX_PER_WINDOW = 12;
const hits = new Map<string, { count: number; reset: number }>();

const LOG = "[assistant]";

function rateLimit(key: string): boolean {
  const now = Date.now();
  const row = hits.get(key);

  if (!row || now > row.reset) {
    hits.set(key, { count: 1, reset: now + WINDOW_MS });
    return true;
  }
  if (row.count >= MAX_PER_WINDOW) return false;

  row.count += 1;
  return true;
}

function clientKey(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  const raw = forwarded?.split(",")[0]?.trim() || "unknown";
  let hash = 0;
  for (let i = 0; i < raw.length; i += 1) {
    hash = (hash * 31 + raw.charCodeAt(i)) >>> 0;
  }
  return String(hash);
}

interface Turn {
  role: "visitor" | "assistant";
  text: string;
}

interface ChatBody {
  message: string;
  history: Turn[];
}

function parseBody(value: unknown): ChatBody | null {
  if (!value || typeof value !== "object") return null;

  const record = value as Record<string, unknown>;
  const message = typeof record.message === "string" ? record.message.trim() : "";
  if (message === "" || message.length > MAX_MESSAGE_CHARS) return null;

  const history: Turn[] = [];
  if (Array.isArray(record.history)) {
    for (const raw of record.history.slice(-MAX_HISTORY_TURNS)) {
      if (!raw || typeof raw !== "object") continue;
      const turn = raw as Record<string, unknown>;
      const role = turn.role === "assistant" ? "assistant" : "visitor";
      const text = typeof turn.text === "string" ? turn.text.slice(0, MAX_MESSAGE_CHARS) : "";
      if (text.trim() === "") continue;
      history.push({ role, text });
    }
  }

  return { message, history };
}

/** Links come from the local corpus - the model is never asked to invent URLs. */
function groundedLinks(question: string): AssistantLink[] | undefined {
  const local = replyFromKnowledge(question);
  if (local.text === unknownReply.text) return undefined;
  return local.links;
}

function localAnswer(question: string, emotion: AvatarEmotion = "neutral") {
  const local = replyFromKnowledge(question);
  return NextResponse.json({
    text: local.text,
    emotion: local.text === unknownReply.text ? "sad" : emotion,
    links: local.links,
    source: "local" as const,
  });
}

/**
 * Print the resolved configuration once per process so a misconfiguration is
 * visible at the first request instead of looking like "the model is quiet".
 */
let configLogged = false;
function logConfigOnce(config: LlmConfig | null) {
  if (configLogged) return;
  configLogged = true;

  if (!config) {
    console.warn(
      `${LOG} LLM_API_KEY is not set - answering from the local knowledge base.`,
      "Set LLM_API_KEY and LLM_PROVIDER in .env.local to enable the model.",
    );
    return;
  }

  console.info(`${LOG} ${describeLlmConfig(config)}`);
  for (const note of config.notes) console.warn(`${LOG} config: ${note}`);
}

export async function POST(request: Request) {
  const declared = Number(request.headers.get("content-length") ?? 0);
  if (declared > MAX_BYTES) {
    return NextResponse.json({ error: "payload_too_large" }, { status: 413 });
  }

  if (!rateLimit(clientKey(request))) {
    return NextResponse.json({ error: "rate_limited" }, { status: 429 });
  }

  let json: unknown;
  try {
    const raw = await request.text();
    if (raw.length > MAX_BYTES) {
      return NextResponse.json({ error: "payload_too_large" }, { status: 413 });
    }
    json = JSON.parse(raw) as unknown;
  } catch {
    return NextResponse.json({ error: "bad_request" }, { status: 400 });
  }

  const body = parseBody(json);
  if (!body) {
    return NextResponse.json({ error: "bad_request" }, { status: 400 });
  }

  const config = resolveLlmConfig();
  logConfigOnce(config);

  if (!config) {
    // No key configured: the knowledge base is the product, not an error.
    return localAnswer(body.message);
  }

  try {
    const envelope = await callProvider(config, body);
    if (!envelope) return localAnswer(body.message);

    return NextResponse.json({
      text: envelope.text,
      emotion: envelope.emotion,
      links: groundedLinks(body.message),
      source: "llm" as const,
    });
  } catch (cause) {
    // Swallow the upstream error on purpose: its body can echo request
    // headers, and the visitor still deserves an answer. Log it server-side.
    const reason = cause instanceof Error ? cause.message : String(cause);
    console.error(
      `${LOG} ${config.provider} request failed (${reason}) - serving the local knowledge base.`,
    );
    return localAnswer(body.message);
  }
}

async function callProvider(config: LlmConfig, body: ChatBody) {
  const system = buildSystemPrompt();

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), UPSTREAM_TIMEOUT_MS);

  try {
    const raw =
      config.provider === "gemini"
        ? await callGemini(config, system, body, controller.signal)
        : await callOpenAICompatible(config, system, body, controller.signal);

    if (!raw) return null;

    const envelope = parseAssistantEnvelope(raw);
    if (envelope) return envelope;

    // Valid completion, unusable shape: keep the prose, default the face.
    const text = raw.trim();
    if (text === "") return null;
    console.warn(
      `${LOG} ${config.provider} returned text that was not the {text, emotion} envelope;`,
      "using it as plain prose with a neutral expression.",
    );
    return { text, emotion: coerceEmotion(undefined) };
  } finally {
    clearTimeout(timeout);
  }
}

/** Read an error body for the log without letting a huge page through. */
async function describeFailure(response: Response): Promise<string> {
  let detail = "";
  try {
    detail = (await response.text()).replace(/\s+/g, " ").slice(0, 400);
  } catch {
    detail = "<unreadable body>";
  }
  return `HTTP ${response.status} ${response.statusText} ${detail}`.trim();
}

/** Point at the most common cause of each status so the log is actionable. */
function hintForStatus(status: number, provider: string): string {
  if (status === 400) return "malformed request, or the model rejected a field";
  if (status === 401 || status === 403) {
    return provider === "gemini"
      ? "the API key was rejected - check LLM_API_KEY is a Google AI Studio key and the Generative Language API is enabled"
      : "the API key was rejected - check LLM_API_KEY";
  }
  if (status === 404) {
    if (provider === "gemini") {
      return "model not found for this key - try LLM_MODEL=gemini-2.0-flash (the 1.5 series is unavailable to newer keys)";
    }
    return "model not found - LLM_MODEL is stale and live discovery could not replace it";
  }
  if (status === 429) return "rate limited or out of quota";
  if (status >= 500) return "provider-side outage";
  return "unexpected status";
}

/** Friendly name for the log line. */
function providerLabel(provider: string): string {
  if (provider === "groq") return "Groq";
  if (provider === "gemini") return "Gemini";
  return "OpenAI";
}

async function callOpenAICompatible(
  config: LlmConfig,
  system: string,
  body: ChatBody,
  signal: AbortSignal,
): Promise<string | null> {
  const post = (model: string) =>
    fetch(`${config.baseUrl}/chat/completions`, {
      method: "POST",
      signal,
      headers: {
        Authorization: `Bearer ${config.apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        temperature: 0.4,
        max_tokens: MAX_OUTPUT_TOKENS,
        // Provider-level JSON mode. parseAssistantEnvelope still validates.
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: system },
          ...body.history.map((turn) => ({
            role: turn.role === "assistant" ? ("assistant" as const) : ("user" as const),
            content: turn.text,
          })),
          { role: "user", content: body.message },
        ],
      }),
    });

  // Prefer an id already proven live for this host over the configured one,
  // so a decommissioned LLM_MODEL costs one failed call, not one per request.
  const cached = getWorkingModel(config.baseUrl);
  let model = cached ?? config.model;
  let response = await post(model);
  let detail = response.ok ? "" : await describeFailure(response);

  if (!response.ok) {
    if (isModelAvailabilityError(response.status, detail)) {
      console.warn(`${LOG} model "${model}" was rejected: ${detail}`);
      const discovered = await discoverChatModel(config.baseUrl, config.apiKey, signal);

      if (discovered && discovered !== model) {
        console.info(
          `${LOG} Fallback to active ${providerLabel(config.provider)} model: ${discovered}`,
        );
        model = discovered;
        response = await post(model);
        detail = response.ok ? "" : await describeFailure(response);
      } else if (!discovered) {
        console.error(
          `${LOG} could not read a live model list from ${config.baseUrl}/models -`,
          "serving the local knowledge base.",
        );
      }
    } else {
      console.error(
        `${LOG} ${config.provider} ${detail} -`,
        hintForStatus(response.status, config.provider),
      );
      return null;
    }
  }

  if (!response.ok) {
    console.error(
      `${LOG} ${config.provider} ${detail} -`,
      hintForStatus(response.status, config.provider),
    );
    return null;
  }

  // Only cache once a request has actually succeeded with this id.
  if (model !== cached) rememberWorkingModel(config.baseUrl, model);

  const data = (await response.json()) as {
    choices?: { message?: { content?: string } }[];
  };
  return data.choices?.[0]?.message?.content ?? null;
}

interface GeminiContent {
  role: "user" | "model";
  parts: { text: string }[];
}

/**
 * Gemini rejects a `contents` array that does not begin with a user turn, and
 * it expects roles to alternate. A transcript that opens with an assistant
 * greeting would 400, so drop any leading model turns and merge runs of the
 * same role rather than passing the log through untouched.
 */
function toGeminiContents(body: ChatBody): GeminiContent[] {
  const turns: GeminiContent[] = [];

  for (const turn of body.history) {
    const role: "user" | "model" = turn.role === "assistant" ? "model" : "user";
    if (turns.length === 0 && role === "model") continue;

    const previous = turns[turns.length - 1];
    if (previous && previous.role === role) {
      previous.parts.push({ text: turn.text });
      continue;
    }
    turns.push({ role, parts: [{ text: turn.text }] });
  }

  const last = turns[turns.length - 1];
  if (last && last.role === "user") {
    last.parts.push({ text: body.message });
  } else {
    turns.push({ role: "user", parts: [{ text: body.message }] });
  }

  return turns;
}

interface GeminiResponse {
  candidates?: {
    content?: { parts?: { text?: string }[] };
    finishReason?: string;
  }[];
  promptFeedback?: { blockReason?: string };
}

async function callGemini(
  config: LlmConfig,
  system: string,
  body: ChatBody,
  signal: AbortSignal,
): Promise<string | null> {
  const url = `${config.baseUrl}/models/${encodeURIComponent(config.model)}:generateContent`;

  const generationConfig: Record<string, unknown> = {
    temperature: 0.4,
    maxOutputTokens: MAX_OUTPUT_TOKENS,
    // Structured output: Gemini guarantees raw JSON in this exact shape, with
    // no markdown fence to strip. parseAssistantEnvelope still validates.
    responseMimeType: "application/json",
    responseSchema: {
      type: "object",
      properties: {
        text: { type: "string" },
        emotion: { type: "string", enum: [...AVATAR_EMOTIONS] },
      },
      required: ["text", "emotion"],
    },
  };

  const request = (gen: Record<string, unknown>) =>
    fetch(url, {
      method: "POST",
      signal,
      headers: {
        "Content-Type": "application/json",
        // Header auth, so the key never lands in a URL or an access log.
        "x-goog-api-key": config.apiKey,
      },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: system }] },
        contents: toGeminiContents(body),
        generationConfig: gen,
      }),
    });

  let response = await request(generationConfig);

  // Older or lighter models reject `responseSchema`. Retry once with plain
  // JSON mode rather than silently degrading to the knowledge base.
  if (response.status === 400) {
    const detail = await describeFailure(response);
    if (/responseSchema|response_schema|Unknown name/i.test(detail)) {
      console.warn(
        `${LOG} gemini rejected responseSchema on ${config.model}; retrying with plain JSON mode.`,
      );
      const { responseSchema: _omit, ...withoutSchema } = generationConfig;
      void _omit;
      response = await request(withoutSchema);
    } else {
      console.error(`${LOG} gemini ${detail} -`, hintForStatus(400, "gemini"));
      return null;
    }
  }

  if (!response.ok) {
    console.error(
      `${LOG} gemini ${await describeFailure(response)} -`,
      hintForStatus(response.status, "gemini"),
    );
    return null;
  }

  const data = (await response.json()) as GeminiResponse;

  if (data.promptFeedback?.blockReason) {
    console.warn(
      `${LOG} gemini blocked the prompt (${data.promptFeedback.blockReason}) - serving the local knowledge base.`,
    );
    return null;
  }

  const candidate = data.candidates?.[0];
  if (candidate?.finishReason === "MAX_TOKENS") {
    console.warn(
      `${LOG} gemini hit MAX_TOKENS (${MAX_OUTPUT_TOKENS}); the JSON may be truncated.`,
    );
  }

  // Join every part: structured output can arrive split across parts.
  const text = (candidate?.content?.parts ?? [])
    .map((part) => part.text ?? "")
    .join("")
    .trim();

  return text === "" ? null : text;
}
