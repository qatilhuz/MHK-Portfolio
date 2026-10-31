"use client";

import { useRef, type MouseEvent } from "react";
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

function ExperienceCard({
  item,
  index,
  total,
}: {
  item: Experience;
  index: number;
  total: number;
}) {
  const cardRef = useRef<HTMLElement>(null);
  const project = PROJECT_LINKS[item.id] ?? FALLBACK_PROJECT;
  const responsibilities = item.responsibilities.slice(0, 4);

  const handleMouseMove = (event: MouseEvent<HTMLElement>) => {
    const card = cardRef.current;
    if (!card) return;

    const rect = card.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    const rotateX = ((y - rect.height / 2) / (rect.height / 2)) * -4;
    const rotateY = ((x - rect.width / 2) / (rect.width / 2)) * 4;

    gsap.to(card, {
      rotateX,
      rotateY,
      transformPerspective: 1000,
      transformOrigin: "center center",
      duration: 0.4,
      ease: "power2.out",
      overwrite: "auto",
      force3D: true,
    });
  };

  const handleMouseLeave = () => {
    const card = cardRef.current;
    if (!card) return;

    gsap.to(card, {
      rotateX: 0,
      rotateY: 0,
      duration: 0.7,
      ease: "power3.out",
      overwrite: "auto",
      force3D: true,
    });
  };

  return (
    <article
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ transformStyle: "preserve-3d" }}
      className="group relative flex h-fit min-h-[62vh] max-h-[calc(100svh-4rem)] w-[85vw] flex-col overflow-hidden whitespace-normal text-wrap rounded-3xl border border-cyan-200/20 bg-black/50 p-5 shadow-[0_0_34px_rgba(34,211,238,0.12),0_0_100px_rgba(59,130,246,0.14)] backdrop-blur-xl will-change-transform [backface-visibility:hidden] [transform-style:preserve-3d] transition-[border-color,box-shadow] duration-[var(--motion-normal)] ease-out hover:border-cyan-200/45 hover:shadow-[0_0_44px_rgba(34,211,238,0.20),0_0_130px_rgba(59,130,246,0.22)] md:h-[70vh] md:w-[700px] md:p-8 lg:w-[72vw] lg:p-10 xl:w-[72rem]"
    >
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
        className="pointer-events-none absolute -right-2 -top-7 max-w-full select-none overflow-hidden text-[clamp(5rem,10vw,10rem)] font-semibold uppercase leading-none tracking-[-0.12em] text-white/[0.035] will-change-transform"
      >
        {String(index + 1).padStart(2, "0")}
      </p>

      <div className="relative min-w-0 [transform-style:preserve-3d]">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border/80 pb-5">
          <p className="label whitespace-normal text-wrap text-cyan-100/75">
            {item.startDate} — {item.endDate ?? "Present"}
          </p>
          <p className="font-mono text-[11px] uppercase tracking-[0.26em] text-muted">
            {String(index + 1).padStart(2, "0")} /{" "}
            {String(total).padStart(2, "0")}
          </p>
        </div>

        <div className="mt-6 grid gap-5 xl:grid-cols-[minmax(0,1fr)_13rem]">
          <div className="min-w-0">
            <p className="label whitespace-normal text-wrap">{item.location}</p>
            <h2 className="mt-3 max-w-full whitespace-normal text-wrap text-[clamp(1.75rem,3.7vw,3.9rem)] font-semibold uppercase leading-[0.94] tracking-[-0.055em] text-foreground">
              {item.role}
            </h2>
            <p className="mt-3 max-w-full whitespace-normal text-wrap bg-gradient-to-r from-cyan-100 to-accent bg-clip-text text-lg font-semibold uppercase tracking-[-0.03em] text-transparent md:text-2xl">
              {item.company}
            </p>
            <p className="mt-4 max-w-prose whitespace-normal text-wrap text-sm leading-relaxed text-muted md:text-base">
              {item.description}
            </p>
          </div>

          <div className="min-w-0 border-l border-border/80 pl-5 font-mono text-[10px] uppercase leading-6 tracking-[0.2em] text-muted">
            <p className="whitespace-normal text-wrap">INTERFACE / LOGIC</p>
            <p className="whitespace-normal text-wrap">API / DATA FLOW</p>
            <p className="whitespace-normal text-wrap">DELIVERY + QUALITY</p>
            <p className="mt-3 whitespace-normal text-wrap text-cyan-100/78">
              ACTIVE TIMELINE NODE
            </p>
          </div>
        </div>

        {responsibilities.length > 0 ? (
          <ul className="mt-5 grid gap-2 border-y border-border/80 py-4 text-[13px] leading-snug text-muted md:grid-cols-2">
            {responsibilities.map((line) => (
              <li
                key={line}
                className="flex min-w-0 gap-3 whitespace-normal text-wrap"
              >
                <span
                  className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-accent shadow-[0_0_12px_rgba(59,130,246,0.8)]"
                  aria-hidden="true"
                />
                <span className="min-w-0 whitespace-normal text-wrap">{line}</span>
              </li>
            ))}
          </ul>
        ) : null}

        {item.technologies.length > 0 ? (
          <ul className="mt-5 flex flex-wrap gap-2">
            {item.technologies.map((tech) => (
              <li key={tech} className="whitespace-normal text-wrap">
                <Badge>{tech}</Badge>
              </li>
            ))}
          </ul>
        ) : null}

        <div className="mt-auto flex flex-wrap items-center justify-between gap-5 pt-6">
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
          <p className="max-w-[18rem] whitespace-normal text-wrap font-mono text-[10px] uppercase tracking-[0.24em] text-muted">
            Featured case / {project.projectName}
          </p>
        </div>
      </div>
    </article>
  );
}

