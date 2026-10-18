import { Badge } from "@/components/ui/Badge";
import { Section } from "@/components/ui/Section";
import { education } from "@/data/education";
import { siteConfig } from "@/data/site";
import { InView } from "@/components/motion/InView";

const focusAreas = [
  {
    index: "01",
    label: "Development",
    title: "Full-Stack Web Development",
    body: "Building scalable, responsive applications with Next.js, React, TypeScript, and modern web technologies.",
  },
  {
    index: "02",
    label: "Engineering",
    title: "Software Engineering",
    body: "Developing reliable frontend and backend systems with maintainable code and current hands-on .NET experience.",
  },
  {
    index: "03",
    label: "Quality",
    title: "Software Testing",
    body: "Applying a quality-focused mindset to catch issues early, improve usability, and deliver dependable products.",
  },
] as const;

const profileRows = [
  { label: "Name", value: siteConfig.legalName },
  { label: "Role", value: siteConfig.role },
  { label: "Location", value: siteConfig.location },
  { label: "Current Role", value: ".NET Developer · Techcose Solutions" },
  { label: "Experience", value: siteConfig.experienceSummary },
  { label: "Focus", value: siteConfig.focusSummary },
  { label: "Languages", value: siteConfig.spokenLanguages.join(" · ") },
] as const;

