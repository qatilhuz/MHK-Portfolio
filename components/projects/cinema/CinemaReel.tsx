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
import { SkipProjectsButton } from "./SkipProjectsButton";

/* ------------------------------------------------------------------ *
 * Shot timing, in abstract timeline units (1 unit ~= one card's turn).
 * ScrollTrigger maps the finished duration onto the track, so these are
 * pure ratios — changing the track height never desyncs them.
 * ------------------------------------------------------------------ */
const ENTER = 0.6; // dolly in from the back of the room
const HOLD = 0.42; // beat on the mark
const EXIT = 0.5; // push past the camera
const STEP = ENTER + HOLD; // next card launches as this one starts leaving
const TAIL = 0.5; // the last frame holds instead of flying out

/**
 * Catch-up smoothing on every trigger in the section.
 *
 * ScrollTrigger lerps the animation toward the scroll position over this many
 * seconds, so a flick of the wheel resolves as a glide rather than a jump.
 * All three triggers share the value — mismatched scrubs are what make a
 * composed scene feel like separate animations sliding against each other.
 */
const SCRUB = 1.5;

/**
 * Poses carry motion only. Opacity rides its own shorter tween so a card is
 * solid for the middle of its travel and only dissolves at the hand-off,
 * instead of spending its whole approach translucent.
 */
const BACK_MOTION = {
  z: -560,
  scale: 0.86,
  rotateX: 6,
  rotateY: -4,
  yPercent: 5,
} as const;

/** On the mark, square to the camera. */
const MARK_MOTION = {
  z: 0,
  scale: 1,
  rotateX: 0,
  rotateY: 0,
  yPercent: 0,
} as const;

/** Overshooting the lens. */
const PAST_MOTION = {
  z: 300,
  scale: 1.12,
  rotateX: -4,
  rotateY: 3,
  yPercent: -5,
} as const;

/** Fraction of ENTER the fade-in takes. */
const FADE_IN = 0.55;
/** Fraction of EXIT the fade-out takes, and how late it starts. */
const FADE_OUT = 0.7;

