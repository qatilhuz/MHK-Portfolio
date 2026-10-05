import { ArrowDown, ArrowUpRight, Orbit } from "lucide-react";
import { siteConfig } from "@/data/site";
import { getActiveSocialLinks } from "@/data/social";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { AmbientBackground } from "@/components/ui/AmbientBackground";
import { HeroWorkspace } from "@/components/three/HeroWorkspace";
import { HeroDescription } from "@/components/hero/HeroDescription";
import { HeroMotion } from "@/components/motion/HeroMotion";
import { InView } from "@/components/motion/InView";

export function Hero() {
  const socials = getActiveSocialLinks();

  return (
    <section
      id="hero"
      className="relative min-h-[calc(100svh-4rem)] overflow-hidden border-b border-white/10"
      data-scene="workspace"
      data-journey-section="origin"
    >
      <AmbientBackground variant="hero" />
      <div className="pointer-events-none absolute inset-0 grid-fade opacity-65" aria-hidden="true" />
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-[28rem] bg-[radial-gradient(ellipse_at_top,rgba(34,211,238,0.12),transparent_64%)]"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute left-1/2 top-0 hidden h-full w-px bg-gradient-to-b from-cyan-300/0 via-cyan-300/15 to-cyan-300/0 lg:block"
        aria-hidden="true"
      />

      <Container className="relative grid min-h-[calc(100svh-4rem)] items-center gap-12 py-20 lg:grid-cols-[minmax(0,1.02fr)_minmax(0,0.98fr)] lg:py-24">
        <div className="relative z-10">
          <InView stagger="[data-hero-intro]" y={12}>
            <div
              data-hero-intro
              className="mb-6 inline-flex items-center gap-2 rounded-full border border-cyan-200/15 bg-cyan-300/[0.055] px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.24em] text-cyan-100/75 backdrop-blur-md"
            >
              <Orbit size={13} aria-hidden="true" />
              Scroll-linked developer system
            </div>
          </InView>

          <HeroMotion role={siteConfig.role} name={siteConfig.displayName} />
          <div className="mt-1 max-w-2xl border-l border-cyan-300/20 pl-5">
            <HeroDescription />
          </div>

          <InView className="mt-9 flex flex-wrap gap-3" stagger="a" y={10} delay={0.28}>
            <Button href="/projects">
              Explore My Work
              <ArrowUpRight size={16} aria-hidden="true" />
            </Button>
            <Button
              href={siteConfig.resumeAvailable ? siteConfig.resumePath : "/#resume"}
              variant="secondary"
              className="border-white/10 bg-white/[0.055] backdrop-blur-md hover:bg-white/[0.09]"
            >
              View Resume
            </Button>
          </InView>

          {socials.length > 0 ? (
            <InView className="mt-9" stagger="li" y={8}>
              <ul className="flex flex-wrap gap-x-5 gap-y-2">
                {socials.map((link) => (
                  <li key={link.platform}>
                    <a
                      href={link.url}
                      className="font-mono text-xs uppercase tracking-[0.12em] text-white/45 transition-colors duration-[var(--motion-micro)] hover:text-cyan-100"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </InView>
          ) : null}
        </div>

        <InView className="relative" y={18}>
          <div data-in className="relative">
            <div
              className="pointer-events-none absolute -inset-8 rounded-[2rem] bg-[radial-gradient(circle,rgba(34,211,238,0.11),transparent_68%)] blur-2xl"
              aria-hidden="true"
            />
            <div className="pointer-events-none absolute -top-3 left-6 z-20 flex items-center gap-2 rounded-full border border-white/10 bg-black/70 px-3 py-1 font-mono text-[9px] uppercase tracking-[0.22em] text-cyan-100/70 backdrop-blur-xl">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-cyan-300 shadow-[0_0_12px_rgba(34,211,238,0.9)]" />
              Live workspace
            </div>
            <div
              className="scene-slot relative overflow-hidden rounded-[1.75rem] border border-white/12 bg-black/35 shadow-[0_30px_100px_-48px_rgba(34,211,238,0.72),inset_0_1px_0_rgba(255,255,255,0.08)] backdrop-blur-xl"
              data-scene-slot="hero-workspace"
            >
              <HeroWorkspace />
            </div>
          </div>
        </InView>

        <div className="pointer-events-none absolute bottom-6 left-[var(--page-gutter)] hidden items-center gap-3 font-mono text-[9px] uppercase tracking-[0.24em] text-white/35 md:flex">
          <span className="grid h-7 w-7 place-items-center rounded-full border border-white/10 bg-white/[0.035]">
            <ArrowDown size={12} aria-hidden="true" />
          </span>
          Trace the data core
        </div>
        <div className="pointer-events-none absolute right-[var(--page-gutter)] top-8 font-mono text-[9px] uppercase tracking-[0.24em] text-white/30">
          01 / Origin
        </div>
      </Container>
    </section>
  );
}
