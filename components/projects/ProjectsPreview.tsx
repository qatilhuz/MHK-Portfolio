import { Section } from "@/components/ui/Section";
import { Button } from "@/components/ui/Button";
import { ProjectGrid } from "./ProjectGrid";

export function ProjectsPreview() {
  return (
    <Section
      id="projects"
      eyebrow="Work"
      title="Projects"
      description="Interactive web, PHP case studies, and Flutter apps share one data model. Previews stay honest: only real links and real files."
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
