"use client";

import Link from "next/link";
import { cinemaDisplayHost, cinemaLiveUrl } from "@/lib/cinema";
import { cn } from "@/lib/utils";
import type { CinemaProject } from "@/types";
import { CinemaMedia } from "./CinemaMedia";

interface ProjectCardProps {
  project: CinemaProject;
  index: number;
  total: number;
  /** This card currently owns the stage. */
  active: boolean;
  /** Media may mount (the reel has reached this card at least once). */
  load: boolean;
}

/**
 * One frame of the reel.
 *
 * The outer slot is a full-stage overlay so every card shares the same centre;
 * GSAP transforms the inner <article> along Z. The slot stays pointer-inert
 * and only the active card re-enables pointer events, so a buried card can
 * never intercept a click meant for the one on screen.
 */
export function ProjectCard({
  project,
  index,
  total,
  active,
  load,
}: ProjectCardProps) {
  const liveUrl = cinemaLiveUrl(project);
  const host = cinemaDisplayHost(project);
  const counter = `${String(index + 1).padStart(2, "0")} / ${String(total).padStart(2, "0")}`;

  return (
    <div
      data-reel-slot
      className="pointer-events-none absolute inset-0 flex items-center justify-center px-4 py-16 md:px-8"
    >
      <article
        data-reel-card
        aria-hidden={active ? undefined : "true"}
        className={cn(
          "relative flex aspect-[16/11] w-full max-w-[min(92vw,76rem)] flex-col overflow-hidden rounded-[1.75rem] border border-cyan-200/20 bg-[#0a0a0e]",
          "shadow-[0_0_40px_rgba(34,211,238,0.10),0_0_140px_rgba(59,130,246,0.16),inset_0_1px_0_rgba(255,255,255,0.06)]",
          "[backface-visibility:hidden] [transform-style:preserve-3d] sm:aspect-[16/10] lg:aspect-[16/9]",
          active ? "pointer-events-auto" : "pointer-events-none",
        )}
      >
        {/* ---------- media ---------- */}
        <CinemaMedia project={project} load={load} active={active} />

        {/* ---------- cinematic scrim ---------- */}
        <div
          className="pointer-events-none absolute inset-0 z-30 bg-[linear-gradient(to_top,rgba(5,5,8,0.97)_0%,rgba(5,5,8,0.88)_26%,rgba(5,5,8,0.30)_52%,rgba(5,5,8,0.12)_70%,rgba(5,5,8,0.55)_100%)]"
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute inset-0 z-30 bg-[radial-gradient(ellipse_85%_60%_at_50%_120%,rgba(59,130,246,0.22),rgba(9,9,11,0)_70%)]"
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute inset-x-10 top-0 z-40 h-px bg-gradient-to-r from-transparent via-cyan-200/70 to-transparent"
          aria-hidden="true"
        />

        {/* ---------- browser chrome ---------- */}
        <header className="relative z-40 flex items-center gap-3 border-b border-white/[0.07] bg-black/35 px-4 py-2.5 md:px-6">
          <span className="flex shrink-0 gap-1.5" aria-hidden="true">
            <span className="h-2 w-2 rounded-full bg-white/15" />
            <span className="h-2 w-2 rounded-full bg-white/15" />
            <span className="h-2 w-2 rounded-full bg-cyan-300/60 shadow-[0_0_8px_rgba(34,211,238,0.8)]" />
          </span>
          <p className="min-w-0 flex-1 truncate rounded-full border border-white/[0.08] bg-black/40 px-3 py-1 font-mono text-[10px] tracking-[0.12em] text-foreground/60">
            {host}
          </p>
          <span className="shrink-0 font-mono text-[9px] uppercase tracking-[0.28em] text-cyan-100/70">
            {project.pending
              ? "Pending"
              : project.mediaType === "embed"
                ? "Live embed"
                : "Video"}
          </span>
          <span className="hidden shrink-0 font-mono text-[9px] uppercase tracking-[0.28em] text-muted sm:block">
            {counter}
          </span>
        </header>

        {/* ---------- oversized frame number ---------- */}
        <p
          data-reel-layer="back"
          className="pointer-events-none absolute right-4 top-10 z-30 select-none text-[clamp(4rem,9vw,9rem)] font-semibold leading-none tracking-[-0.1em] text-white/[0.045] md:right-8"
          aria-hidden="true"
        >
          {String(index + 1).padStart(2, "0")}
        </p>

        {/* ---------- info slate ---------- */}
        <div
          data-reel-layer="front"
          className="relative z-40 mt-auto flex flex-col gap-4 p-5 md:p-8 lg:p-10"
        >
          <div className="flex items-center gap-3">
            <span
              className="h-px w-8 bg-accent shadow-[0_0_14px_rgba(59,130,246,0.8)]"
              aria-hidden="true"
            />
            <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-cyan-100/75">
              {project.year ? `${project.year} · ` : ""}
              {project.role ?? "Selected work"}
            </p>
          </div>

          <h3 className="max-w-3xl text-balance text-[clamp(1.5rem,3.6vw,3.25rem)] font-semibold uppercase leading-[0.95] tracking-[-0.055em] text-foreground">
            {project.title}
          </h3>

          <p className="max-w-2xl text-pretty text-sm leading-relaxed text-foreground/70 md:text-base">
            {project.description}
          </p>

          <div className="flex flex-wrap items-center gap-x-5 gap-y-3 pt-1">
            <ul className="flex min-w-0 flex-wrap gap-2">
              {project.techStack.map((tech) => (
                <li
                  key={tech}
                  className="rounded-full border border-cyan-200/20 bg-cyan-300/[0.06] px-3 py-1 font-mono text-[10px] uppercase tracking-[0.18em] text-cyan-100/80"
                >
                  {tech}
                </li>
              ))}
            </ul>

            <div className="ml-auto flex flex-wrap items-center gap-3">
              {project.caseStudyHref ? (
                <Link
                  href={project.caseStudyHref}
                  className="font-mono text-[10px] uppercase tracking-[0.24em] text-muted underline-offset-4 transition-colors duration-[var(--motion-micro)] hover:text-foreground hover:underline"
                >
                  Case study
                </Link>
              ) : null}

              {liveUrl ? (
                <a
                  href={liveUrl}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="group/cta relative inline-flex min-h-11 items-center gap-3 overflow-hidden border border-cyan-200/35 bg-accent/10 px-5 py-2.5 font-mono text-[10px] font-semibold uppercase tracking-[0.24em] text-cyan-100 transition-[background-color,border-color,color,box-shadow,transform] duration-[var(--motion-micro)] ease-out [clip-path:polygon(0_0,calc(100%-0.8rem)_0,100%_50%,calc(100%-0.8rem)_100%,0_100%)] hover:-translate-y-0.5 hover:border-cyan-100 hover:bg-accent hover:text-accent-foreground hover:shadow-[0_0_26px_rgba(59,130,246,0.5)]"
                  aria-label={`Open the live ${project.title} site in a new tab`}
                >
                  <span>Open live site</span>
                  <span
                    className="text-sm leading-none transition-transform duration-[var(--motion-micro)] group-hover/cta:-translate-y-0.5 group-hover/cta:translate-x-0.5"
                    aria-hidden="true"
                  >
                    ↗
                  </span>
                  <span
                    className="absolute inset-y-0 left-0 w-14 -translate-x-full bg-gradient-to-r from-transparent via-white/25 to-transparent transition-transform duration-[var(--motion-normal)] ease-out group-hover/cta:translate-x-[520%]"
                    aria-hidden="true"
                  />
                </a>
              ) : (
                <span className="font-mono text-[10px] uppercase tracking-[0.24em] text-muted">
                  Link pending
                </span>
              )}
            </div>
          </div>
        </div>
      </article>
    </div>
  );
}
