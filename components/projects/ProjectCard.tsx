import Link from "next/link";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { previewLabel } from "@/lib/projects";
import type { Project } from "@/types";

export function ProjectCard({ project }: { project: Project }) {
  return (
    <article>
      <Card className="flex h-full flex-col overflow-hidden p-0 transition-[border-color] duration-[var(--motion-micro)] hover:border-accent/40">
        <div className="flex aspect-[16/10] items-center justify-center border-b border-border bg-surface-secondary">
          <p className="font-mono text-xs text-muted">
            {previewLabel(project.projectType)}
          </p>
        </div>
        <div className="flex flex-1 flex-col p-5">
          <div className="flex flex-wrap gap-2">
            <Badge>{project.category}</Badge>
            <Badge>{project.projectType}</Badge>
          </div>
          <h3 className="mt-4">
            <Link href={`/projects/${project.slug}`} className="hover:text-accent">
              {project.title}
            </Link>
          </h3>
          <p className="mt-2 flex-1 text-sm leading-relaxed text-muted">
            {project.shortDescription}
          </p>
          <ul className="mt-4 flex flex-wrap gap-2">
            {project.technologies.map((tech) => (
              <li key={tech}>
                <Badge>{tech}</Badge>
              </li>
            ))}
          </ul>
          <div className="mt-5 flex flex-wrap gap-4 text-sm">
            <Link href={`/projects/${project.slug}`} className="text-accent">
              Details
            </Link>
            {project.githubUrl ? (
              <a
                href={project.githubUrl}
                className="text-muted hover:text-foreground"
                target="_blank"
                rel="noopener noreferrer"
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
              >
                Live demo
              </a>
            ) : null}
          </div>
        </div>
      </Card>
    </article>
  );
}
