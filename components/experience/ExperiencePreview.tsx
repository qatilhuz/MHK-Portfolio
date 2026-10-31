"use client";

import { useRef } from "react";
import Link from "next/link";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Badge } from "@/components/ui/Badge";
import { experience } from "@/data/experience";
import type { Experience } from "@/types";

const PROJECT_LINKS: Record<
  Experience["id"],
  { href: string; projectName: string }
> = {
  techcose: {
    href: "/projects/laptop-ecommerce-mobile-app",
    projectName: "Laptop E-Commerce App",
  },
  hudasoft: {
    href: "/projects/ecommerce-web-application",
    projectName: "E-Commerce Platform",
  },
};

const FALLBACK_PROJECT = {
  href: "/projects",
  projectName: "Selected Work",
} as const;

export function ExperiencePreview({
  headingLevel = "h2",
}: {
  headingLevel?: "h1" | "h2";
}) {
  const sectionRef = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const HeadingTag = headingLevel;
  const panelCount = experience.length + 1;

  useGSAP(
    () => {
      const section = sectionRef.current;
      const track = trackRef.current;

      if (!section || !track) return;

      gsap.registerPlugin(useGSAP, ScrollTrigger);

      const getTravelDistance = () =>
        Math.max(track.scrollWidth - window.innerWidth, 0);

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          pin: true,
          pinSpacing: true,
          start: "top top",
          end: () => `+=${getTravelDistance()}`,
          scrub: 1.5,
          anticipatePin: 1,
          invalidateOnRefresh: true,
        },
      });

      tl.to(track, {
        x: () => -getTravelDistance(),
        ease: "none",
        force3D: true,
      });

      tl.to(
        section.querySelectorAll<HTMLElement>("[data-depth-back]"),
        {
          xPercent: 8,
          yPercent: -3,
          ease: "none",
          force3D: true,
        },
        0,
      );

      tl.to(
        section.querySelectorAll<HTMLElement>("[data-depth-front]"),
        {
          xPercent: -10,
          yPercent: 3,
          ease: "none",
          force3D: true,
        },
        0,
      );
    },
    { scope: sectionRef },
  );

  return (
    <section
      id="experience"
      ref={sectionRef}
      className="relative h-screen w-full overflow-hidden bg-background"
      aria-label="Professional experience timeline"
    >
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_18%,rgba(59,130,246,0.20),transparent_34%),radial-gradient(circle_at_80%_82%,rgba(34,211,238,0.15),transparent_34%),linear-gradient(180deg,rgba(9,9,11,0)_0%,rgba(9,9,11,0.76)_100%)]"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.16] [background-image:linear-gradient(rgba(255,255,255,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.08)_1px,transparent_1px)] [background-size:72px_72px]"
        aria-hidden="true"
      />

      <div
        ref={trackRef}
        style={{ width: `${panelCount * 100}vw` }}
        className="relative z-10 flex h-full will-change-transform"
      >
        <section className="relative flex h-full w-screen shrink-0 items-center overflow-hidden px-5 py-24 md:px-10 lg:px-16">
          <div
            data-depth-back
            className="absolute -left-[10vw] top-1/2 h-[54vw] w-[54vw] -translate-y-1/2 rounded-full bg-accent/10 blur-3xl will-change-transform"
            aria-hidden="true"
          />
          <div className="relative max-w-6xl">
            <p className="label mb-5 flex items-center gap-3">
              <span
                className="h-px w-12 bg-accent shadow-[0_0_18px_rgba(59,130,246,0.75)]"
                aria-hidden="true"
              />
              WHERE I’VE WORKED
            </p>
            <HeadingTag className="text-[clamp(3.6rem,13vw,13rem)] font-semibold uppercase leading-[0.82] tracking-[-0.075em] text-foreground">
              Experience
              <span className="block bg-gradient-to-r from-foreground via-cyan-100 to-accent bg-clip-text text-transparent">
                In Practice
              </span>
            </HeadingTag>
            <p className="mt-8 max-w-2xl text-base leading-relaxed text-muted md:text-xl">
              A focused timeline of production systems, responsive interfaces,
              API integration, and maintainable software delivery.
            </p>
            <div className="mt-10 flex flex-wrap gap-3 font-mono text-[11px] uppercase tracking-[0.24em] text-muted">
              <span className="border border-border bg-surface-secondary/40 px-3 py-2 backdrop-blur-md">
                PIN / CASCADE
              </span>
              <span className="border border-border bg-surface-secondary/40 px-3 py-2 backdrop-blur-md">
                HORIZONTAL SCROLL
              </span>
            </div>
          </div>
          <p
            data-depth-front
            className="pointer-events-none absolute -right-6 bottom-8 select-none text-[clamp(7rem,22vw,24rem)] font-semibold uppercase leading-none tracking-[-0.12em] text-white/[0.025] will-change-transform"
          >
            01
          </p>
        </section>

        {experience.map((item, index) => {
          const project = PROJECT_LINKS[item.id] ?? FALLBACK_PROJECT;
          const responsibilities = item.responsibilities.slice(0, 4);

          return (
            <section
              key={item.id}
              className="relative flex h-full w-screen shrink-0 items-center justify-center overflow-hidden px-5 py-24 [perspective:1400px] md:px-10 lg:px-16"
              aria-label={`${item.role} at ${item.company}`}
            >
              <div
                data-depth-back
                className="absolute inset-x-[8%] top-1/2 h-[72%] -translate-y-1/2 rounded-full bg-gradient-to-r from-accent/12 via-cyan-400/7 to-transparent blur-3xl will-change-transform"
                aria-hidden="true"
              />

              <article className="group relative max-h-[calc(100svh-6rem)] w-full max-w-5xl overflow-y-auto rounded-[1.75rem] border border-cyan-200/20 bg-black/50 p-6 shadow-[0_0_34px_rgba(34,211,238,0.12),0_0_100px_rgba(59,130,246,0.14)] backdrop-blur-xl [transform-style:preserve-3d] transition-[border-color,box-shadow,transform] duration-[var(--motion-normal)] ease-out will-change-transform hover:-translate-y-2 hover:border-cyan-200/45 hover:shadow-[0_0_44px_rgba(34,211,238,0.20),0_0_130px_rgba(59,130,246,0.22)] hover:[transform:rotateX(4deg)_rotateY(-5deg)_translateZ(28px)] md:p-10 lg:p-12">
                <div
                  className="pointer-events-none absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.12),transparent_28%,transparent_70%,rgba(59,130,246,0.10))]"
                  aria-hidden="true"
                />
                <div
                  className="pointer-events-none absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-cyan-200/70 to-transparent"
                  aria-hidden="true"
                />

                <p
                  data-depth-front
                  className="pointer-events-none absolute -right-4 -top-8 select-none text-[clamp(7rem,15vw,15rem)] font-semibold uppercase leading-none tracking-[-0.12em] text-white/[0.035] will-change-transform"
                >
                  {String(index + 1).padStart(2, "0")}
                </p>

                <div className="relative [transform-style:preserve-3d]">
                  <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border/80 pb-6">
                    <p className="label text-cyan-100/75">
                      {item.startDate} — {item.endDate ?? "Present"}
                    </p>
                    <p className="font-mono text-[11px] uppercase tracking-[0.26em] text-muted">
                      {String(index + 1).padStart(2, "0")} /{" "}
                      {String(experience.length).padStart(2, "0")}
                    </p>
                  </div>

                  <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1fr)_15rem]">
                    <div>
                      <p className="label">{item.location}</p>
                      <h2 className="mt-4 text-[clamp(2.1rem,5vw,5.5rem)] font-semibold uppercase leading-[0.9] tracking-[-0.06em] text-foreground">
                        {item.role}
                      </h2>
                      <p className="mt-3 bg-gradient-to-r from-cyan-100 to-accent bg-clip-text text-xl font-semibold uppercase tracking-[-0.03em] text-transparent md:text-3xl">
                        {item.company}
                      </p>
                      <p className="mt-7 max-w-2xl text-sm leading-relaxed text-muted md:text-base">
                        {item.description}
                      </p>
                    </div>

                    <div className="border-l border-border/80 pl-5 font-mono text-[11px] uppercase leading-7 tracking-[0.2em] text-muted">
                      <p>INTERFACE / LOGIC</p>
                      <p>API / DATA FLOW</p>
                      <p>DELIVERY + QUALITY</p>
                      <p className="mt-4 text-cyan-100/78">
                        ACTIVE TIMELINE NODE
                      </p>
                    </div>
                  </div>

                  {responsibilities.length > 0 ? (
                    <ul className="mt-8 grid gap-3 border-y border-border/80 py-6 text-sm leading-relaxed text-muted md:grid-cols-2">
                      {responsibilities.map((line) => (
                        <li key={line} className="flex gap-3">
                          <span
                            className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-accent shadow-[0_0_12px_rgba(59,130,246,0.8)]"
                            aria-hidden="true"
                          />
                          {line}
                        </li>
                      ))}
                    </ul>
                  ) : null}

                  {item.technologies.length > 0 ? (
                    <ul className="mt-7 flex flex-wrap gap-2">
                      {item.technologies.map((tech) => (
                        <li key={tech}>
                          <Badge>{tech}</Badge>
                        </li>
                      ))}
                    </ul>
                  ) : null}

                  <div className="mt-10 flex flex-wrap items-center justify-between gap-6">
                    <Link
                      href={project.href}
                      className="group/button relative inline-flex min-h-12 items-center gap-4 overflow-hidden border border-cyan-200/35 bg-accent/8 px-5 py-3 font-mono text-[11px] font-semibold uppercase tracking-[0.24em] text-cyan-100 transition-[background-color,border-color,color,box-shadow,transform] duration-[var(--motion-micro)] ease-out [clip-path:polygon(0_0,calc(100%-0.85rem)_0,100%_50%,calc(100%-0.85rem)_100%,0_100%)] hover:-translate-y-0.5 hover:border-cyan-100 hover:bg-accent hover:text-accent-foreground hover:shadow-[0_0_28px_rgba(59,130,246,0.50)]"
                      aria-label={`View the ${project.projectName} project`}
                    >
                      <span>View Project</span>
                      <span
                        className="text-base leading-none transition-transform duration-[var(--motion-micro)] group-hover/button:-translate-y-0.5 group-hover/button:translate-x-0.5"
                        aria-hidden="true"
                      >
                        ↗
                      </span>
                      <span
                        className="absolute inset-y-0 left-0 w-16 -translate-x-full bg-gradient-to-r from-transparent via-white/22 to-transparent transition-transform duration-[var(--motion-normal)] ease-out group-hover/button:translate-x-[500%]"
                        aria-hidden="true"
                      />
                    </Link>
                    <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-muted">
                      Featured case / {project.projectName}
                    </p>
                  </div>
                </div>
              </article>
            </section>
          );
        })}
      </div>

      <div
        className="pointer-events-none absolute inset-x-10 bottom-6 z-20 flex items-center gap-3 font-mono text-[10px] uppercase tracking-[0.28em] text-muted"
        aria-hidden="true"
      >
        <span className="h-px flex-1 bg-gradient-to-r from-accent/70 via-border to-transparent" />
        Scroll down to move laterally
      </div>
    </section>
  );
}
