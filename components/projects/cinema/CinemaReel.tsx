"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { cinemaCategories } from "@/data/cinemaProjects";
import {
  DEFAULT_CINEMA_CATEGORY,
  groupCinemaProjects,
  maxCinemaReelLength,
} from "@/lib/cinema";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import type { CinemaCategoryId } from "@/types";
import { CinemaTabs } from "./CinemaTabs";
import { ProjectCard } from "./ProjectCard";

/* ------------------------------------------------------------------ *
 * Shot timing, in abstract timeline units (1 unit ~= one card's turn).
 * ScrollTrigger maps the finished duration onto the track, so these are
 * pure ratios — changing the track height never desyncs them.
 * ------------------------------------------------------------------ */
const ENTER = 0.55; // dolly in from the back of the room
const HOLD = 0.3; // beat on the mark
const EXIT = 0.45; // push past the camera
const STEP = ENTER + HOLD; // next card launches as this one starts leaving
const TAIL = 0.5; // the last frame holds instead of flying out

/** Pose a card holds while it waits at the back of the stage. */
const BACK_POSE = {
  z: -1500,
  scale: 0.62,
  autoAlpha: 0,
  rotateX: 11,
  rotateY: -7,
  yPercent: 9,
} as const;

/** Pose on the mark, square to the camera. */
const MARK_POSE = {
  z: 0,
  scale: 1,
  autoAlpha: 1,
  rotateX: 0,
  rotateY: 0,
  yPercent: 0,
} as const;

/** Pose as the card overshoots the lens. */
const PAST_POSE = {
  z: 640,
  scale: 1.24,
  autoAlpha: 0,
  rotateX: -8,
  rotateY: 5,
  yPercent: -8,
} as const;

