import { ArrowDown, ArrowUpRight, Cpu, Gauge, Layers3, Orbit, ShieldCheck, Sparkles } from "lucide-react";
import { siteConfig } from "@/data/site";
import { getActiveSocialLinks } from "@/data/social";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { AmbientBackground } from "@/components/ui/AmbientBackground";
import { HeroDescription } from "@/components/hero/HeroDescription";
import { HeroMotion } from "@/components/motion/HeroMotion";
import { InView } from "@/components/motion/InView";

const heroSignals = [
  { label: "Interface", value: "Next.js / React", detail: "Cinematic UI systems" },
  { label: "Backend", value: ".NET APIs", detail: "Secure business logic" },
  { label: "Motion", value: "WebGL / GSAP", detail: "Scroll-linked experiences" },
] as const;

const telemetry = ["SSR ready", "Binary rain", "Artifact synced", "Bot online"] as const;
const sequence = ["Origin", "Identity", "Capabilities"] as const;

export function Hero() {
  const socials = getActiveSocialLinks();

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

      <Container className="relative z-30 grid min-h-[calc(100svh-4rem)] items-center gap-12 py-20 lg:grid-cols-[minmax(0,1.02fr)_minmax(0,0.98fr)] lg:py-24">
        <div className="relative z-20">
          <div
            className="pointer-events-none absolute -left-5 top-20 -z-10 font-mono text-[clamp(4rem,14vw,12rem)] font-black uppercase leading-none tracking-[-0.09em] text-white/[0.025]"
            aria-hidden="true"
          >
            DEV
          </div>
          <div
            className="pointer-events-none absolute -left-2 top-36 -z-10 font-mono text-[clamp(2.8rem,8vw,7rem)] font-black uppercase leading-none tracking-[0.18em] text-cyan-200/[0.035]"
            aria-hidden="true"
          >
            SYSTEM
          </div>

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
            <Button href="/projects" className="shadow-[0_0_34px_rgba(34,211,238,0.18)]">
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

        <InView className="relative z-20" y={18}>
          <div
            data-in
            className="relative min-h-[430px] overflow-hidden rounded-[2rem] border border-cyan-200/12 bg-[linear-gradient(135deg,rgba(8,145,178,0.14),rgba(15,23,42,0.34)_44%,rgba(2,6,23,0.72))] p-4 shadow-[0_32px_130px_-58px_rgba(34,211,238,0.7),inset_0_1px_0_rgba(255,255,255,0.08)] backdrop-blur-xl lg:min-h-[560px] lg:p-6"
            data-scene-slot="premium-hero-command-deck"
          >
            <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(103,232,249,0.045)_1px,transparent_1px),linear-gradient(90deg,rgba(103,232,249,0.04)_1px,transparent_1px)] bg-[size:38px_38px] [mask-image:linear-gradient(to_bottom,black,transparent_92%)]" />
            <div className="pointer-events-none absolute -right-20 -top-24 h-72 w-72 bg-[radial-gradient(circle,rgba(34,211,238,0.18),transparent_68%)] blur-2xl" />
            <div className="pointer-events-none absolute -bottom-28 left-4 h-80 w-80 bg-[radial-gradient(circle,rgba(139,92,246,0.14),transparent_70%)] blur-3xl" />
            <span className="pointer-events-none absolute left-5 top-5 h-10 w-10 border-l border-t border-cyan-200/30" />
            <span className="pointer-events-none absolute right-5 top-5 h-10 w-10 border-r border-t border-cyan-200/30" />
            <span className="pointer-events-none absolute bottom-5 left-5 h-10 w-10 border-b border-l border-cyan-200/30" />
            <span className="pointer-events-none absolute bottom-5 right-5 h-10 w-10 border-b border-r border-cyan-200/30" />

            <div className="relative flex items-start justify-between gap-4">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/45 px-3 py-1.5 font-mono text-[8px] uppercase tracking-[0.22em] text-cyan-100/72 backdrop-blur-xl">
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-cyan-300 shadow-[0_0_12px_rgba(34,211,238,0.9)]" />
                  Artifact online
                </div>
                <h2 className="mt-5 max-w-sm font-mono text-4xl font-black uppercase leading-[0.86] tracking-[-0.08em] text-white/90 sm:text-5xl lg:text-6xl">
                  Build
                  <span className="block bg-gradient-to-r from-cyan-200 via-white to-blue-300 bg-clip-text text-transparent">
                    Control
                  </span>
                </h2>
              </div>
              <div className="rounded-2xl border border-cyan-200/12 bg-black/40 px-3 py-3 text-right font-mono text-[9px] uppercase tracking-[0.2em] text-white/38 backdrop-blur-xl">
                <div className="text-cyan-100/72">State 01</div>
                <div className="mt-1">Sealed core</div>
              </div>
            </div>

            <div className="relative mt-8 grid gap-4 sm:grid-cols-[1.1fr_0.9fr]">
              <div className="rounded-[1.5rem] border border-white/[0.08] bg-black/35 p-4 backdrop-blur-xl">
                <div className="flex items-center justify-between gap-3 border-b border-white/[0.08] pb-3">
                  <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.22em] text-cyan-100/70">
                    <Sparkles size={14} aria-hidden="true" />
                    Premium interface lab
                  </div>
                  <div className="text-[10px] text-white/35">v3.0</div>
                </div>
                <div className="mt-5 space-y-4">
                  {[
                    ["Design fidelity", "96%", "w-[96%]"],
                    ["Performance budget", "60 FPS", "w-[86%]"],
                    ["Interaction polish", "AAA", "w-[92%]"],
                  ].map(([label, value, width]) => (
                    <div key={label}>
                      <div className="mb-2 flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.18em] text-white/48">
                        <span>{label}</span>
                        <span className="text-cyan-100/72">{value}</span>
                      </div>
                      <div className="h-1.5 overflow-hidden rounded-full bg-white/[0.06]">
                        <div className={`${width} h-full rounded-full bg-gradient-to-r from-cyan-300 via-blue-400 to-violet-400 shadow-[0_0_18px_rgba(34,211,238,0.45)]`} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid gap-4">
                <div className="rounded-[1.4rem] border border-white/[0.08] bg-white/[0.045] p-4 backdrop-blur-xl">
                  <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.2em] text-cyan-100/65">
                    <Cpu size={14} aria-hidden="true" />
                    Stack matrix
                  </div>
                  <div className="mt-4 grid grid-cols-2 gap-2 text-xs text-white/58">
                    {telemetry.map((item) => (
                      <div key={item} className="rounded-xl border border-white/[0.07] bg-black/26 px-3 py-2">
                        {item}
                      </div>
                    ))}
                  </div>
                </div>
                <div className="rounded-[1.4rem] border border-cyan-200/10 bg-cyan-300/[0.045] p-4 backdrop-blur-xl">
                  <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.2em] text-cyan-100/68">
                    <ShieldCheck size={14} aria-hidden="true" />
                    Production profile
                  </div>
                  <div className="mt-3 text-sm leading-relaxed text-white/55">
                    Clean architecture, responsive motion, and resilient forms preserved behind the cinematic layer.
                  </div>
                </div>
              </div>
            </div>

            <div className="relative mt-5 grid gap-4 md:grid-cols-3">
              {sequence.map((item, index) => (
                <div
                  key={item}
                  className="relative overflow-hidden rounded-2xl border border-white/[0.08] bg-black/30 p-4 backdrop-blur-xl"
                >
                  <div className="flex items-center justify-between font-mono text-[9px] uppercase tracking-[0.2em] text-white/36">
                    <span>0{index + 1}</span>
                    <Layers3 size={13} aria-hidden="true" />
                  </div>
                  <div className="mt-5 text-lg font-semibold text-white/86">{item}</div>
                  <div className="mt-2 h-px bg-gradient-to-r from-cyan-300/55 to-transparent" />
                </div>
              ))}
            </div>

            <div className="relative mt-5 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/[0.08] bg-black/30 px-4 py-3 font-mono text-[9px] uppercase tracking-[0.2em] text-white/42 backdrop-blur-xl">
              <span className="inline-flex items-center gap-2 text-cyan-100/65">
                <Gauge size={14} aria-hidden="true" />
                Background artifact anchored behind foreground UI
              </span>
              <span>Scroll to evolve</span>
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
