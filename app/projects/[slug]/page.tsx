import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProjectDetail } from "@/components/projects/ProjectDetail";
import { getProjectBySlug, projects } from "@/data/projects";
import { pageMetadata } from "@/lib/seo";

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

  return <ProjectDetail project={project} />;
}
