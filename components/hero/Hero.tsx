import { ArrowDown, ArrowUpRight, Orbit } from "lucide-react";
import { siteConfig } from "@/data/site";
import { getActiveSocialLinks } from "@/data/social";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { AmbientBackground } from "@/components/ui/AmbientBackground";
import { HeroDescription } from "@/components/hero/HeroDescription";
import { TerminalBrailleImage } from "@/components/hero/TerminalBrailleImage";
import { HeroMotion } from "@/components/motion/HeroMotion";
import { InView } from "@/components/motion/InView";

const heroSignals = [
  { label: "Interface", value: "Next.js / React", detail: "Cinematic UI systems" },
  { label: "Backend", value: ".NET APIs", detail: "Secure business logic" },
  { label: "Motion", value: "WebGL / GSAP", detail: "Scroll-linked experiences" },
] as const;

export function Hero() {
  const socials = getActiveSocialLinks();

  return (
    <section
      id="hero"
      className="relative flex min-h-[calc(100svh-4rem)] flex-col overflow-hidden border-b border-white/10"
      data-scene="evolving-artifact"
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
      <div
        className="pointer-events-none absolute inset-x-[8%] top-24 h-px bg-gradient-to-r from-transparent via-cyan-200/25 to-transparent"
        aria-hidden="true"
      />

      <Container className="relative z-30 grid min-h-[calc(100svh-4rem)] flex-1 items-center gap-10 py-6 pb-14 sm:py-8 sm:pb-16 lg:grid-cols-[minmax(0,1.02fr)_minmax(0,0.98fr)] lg:py-10 lg:pb-14">
        <div className="relative z-20">
          <InView stagger="[data-hero-intro]" y={12}>
            <div
              data-hero-intro
              className="mb-6 inline-flex items-center gap-2 rounded-full border border-cyan-200/15 bg-cyan-300/[0.075] px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.24em] text-cyan-100/80 shadow-[0_0_32px_rgba(34,211,238,0.16)] backdrop-blur-md"
            >
              <Orbit size={13} aria-hidden="true" />
              Scroll-linked developer system
            </div>
          </InView>

          <HeroMotion role={siteConfig.role} name={siteConfig.displayName} />
          <div className="mt-1 max-w-2xl border-l border-cyan-300/25 bg-black/[0.08] pl-5 backdrop-blur-[1px]">
            <HeroDescription />
          </div>

          <InView className="mt-9 flex flex-wrap gap-3" stagger="a" y={10} delay={0.28}>
            <Button href="/projects" className="hero-cta-shine relative overflow-hidden shadow-[0_0_34px_rgba(34,211,238,0.18)]">
              Explore My Work
              <ArrowUpRight size={16} aria-hidden="true" />
            </Button>
            <Button
              href={siteConfig.resumeAvailable ? siteConfig.resumePath : "/#resume"}
              variant="secondary"
              className="border-white/10 bg-white/[0.065] backdrop-blur-md hover:bg-white/[0.1]"
            >
              View Resume
            </Button>
          </InView>

          <InView className="mt-9 grid max-w-2xl gap-3 sm:grid-cols-3" stagger="[data-signal]" y={10} delay={0.34}>
            {heroSignals.map((signal) => (
              <div
                key={signal.label}
                data-signal
                className="group relative overflow-hidden rounded-2xl border border-white/[0.09] bg-slate-950/38 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] backdrop-blur-xl"
              >
                <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-200/50 to-transparent opacity-60" />
                <div className="font-mono text-[9px] uppercase tracking-[0.22em] text-cyan-100/55">{signal.label}</div>
                <div className="mt-2 text-sm font-semibold text-white/90">{signal.value}</div>
                <div className="mt-1 text-xs leading-relaxed text-white/42">{signal.detail}</div>
              </div>
            ))}
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

        <InView className="relative z-20 lg:mt-24" y={18}>
          <TerminalBrailleImage />
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
