import type { AssistantStatus } from "@/types";

export function AvatarFallback({ status }: { status: AssistantStatus }) {
  return (
    <div className="flex h-full min-h-[220px] flex-col items-center justify-center bg-surface-secondary px-4 text-center">
      <p className="label">Portfolio Assistant</p>
      <p className="mt-3 text-sm text-muted">
        The assistant is available through the chat on this device. Current status: {status}.
      </p>
    </div>
  );
}
