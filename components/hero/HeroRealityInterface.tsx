"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, type CSSProperties, type PointerEvent as ReactPointerEvent } from "react";
import { ArrowUpRight } from "lucide-react";
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

const stackLabels = ["Next.js", "React", ".NET", "WebGL"] as const;
const sectionLinks = [
  { href: "/#skills", label: "Tech Stack" },
  { href: "/experience", label: "Experience" },
  { href: "/projects", label: "Projects" },
] as const;

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

function FragmentedLine({ letters, small = false }: { letters: string[]; small?: boolean }) {
  return (
    <div className={small ? "mt-3 flex flex-wrap justify-center gap-x-[0.055em] gap-y-3 pl-[0.08em] text-[0.62em] tracking-[-0.08em]" : "flex flex-wrap justify-center gap-x-[0.035em] gap-y-3"}>
      {letters.map((letter, index) => (
        <span
          key={`${letter}-${index}`}
          className={
            small
              ? "relative inline-grid min-w-[0.58em] place-items-center overflow-hidden border border-blue-300/[0.08] bg-cyan-300/[0.035] px-[0.045em]"
              : "relative inline-grid min-w-[0.64em] place-items-center overflow-hidden border border-white/[0.07] bg-white/[0.025] px-[0.035em] shadow-[inset_0_0_22px_rgba(34,211,238,0.08)]"
          }
          style={{
            clipPath: small
              ? index % 2 === 0
                ? "polygon(12% 0, 100% 10%, 86% 100%, 0 88%)"
                : "polygon(0 16%, 88% 0, 100% 84%, 10% 100%)"
              : index % 2 === 0
                ? "polygon(0 8%, 92% 0, 100% 78%, 12% 100%)"
                : "polygon(8% 0, 100% 14%, 90% 100%, 0 82%)",
            transform: small
              ? `translate3d(calc(var(--mx) * ${(index + 1) * -3}px), calc(var(--my) * ${(index + 1) * 2}px), ${index * 3}px)`
              : `translate3d(calc(var(--mx) * ${(index - 2) * 4}px), calc(var(--my) * ${(index % 3) * 3 - 3}px), ${index * 4}px)`,
          }}
        >
          {!small ? (
            <>
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
            </>
          ) : (
            <span className="absolute text-blue-400/35 blur-[0.4px]">{letter}</span>
          )}
          <span
            className={
              small
                ? "relative bg-gradient-to-r from-blue-200 via-white to-cyan-300 bg-clip-text text-transparent"
                : "relative bg-gradient-to-b from-white via-cyan-100 to-cyan-500 bg-clip-text text-transparent drop-shadow-[0_0_26px_rgba(34,211,238,0.34)]"
            }
          >
            {letter}
          </span>
        </span>
      ))}
    </div>
  );
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
      className="group/reality relative min-h-[calc(100svh-8rem)] w-full overflow-hidden px-1 py-2 font-sans text-white sm:px-3 lg:px-0"
      style={{ "--mx": "0", "--my": "0" } as RealityStyle}
      onPointerMove={handlePointerMove}
      onPointerLeave={resetPointer}
      data-hero-reality-interface
    >
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-white/0 via-white/16 to-white/0" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-white/0 via-white/12 to-white/0" />
      <div className="pointer-events-none absolute bottom-0 left-0 top-0 w-px bg-gradient-to-b from-white/0 via-white/12 to-white/0" />
      <div className="pointer-events-none absolute bottom-0 right-0 top-0 w-px bg-gradient-to-b from-white/0 via-white/12 to-white/0" />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.025)_1px,transparent_1px)] bg-[size:7.5rem_7.5rem] [mask-image:linear-gradient(to_bottom,transparent,black_12%,black_86%,transparent)]" />
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-[32rem] w-[32rem] -translate-x-1/2 -translate-y-1/2 rounded-full border border-cyan-100/[0.045]" />

      <div className="relative z-10 flex min-h-[calc(100svh-8rem)] flex-col justify-between px-4 py-6 sm:px-6 lg:px-8">
        <div className="flex items-start justify-between gap-6 font-sans text-[10px] uppercase tracking-[0.24em] text-white/42">
          <span>100 %</span>
          <span className="hidden sm:inline">{location}</span>
          <span className="text-cyan-100/55">Available / 2026</span>
        </div>

        <div className="grid flex-1 items-center gap-8 py-12 lg:grid-cols-[8.5rem_minmax(0,1fr)_8.5rem] lg:py-8">
          <nav className="hidden h-full flex-col justify-center gap-5 border-l border-white/[0.08] pl-5 font-sans text-[10px] uppercase tracking-[0.22em] text-white/42 lg:flex">
            {sectionLinks.map((link) => (
              <Link key={link.href} href={link.href} className="transition-colors duration-300 hover:text-cyan-100">
                {link.label}
              </Link>
            ))}
          </nav>

          <main className="mx-auto flex w-full max-w-6xl flex-col items-center text-center">
            <p className="mb-7 font-sans text-[11px] uppercase tracking-[0.38em] text-white/48">Hi, I am</p>
            <h1 className="sr-only">{name}</h1>
            <div
              aria-hidden="true"
              className="relative select-none font-mono text-[clamp(4.2rem,13vw,13rem)] font-black uppercase leading-[0.74] tracking-[-0.12em] text-white"
              style={{
                transform:
                  "perspective(1100px) rotateX(calc(var(--my) * -4.5deg)) rotateY(calc(var(--mx) * 6deg)) translate3d(calc(var(--mx) * 6px), calc(var(--my) * 5px), 0)",
                transformStyle: "preserve-3d",
              }}
            >
              <FragmentedLine letters={firstLetters} />
              <FragmentedLine letters={lastLetters} small />
              <div className="pointer-events-none absolute -bottom-6 left-[12%] h-px w-[76%] bg-gradient-to-r from-transparent via-cyan-100/55 to-transparent shadow-[0_0_18px_rgba(34,211,238,0.55)]" />
            </div>

            <div className="mt-12 flex max-w-3xl flex-col items-center gap-4">
              <p className="font-sans text-[clamp(1rem,1.6vw,1.35rem)] font-light leading-relaxed text-white/62">
                {role} crafting quiet, futuristic systems with {specialization}.
              </p>
              <div className="flex flex-wrap justify-center gap-x-3 gap-y-2 font-sans text-[10px] uppercase tracking-[0.24em] text-white/38">
                {stackLabels.map((label, index) => (
                  <span key={label} className="inline-flex items-center gap-3">
                    {index > 0 ? <span className="h-px w-5 bg-white/14" aria-hidden="true" /> : null}
                    {label}
                  </span>
                ))}
              </div>
              <div className="mt-3 flex flex-wrap justify-center gap-x-7 gap-y-3 font-sans text-[11px] uppercase tracking-[0.22em]">
                <Link href={resumeHref} className="text-white/58 transition-colors duration-300 hover:text-cyan-100">
                  Resume
                </Link>
                <Link href="/#contact" className="inline-flex items-center gap-1 text-cyan-100/72 transition-colors duration-300 hover:text-white">
                  Hire Me
                  <ArrowUpRight size={12} aria-hidden="true" />
                </Link>
              </div>
            </div>
          </main>

          <aside className="hidden h-full flex-col items-end justify-center gap-5 border-r border-white/[0.08] pr-5 text-right font-sans text-[10px] uppercase tracking-[0.22em] text-white/42 lg:flex">
            {socials.map((link) => (
              <a key={link.platform} href={link.url} className="transition-colors duration-300 hover:text-cyan-100" target="_blank" rel="noopener noreferrer">
                {link.label}
              </a>
            ))}
            <span className="pt-5 text-white/26">hint: move cursor</span>
          </aside>
        </div>

        <div className="flex flex-wrap items-end justify-between gap-4 border-t border-white/[0.07] pt-5 font-sans text-[10px] uppercase tracking-[0.24em] text-white/38">
          <span>Scroll</span>
          <span className="max-w-sm text-right leading-relaxed text-white/34">Background artifact stays centered behind the minimalist hero field.</span>
        </div>
      </div>
    </div>
  );
}
