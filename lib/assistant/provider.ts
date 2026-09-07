import { mockAssistantProvider } from "./mockProvider";
import type { AssistantProvider } from "./types";

/**
 * Swap this factory when a server-side LLM is added.
 * Never import API keys into client bundles.
 */
export function getAssistantProvider(): AssistantProvider {
  return mockAssistantProvider;
}
