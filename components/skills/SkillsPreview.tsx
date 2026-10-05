"use client";

import { useMemo, useState } from "react";
import { Cpu, Radio } from "lucide-react";
import { Section } from "@/components/ui/Section";
import { Badge } from "@/components/ui/Badge";
import {
  coreStrengths,
  getActiveSkillCategories,
  getSkillsByCategory,
} from "@/data/skills";
import { cn } from "@/lib/utils";
import { InView } from "@/components/motion/InView";
import type { SkillCategory } from "@/types";

export function SkillsPreview() {
  const categories = getActiveSkillCategories();
  const [active, setActive] = useState<SkillCategory>(categories[0]);
  const items = useMemo(() => getSkillsByCategory(active), [active]);

  return (
    <Section
      id="skills"
      eyebrow="Stack"
      title="Skills"
      titleMotion="scan"
      description="A living toolkit, selected for the problem—not displayed as arbitrary percentages."
      className="relative min-h-[92svh] overflow-hidden bg-surface/20"
    >
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_76%_58%,rgba(34,211,238,0.11),transparent_28%),linear-gradient(180deg,transparent,rgba(2,6,23,0.34))]"
        aria-hidden="true"
      />

      <InView
        className="relative grid gap-8 lg:grid-cols-[minmax(0,0.72fr)_minmax(14rem,0.28fr)] lg:items-stretch"
        stagger="[data-skills-panel]"
        y={20}
      >
        <div
          data-skills-panel
          className="rounded-[1.75rem] border border-white/10 bg-black/30 p-6 shadow-[0_30px_100px_-54px_rgba(59,130,246,0.65),inset_0_1px_0_rgba(255,255,255,0.07)] backdrop-blur-xl md:p-8"
        >
          <div className="mb-7 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="grid h-10 w-10 place-items-center rounded-xl border border-cyan-200/15 bg-cyan-300/[0.06] text-cyan-100/70">
                <Cpu size={18} aria-hidden="true" />
              </span>
              <div>
                <p className="font-mono text-[9px] uppercase tracking-[0.22em] text-cyan-200/55">
                  Capability matrix
                </p>
                <p className="mt-1 text-sm text-white/45">Select a channel to inspect the stack.</p>
              </div>
            </div>
            <span className="inline-flex items-center gap-2 rounded-full border border-emerald-300/15 bg-emerald-300/[0.055] px-3 py-1.5 font-mono text-[8px] uppercase tracking-[0.18em] text-emerald-200/65">
              <Radio size={11} aria-hidden="true" />
              Core online
            </span>
          </div>

          <div
            role="tablist"
            aria-label="Skill categories"
            className="flex flex-wrap gap-2 border-b border-white/8 pb-6"
          >
            {categories.map((category) => {
              const selected = category === active;
              return (
                <button
                  key={category}
                  type="button"
                  role="tab"
                  aria-selected={selected}
                  className={cn(
                    "rounded-full border px-3.5 py-2 text-sm transition-[border-color,background-color,color,box-shadow] duration-[var(--motion-micro)]",
                    selected
                      ? "border-cyan-200/30 bg-cyan-300/[0.1] text-cyan-50 shadow-[0_0_24px_-10px_rgba(34,211,238,0.75)]"
                      : "border-white/9 bg-white/[0.035] text-white/45 hover:border-white/16 hover:bg-white/[0.06] hover:text-white/80",
                  )}
                  onClick={() => setActive(category)}
                >
                  {category}
                </button>
              );
            })}
          </div>

          <InView>
            <ul className="mt-6 flex flex-wrap gap-2" aria-label="Core strengths">
              {coreStrengths.map((item) => (
                <li key={item} data-in>
                  <Badge className="border-blue-300/15 bg-blue-300/[0.055] px-3 py-1.5 text-blue-100/60">
                    {item}
                  </Badge>
                </li>
              ))}
            </ul>
          </InView>

          <InView>
            <ul
              role="tabpanel"
              className="mt-8 grid gap-2 sm:grid-cols-2 xl:grid-cols-3"
              aria-label={`${active} skills`}
            >
              {items.map((skill, index) => (
                <li
                  key={skill.id}
                  data-in
                  className="flex items-center gap-3 rounded-xl border border-white/8 bg-white/[0.03] px-3.5 py-3 text-sm text-white/72 shadow-[inset_0_1px_0_rgba(255,255,255,0.035)] backdrop-blur-sm"
                >
                  <span className="font-mono text-[9px] text-cyan-200/38">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <span>{skill.name}</span>
                </li>
              ))}
            </ul>
          </InView>
        </div>

        <aside
          data-skills-panel
          className="relative flex min-h-[24rem] items-center justify-center overflow-hidden rounded-[1.75rem] border border-cyan-200/10 bg-cyan-300/[0.025] shadow-[0_30px_90px_-48px_rgba(34,211,238,0.55),inset_0_1px_0_rgba(255,255,255,0.06)] backdrop-blur-md"
          aria-label="Data core destination"
        >
          <div
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(34,211,238,0.1),transparent_48%)]"
            aria-hidden="true"
          />
          <div className="relative grid h-52 w-52 place-items-center rounded-full border border-cyan-200/10">
            <div className="absolute inset-5 rounded-full border border-dashed border-cyan-200/15" />
            <div className="absolute inset-12 rounded-full border border-cyan-100/10 shadow-[0_0_45px_rgba(34,211,238,0.09)]" />
            <div className="text-center">
              <p className="font-mono text-[9px] uppercase tracking-[0.28em] text-cyan-100/48">
                Dock 03
              </p>
              <p className="mt-2 font-mono text-[8px] uppercase tracking-[0.18em] text-white/25">
                Awaiting core
              </p>
            </div>
          </div>
          <div className="absolute inset-x-6 bottom-6 flex items-center justify-between font-mono text-[8px] uppercase tracking-[0.18em] text-white/25">
            <span>Path complete</span>
            <span>03 / Skills</span>
          </div>
        </aside>
      </InView>
    </Section>
  );
}
