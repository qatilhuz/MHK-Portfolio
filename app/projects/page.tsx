import { Section } from "@/components/ui/Section";
import { ProjectGrid } from "@/components/projects/ProjectGrid";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Projects",
  description:
    "Web, Flutter, and PHP project presentations by Huzaifa Khan. Demo entries are labelled placeholders until verified work is added.",
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
      description="Interactive web, Flutter, and PHP presentations share one typed model. Entries marked Demo are UI placeholders, not client work."
    >
      <ProjectGrid initialFilter={filter} />
    </Section>
  );
}
