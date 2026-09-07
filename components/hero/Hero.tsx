import { ArrowUpRight } from "lucide-react";
import { siteConfig } from "@/data/site";
import { getActiveSocialLinks } from "@/data/social";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { Badge } from "@/components/ui/Badge";

export function Hero() {
  const socials = getActiveSocialLinks();

  return (
    <section
      id="hero"
      className="relative overflow-hidden border-b border-border"
      data-scene="workspace"
    >
      <div className="pointer-events-none absolute inset-0 grid-fade" aria-hidden="true" />
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-72 bg-[radial-gradient(ellipse_at_top,var(--accent-soft),transparent_60%)]"
        aria-hidden="true"
      />
      <Container className="relative grid items-center gap-12 py-20 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:py-28">
        <div>
          <p className="label reveal">Developer · QA-minded</p>
          <h1 className="display mt-5 reveal reveal-delay-1">
            {siteConfig.displayName}
          </h1>
          <p className="mt-5 max-w-xl text-lg leading-relaxed text-muted reveal reveal-delay-2">
            I build web, backend, and mobile software — and I care about
            whether it actually holds up. Explore the work, the stack, and the
            testing side of how I operate.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button href="/projects">
              Explore My Work
              <ArrowUpRight size={16} aria-hidden="true" />
            </Button>
            <Button href={siteConfig.resumePath} variant="secondary">
              View Resume
            </Button>
          </div>
          {socials.length > 0 ? (
            <ul className="mt-8 flex flex-wrap gap-4">
              {socials.map((link) => (
                <li key={link.platform}>
                  <a
                    href={link.url}
                    className="text-sm text-muted transition-colors duration-[var(--motion-micro)] hover:text-foreground"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          ) : null}
        </div>

        <div
          className="scene-slot relative flex items-end justify-center overflow-hidden rounded-[var(--radius-lg)] border border-border bg-surface"
          data-scene-slot="hero-workspace"
        >
          <div className="absolute inset-4 rounded-[calc(var(--radius-lg)-0.5rem)] border border-dashed border-border/80" />
          <div className="relative z-10 m-6 w-full max-w-sm rounded-[var(--radius-md)] border border-border bg-surface-secondary p-5">
            <div className="mb-4 flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-border" />
              <span className="h-2.5 w-2.5 rounded-full bg-border" />
              <span className="h-2.5 w-2.5 rounded-full bg-accent/70" />
              <span className="ml-2 font-mono text-xs text-muted">workspace.glb</span>
            </div>
            <p className="font-mono text-xs leading-relaxed text-muted">
              {"// 3D digital workspace reserved"}
              <br />
              monitor → projects
              <br />
              laptop → skills
              <br />
              phone → flutter
            </p>
            <div className="mt-4">
              <Badge>Scene pending</Badge>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
