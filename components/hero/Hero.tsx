import { siteConfig } from "@/data/site";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { Badge } from "@/components/ui/Badge";

export function Hero() {
  return (
    <section className="relative overflow-hidden border-b border-border">
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,var(--accent-soft),transparent_55%)]"
        aria-hidden="true"
      />
      <Container className="relative grid min-h-[70vh] items-center gap-10 py-20 lg:grid-cols-[1.1fr_0.9fr]">
        <div>
          <Badge>Portfolio</Badge>
          <h1 className="display mt-6">{siteConfig.displayName}</h1>
          <p className="mt-4 max-w-xl text-lg leading-relaxed text-muted">
            {siteConfig.role}. {siteConfig.description}
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button href="/projects">View projects</Button>
            <Button href="/contact" variant="secondary">
              Contact
            </Button>
          </div>
        </div>
        <div className="flex min-h-[240px] items-center justify-center rounded-[var(--radius-lg)] border border-dashed border-border bg-surface">
          <p className="px-6 text-center text-sm text-muted">
            3D digital workspace will live here in a later batch. This layout is
            reserved for the scene, camera, and object interactions.
          </p>
        </div>
      </Container>
    </section>
  );
}