export function CinemaReel({
  headingLevel = "h2",
}: {
  headingLevel?: "h1" | "h2";
}) {
  const sectionRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef<HTMLSpanElement>(null);
  const activeRef = useRef(0);

  const HeadingTag = headingLevel;
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

      // The skip control belongs to the reel, not the page: it appears once
      // the stage owns the screen and is gone before the section lets go.
      const skip = section.querySelector<HTMLElement>("[data-reel-skip]");
      if (skip) {
        gsap.set(skip, { autoAlpha: 0, y: 12 });
        ScrollTrigger.create({
          trigger: section,
          start: "top 55%",
          end: "bottom bottom",
          onToggle: (self) => {
            gsap.to(skip, {
              autoAlpha: self.isActive ? 1 : 0,
              y: self.isActive ? 0 : 12,
              duration: 0.4,
              ease: "power2.out",
              overwrite: "auto",
            });
          },
        });
      }

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

      // Deterministic, so onUpdate never has to reach back into the timeline
      // it is attached to (ScrollTrigger can fire onUpdate during its own init
      // refresh, while `timeline` is still in its temporal dead zone).
      const totalDuration = (cards.length - 1) * STEP + ENTER + TAIL;

      const reportActive = (progress: number) => {
        const time = progress * totalDuration;
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
          scrub: SCRUB,
          invalidateOnRefresh: true,
          onUpdate: (self) => {
            setProgress?.(self.progress);
            reportActive(self.progress);
          },
        },
      });

      // The opening frame rides in on the scroll that brings the section to
      // the top of the viewport, so the stage is never empty once it locks.
      if (!reduced) {
        const intro = gsap.timeline({
          scrollTrigger: {
            trigger: section,
            start: "top bottom",
            end: "top top",
            scrub: SCRUB,
            invalidateOnRefresh: true,
          },
        });
        intro.fromTo(
          cards[0],
          { ...BACK_MOTION },
          { ...MARK_MOTION, duration: 1, ease: "none", force3D: true },
          0,
        );
        intro.fromTo(
          cards[0],
          { autoAlpha: 0 },
          { autoAlpha: 1, duration: FADE_IN, ease: "none" },
          0,
        );
      }

      cards.forEach((card, index) => {
        const at = index * STEP;
        const last = index === cards.length - 1;
        const first = index === 0;

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

        // Linear everywhere. A scrubbed tween is already being eased by the
        // scrub itself, so an easing curve on top fights the scroll: the card
        // decelerates hard into its mark, sits, then snaps away again. That
        // double-easing is what reads as rigid.
        if (!first) {
          timeline.fromTo(
            card,
            { ...BACK_MOTION },
            { ...MARK_MOTION, duration: ENTER, ease: "none", force3D: true },
            at,
          );
          timeline.fromTo(
            card,
            { autoAlpha: 0 },
            { autoAlpha: 1, duration: ENTER * FADE_IN, ease: "none" },
            at,
          );
        }

        if (!last) {
          const exitAt = at + ENTER + HOLD * 0.35;
          timeline.to(
            card,
            { ...PAST_MOTION, duration: EXIT, ease: "none", force3D: true },
            exitAt,
          );
          timeline.to(
            card,
            { autoAlpha: 0, duration: EXIT * FADE_OUT, ease: "none" },
            exitAt + EXIT * (1 - FADE_OUT),
          );
        }
      });

      // Dead air at the end so the closing frame holds before the stage lets go.
      timeline.to({}, { duration: TAIL });

      if (!reduced) {
        // Slow dolly on the backdrop: the room keeps moving even while a card
        // is parked on its mark, which is what sells the depth.
        gsap.fromTo(
          gsap.utils.toArray<HTMLElement>("[data-reel-bg]", section),
          { scale: 1, yPercent: 0 },
          {
            scale: 1.18,
            yPercent: -5,
            ease: "none",
            force3D: true,
            scrollTrigger: {
              trigger: section,
              start: "top top",
              end: "bottom bottom",
              scrub: SCRUB,
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
          className="pointer-events-none absolute inset-0 origin-center will-change-transform bg-[radial-gradient(ellipse_70%_60%_at_20%_18%,rgba(59,130,246,0.16),rgba(9,9,11,0)_70%),radial-gradient(ellipse_65%_55%_at_82%_82%,rgba(168,85,247,0.13),rgba(9,9,11,0)_70%)]"
          aria-hidden="true"
        />
        <div
          data-reel-bg
          className="pointer-events-none absolute inset-0 origin-center will-change-transform opacity-[0.09] [background-image:linear-gradient(rgba(255,255,255,0.07)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.07)_1px,transparent_1px)] [background-size:110px_110px] [mask-image:radial-gradient(ellipse_72%_62%_at_50%_50%,rgba(0,0,0,0.95),rgba(0,0,0,0)_78%)] [-webkit-mask-image:radial-gradient(ellipse_72%_62%_at_50%_50%,rgba(0,0,0,0.95),rgba(0,0,0,0)_78%)]"
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
        <header className="relative z-30 shrink-0 px-[var(--page-gutter)] pt-[calc(4rem+1rem)] md:pt-[calc(4rem+2rem)]">
          <div className="mx-auto flex w-full max-w-[90rem] flex-col gap-5 md:flex-row md:items-end md:justify-between">
            <div className="min-w-0">
              <p className="label mb-3 flex items-center gap-3">
                <span
                  className="h-px w-10 bg-accent shadow-[0_0_18px_rgba(59,130,246,0.75)]"
                  aria-hidden="true"
                />
                SELECTED WORK / REEL
              </p>
              <HeadingTag className="text-[clamp(2rem,5.6vw,4.75rem)] font-semibold uppercase leading-[0.86] tracking-[-0.07em] text-foreground">
                Built to{" "}
                <span className="bg-gradient-to-r from-foreground via-cyan-100 to-accent bg-clip-text text-transparent">
                  Work.
                </span>
              </HeadingTag>
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

        <SkipProjectsButton targetSelector="#qa" fallbackRef={sectionRef} />
      </div>
    </section>
  );
}
