import { Card } from "@/components/ui/Card";

export function ProjectEmptyState() {
  return (
    <Card className="border-dashed">
      <p className="label">Showcase</p>
      <h3 className="mt-3">Projects are being prepared</h3>
      <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted">
        Cards, filters, browser and phone previews, and detail pages are ready.
        Verified work will appear here from data/projects.ts — nothing is
        invented to fill the grid.
      </p>
    </Card>
  );
}
