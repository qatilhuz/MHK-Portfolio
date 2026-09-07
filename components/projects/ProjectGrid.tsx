"use client";

import { useMemo, useState } from "react";
import { projects } from "@/data/projects";
import {
  isProjectFilterId,
  matchesProjectFilter,
  projectFilters,
  type ProjectFilterId,
} from "@/lib/projects";
import { cn } from "@/lib/utils";
import { ProjectCard } from "./ProjectCard";
import { ProjectEmptyState } from "./ProjectEmptyState";

export function ProjectGrid({ initialFilter }: { initialFilter?: string }) {
  const [filter, setFilter] = useState<ProjectFilterId>(
    initialFilter && isProjectFilterId(initialFilter) ? initialFilter : "all",
  );

  const available = useMemo(
    () =>
      projectFilters.filter(
        (item) =>
          item.id === "all" ||
          projects.some((project) => matchesProjectFilter(project, item.id)),
      ),
    [],
  );

  const filtered = useMemo(
    () => projects.filter((project) => matchesProjectFilter(project, filter)),
    [filter],
  );

  if (projects.length === 0) {
    return <ProjectEmptyState />;
  }

  return (
    <div>
      {available.length > 1 ? (
        <div
          className="mb-8 flex flex-wrap gap-2"
          role="group"
          aria-label="Filter projects"
        >
          {available.map((item) => {
            const selected = item.id === filter;
            return (
              <button
                key={item.id}
                type="button"
                aria-pressed={selected}
                className={cn(
                  "rounded-full border px-3 py-1.5 text-sm transition-colors duration-[var(--motion-micro)]",
                  selected
                    ? "border-accent bg-accent-soft text-foreground"
                    : "border-border bg-surface text-muted hover:text-foreground",
                )}
                onClick={() => setFilter(item.id)}
              >
                {item.label}
              </button>
            );
          })}
        </div>
      ) : null}

      {filtered.length === 0 ? (
        <p className="text-sm text-muted">No projects in this category yet.</p>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2">
          {filtered.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      )}
    </div>
  );
}
