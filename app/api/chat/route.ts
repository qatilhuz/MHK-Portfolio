import { NextResponse } from "next/server";
import { replyFromKnowledge, unknownReply } from "@/lib/assistant/knowledge";
import { buildSystemPrompt } from "@/lib/assistant/prompt";
import {
  coerceEmotion,
  parseAssistantEnvelope,
  type AvatarEmotion,
} from "@/lib/assistant/emotion";
import type { AssistantLink } from "@/types";

/**
 * Portfolio assistant LLM endpoint.
 *
 * SECURITY: `LLM_API_KEY` is read only here, on the server. It has no
 * NEXT_PUBLIC_ prefix, so Next will never inline it into a client bundle, and
 * the key is never echoed back in a response - upstream failures are collapsed
 * into a generic fallback so provider error bodies cannot leak either.
 *
 * AVAILABILITY: when no key is configured, or the provider errors out, or it
 * returns something that is not the agreed JSON envelope, the route answers
 * from the local knowledge base instead of failing. The avatar always gets a
 * usable `{ text, emotion }` pair, and the site works with no key at all.
 */

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_BYTES = 8_192;
const MAX_MESSAGE_CHARS = 1_000;
const MAX_HISTORY_TURNS = 8;
const UPSTREAM_TIMEOUT_MS = 20_000;

const WINDOW_MS = 60_000;
const MAX_PER_WINDOW = 12;
const hits = new Map<string, { count: number; reset: number }>();

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

  const apiKey = process.env.LLM_API_KEY;
  if (!apiKey) {
    // No key configured: the knowledge base is the product, not an error.
    return localAnswer(body.message);
  }

  try {
    const envelope = await callProvider(apiKey, body);
    if (!envelope) return localAnswer(body.message);

    return NextResponse.json({
      text: envelope.text,
      emotion: envelope.emotion,
      links: groundedLinks(body.message),
      source: "llm" as const,
    });
  } catch {
    // Swallow the upstream error on purpose: its body can echo request
    // headers, and the visitor still deserves an answer.
    return localAnswer(body.message);
  }
}

async function callProvider(apiKey: string, body: ChatBody) {
  const provider = (process.env.LLM_PROVIDER ?? "openai").toLowerCase();
  const system = buildSystemPrompt();

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), UPSTREAM_TIMEOUT_MS);

  try {
    const raw =
      provider === "gemini"
        ? await callGemini(apiKey, system, body, controller.signal)
        : await callOpenAICompatible(apiKey, system, body, controller.signal);

    if (!raw) return null;

    const envelope = parseAssistantEnvelope(raw);
    if (envelope) return envelope;

    // Valid completion, unusable shape: keep the prose, default the face.
    const text = raw.trim();
    return text === "" ? null : { text, emotion: coerceEmotion(undefined) };
  } finally {
    clearTimeout(timeout);
  }
}

async function callOpenAICompatible(
  apiKey: string,
  system: string,
  body: ChatBody,
  signal: AbortSignal,
): Promise<string | null> {
  const base = process.env.LLM_API_BASE ?? "https://api.openai.com/v1";
  const model = process.env.LLM_MODEL ?? "gpt-4o-mini";

  const response = await fetch(`${base.replace(/\/+$/, "")}/chat/completions`, {
    method: "POST",
    signal,
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      temperature: 0.4,
      max_tokens: 400,
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

  if (!response.ok) return null;

  const data = (await response.json()) as {
    choices?: { message?: { content?: string } }[];
  };
  return data.choices?.[0]?.message?.content ?? null;
}

async function callGemini(
  apiKey: string,
  system: string,
  body: ChatBody,
  signal: AbortSignal,
): Promise<string | null> {
  const model = process.env.LLM_MODEL ?? "gemini-1.5-flash";
  const base =
    process.env.LLM_API_BASE ?? "https://generativelanguage.googleapis.com/v1beta";

  const response = await fetch(
    `${base.replace(/\/+$/, "")}/models/${encodeURIComponent(model)}:generateContent`,
    {
      method: "POST",
      signal,
      headers: {
        "Content-Type": "application/json",
        // Header auth, so the key never lands in a URL or an access log.
        "x-goog-api-key": apiKey,
      },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: system }] },
        contents: [
          ...body.history.map((turn) => ({
            role: turn.role === "assistant" ? "model" : "user",
            parts: [{ text: turn.text }],
          })),
          { role: "user", parts: [{ text: body.message }] },
        ],
        generationConfig: {
          temperature: 0.4,
          maxOutputTokens: 400,
          responseMimeType: "application/json",
        },
      }),
    },
  );

  if (!response.ok) return null;

  const data = (await response.json()) as {
    candidates?: { content?: { parts?: { text?: string }[] } }[];
  };
  return data.candidates?.[0]?.content?.parts?.[0]?.text ?? null;
}
