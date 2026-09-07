"use client";

import { useCallback, useState } from "react";
import { getAssistantProvider } from "@/lib/assistant/provider";
import { unknownReply } from "@/lib/assistant/knowledge";
import type { AssistantMessage, AssistantStatus } from "@/types";

export function useAssistant() {
  const [messages, setMessages] = useState<AssistantMessage[]>([]);
  const [status, setStatus] = useState<AssistantStatus>("idle");
  const [error, setError] = useState<string | null>(null);

  const reset = useCallback(() => {
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
    setMessages((prev) => [...prev, visitor]);
    setStatus("thinking");
    setError(null);

    try {
      const provider = getAssistantProvider();
      const history = [...messages, visitor].map((item) => ({
        role: item.role,
        text: item.text,
      }));
      const reply = await provider.ask(trimmed, history);
      const assistant: AssistantMessage = {
        id: `a-${Date.now()}`,
        role: "assistant",
        text: reply.text,
        links: reply.links,
      };
      setMessages((prev) => [...prev, assistant]);
      setStatus("idle");
      return assistant;
    } catch {
      setError("The assistant could not answer just now.");
      setStatus("error");
      const assistant: AssistantMessage = {
        id: `a-${Date.now()}`,
        role: "assistant",
        text: unknownReply.text,
      };
      setMessages((prev) => [...prev, assistant]);
      return assistant;
    }
  }, [messages]);

  return { messages, status, setStatus, error, ask, reset };
}
