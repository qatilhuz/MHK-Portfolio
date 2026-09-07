import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { previewLabel } from "@/lib/projects";
import type { Project } from "@/types";
import { ProjectLinks } from "./ProjectLinks";

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
            <div className="flex h-full flex-col items-center justify-center gap-1 px-4 text-center">
              <p className="font-mono text-xs uppercase tracking-[0.14em] text-muted">
                {project.isDemo
                  ? "Demo Preview"
                  : project.mediaStatus === "coming-soon"
                    ? "Project media coming soon"
                    : previewLabel(project.projectType)}
              </p>
            </div>
          )}
        </div>
        <div className="flex flex-1 flex-col p-5">
          <div className="flex flex-wrap gap-2">
            {project.isDemo ? <Badge>Demo</Badge> : <Badge>{project.category}</Badge>}
            {project.featured ? <Badge>Featured</Badge> : null}
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
          <ProjectLinks project={project} />
        </div>
      </Card>
    </article>
  );
}
