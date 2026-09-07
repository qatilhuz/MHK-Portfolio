"use client";

import Link from "next/link";
import { trackEvent } from "@/lib/analytics/client";
import { primaryActionLabel } from "@/lib/projects";
import type { Project } from "@/types";

export function ProjectLinks({ project }: { project: Project }) {
  return (
    <div className="mt-5 flex flex-wrap gap-4 text-sm">
      <Link href={`/projects/${project.slug}`} className="text-accent">
        {primaryActionLabel(project)}
      </Link>
      {project.githubUrl ? (
        <a
          href={project.githubUrl}
          className="text-muted hover:text-foreground"
          target="_blank"
          rel="noopener noreferrer"
          onClick={() =>
            trackEvent("project_github_click", { slug: project.slug })
          }
        >
          GitHub
        </a>
      ) : null}
      {project.liveUrl ? (
        <a
          href={project.liveUrl}
          className="text-muted hover:text-foreground"
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => trackEvent("project_demo_open", { slug: project.slug })}
        >
          Live Demo
        </a>
      ) : null}
      {project.video && !project.liveUrl ? (
        <Link
          href={`/projects/${project.slug}`}
          className="text-muted hover:text-foreground"
        >
          Watch Demo
        </Link>
      ) : null}
    </div>
  );
}
