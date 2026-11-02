"use client";

import Link from "next/link";
import { FormEvent, useEffect, useRef, useState } from "react";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { suggestedQuestions } from "@/lib/assistant/knowledge";
import type { AssistantMessage } from "@/types";

interface AvatarChatProps {
  messages: AssistantMessage[];
  input: string;
  onInput: (value: string) => void;
  onSend: (value: string) => void;
  onReset: () => void;
  busy: boolean;
}

const THINKING_PHRASES = [
  "QUERYING MODEL",
  "PARSING ENVELOPE",
  "COMPOSING REPLY",
];
const GLYPHS = "ABCDEFGHJKLMNPQRSTUVWXYZ0123456789/<>#*+=";
const WAVE_BARS = [0, 1, 2, 3, 4, 5, 6];

/**
 * Character-scramble status line. Each tick reveals one more real character
 * and randomises the rest, so the phrase appears to decrypt in place.
 */
function DecryptingText() {
  const reducedMotion = useReducedMotion();
  const [display, setDisplay] = useState(THINKING_PHRASES[0]);

  useEffect(() => {
    if (reducedMotion) {
      setDisplay(THINKING_PHRASES[0]);
      return;
    }

    let phrase = 0;
    let revealed = 0;
    let holdFrames = 0;

    const interval = setInterval(() => {
      const target = THINKING_PHRASES[phrase];

      if (revealed >= target.length) {
        holdFrames += 1;
        setDisplay(target);
        if (holdFrames > 14) {
          phrase = (phrase + 1) % THINKING_PHRASES.length;
          revealed = 0;
          holdFrames = 0;
        }
        return;
      }

      revealed += 1;
      const scrambled = target
        .split("")
        .map((char, index) => {
          if (index < revealed || char === " ") return char;
          return GLYPHS[Math.floor(Math.random() * GLYPHS.length)];
        })
        .join("");
      setDisplay(scrambled);
    }, 52);

    return () => clearInterval(interval);
  }, [reducedMotion]);

  return (
    <span className="font-mono text-[10px] uppercase tracking-[0.26em] text-cyan-200/90">
      {display}
    </span>
  );
}

function ThinkingIndicator() {
  return (
    <div
      className="assistant-sheen relative flex items-center gap-4 overflow-hidden rounded-xl border border-cyan-300/20 bg-cyan-400/[0.06] px-4 py-3"
      role="status"
      aria-live="polite"
    >
      <span className="sr-only">The assistant is thinking…</span>
      <div className="flex h-6 items-end gap-[3px]" aria-hidden="true">
        {WAVE_BARS.map((bar) => (
          <span
            key={bar}
            className="assistant-wave-bar block h-full w-[3px] rounded-full bg-cyan-300 shadow-[0_0_10px_rgba(103,232,249,0.85)]"
            style={{ animationDelay: `${bar * 110}ms` }}
          />
        ))}
      </div>
      <DecryptingText />
    </div>
  );
}

export function AvatarChat({
  messages,
  input,
  onInput,
  onSend,
  onReset,
  busy,
}: AvatarChatProps) {
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const list = listRef.current;
    if (!list) return;
    // Scroll the log itself - scrollIntoView would drag the whole page.
    list.scrollTo({ top: list.scrollHeight, behavior: "smooth" });
  }, [messages, busy]);

  const submit = (event: FormEvent) => {
    event.preventDefault();
    onSend(input);
  };

  return (
    <div className="flex h-full min-h-[280px] flex-col">
      <div
        ref={listRef}
        data-lenis-prevent
        className="panel-scroll max-h-72 flex-1 space-y-3 overflow-y-auto overscroll-contain pr-1"
        role="log"
        aria-live="polite"
        aria-relevant="additions"
      >
        {messages.length === 0 ? (
          <div className="rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3">
            <p className="label mb-1 text-cyan-200/80">System</p>
            <p className="text-sm text-muted">
              Hi — I’m Huzaifa’s portfolio assistant. Ask me about his
              experience, skills, projects, or tech stack.
            </p>
          </div>
        ) : (
          messages.map((message) => (
            <article
              key={message.id}
              className={
                message.role === "visitor"
                  ? "rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm"
                  : "rounded-xl border border-cyan-300/20 bg-cyan-400/[0.07] px-4 py-3 text-sm shadow-[0_0_28px_rgba(34,211,238,0.07)]"
              }
            >
              <p
                className={
                  message.role === "visitor"
                    ? "label mb-1"
                    : "label mb-1 text-cyan-200/85"
                }
              >
                {message.role === "visitor" ? "You" : "Assistant"}
              </p>
              <p className="leading-relaxed">{message.text}</p>
              {message.links?.length ? (
                <ul className="mt-2 flex flex-wrap gap-3">
                  {message.links.map((link) => (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        className="text-accent underline-offset-4 hover:underline"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              ) : null}
            </article>
          ))
        )}

        {busy ? <ThinkingIndicator /> : null}
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {suggestedQuestions.map((question) => (
          <button
            key={question}
            type="button"
            className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1.5 text-xs text-muted transition-colors duration-[var(--motion-micro)] hover:border-cyan-300/40 hover:bg-cyan-400/10 hover:text-foreground disabled:opacity-40"
            onClick={() => onSend(question)}
            disabled={busy}
          >
            {question}
          </button>
        ))}
      </div>

      <form className="mt-4 flex flex-col gap-3 sm:flex-row" onSubmit={submit}>
        <label htmlFor="assistant-input" className="sr-only">
          Ask the portfolio assistant
        </label>
        <input
          id="assistant-input"
          value={input}
          onChange={(event) => onInput(event.target.value)}
          className="h-11 flex-1 rounded-xl border border-white/10 bg-black/30 px-4 text-sm outline-none transition-colors duration-[var(--motion-micro)] placeholder:text-muted/70 focus:border-cyan-400/40 focus:ring-1 focus:ring-cyan-500/50"
          placeholder="Ask me about Huzaifa..."
          autoComplete="off"
          disabled={busy}
        />
        <div className="flex gap-2">
          <button
            type="submit"
            disabled={busy}
            className="h-11 rounded-xl border border-cyan-300/30 bg-cyan-400/15 px-5 text-sm font-medium text-cyan-100 shadow-[0_0_24px_rgba(34,211,238,0.12)] outline-none transition-colors duration-[var(--motion-micro)] hover:border-cyan-200/60 hover:bg-cyan-400/25 focus-visible:ring-1 focus-visible:ring-cyan-500/60 disabled:opacity-40"
          >
            Send ↗
          </button>
          <button
            type="button"
            onClick={onReset}
            className="h-11 rounded-xl border border-white/10 px-4 text-sm text-muted outline-none transition-colors duration-[var(--motion-micro)] hover:border-white/25 hover:text-foreground focus-visible:ring-1 focus-visible:ring-cyan-500/50"
          >
            Reset
          </button>
        </div>
      </form>
    </div>
  );
}
