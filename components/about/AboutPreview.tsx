import Link from "next/link";
import { Badge } from "@/components/ui/Badge";
import { Section } from "@/components/ui/Section";
import { education } from "@/data/education";
import { siteConfig } from "@/data/site";
import { InView } from "@/components/motion/InView";

const focusAreas = [
  {
    index: "A1",
    title: "Frontend",
    body: "Next.js, React, Angular, HTML, CSS, JavaScript, TypeScript, and GSAP.",
  },
  {
    index: "A2",
    title: "Full stack",
    body: ".NET and C# at Techcose Solutions; PHP and Flutter on selected projects.",
  },
  {
    index: "A3",
    title: "Delivery",
    body: "Responsive UI, API integration, cross-browser work, and team collaboration.",
  },
];

export function AboutPreview({ headingLevel = "h2" }: { headingLevel?: "h1" | "h2" }) {
  return (
    <Section
      id="about"
      eyebrow="About"
      headingLevel={headingLevel}
      title={`I’m ${siteConfig.displayName}.`}
      titleMotion="words"
      description={`${siteConfig.role} in ${siteConfig.location}, specializing in ${siteConfig.specialization}.`}
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
            {siteConfig.legalName} builds web and mobile software across frontend and backend.
            Current work is .NET development; previous work was Next.js and React.
          </p>
          <p className="mt-4 max-w-2xl leading-8 text-white/55">
            Languages spoken: {siteConfig.spokenLanguages.join(" and ")}. Explore the{" "}
            <Link
              href="/experience"
              className="text-cyan-100 underline decoration-cyan-300/30 underline-offset-4 transition-colors hover:text-white"
            >
              experience
            </Link>
            ,{" "}
            <Link
              href="/projects"
              className="text-cyan-100 underline decoration-cyan-300/30 underline-offset-4 transition-colors hover:text-white"
            >
              projects
            </Link>
            , and the{" "}
            <Link
              href="/#avatar"
              className="text-cyan-100 underline decoration-cyan-300/30 underline-offset-4 transition-colors hover:text-white"
            >
              assistant
            </Link>
            .
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
              Digital ID
            </p>
            <span className="rounded-full border border-emerald-300/15 bg-emerald-300/[0.06] px-2.5 py-1 font-mono text-[8px] uppercase tracking-[0.16em] text-emerald-200/70">
              Verified
            </span>
          </div>
          <div className="relative mt-6 flex h-32 items-center justify-center overflow-hidden rounded-2xl border border-white/8 bg-black/25 font-mono text-[9px] uppercase tracking-[0.24em] text-white/35">
            <div className="absolute inset-0 grid-fade opacity-50" aria-hidden="true" />
            <span className="relative">Identity encrypted</span>
          </div>
          <dl className="relative mt-6 space-y-4 text-sm">
            <div className="flex justify-between gap-4 border-b border-white/7 pb-3">
              <dt className="text-white/40">Name</dt>
              <dd className="text-right text-white/80">{siteConfig.legalName}</dd>
            </div>
            <div className="flex justify-between gap-4 border-b border-white/7 pb-3">
              <dt className="text-white/40">Role</dt>
              <dd className="text-right text-white/80">{siteConfig.role}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-white/40">Location</dt>
              <dd className="text-right text-white/80">{siteConfig.location}</dd>
            </div>
          </dl>
          <div className="relative mt-6 flex flex-wrap gap-2">
            <Badge className="border-white/10 bg-white/[0.055] text-white/55">CV-backed</Badge>
            <Badge className="border-white/10 bg-white/[0.055] text-white/55">Human-built</Badge>
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
              <h3 className="text-sm text-white/90">{item.title}</h3>
              <span className="font-mono text-[9px] text-cyan-200/45">{item.index}</span>
            </div>
            <p className="mt-3 text-sm leading-6 text-white/48">{item.body}</p>
          </article>
        ))}
      </InView>
    </Section>
  );
}
