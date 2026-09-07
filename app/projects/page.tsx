import type { Metadata } from "next";
import { Section } from "@/components/ui/Section";
import { ProjectGrid } from "@/components/projects/ProjectGrid";

export const metadata: Metadata = {
  title: "Projects",
  description: "Selected development work by Huzaifa.",
};

interface PageProps {
  searchParams: Promise<{ filter?: string }>;
}

export default async function ProjectsPage({ searchParams }: PageProps) {
  const { filter } = await searchParams;

  return (
    <Section
      eyebrow="Work"
      title="Projects"
      description="Interactive web, Flutter, video demos, and case studies share one typed model. Only verified entries are listed."
    >
      <ProjectGrid initialFilter={filter} />
    </Section>
  );
}
