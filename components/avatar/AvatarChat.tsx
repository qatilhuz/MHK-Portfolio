"use client";

import Link from "next/link";
import { FormEvent, useEffect, useRef } from "react";
import { Button } from "@/components/ui/Button";
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
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight });
  }, [messages]);

  const submit = (event: FormEvent) => {
    event.preventDefault();
    onSend(input);
  };

  return (
    <div className="flex h-full min-h-[280px] flex-col">
      <div
        ref={listRef}
        className="max-h-72 flex-1 space-y-3 overflow-y-auto pr-1"
        role="log"
        aria-live="polite"
        aria-relevant="additions"
      >
        {messages.length === 0 ? (
          <p className="text-sm text-muted">
            Ask about Huzaifa’s background, stack, experience, or projects.
            Answers come only from verified portfolio data.
          </p>
        ) : (
          messages.map((message) => (
            <article
              key={message.id}
              className={
                message.role === "visitor"
                  ? "rounded-[var(--radius-md)] border border-border bg-surface-secondary px-3 py-2 text-sm"
                  : "rounded-[var(--radius-md)] bg-accent-soft px-3 py-2 text-sm"
              }
            >
              <p className="label mb-1">
                {message.role === "visitor" ? "You" : "Assistant"}
              </p>
              <p>{message.text}</p>
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
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {suggestedQuestions.map((question) => (
          <button
            key={question}
            type="button"
            className="rounded-full border border-border px-3 py-1 text-xs text-muted hover:text-foreground"
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
          className="h-11 flex-1 rounded-[var(--radius-md)] border border-border bg-surface px-3 text-sm"
          placeholder="Ask a question…"
          autoComplete="off"
        />
        <div className="flex gap-2">
          <Button type="submit" disabled={busy}>
            Send
          </Button>
          <Button type="button" variant="ghost" onClick={onReset}>
            Reset
          </Button>
        </div>
      </form>
    </div>
  );
}
