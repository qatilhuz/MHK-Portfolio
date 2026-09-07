import { Section } from "@/components/ui/Section";
import { Button } from "@/components/ui/Button";
import { ProjectGrid } from "./ProjectGrid";

export function ProjectsPreview() {
  return (
    <Section
      id="projects"
      eyebrow="Work"
      title="Projects"
      description="CV-backed work: PHP e-commerce, a Flutter laptop shop, a weather SPA, and a gaming showcase site. Media is added when files exist."
      className="bg-surface/40"
    >
      <ProjectGrid />
      <div className="mt-8">
        <Button href="/projects" variant="secondary">
          All projects
        </Button>
      </div>
    </Section>
  );
}
