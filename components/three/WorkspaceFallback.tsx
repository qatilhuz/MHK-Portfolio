import { Badge } from "@/components/ui/Badge";

export function WorkspaceFallback() {
  return (
    <div className="flex h-full min-h-[280px] items-end justify-center p-6">
      <div className="w-full max-w-sm rounded-[var(--radius-md)] border border-border bg-surface-secondary p-5">
        <p className="label">Digital workspace</p>
        <p className="mt-3 text-sm leading-relaxed text-muted">
          The interactive 3D scene is unavailable in this browser. The rest of
          the portfolio remains fully usable.
        </p>
        <div className="mt-4">
          <Badge>2D fallback</Badge>
        </div>
      </div>
    </div>
  );
}
