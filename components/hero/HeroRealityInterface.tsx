"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, type CSSProperties, type PointerEvent as ReactPointerEvent } from "react";
import { ArrowUpRight, Atom, Braces, CircuitBoard, Crosshair, MousePointer2, Sparkles } from "lucide-react";
import { isPageRevealed, onPageRevealed } from "@/lib/boot/reveal";
import { requestEmote } from "@/lib/character/emoteBus";
import { prefersReducedMotion } from "@/lib/motion/engine";

type SocialLink = {
  platform: string;
  label: string;
  url: string;
};

interface HeroRealityInterfaceProps {
  name: string;
  role: string;
  specialization: string;
  location: string;
  resumeHref: string;
  socials: SocialLink[];
}

type RealityStyle = CSSProperties & {
  "--mx"?: string;
  "--my"?: string;
};

const telemetry = ["Neural UI", "R3F Core", "GSAP Sync", "Binary Storm", "Bot Link", "API Guard"] as const;
const orbitLabels = ["identity", "systems", "motion", "shipping"] as const;
const fragments = ["01", "UX", "API", "3D", "QA", "∞", "NEXT", ".NET"] as const;

function toLetters(value: string) {
  return Array.from(value.toUpperCase()).filter((char) => char !== " ");
}

function clampMotion(value: number) {
  return Math.max(-1, Math.min(1, value));
}

function setMotionVars(node: HTMLElement, x: number, y: number) {
  node.style.setProperty("--mx", x.toFixed(3));
  node.style.setProperty("--my", y.toFixed(3));
}

