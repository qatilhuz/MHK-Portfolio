import { cn } from "@/lib/utils";

type AmbientVariant = "page" | "hero" | "projects" | "arcade" | "terminal";

const variantClass: Record<AmbientVariant, string> = {
  page: "ambient-page fixed inset-0 z-0",
  hero: "ambient-hero absolute inset-0 z-0",
  projects: "ambient-projects absolute inset-0 z-0",
  arcade: "ambient-arcade absolute inset-0 z-0",
  terminal: "ambient-terminal absolute inset-0 z-0",
};

export function AmbientBackground({
  variant = "page",
  className,
}: {
  variant?: AmbientVariant;
  className?: string;
}) {
  return (
    <div
      className={cn("ambient-root", variantClass[variant], className)}
      aria-hidden="true"
    >
      <div className="ambient-veil" />
      <div className="ambient-blob ambient-blob-a" />
      <div className="ambient-blob ambient-blob-b" />
      <div className="ambient-blob ambient-blob-c" />
      <div className="ambient-dots" />
    </div>
  );
}
