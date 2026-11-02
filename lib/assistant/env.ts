/**
 * LLM configuration resolver.
 *
 * Reading `process.env` directly is how the assistant kept silently falling
 * back to the knowledge base: a trailing space in `LLM_PROVIDER=gemini ` does
 * not match `"gemini"`, so execution dropped into the OpenAI branch and the
 * Google key was rejected by api.openai.com. Everything here is defensive
 * normalisation of hand-edited `.env` files.
 *
 * SECURITY: this module is server-only by construction - it is imported by the
 * route handler, never by a client component, and no value it returns is ever
 * sent to the browser. `describeLlmConfig` masks the key for logging.
 */

export type LlmProvider = "openai" | "gemini";

const GEMINI_ALIASES = new Set([
  "gemini",
  "google",
  "googleai",
  "google-ai",
  "google_ai",
  "google-gemini",
  "googlegenerativeai",
  "generativelanguage",
  "aistudio",
  "google-ai-studio",
]);

const OPENAI_ALIASES = new Set([
  "openai",
  "oai",
  "open-ai",
  "azure",
  "azureopenai",
  "azure-openai",
  "groq",
  "openrouter",
  "together",
  "deepseek",
  "mistral",
  "perplexity",
  "ollama",
  "llamacpp",
  "lmstudio",
  "local",
  "compatible",
  "openai-compatible",
]);

export const DEFAULT_GEMINI_BASE = "https://generativelanguage.googleapis.com/v1beta";
export const DEFAULT_OPENAI_BASE = "https://api.openai.com/v1";

/**
 * Google retired the 1.5 series for keys created from mid-2025 onward, so a
 * brand-new AI Studio key 404s on `gemini-1.5-flash`. 2.0-flash is the current
 * free-tier default and is what a fresh key can actually reach.
 */
export const DEFAULT_GEMINI_MODEL = "gemini-2.0-flash";
export const DEFAULT_OPENAI_MODEL = "gpt-4o-mini";

/** Quote characters people paste in from docs, including smart quotes. */
const QUOTES = ['"', "'", "`", "\u201C", "\u201D", "\u2018", "\u2019"];

/**
 * Read one variable the way a tolerant `.env` parser should: strip stray CR
 * (Windows-edited files), tabs, zero-width characters and a BOM, then peel any
 * surrounding quotes. Returns undefined for anything that ends up empty, so
 * `LLM_API_KEY=` and `LLM_API_KEY=""` both read as "not configured".
 */
export function readEnv(name: string): string | undefined {
  const raw = process.env[name];
  if (typeof raw !== "string") return undefined;

  let value = raw.replace(/[\r\n\t\u200B-\u200D\uFEFF]/g, "").trim();

  // Peel repeatedly: a value can arrive as '"sk-..."' once dotenv has had a go.
  for (let guard = 0; guard < 4; guard += 1) {
    const first = value.charAt(0);
    const last = value.charAt(value.length - 1);
    if (value.length < 2 || !QUOTES.includes(first) || !QUOTES.includes(last)) break;
    value = value.slice(1, -1).trim();
  }

  return value === "" ? undefined : value;
}

/** Google AI Studio keys are unambiguous: 39 chars beginning `AIza`. */
function looksLikeGoogleKey(key: string): boolean {
  return /^AIza[\w-]{10,}$/.test(key);
}

/** OpenAI and most compatible proxies issue `sk-` / `sk-proj-` keys. */
function looksLikeOpenAiKey(key: string): boolean {
  return /^sk-/i.test(key);
}

function normaliseProvider(declared: string | undefined): LlmProvider | null {
  if (!declared) return null;
  const key = declared.toLowerCase().replace(/\s+/g, "");
  if (GEMINI_ALIASES.has(key)) return "gemini";
  if (OPENAI_ALIASES.has(key)) return "openai";
  // Unknown but clearly Google-flavoured, e.g. "gemini-pro" in the wrong slot.
  if (key.includes("gemini") || key.includes("google")) return "gemini";
  if (key.includes("openai")) return "openai";
  return null;
}

