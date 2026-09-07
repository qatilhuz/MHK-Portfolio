import Link from "next/link";
import { Badge } from "@/components/ui/Badge";
import { Section } from "@/components/ui/Section";
import { getRelatedProjects } from "@/data/projects";
import { previewLabel } from "@/lib/projects";
import type { Project } from "@/types";
import { ProjectActions } from "./ProjectActions";
import { ProjectCard } from "./ProjectCard";
import { ProjectPreview } from "./ProjectPreview";
import { ScreenshotGallery } from "./ScreenshotGallery";
import { VideoPreview } from "./VideoPreview";

export function ProjectDetail({ project }: { project: Project }) {
  const related = getRelatedProjects(project.slug);

  return (
    <Section
      eyebrow={project.isDemo ? "Placeholder" : previewLabel(project.projectType)}
      title={project.title}
    >
      {project.isDemo ? (
        <p className="mb-4 text-sm text-muted">
          This page is a UI demonstration, not a real portfolio case study.
        </p>
      ) : null}
      <p className="max-w-2xl text-lg leading-relaxed text-muted">
        {project.shortDescription}
      </p>
      <div className="mt-6 flex flex-wrap gap-2">
        {project.isDemo ? <Badge>Demo</Badge> : <Badge>{project.category}</Badge>}
        <Badge>{project.projectType}</Badge>
      </div>

      <div className="mt-10">
        <ProjectPreview project={project} />
      </div>

      <div className="mt-10 max-w-2xl space-y-4">
        <h2>Overview</h2>
        <p className="leading-relaxed text-muted">{project.description}</p>
      </div>

      {project.features.length > 0 ? (
        <div className="mt-10 max-w-2xl">
          <h2>Features</h2>
          <ul className="mt-4 list-disc space-y-1 pl-5 text-muted">
            {project.features.map((feature) => (
              <li key={feature}>{feature}</li>
            ))}
          </ul>
        </div>
      ) : null}

      {project.role ? (
        <div className="mt-10 max-w-2xl">
          <h2>My role</h2>
          <p className="mt-3 leading-relaxed text-muted">{project.role}</p>
        </div>
      ) : null}

      {project.technologies.length > 0 ? (
        <div className="mt-10">
          <h2>Technologies</h2>
          <ul className="mt-4 flex flex-wrap gap-2">
            {project.technologies.map((tech) => (
              <li key={tech}>
                <Badge>{tech}</Badge>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {project.screenshots.length > 0 ? (
        <div className="mt-10">
          <h2>Screenshots</h2>
          <div className="mt-4">
            <ScreenshotGallery images={project.screenshots} />
          </div>
        </div>
      ) : null}

      {project.video && project.projectType !== "video" ? (
        <div className="mt-10">
          <h2>Demo video</h2>
          <div className="mt-4">
            <VideoPreview project={project} />
          </div>
        </div>
      ) : null}

      <div className="mt-10">
        <ProjectActions project={project} />
      </div>
      <p className="mt-8 text-sm text-muted">
        <Link href="/projects" className="text-foreground underline-offset-4 hover:underline">
          All projects
        </Link>
        {" · "}
        <Link href="/contact" className="text-foreground underline-offset-4 hover:underline">
          Contact
        </Link>
      </p>

      {related.length > 0 ? (
        <div className="mt-16">
          <h2>Related projects</h2>
          <div className="mt-6 grid gap-6 sm:grid-cols-2">
            {related.map((item) => (
              <ProjectCard key={item.id} project={item} />
            ))}
          </div>
        </div>
      ) : null}
    </Section>
  );
}
