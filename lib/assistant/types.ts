import type { AssistantReply } from "@/types";

export interface AssistantProvider {
  id: string;
  ask: (
    question: string,
    history: { role: "visitor" | "assistant"; text: string }[],
  ) => Promise<AssistantReply>;
}