export function HeroRealityInterface({
  name,
  role,
  specialization,
  location,
  resumeHref,
  socials,
}: HeroRealityInterfaceProps) {
  const root = useRef<HTMLDivElement>(null);
  const [firstName, lastName] = useMemo(() => {
    const parts = name.trim().split(/\s+/);
    return [parts[0] ?? name, parts.slice(1).join(" ") || "Khan"];
  }, [name]);
  const firstLetters = useMemo(() => toLetters(firstName), [firstName]);
  const lastLetters = useMemo(() => toLetters(lastName), [lastName]);

  useEffect(() => {
    if (prefersReducedMotion()) return;
    if (window.innerWidth < 1024) return;

    const activate = () => {
      window.setTimeout(() => requestEmote("point"), 900);
    };

    if (isPageRevealed()) {
      activate();
      return;
    }

    return onPageRevealed(activate);
  }, []);

  const handlePointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    const node = root.current;
    if (!node) return;
    const bounds = node.getBoundingClientRect();
    const x = clampMotion(((event.clientX - bounds.left) / bounds.width - 0.5) * 2);
    const y = clampMotion(((event.clientY - bounds.top) / bounds.height - 0.5) * 2);
    setMotionVars(node, x, y);
  };

  const resetPointer = () => {
    const node = root.current;
    if (!node) return;
    setMotionVars(node, 0, 0);
  };

  return (
    <div
      ref={root}
      className="group/reality relative w-full overflow-hidden rounded-[2.4rem] border border-cyan-200/12 bg-[radial-gradient(circle_at_calc(50%+var(--mx,0)*18%)_calc(35%+var(--my,0)*18%),rgba(34,211,238,0.2),transparent_30%),linear-gradient(135deg,rgba(2,6,23,0.72),rgba(8,47,73,0.34)_42%,rgba(2,6,23,0.82))] p-4 shadow-[0_38px_160px_-80px_rgba(34,211,238,0.72),inset_0_1px_0_rgba(255,255,255,0.08)] backdrop-blur-xl sm:p-6 lg:p-8"
      style={{ "--mx": "0", "--my": "0" } as RealityStyle}
      onPointerMove={handlePointerMove}
      onPointerLeave={resetPointer}
      data-hero-reality-interface
    >
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(103,232,249,0.055)_1px,transparent_1px),linear-gradient(90deg,rgba(103,232,249,0.05)_1px,transparent_1px)] bg-[size:42px_42px] [mask-image:radial-gradient(circle_at_center,black,transparent_78%)]" />
      <div className="pointer-events-none absolute inset-0 opacity-45 [background:repeating-linear-gradient(0deg,transparent_0px,transparent_6px,rgba(125,211,252,0.08)_7px)]" />
      <div className="pointer-events-none absolute -left-24 top-1/2 h-80 w-80 -translate-y-1/2 rounded-full border border-cyan-200/10" />
      <div className="pointer-events-none absolute -right-28 top-10 h-96 w-96 rounded-full border border-violet-300/10" />

      {fragments.map((fragment, index) => (
        <span
          key={fragment}
          className="pointer-events-none absolute hidden rounded-full border border-white/[0.08] bg-black/28 px-3 py-1 font-mono text-[9px] uppercase tracking-[0.2em] text-cyan-100/48 shadow-[0_0_24px_rgba(34,211,238,0.08)] backdrop-blur-md transition-transform duration-300 md:block"
          style={{
            left: `${8 + ((index * 17) % 78)}%`,
            top: `${10 + ((index * 23) % 70)}%`,
            transform: `translate3d(calc(var(--mx) * ${(index % 2 === 0 ? 1 : -1) * (10 + index * 2)}px), calc(var(--my) * ${(index % 3 === 0 ? -1 : 1) * (8 + index)}px), 0)`,
          }}
        >
          {fragment}
        </span>
      ))}

      <div className="relative z-10 grid min-h-[calc(100svh-11rem)] gap-8 lg:grid-cols-[minmax(0,1fr)_20rem] lg:items-center">
        <div className="relative flex min-h-[32rem] flex-col justify-center py-8">
          <div className="mb-8 flex flex-wrap items-center gap-3">
            <div className="inline-flex items-center gap-2 rounded-full border border-cyan-200/15 bg-cyan-300/[0.075] px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.24em] text-cyan-100/80 shadow-[0_0_32px_rgba(34,211,238,0.16)] backdrop-blur-md">
              <Sparkles size={13} aria-hidden="true" />
              Premium 3D portfolio system
            </div>
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/35 px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.22em] text-white/45 backdrop-blur-md">
              <MousePointer2 size={12} aria-hidden="true" />
              Move cursor to distort field
            </div>
          </div>

          <h1 className="sr-only">{name}</h1>
          <div
            aria-hidden="true"
            className="relative max-w-[68rem] select-none font-mono text-[clamp(4.5rem,12.5vw,12.4rem)] font-black uppercase leading-[0.74] tracking-[-0.12em] text-white"
            style={{
              transform:
                "perspective(1100px) rotateX(calc(var(--my) * -5.5deg)) rotateY(calc(var(--mx) * 7deg)) translate3d(calc(var(--mx) * 8px), calc(var(--my) * 6px), 0)",
              transformStyle: "preserve-3d",
            }}
          >
            <div className="flex flex-wrap gap-x-[0.035em] gap-y-3">
              {firstLetters.map((letter, index) => (
                <span
                  key={`${letter}-${index}`}
                  className="relative inline-grid min-w-[0.64em] place-items-center overflow-hidden border border-white/[0.07] bg-white/[0.025] px-[0.035em] shadow-[inset_0_0_22px_rgba(34,211,238,0.08)]"
                  style={{
                    clipPath:
                      index % 2 === 0
                        ? "polygon(0 8%, 92% 0, 100% 78%, 12% 100%)"
                        : "polygon(8% 0, 100% 14%, 90% 100%, 0 82%)",
                    transform: `translate3d(calc(var(--mx) * ${(index - 2) * 4}px), calc(var(--my) * ${(index % 3) * 3 - 3}px), ${index * 4}px)`,
                  }}
                >
                  <span
                    className="absolute text-cyan-300/50 mix-blend-screen blur-[0.3px]"
                    style={{ transform: `translate3d(calc(var(--mx) * ${10 + index}px), calc(var(--my) * -7px), 0)` }}
                  >
                    {letter}
                  </span>
                  <span
                    className="absolute text-fuchsia-400/35 mix-blend-screen blur-[0.2px]"
                    style={{ transform: `translate3d(calc(var(--mx) * -${8 + index}px), calc(var(--my) * 6px), 0)` }}
                  >
                    {letter}
                  </span>
                  <span className="relative bg-gradient-to-b from-white via-cyan-100 to-cyan-500 bg-clip-text text-transparent drop-shadow-[0_0_26px_rgba(34,211,238,0.34)]">
                    {letter}
                  </span>
                </span>
              ))}
            </div>
            <div className="mt-3 flex flex-wrap gap-x-[0.055em] gap-y-3 pl-[0.08em] text-[0.62em] tracking-[-0.08em]">
              {lastLetters.map((letter, index) => (
                <span
                  key={`${letter}-${index}`}
                  className="relative inline-grid min-w-[0.58em] place-items-center overflow-hidden border border-blue-300/[0.08] bg-cyan-300/[0.035] px-[0.045em]"
                  style={{
                    clipPath:
                      index % 2 === 0
                        ? "polygon(12% 0, 100% 10%, 86% 100%, 0 88%)"
                        : "polygon(0 16%, 88% 0, 100% 84%, 10% 100%)",
                    transform: `translate3d(calc(var(--mx) * ${(index + 1) * -3}px), calc(var(--my) * ${(index + 1) * 2}px), ${index * 3}px)`,
                  }}
                >
                  <span className="absolute text-blue-400/35 blur-[0.4px]">{letter}</span>
                  <span className="relative bg-gradient-to-r from-blue-200 via-white to-cyan-300 bg-clip-text text-transparent">
                    {letter}
                  </span>
                </span>
              ))}
            </div>
            <div className="pointer-events-none absolute -bottom-5 left-[7%] h-px w-[62%] bg-gradient-to-r from-transparent via-cyan-200/70 to-transparent shadow-[0_0_22px_rgba(34,211,238,0.8)]" />
          </div>

          <div className="mt-12 grid gap-5 lg:grid-cols-[minmax(0,0.92fr)_minmax(18rem,0.58fr)]">
            <div className="relative overflow-hidden rounded-[1.65rem] border border-white/[0.09] bg-black/35 p-5 backdrop-blur-xl">
              <div className="absolute inset-y-5 left-0 w-px bg-gradient-to-b from-transparent via-cyan-300/55 to-transparent" />
              <p className="max-w-2xl text-lg leading-relaxed text-white/66">
                {role} from {location}, engineering {specialization} into cinematic interfaces, resilient products, and
                scroll-driven 3D stories that feel alive before the first click.
              </p>
              <div className="mt-5 flex flex-wrap gap-3">
                <Link
                  href="/projects"
                  className="group/launch relative inline-flex items-center gap-2 overflow-hidden rounded-full border border-cyan-200/30 bg-cyan-300/12 px-5 py-3 font-mono text-[11px] uppercase tracking-[0.2em] text-cyan-50 shadow-[0_0_35px_rgba(34,211,238,0.2)] transition-transform duration-300 hover:-translate-y-0.5"
                >
                  <span className="absolute inset-0 translate-x-[-120%] bg-gradient-to-r from-transparent via-white/22 to-transparent transition-transform duration-700 group-hover/launch:translate-x-[120%]" />
                  Launch projects
                  <ArrowUpRight size={15} aria-hidden="true" />
                </Link>
                <Link
                  href={resumeHref}
                  className="inline-flex items-center rounded-full border border-white/10 bg-white/[0.055] px-5 py-3 font-mono text-[11px] uppercase tracking-[0.2em] text-white/62 backdrop-blur-xl transition-colors duration-300 hover:border-cyan-200/25 hover:text-cyan-100"
                >
                  Open dossier
                </Link>
              </div>
            </div>

            <div className="relative min-h-48 overflow-hidden rounded-[1.65rem] border border-cyan-200/12 bg-cyan-300/[0.045] p-5 backdrop-blur-xl">
              <div className="absolute right-5 top-5 h-24 w-24 rounded-full border border-dashed border-cyan-200/25 opacity-70 [animation:spin_18s_linear_infinite]" />
              <div className="absolute right-9 top-9 h-16 w-16 rounded-full border border-blue-300/20 opacity-70 [animation:spin_12s_linear_infinite_reverse]" />
              <div className="relative flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.22em] text-cyan-100/68">
                <Crosshair size={14} aria-hidden="true" />
                Live capabilities
              </div>
              <div className="relative mt-8 grid grid-cols-2 gap-2 text-[11px] text-white/58">
                {telemetry.map((item) => (
                  <span key={item} className="rounded-xl border border-white/[0.07] bg-black/28 px-3 py-2">
                    {item}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        <aside className="relative hidden min-h-[36rem] lg:block">
          <div
            className="absolute left-1/2 top-1/2 h-[29rem] w-[29rem] -translate-x-1/2 -translate-y-1/2 rounded-full border border-cyan-200/12"
            style={{ transform: "translate(-50%, -50%) rotate(calc(var(--mx) * 16deg))" }}
          />
          <div className="absolute left-1/2 top-1/2 h-[22rem] w-[22rem] -translate-x-1/2 -translate-y-1/2 rounded-full border border-dashed border-blue-300/16 [animation:spin_28s_linear_infinite]" />
          <div className="absolute left-1/2 top-1/2 grid h-44 w-44 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border border-white/10 bg-black/30 text-center backdrop-blur-xl">
            <Atom className="mb-2 text-cyan-200" size={28} aria-hidden="true" />
            <div className="font-mono text-[10px] uppercase tracking-[0.24em] text-cyan-100/70">Identity core</div>
            <div className="mt-2 text-xs leading-relaxed text-white/42">Hover field active</div>
          </div>

          {orbitLabels.map((label, index) => (
            <div
              key={label}
              className="absolute left-1/2 top-1/2 rounded-full border border-white/[0.08] bg-black/42 px-3 py-2 font-mono text-[9px] uppercase tracking-[0.22em] text-white/50 backdrop-blur-xl"
              style={{
                transform: `translate(-50%, -50%) rotate(${index * 90}deg) translateY(-13.5rem) rotate(-${index * 90}deg) translate3d(calc(var(--mx) * ${(index - 1.5) * 8}px), calc(var(--my) * ${(1.5 - index) * 8}px), 0)`,
              }}
            >
              {label}
            </div>
          ))}

          <div className="absolute bottom-0 left-0 right-0 rounded-[1.5rem] border border-white/[0.08] bg-black/34 p-4 backdrop-blur-xl">
            <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.22em] text-cyan-100/60">
              <CircuitBoard size={14} aria-hidden="true" />
              Social transmission
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              {socials.map((link) => (
                <a
                  key={link.platform}
                  href={link.url}
                  className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.18em] text-white/48 transition-colors duration-300 hover:border-cyan-200/25 hover:text-cyan-100"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {link.label}
                </a>
              ))}
            </div>
          </div>
        </aside>
      </div>

      <div className="pointer-events-none absolute bottom-5 left-5 hidden items-center gap-2 font-mono text-[9px] uppercase tracking-[0.22em] text-white/32 md:flex">
        <Braces size={13} aria-hidden="true" />
        Artifact locked to viewport center
      </div>
    </div>
  );
}
