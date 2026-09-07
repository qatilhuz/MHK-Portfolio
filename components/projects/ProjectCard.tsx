import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { previewLabel, primaryActionLabel } from "@/lib/projects";
import type { Project } from "@/types";

export function ProjectCard({ project }: { project: Project }) {
  return (
    <article>
      <Card className="flex h-full flex-col overflow-hidden p-0 transition-[border-color] duration-[var(--motion-micro)] hover:border-accent/40">
        <div className="relative aspect-[16/10] overflow-hidden border-b border-border bg-surface-secondary">
          {project.thumbnail ? (
            <Image
              src={project.thumbnail}
              alt={project.thumbnailAlt}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 50vw"
            />
          ) : (
            <div className="flex h-full items-center justify-center">
              <p className="font-mono text-xs text-muted">
                {previewLabel(project.projectType)}
              </p>
            </div>
          )}
        </div>
        <div className="flex flex-1 flex-col p-5">
          <div className="flex flex-wrap gap-2">
            <Badge>{project.category}</Badge>
            <Badge>{previewLabel(project.projectType)}</Badge>
          </div>
          <h3 className="mt-4">
            <Link href={`/projects/${project.slug}`} className="hover:text-accent">
              {project.title}
            </Link>
          </h3>
          <p className="mt-2 flex-1 text-sm leading-relaxed text-muted">
            {project.shortDescription}
          </p>
          {project.technologies.length > 0 ? (
            <ul className="mt-4 flex flex-wrap gap-2">
              {project.technologies.map((tech) => (
                <li key={tech}>
                  <Badge>{tech}</Badge>
                </li>
              ))}
            </ul>
          ) : null}
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
        </div>
      </Card>
    </article>
  );
}