export function CinemaReel({
  headingLevel = "h2",
}: {
  headingLevel?: "h1" | "h2";
}) {
  const sectionRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef<HTMLSpanElement>(null);
  const activeRef = useRef(0);

  const reduced = useReducedMotion();
  const [category, setCategory] = useState<CinemaCategoryId>(DEFAULT_CINEMA_CATEGORY);
  const [activeIndex, setActiveIndex] = useState(0);
  const [armed, setArmed] = useState(false);
  const [loaded, setLoaded] = useState<Record<string, boolean>>({});

  const groups = useMemo(() => groupCinemaProjects(), []);
  const counts = useMemo(
    () =>
      cinemaCategories.reduce(
        (totals, item) => {
          totals[item.id] = groups[item.id].length;
          return totals;
        },
        {} as Record<CinemaCategoryId, number>,
      ),
    [groups],
  );

  const items = groups[category];
  const activeCategory =
    cinemaCategories.find((item) => item.id === category) ?? cinemaCategories[0];

  /**
   * The track is sized from the longest reel, never the active one, so
   * switching tabs cannot change document height. No layout jump, no
   * ScrollTrigger re-measure, nothing for Lenis to fight.
   */
  const trackHeight = useMemo(() => `${(maxCinemaReelLength() + 1) * 100}vh`, []);

  const handleCategory = useCallback((id: CinemaCategoryId) => {
    setCategory(id);
    activeRef.current = 0;
    setActiveIndex(0);
  }, []);

  /**
   * Lazy media: nothing mounts until the reel has been reached, then the card
   * on stage and the one behind it are marked loaded. Entries are never
   * removed, so a card stays warm once it has played.
   */
  useEffect(() => {
    if (!armed) return;
    const ids = [items[activeIndex]?.id, items[activeIndex + 1]?.id].filter(
      (id): id is string => Boolean(id),
    );
    setLoaded((previous) => {
      if (ids.every((id) => previous[id])) return previous;
      const next = { ...previous };
      for (const id of ids) next[id] = true;
      return next;
    });
  }, [armed, activeIndex, items]);

  useGSAP(
    () => {
      const section = sectionRef.current;
      const stage = stageRef.current;
      if (!section || !stage) return;

      gsap.registerPlugin(useGSAP, ScrollTrigger);

      const cards = gsap.utils.toArray<HTMLElement>("[data-reel-card]", stage);
      if (cards.length === 0) return;

      // Arm lazy loading slightly before the section is actually on screen.
      ScrollTrigger.create({
        trigger: section,
        start: "top bottom+=20%",
        once: true,
        onEnter: () => setArmed(true),
      });

      const setProgress = progressRef.current
        ? gsap.quickSetter(progressRef.current, "scaleX")
        : null;

      const reportActive = (progress: number, duration: number) => {
        const time = progress * duration;
        const index = Math.min(
          cards.length - 1,
          Math.max(0, Math.floor(time / STEP)),
        );
        if (index !== activeRef.current) {
          activeRef.current = index;
          setActiveIndex(index);
        }
      };

      // Every card owns its own perspective. Because they all share one centre
      // the vanishing points coincide, and nothing depends on an ancestor
      // keeping a 3D context alive through the overflow-hidden stage.
      gsap.set(cards, {
        transformPerspective: 1400,
        transformOrigin: "50% 50%",
        willChange: "transform, opacity",
        force3D: true,
      });

      const timeline = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: "top top",
          end: "bottom bottom",
          scrub: 1.1,
          invalidateOnRefresh: true,
          onUpdate: (self) => {
            setProgress?.(self.progress);
            reportActive(self.progress, timeline.duration());
          },
        },
      });

      cards.forEach((card, index) => {
        const at = index * STEP;
        const last = index === cards.length - 1;

        if (reduced) {
          // Honour the preference: same choreography, no depth or motion.
          timeline.fromTo(
            card,
            { autoAlpha: 0 },
            { autoAlpha: 1, duration: ENTER, ease: "none" },
            at,
          );
          if (!last) {
            timeline.to(
              card,
              { autoAlpha: 0, duration: EXIT, ease: "none" },
              at + ENTER + HOLD * 0.35,
            );
          }
          return;
        }

        timeline.fromTo(
          card,
          { ...BACK_POSE },
          { ...MARK_POSE, duration: ENTER, ease: "power2.out", force3D: true },
          at,
        );

        if (!last) {
          timeline.to(
            card,
            { ...PAST_POSE, duration: EXIT, ease: "power2.in", force3D: true },
            at + ENTER + HOLD * 0.35,
          );
        }
      });

      // Dead air at the end so the closing frame holds before the stage lets go.
      timeline.to({}, { duration: TAIL });

      if (!reduced) {
        // Slow dolly on the backdrop: the room keeps moving even while a card
        // is parked on its mark, which is what sells the depth.
        gsap.fromTo(
          stage.parentElement?.querySelectorAll<HTMLElement>("[data-reel-bg]") ?? [],
          { scale: 1, yPercent: 0 },
          {
            scale: 1.28,
            yPercent: -7,
            ease: "none",
            force3D: true,
            scrollTrigger: {
              trigger: section,
              start: "top top",
              end: "bottom bottom",
              scrub: 1.1,
              invalidateOnRefresh: true,
            },
          },
        );
      }
    },
    {
      scope: sectionRef,
      dependencies: [category, reduced],
      revertOnUpdate: true,
    },
  );

  return (
    <section
      id="projects"
      ref={sectionRef}
      style={{ height: trackHeight }}
      className="relative w-full bg-background"
      aria-label="Selected work, as a scroll-driven reel"
    >
      <div className="sticky top-0 flex h-screen w-full flex-col overflow-hidden">
        {/* ---------- backdrop ---------- */}
        <div
          data-reel-bg
          className="pointer-events-none absolute inset-0 origin-center bg-[radial-gradient(ellipse_70%_60%_at_20%_18%,rgba(59,130,246,0.16),rgba(9,9,11,0)_70%),radial-gradient(ellipse_65%_55%_at_82%_82%,rgba(168,85,247,0.13),rgba(9,9,11,0)_70%)]"
          aria-hidden="true"
        />
        <div
          data-reel-bg
          className="pointer-events-none absolute inset-0 origin-center opacity-[0.09] [background-image:linear-gradient(rgba(255,255,255,0.07)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.07)_1px,transparent_1px)] [background-size:110px_110px] [mask-image:radial-gradient(ellipse_72%_62%_at_50%_50%,rgba(0,0,0,0.95),rgba(0,0,0,0)_78%)] [-webkit-mask-image:radial-gradient(ellipse_72%_62%_at_50%_50%,rgba(0,0,0,0.95),rgba(0,0,0,0)_78%)]"
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-background to-transparent"
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-background to-transparent"
          aria-hidden="true"
        />

        {/* ---------- header + tabs ---------- */}
        <header className="relative z-30 shrink-0 px-[var(--page-gutter)] pt-[max(4.5rem,8vh)]">
          <div className="mx-auto flex w-full max-w-[90rem] flex-col gap-5 md:flex-row md:items-end md:justify-between">
            <div className="min-w-0">
              <p className="label mb-3 flex items-center gap-3">
                <span
                  className="h-px w-10 bg-accent shadow-[0_0_18px_rgba(59,130,246,0.75)]"
                  aria-hidden="true"
                />
                SELECTED WORK / REEL
              </p>
              {headingLevel === "h1" ? (
                <h1 className="text-[clamp(2.25rem,6vw,5rem)] font-semibold uppercase leading-[0.86] tracking-[-0.07em] text-foreground">
                  Built to{" "}
                  <span className="bg-gradient-to-r from-foreground via-cyan-100 to-accent bg-clip-text text-transparent">
                    Work.
                  </span>
                </h1>
              ) : (
                <h2 className="text-[clamp(2.25rem,6vw,5rem)] font-semibold uppercase leading-[0.86] tracking-[-0.07em] text-foreground">
                  Built to{" "}
                  <span className="bg-gradient-to-r from-foreground via-cyan-100 to-accent bg-clip-text text-transparent">
                    Work.
                  </span>
                </h2>
              )}
              <p
                key={activeCategory.id}
                className="mt-3 max-w-xl text-sm leading-relaxed text-muted md:text-base"
              >
                {activeCategory.tagline}
              </p>
            </div>

            <CinemaTabs
              active={category}
              counts={counts}
              onChange={handleCategory}
            />
          </div>
        </header>

        {/* ---------- stage ---------- */}
        <div
          id="reel-stage"
          ref={stageRef}
          role="tabpanel"
          aria-labelledby={`reel-tab-${category}`}
          className="relative z-20 min-h-0 flex-1"
        >
          {items.map((project, index) => (
            <ProjectCard
              key={`${category}-${project.id}`}
              project={project}
              index={index}
              total={items.length}
              active={index === activeIndex}
              load={Boolean(loaded[project.id])}
            />
          ))}
        </div>

        {/* ---------- transport HUD ---------- */}
        <footer className="relative z-30 shrink-0 px-[var(--page-gutter)] pb-[max(1.25rem,3vh)]">
          <div className="mx-auto flex w-full max-w-[90rem] items-center gap-4">
            <p className="shrink-0 font-mono text-[10px] uppercase tracking-[0.28em] text-cyan-100/70 tabular-nums">
              {String(activeIndex + 1).padStart(2, "0")}
              <span className="text-muted">
                {" "}
                / {String(items.length).padStart(2, "0")}
              </span>
            </p>
            <span
              className="relative h-px flex-1 overflow-hidden bg-border"
              aria-hidden="true"
            >
              <span
                ref={progressRef}
                className="absolute inset-0 origin-left scale-x-0 bg-gradient-to-r from-accent via-cyan-200 to-transparent"
              />
            </span>
            <p className="hidden shrink-0 font-mono text-[10px] uppercase tracking-[0.28em] text-muted sm:block">
              Scroll to run the reel
            </p>
          </div>
        </footer>
      </div>
    </section>
  );
}
