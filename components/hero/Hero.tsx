import { ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { siteConfig } from "@/data/site";
import { getActiveSocialLinks } from "@/data/social";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { HeroWorkspace } from "@/components/three/HeroWorkspace";

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
          <p className="label reveal">{siteConfig.role}</p>
          <h1 className="display mt-5 reveal reveal-delay-1">
            {siteConfig.displayName}
          </h1>
          <p className="mt-5 max-w-xl text-lg leading-relaxed text-muted reveal reveal-delay-2">
            Full-stack developer in {siteConfig.location}, focused on{" "}
            {siteConfig.specialization}. Browse{" "}
            <Link href="/about" className="text-foreground underline-offset-4 hover:underline">
              about
            </Link>
            ,{" "}
            <Link href="/projects" className="text-foreground underline-offset-4 hover:underline">
              projects
            </Link>
            , or ask the{" "}
            <Link href="/#avatar" className="text-foreground underline-offset-4 hover:underline">
              portfolio assistant
            </Link>
            .
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
          className="scene-slot relative overflow-hidden rounded-[var(--radius-lg)] border border-border bg-surface"
          data-scene-slot="hero-workspace"
        >
          <HeroWorkspace />
        </div>
      </Container>
    </section>
  );
}
