import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Section } from "@/components/ui/Section";
import { getProjectBySlug, projects } from "@/data/projects";
import { previewLabel } from "@/lib/projects";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return projects.map((project) => ({ slug: project.slug }));
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const project = getProjectBySlug(slug);
  if (!project) {
    return { title: "Project not found" };
  }
  return {
    title: project.title,
    description: project.shortDescription,
  };
}

export default async function ProjectPage({ params }: PageProps) {
  const { slug } = await params;
  const project = getProjectBySlug(slug);
  if (!project) {
    notFound();
  }

  return (
    <Section eyebrow={project.category} title={project.title}>
      <div className="mb-6 flex aspect-[16/8] items-center justify-center rounded-[var(--radius-lg)] border border-border bg-surface">
        <p className="font-mono text-sm text-muted">
          {previewLabel(project.projectType)}
        </p>
      </div>
      <div className="flex flex-wrap gap-2">
        <Badge>{project.projectType}</Badge>
        {project.technologies.map((tech) => (
          <Badge key={tech}>{tech}</Badge>
        ))}
      </div>
      <p className="mt-6 max-w-2xl leading-relaxed text-muted">
        {project.description}
      </p>
      {project.features.length > 0 ? (
        <ul className="mt-6 list-disc space-y-1 pl-5 text-sm text-muted">
          {project.features.map((feature) => (
            <li key={feature}>{feature}</li>
          ))}
        </ul>
      ) : null}
      <div className="mt-8 flex flex-wrap gap-3">
        {project.githubUrl ? (
          <Button href={project.githubUrl} external variant="secondary">
            GitHub
          </Button>
        ) : null}
        {project.liveUrl ? (
          <Button href={project.liveUrl} external>
            Live demo
          </Button>
        ) : null}
      </div>
    </Section>
  );
}
