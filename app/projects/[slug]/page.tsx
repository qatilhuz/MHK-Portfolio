import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProjectViewTracker } from "@/components/analytics/ProjectViewTracker";
import { ProjectDetail } from "@/components/projects/ProjectDetail";
import { JsonLd } from "@/components/seo/JsonLd";
import { getProjectBySlug, getRelatedProjects, projects } from "@/data/projects";
import { hydrateProject, hydrateProjects } from "@/lib/assets";
import { pageMetadata, projectJsonLd } from "@/lib/seo";

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
  const title = project.isDemo ? `${project.title} (Demo)` : project.title;
  const description = project.isDemo
    ? `Placeholder demonstration page: ${project.shortDescription}`
    : project.shortDescription;
  return pageMetadata({
    title,
    description,
    path: `/projects/${project.slug}`,
    noIndex: project.isDemo,
  });
}

export default async function ProjectPage({ params }: PageProps) {
  const { slug } = await params;
  const project = getProjectBySlug(slug);
  if (!project) {
    notFound();
  }

  return (
    <>
      {!project.isDemo ? <JsonLd data={projectJsonLd(project)} /> : null}
      <ProjectViewTracker slug={project.slug} projectType={project.projectType} />
      <ProjectDetail
        project={hydrateProject(project)}
        related={hydrateProjects(getRelatedProjects(project.slug))}
      />
    </>
  );
}
