"use client";

import { Button } from "@/components/ui/Button";

interface ArcadeShellProps {
  title: string;
  instructions: string;
  status: string;
  onBack: () => void;
  onRestart: () => void;
  children: React.ReactNode;
}

export function ArcadeShell({
  title,
  instructions,
  status,
  onBack,
  onRestart,
  children,
}: ArcadeShellProps) {
  return (
    <div className="rounded-[var(--radius-lg)] border border-border bg-surface p-5">
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3>{title}</h3>
          <p className="mt-1 text-sm text-muted">{instructions}</p>
        </div>
        <div className="flex gap-2">
          <Button type="button" size="sm" variant="ghost" onClick={onBack}>
            Back
          </Button>
          <Button type="button" size="sm" variant="secondary" onClick={onRestart}>
            Restart
          </Button>
        </div>
      </div>
      <p className="mb-4 text-sm" role="status" aria-live="polite">
        {status}
      </p>
      {children}
    </div>
  );
}
