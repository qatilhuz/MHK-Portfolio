import { Section } from "@/components/ui/Section";
import { Button } from "@/components/ui/Button";
import { projects } from "@/data/projects";

export function ProjectsPreview() {
  return (
    <Section
      id="projects"
      eyebrow="Work"
      title="Projects"
      description="Project cards will be generated from typed data. Interactive web, PHP case studies, and Flutter presentations are supported by the data model."
    >
      {projects.length === 0 ? (
        <p className="mb-6 text-sm text-muted">
          No projects published yet. Placeholder demos will not be shown as real
          work.
        </p>
      ) : null}
      <Button href="/projects" variant="secondary">
        Browse projects
      </Button>
    </Section>
  );
}
