import type { AssistantStatus } from "@/types";

export function AvatarFallback({ status }: { status: AssistantStatus }) {
  return (
    <div className="flex h-full min-h-[220px] flex-col items-center justify-center bg-surface-secondary px-4 text-center">
      <p className="label">Digital assistant</p>
      <p className="mt-3 text-sm text-muted">
        3D avatar placeholder unavailable. Status: {status}. A likeness model
        can replace this later via public/models/avatar.glb.
      </p>
    </div>
  );
}
