import { Card } from "@/components/ui/Card";

export function ProjectEmptyState() {
  return (
    <Card className="border-dashed">
      <p className="label">Selected Work</p>
      <h3 className="mt-3">No projects in this category yet.</h3>
      <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted">
        Try another filter or browse all selected work.
      </p>
    </Card>
  );
}
