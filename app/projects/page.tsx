import { Section } from "@/components/ui/Section";
import { ProjectGrid } from "@/components/projects/ProjectGrid";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Projects",
  description:
    "Projects by Huzaifa Khan: PHP e-commerce, Flutter laptop shop, weather SPA, and a gaming showcase site.",
  path: "/projects",
});

interface PageProps {
  searchParams: Promise<{ filter?: string }>;
}

export default async function ProjectsPage({ searchParams }: PageProps) {
  const { filter } = await searchParams;

  return (
    <Section
      eyebrow="Work"
      title="Projects"
      description="Verified CV projects. Media files can be added later without changing the data model."
    >
      <ProjectGrid initialFilter={filter} />
    </Section>
  );
}
