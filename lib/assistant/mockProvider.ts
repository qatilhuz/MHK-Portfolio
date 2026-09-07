import type { AssistantProvider } from "./types";
import { replyFromKnowledge } from "./knowledge";

export const mockAssistantProvider: AssistantProvider = {
  id: "mock-knowledge",
  async ask(question, history) {
    const followUp = question.toLowerCase();
    const lastAssistant = [...history]
      .reverse()
      .find((item) => item.role === "assistant");

    if (
      lastAssistant &&
      (followUp.includes("currently") || followUp.includes("which one"))
    ) {
      if (lastAssistant.text.toLowerCase().includes("react")) {
        return {
          text: "His current role is .NET Developer at Techcose Solutions (Jun 2026 – Present). Previously he was a Next.js & React Developer at Hudasoft.",
          links: [{ href: "/experience", label: "Experience" }],
        };
      }
    }

    return replyFromKnowledge(question);
  },
};