export function AboutPreview({ headingLevel = "h2" }: { headingLevel?: "h1" | "h2" }) {
  return (
    <Section
      id="about"
      eyebrow="A LITTLE ABOUT ME"
      headingLevel={headingLevel}
      title={siteConfig.displayName ? `I’m ${siteConfig.displayName}.` : "I’m Huzaifa Khan."}
      titleMotion="words"
      description="I am a full-stack developer based in Karachi, Pakistan, with 1.5+ years of development experience across frontend and backend technologies. I specialize in Next.js, React, TypeScript, and modern web development, and I bring hands-on software testing experience into how I build reliable, user-focused products."
      className="relative min-h-[88svh] border-b border-white/10 bg-transparent"
    >
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_22%_42%,rgba(59,130,246,0.08),transparent_34%),radial-gradient(circle_at_78%_65%,rgba(34,211,238,0.07),transparent_32%)]"
        aria-hidden="true"
      />

      <InView
        className="relative grid gap-8 lg:grid-cols-[minmax(0,0.95fr)_minmax(8rem,0.28fr)_minmax(0,0.72fr)] lg:items-center"
        stagger="[data-about-panel]"
        y={20}
      >
        <div
          data-about-panel
          className="rounded-[1.75rem] border border-white/10 bg-black/30 p-6 shadow-[0_28px_90px_-50px_rgba(59,130,246,0.65),inset_0_1px_0_rgba(255,255,255,0.07)] backdrop-blur-xl md:p-8"
        >
          <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-cyan-200/65">
            Profile transmission
          </p>
          <p className="mt-5 max-w-2xl text-base leading-8 text-white/68">
            I enjoy working at the intersection of product thinking, clean implementation, and practical quality. My current work as a .NET Developer at Techcose Solutions complements previous Next.js and React experience at Hudasoft.
          </p>
          <p className="mt-4 max-w-2xl leading-8 text-white/55">
            I care about building software that is responsive, maintainable, and useful—then checking that it actually behaves the way people expect it to behave.
          </p>

          <div className="mt-7 border-t border-white/8 pt-5">
            <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-white/35">Education</p>
            <ul className="mt-3 space-y-2 text-sm text-white/55">
              {education.map((item) => (
                <li key={item.id} className="flex flex-wrap justify-between gap-x-5 gap-y-1">
                  <span>
                    {item.credential} — {item.institution}
                  </span>
                  <span className="font-mono text-xs text-cyan-100/45">
                    {item.startYear}
                    {item.endYear !== item.startYear ? `–${item.endYear}` : ""}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div
          data-about-panel
          className="relative hidden min-h-[26rem] items-center justify-center lg:flex"
          aria-hidden="true"
        >
          <div className="absolute inset-y-0 left-1/2 w-px bg-gradient-to-b from-transparent via-cyan-300/25 to-transparent" />
          <div className="relative grid h-24 w-24 place-items-center rounded-full border border-cyan-200/15 bg-cyan-300/[0.025] shadow-[0_0_70px_rgba(34,211,238,0.08)] backdrop-blur-sm">
            <div className="absolute inset-3 rounded-full border border-dashed border-cyan-200/20" />
            <span className="font-mono text-[8px] uppercase tracking-[0.2em] text-cyan-100/40">
              Waypoint
            </span>
          </div>
        </div>

        <aside
          data-about-panel
          className="relative overflow-hidden rounded-[1.75rem] border border-white/12 bg-white/[0.045] p-6 shadow-[0_30px_90px_-48px_rgba(34,211,238,0.5),inset_0_1px_0_rgba(255,255,255,0.09)] backdrop-blur-2xl md:p-7"
          data-scene-slot="avatar"
          aria-label="Developer identity card"
        >
          <div
            className="pointer-events-none absolute -right-16 -top-20 h-48 w-48 rounded-full bg-cyan-400/10 blur-3xl"
            aria-hidden="true"
          />
          <div className="relative flex items-center justify-between gap-4">
            <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-cyan-100/60">
              Profile
            </p>
            <span className="rounded-full border border-emerald-300/15 bg-emerald-300/[0.06] px-2.5 py-1 font-mono text-[8px] uppercase tracking-[0.16em] text-emerald-200/70">
              Available
            </span>
          </div>
          <div className="relative mt-6 flex h-24 items-center justify-center overflow-hidden rounded-2xl border border-white/8 bg-black/25 font-mono text-[9px] uppercase tracking-[0.24em] text-white/35">
            <div className="absolute inset-0 grid-fade opacity-50" aria-hidden="true" />
            <span className="relative">Build · Test · Improve</span>
          </div>
          <dl className="relative mt-6 space-y-4 text-sm">
            {profileRows.map((row, index) => (
              <div
                key={row.label}
                className={`flex justify-between gap-4 ${index < profileRows.length - 1 ? "border-b border-white/7 pb-3" : ""}`}
              >
                <dt className="text-white/40">{row.label}</dt>
                <dd className="text-right text-white/80">{row.value}</dd>
              </div>
            ))}
          </dl>
          <div className="relative mt-6 flex flex-wrap gap-2">
            <Badge className="border-white/10 bg-white/[0.055] text-white/55">Karachi-based</Badge>
            <Badge className="border-white/10 bg-white/[0.055] text-white/55">Quality-minded</Badge>
          </div>
        </aside>
      </InView>

      <InView className="relative mt-10 grid gap-4 sm:grid-cols-3" stagger="[data-focus-card]" y={18}>
        {focusAreas.map((item) => (
          <article
            key={item.title}
            data-focus-card
            className="group rounded-2xl border border-white/9 bg-white/[0.035] p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.055)] backdrop-blur-lg transition-[border-color,background-color,transform] duration-300 hover:-translate-y-1 hover:border-cyan-200/20 hover:bg-cyan-300/[0.045]"
          >
            <div className="flex items-center justify-between gap-4">
              <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-cyan-200/45">{item.label}</p>
              <span className="font-mono text-[9px] text-cyan-200/45">{item.index}</span>
            </div>
            <h3 className="mt-3 text-sm text-white/90">{item.title}</h3>
            <p className="mt-3 text-sm leading-6 text-white/48">{item.body}</p>
          </article>
        ))}
      </InView>

      <InView className="relative mt-10" y={10}>
        <p className="max-w-2xl text-base leading-7 text-white/62">
          I don’t just focus on how software looks. I care about how it works.
        </p>
      </InView>
    </Section>
  );
}
