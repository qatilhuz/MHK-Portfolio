interface MediaPendingProps {
  label: string;
  note?: string;
}

export function MediaPending({ label, note }: MediaPendingProps) {
  return (
    <div className="flex aspect-video w-full flex-col items-center justify-center gap-2 bg-surface-secondary px-4 text-center">
      <p className="font-mono text-xs uppercase tracking-[0.14em] text-muted">
        {label}
      </p>
      <p className="text-sm text-muted">
        {note ?? "Replace with project media"}
      </p>
    </div>
  );
}
