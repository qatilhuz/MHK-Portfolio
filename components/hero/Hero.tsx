import { ArrowDown } from "lucide-react";
import { siteConfig } from "@/data/site";
import { getActiveSocialLinks } from "@/data/social";
import { Container } from "@/components/ui/Container";
import { AmbientBackground } from "@/components/ui/AmbientBackground";
import { HeroRealityInterface } from "@/components/hero/HeroRealityInterface";

export function Hero() {
  const socials = getActiveSocialLinks();
  const resumeHref = siteConfig.resumeAvailable ? siteConfig.resumePath : "/#resume";

  return (
    <section
      id="hero"
      className="relative min-h-[calc(100svh-4rem)] overflow-hidden border-b border-white/10"
      data-scene="evolving-artifact"
      data-journey-section="origin"
    >
      <AmbientBackground variant="hero" />
      <div className="pointer-events-none absolute inset-0 grid-fade opacity-65" aria-hidden="true" />
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-[34rem] bg-[radial-gradient(ellipse_at_top,rgba(34,211,238,0.16),transparent_66%)]"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute inset-x-[8%] top-24 h-px bg-gradient-to-r from-transparent via-cyan-200/25 to-transparent"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute bottom-0 left-0 h-72 w-72 bg-[radial-gradient(circle,rgba(59,130,246,0.13),transparent_70%)] blur-3xl"
        aria-hidden="true"
      />

      <Container className="relative z-30 flex min-h-[calc(100svh-4rem)] items-center py-20 lg:py-24">
        <HeroRealityInterface
          name={siteConfig.displayName}
          role={siteConfig.role}
          specialization={siteConfig.specialization}
          location={siteConfig.location}
          resumeHref={resumeHref}
          socials={socials}
        />

        <div className="pointer-events-none absolute bottom-6 left-[var(--page-gutter)] hidden items-center gap-3 font-mono text-[9px] uppercase tracking-[0.24em] text-white/35 md:flex">
          <span className="grid h-7 w-7 place-items-center rounded-full border border-white/10 bg-white/[0.035]">
            <ArrowDown size={12} aria-hidden="true" />
          </span>
          Scroll the centered artifact
        </div>
        <div className="pointer-events-none absolute right-[var(--page-gutter)] top-8 font-mono text-[9px] uppercase tracking-[0.24em] text-white/30">
          01 / Origin
        </div>
      </Container>
    </section>
  );
}
