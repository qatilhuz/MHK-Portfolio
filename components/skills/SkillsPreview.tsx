"use client";

import { useMemo, useState } from "react";
import { Section } from "@/components/ui/Section";
import { Badge } from "@/components/ui/Badge";
import { getActiveSkillCategories, getSkillsByCategory } from "@/data/skills";
import { cn } from "@/lib/utils";
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
      description="Grouped by how I actually use them. No percentage bars — those would be invented."
      className="bg-surface/40"
    >
      <div
        role="tablist"
        aria-label="Skill categories"
        className="flex flex-wrap gap-2"
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
                "rounded-full border px-3 py-1.5 text-sm transition-colors duration-[var(--motion-micro)]",
                selected
                  ? "border-accent bg-accent-soft text-foreground"
                  : "border-border bg-surface text-muted hover:text-foreground",
              )}
              onClick={() => setActive(category)}
            >
              {category}
            </button>
          );
        })}
      </div>

      <ul
        role="tabpanel"
        className="mt-8 flex flex-wrap gap-2"
        aria-label={`${active} skills`}
      >
        {items.map((skill) => (
          <li key={skill.id}>
            <Badge className="px-3 py-1.5 text-sm text-foreground">
              {skill.name}
            </Badge>
          </li>
        ))}
      </ul>
    </Section>
  );
}
