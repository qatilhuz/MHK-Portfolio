import { Section } from "@/components/ui/Section";
import { Button } from "@/components/ui/Button";
import { ProjectGrid } from "@/components/projects/ProjectGrid";
import { projects } from "@/data/projects";
import { siteConfig } from "@/data/site";
import { hydrateProjects } from "@/lib/assets";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Projects",
  description:
    "Selected projects by Huzaifa Khan across web development, mobile apps, and frontend interfaces.",
  path: "/projects",
});

interface PageProps {
  searchParams: Promise<{ filter?: string }>;
}

export default async function ProjectsPage({ searchParams }: PageProps) {
  const { filter } = await searchParams;
  const items = hydrateProjects(projects);

  return (
    <Section
      eyebrow="SELECTED WORK"
      headingLevel="h1"
      title="Built to Work."
      description="Selected projects that show how I build responsive interfaces, connect frontend and backend systems, and apply a quality-focused approach to real development work."
    >
      <ProjectGrid projects={items} initialFilter={filter} />
      <div className="mt-8">
        <Button href={siteConfig.githubUrl} external variant="secondary">
          Explore More on GitHub ↗
        </Button>
      </div>
      <p className="mt-8 max-w-2xl text-sm leading-relaxed text-muted">
        Each project reflects a practical problem, a focused stack, and an opportunity to improve how I design, build, and test software.
      </p>
    </Section>
  );
}
