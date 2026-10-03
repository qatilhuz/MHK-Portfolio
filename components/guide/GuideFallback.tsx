import type { GuidePose } from "@/lib/guide/types";

export function GuideFallback({ pose }: { pose: GuidePose }) {
  return (
    <div className="flex h-full items-end justify-center bg-surface-secondary p-4">
      <div className="text-center">
        <div
          className="mx-auto h-24 w-16 rounded-[2rem] border border-border bg-surface"
          aria-hidden
        />
        <p className="mt-3 font-mono text-[10px] uppercase tracking-[0.14em] text-muted">
          Guide · {pose}
        </p>
      </div>
    </div>
  );
}
