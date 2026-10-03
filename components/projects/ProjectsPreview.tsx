import { AmbientBackground } from "@/components/ui/AmbientBackground";
import { Section } from "@/components/ui/Section";
import { Button } from "@/components/ui/Button";
import { projects } from "@/data/projects";
import { hydrateProjects } from "@/lib/assets";
import { ProjectGrid } from "./ProjectGrid";

export function ProjectsPreview() {
  const items = hydrateProjects(projects);

  return (
    <div className="relative">
      <AmbientBackground variant="projects" />
    <Section
      id="projects"
      eyebrow="Work"
      title="Projects"
      description="CV-backed work: PHP e-commerce, a Flutter laptop shop, a weather SPA, and a gaming showcase site. Media is added when files exist."
      className="relative bg-surface/40"
    >
      <ProjectGrid projects={items} />
      <div className="mt-8">
        <Button href="/projects" variant="secondary">
          All projects
        </Button>
      </div>
    </Section>
    </div>
  );
}