export interface LlmConfig {
  provider: LlmProvider;
  apiKey: string;
  model: string;
  baseUrl: string;
  /** Human-readable notes about anything that was corrected, for the log. */
  notes: string[];
}

/**
 * Resolve the full provider configuration, repairing the mismatches that make
 * a Gemini key fail against an OpenAI endpoint. Returns null when no key is
 * configured at all, which is a supported state, not an error.
 */
export function resolveLlmConfig(): LlmConfig | null {
  const apiKey = readEnv("LLM_API_KEY");
  if (!apiKey) return null;

  const notes: string[] = [];
  const declaredRaw = process.env.LLM_PROVIDER;
  const declared = readEnv("LLM_PROVIDER");

  if (typeof declaredRaw === "string" && declaredRaw !== declared && declared) {
    notes.push(`LLM_PROVIDER had stray whitespace or quotes; read as "${declared}"`);
  }

  let provider = normaliseProvider(declared);

  if (!provider) {
    // Nothing usable declared: infer from the key shape rather than assuming.
    provider = looksLikeGoogleKey(apiKey) ? "gemini" : "openai";
    notes.push(
      declared
        ? `LLM_PROVIDER="${declared}" is not recognised; inferred "${provider}" from the key format`
        : `LLM_PROVIDER not set; inferred "${provider}" from the key format`,
    );
  }

  const configuredBase = readEnv("LLM_API_BASE");

  // A Google key can never authenticate against OpenAI. Correct an impossible
  // pairing, but only when the operator has not pointed us at a custom base -
  // a self-hosted proxy is allowed to use whatever key format it likes.
  if (!configuredBase) {
    if (provider === "openai" && looksLikeGoogleKey(apiKey)) {
      provider = "gemini";
      notes.push("LLM_API_KEY looks like a Google AI Studio key (AIza...); switched to the Gemini endpoint");
    } else if (provider === "gemini" && looksLikeOpenAiKey(apiKey)) {
      provider = "openai";
      notes.push("LLM_API_KEY looks like an OpenAI key (sk-...); switched to the OpenAI-compatible endpoint");
    }
  }

  const defaultBase = provider === "gemini" ? DEFAULT_GEMINI_BASE : DEFAULT_OPENAI_BASE;
  let baseUrl = defaultBase;

  if (configuredBase) {
    const belongsToOther =
      (provider === "gemini" && /openai\.com/i.test(configuredBase)) ||
      (provider === "openai" && /googleapis\.com/i.test(configuredBase));

    if (belongsToOther) {
      notes.push(
        `LLM_API_BASE="${configuredBase}" belongs to a different provider; ignoring it and using ${defaultBase}`,
      );
    } else {
      // Drop a trailing `/models` or slash so URL building stays predictable.
      baseUrl = configuredBase.replace(/\/+$/, "").replace(/\/models$/i, "");
    }
  }

  const defaultModel = provider === "gemini" ? DEFAULT_GEMINI_MODEL : DEFAULT_OPENAI_MODEL;
  let model = defaultModel;
  const configuredModel = readEnv("LLM_MODEL");

  if (configuredModel) {
    // `models/gemini-2.0-flash` is the full resource name; the path adds that.
    const bare = configuredModel.replace(/^models\//i, "");
    const wrongFamily =
      (provider === "gemini" && /^(gpt|o[13]|text-|davinci|chatgpt)/i.test(bare)) ||
      (provider === "openai" && /^gemini/i.test(bare));

    if (wrongFamily) {
      notes.push(
        `LLM_MODEL="${configuredModel}" is not a ${provider} model; falling back to ${defaultModel}`,
      );
    } else {
      model = bare;
    }
  }

  return { provider, apiKey, model, baseUrl, notes };
}

/** One-line, key-masked summary safe to print to the server log. */
export function describeLlmConfig(config: LlmConfig): string {
  const masked = `${config.apiKey.slice(0, 4)}...(${config.apiKey.length} chars)`;
  return `provider=${config.provider} model=${config.model} base=${config.baseUrl} key=${masked}`;
}
