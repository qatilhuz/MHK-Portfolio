import type { AssistantStatus } from "@/types";
import { Badge } from "@/components/ui/Badge";

const labels: Record<AssistantStatus, string> = {
  idle: "Idle",
  listening: "Listening",
  thinking: "Thinking",
  speaking: "Speaking",
  error: "Error",
  unavailable: "Unavailable",
};

export function AvatarStatus({ status }: { status: AssistantStatus }) {
  return <Badge>{labels[status]}</Badge>;
}