export function ExperiencePreview({
  headingLevel = "h2",
}: {
  headingLevel?: "h1" | "h2";
}) {
  const triggerRef = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const HeadingTag = headingLevel;

  useGSAP(
    () => {
      const trigger = triggerRef.current;
      const track = trackRef.current;

      if (!trigger || !track) return;

      gsap.registerPlugin(useGSAP, ScrollTrigger);

      const getScrollAmount = () => {
        const trackWidth = track.scrollWidth;
        return -(trackWidth - window.innerWidth + 100);
      };

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger,
          start: "top top",
          end: "bottom bottom",
          scrub: 1.5,
          invalidateOnRefresh: true,
        },
      });

      tl.to(track, {
        x: getScrollAmount,
        ease: "none",
        force3D: true,
      });

      tl.to(
        trigger.querySelectorAll<HTMLElement>("[data-depth-back]"),
        {
          xPercent: 8,
          yPercent: -3,
          ease: "none",
          force3D: true,
        },
        0,
      );

      tl.to(
        trigger.querySelectorAll<HTMLElement>("[data-depth-front]"),
        {
          xPercent: -10,
          yPercent: 3,
          ease: "none",
          force3D: true,
        },
        0,
      );

      const invalidateTimeline = () => tl.invalidate();
      ScrollTrigger.addEventListener("refresh", invalidateTimeline);

      return () => ScrollTrigger.removeEventListener("refresh", invalidateTimeline);
    },
    { scope: triggerRef },
  );

  return (
    <section
      id="experience"
      ref={triggerRef}
      className="relative w-full h-[400vh] bg-background"
      aria-label="Professional experience timeline"
    >
      <div className="sticky top-0 flex h-screen w-full items-center overflow-hidden">
        <div
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_75%_65%_at_18%_22%,rgba(59,130,246,0.14),rgba(9,9,11,0)_72%),radial-gradient(ellipse_70%_60%_at_82%_78%,rgba(34,211,238,0.10),rgba(9,9,11,0)_70%)]"
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.10] [background-image:linear-gradient(rgba(255,255,255,0.06)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.06)_1px,transparent_1px)] [background-size:96px_96px] [mask-image:radial-gradient(ellipse_70%_60%_at_50%_50%,rgba(0,0,0,0.9),rgba(0,0,0,0)_75%)] [-webkit-mask-image:radial-gradient(ellipse_70%_60%_at_50%_50%,rgba(0,0,0,0.9),rgba(0,0,0,0)_75%)]"
          aria-hidden="true"
        />

        <div
          ref={trackRef}
          className="relative z-10 flex h-full w-max items-center gap-10 px-[10vw] will-change-transform"
        >
          <section className="relative flex h-full w-[90vw] shrink-0 items-center overflow-hidden px-5 py-24 md:px-10 lg:px-16">
            <div
              className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(30,58,138,0.16),rgba(9,9,11,0)_68%)]"
              aria-hidden="true"
            />
            <div
              data-depth-back
              className="pointer-events-none absolute -left-[16vw] top-1/2 h-[64vw] w-[64vw] -translate-y-1/2 rounded-full bg-blue-500/20 opacity-30 blur-[140px] will-change-transform"
              aria-hidden="true"
            />
            <div
              className="pointer-events-none absolute right-[-18vw] top-[6%] h-[48vw] w-[48vw] rounded-full bg-cyan-400/15 opacity-30 blur-[150px]"
              aria-hidden="true"
            />
            <div
              className="pointer-events-none absolute bottom-[-14vw] left-[26%] h-[34vw] w-[52vw] rounded-full bg-indigo-500/12 opacity-25 blur-[160px]"
              aria-hidden="true"
            />

            <div className="relative grid max-w-6xl gap-12 lg:grid-cols-[minmax(0,1.15fr)_minmax(18rem,0.85fr)] lg:items-end">
              <div>
                <p className="label mb-5 flex items-center gap-3">
                  <span
                    className="h-px w-12 bg-accent shadow-[0_0_18px_rgba(59,130,246,0.75)]"
                    aria-hidden="true"
                  />
                  FRONTEND / NEXT.JS / PRODUCT ENGINEERING
                </p>
                <HeadingTag className="text-[clamp(3.8rem,11vw,10.5rem)] font-semibold uppercase leading-[0.82] tracking-[-0.075em] text-foreground">
                  Proven
                  <br />
                  Engineering
                  <br />
                  <span className="bg-gradient-to-r from-foreground via-cyan-100 to-accent bg-clip-text text-transparent drop-shadow-[0_0_28px_rgba(59,130,246,0.22)]">
                    Excellence.
                  </span>
                </HeadingTag>
                <p className="mt-8 max-w-2xl text-base leading-relaxed text-muted md:text-xl">
                  Frontend and Next.js developer crafting high-performance SaaS
                  platforms, e-commerce systems, API-driven interfaces, and
                  immersive React experiences with measurable engineering quality.
                </p>
                <div className="mt-10 flex flex-wrap gap-3 font-mono text-[11px] uppercase tracking-[0.24em] text-muted">
                  <span className="border border-border bg-surface-secondary/40 px-3 py-2 backdrop-blur-md">
                    React Systems
                  </span>
                  <span className="border border-border bg-surface-secondary/40 px-3 py-2 backdrop-blur-md">
                    API Platforms
                  </span>
                  <span className="border border-cyan-200/25 bg-cyan-400/10 px-3 py-2 text-cyan-100 backdrop-blur-md">
                    Performance UX
                  </span>
                </div>
              </div>

              <div className="relative overflow-hidden rounded-3xl border border-cyan-200/20 bg-black/40 p-6 shadow-[0_0_50px_rgba(59,130,246,0.14)] backdrop-blur-xl">
                <div
                  className="absolute inset-0 bg-[linear-gradient(135deg,rgba(59,130,246,0.12),transparent,rgba(34,211,238,0.10))]"
                  aria-hidden="true"
                />
                <div className="relative">
                  <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-cyan-100/75">
                    TIMELINE PROTOCOL
                  </p>
                  <p className="mt-5 text-4xl font-semibold uppercase leading-none tracking-[-0.06em] text-foreground md:text-5xl">
                    2 Roles
                  </p>
                  <div className="mt-7 space-y-3 font-mono text-[10px] uppercase tracking-[0.22em] text-muted">
                    <p>.NET / Enterprise Backend</p>
                    <p>Next.js / React Frontend</p>
                    <p>Responsive Product Delivery</p>
                  </div>
                  <div className="mt-7 h-px bg-gradient-to-r from-accent via-cyan-200/50 to-transparent" />
                </div>
              </div>
            </div>

            <p
              data-depth-front
              className="pointer-events-none absolute -right-6 bottom-8 select-none text-[clamp(7rem,22vw,24rem)] font-semibold uppercase leading-none tracking-[-0.12em] text-transparent opacity-60 [-webkit-text-stroke:1px_rgba(59,130,246,0.14)] will-change-transform"
            >
              PROVEN
            </p>
          </section>

          {experience.map((item, index) => (
            <section
              key={item.id}
              className="relative flex h-full w-[90vw] shrink-0 items-center justify-center overflow-hidden px-4 py-24 [perspective:1400px] md:px-6 lg:px-8"
              aria-label={`${item.role} at ${item.company}`}
            >
              <div
                data-depth-back
                className="absolute inset-x-[8%] top-1/2 h-[72%] -translate-y-1/2 rounded-full bg-gradient-to-r from-accent/12 via-cyan-400/7 to-transparent blur-3xl will-change-transform"
                aria-hidden="true"
              />
              <ExperienceCard item={item} index={index} total={experience.length} />
            </section>
          ))}

          <div className="w-[10vw] shrink-0 md:w-[20vw]" aria-hidden="true" />
        </div>

        <div
          className="pointer-events-none absolute inset-x-10 bottom-6 z-20 flex items-center gap-3 font-mono text-[10px] uppercase tracking-[0.28em] text-muted"
          aria-hidden="true"
        >
          <span className="h-px flex-1 bg-gradient-to-r from-accent/70 via-border to-transparent" />
          Scroll down to move laterally
        </div>
      </div>
    </section>
  );
}
