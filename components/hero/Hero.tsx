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
      <div className="pointer-events-none absolute inset-0 grid-fade opacity-55" aria-hidden="true" />
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-[34rem] bg-[radial-gradient(ellipse_at_top,rgba(34,211,238,0.12),transparent_66%)]"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute bottom-0 left-0 h-72 w-72 bg-[radial-gradient(circle,rgba(59,130,246,0.11),transparent_70%)] blur-3xl"
        aria-hidden="true"
      />

      <Container className="relative z-30 flex min-h-[calc(100svh-4rem)] items-stretch py-8 sm:py-10 lg:py-12">
        <HeroRealityInterface
          name={siteConfig.displayName}
          role={siteConfig.role}
          specialization={siteConfig.specialization}
          location={siteConfig.location}
          resumeHref={resumeHref}
          socials={socials}
        />
      </Container>
    </section>
  );
}
