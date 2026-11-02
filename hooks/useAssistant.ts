"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { classifyAssistantQuestion } from "@/lib/analytics/classify";
import { trackEvent } from "@/lib/analytics/client";
import { coerceEmotion, type AvatarEmotion } from "@/lib/assistant/emotion";
import { unknownReply } from "@/lib/assistant/knowledge";
import type { AssistantLink, AssistantMessage, AssistantStatus } from "@/types";

interface ChatResponse {
  text?: unknown;
  emotion?: unknown;
  links?: unknown;
  source?: unknown;
}

function parseLinks(value: unknown): AssistantLink[] | undefined {
  if (!Array.isArray(value)) return undefined;

  const links = value.flatMap((raw) => {
    if (!raw || typeof raw !== "object") return [];
    const item = raw as Record<string, unknown>;
    if (typeof item.href !== "string" || typeof item.label !== "string") return [];
    return [{ href: item.href, label: item.label }];
  });

  return links.length > 0 ? links : undefined;
}

export function useAssistant() {
  const [messages, setMessages] = useState<AssistantMessage[]>([]);
  const [status, setStatus] = useState<AssistantStatus>("idle");
  const [error, setError] = useState<string | null>(null);

  // Keep history out of `ask`'s dependency list so the callback is stable and
  // a send never races a stale closure of the transcript.
  const messagesRef = useRef<AssistantMessage[]>([]);
  messagesRef.current = messages;

  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => () => abortRef.current?.abort(), []);

  const reset = useCallback(() => {
    abortRef.current?.abort();
    abortRef.current = null;
    setMessages([]);
    setStatus("idle");
    setError(null);
  }, []);

  const ask = useCallback(async (question: string) => {
    const trimmed = question.trim();
    if (!trimmed) return null;

    const visitor: AssistantMessage = {
      id: `v-${Date.now()}`,
      role: "visitor",
      text: trimmed,
    };
    const history = [...messagesRef.current, visitor].map((item) => ({
      role: item.role,
      text: item.text,
    }));

    setMessages((prev) => [...prev, visitor]);
    setStatus("thinking");
    setError(null);
    trackEvent("assistant_question_category", {
      category: classifyAssistantQuestion(trimmed),
    });

    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    const settle = (text: string, emotion: AvatarEmotion, links?: AssistantLink[]) => {
      const assistant: AssistantMessage = {
        id: `a-${Date.now()}`,
        role: "assistant",
        text,
        links,
        emotion,
      };
      setMessages((prev) => [...prev, assistant]);
      return assistant;
    };

    try {
      // The API key lives on the server; the browser only ever sees this route.
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: trimmed, history }),
        signal: controller.signal,
      });

      if (!response.ok) throw new Error(`chat_${response.status}`);

      const data = (await response.json()) as ChatResponse;
      const text = typeof data.text === "string" ? data.text.trim() : "";
      if (text === "") throw new Error("chat_empty");

      setStatus("idle");
      return settle(text, coerceEmotion(data.emotion), parseLinks(data.links));
    } catch (cause) {
      // An aborted request is a reset or an unmount, not a failure.
      if (cause instanceof DOMException && cause.name === "AbortError") return null;

      setError("The assistant could not answer just now.");
      setStatus("error");
      return settle(unknownReply.text, "sad", unknownReply.links);
    } finally {
      if (abortRef.current === controller) abortRef.current = null;
    }
  }, []);

  return { messages, status, setStatus, error, ask, reset };
}
