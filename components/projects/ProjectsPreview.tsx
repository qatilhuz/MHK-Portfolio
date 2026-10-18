import { AmbientBackground } from "@/components/ui/AmbientBackground";
import { Section } from "@/components/ui/Section";
import { Button } from "@/components/ui/Button";
import { projects } from "@/data/projects";
import { siteConfig } from "@/data/site";
import { hydrateProjects } from "@/lib/assets";
import { ProjectGrid } from "./ProjectGrid";

export function ProjectsPreview() {
  const items = hydrateProjects(projects);

  return (
    <div className="relative">
      <AmbientBackground variant="projects" />
    <Section
      id="projects"
      eyebrow="SELECTED WORK"
      title="Built to Work."
      description="Selected projects that show how I build responsive interfaces, connect frontend and backend systems, and apply a quality-focused approach to real development work."
      className="relative bg-surface/40"
    >
      <ProjectGrid projects={items} />
      <div className="mt-8">
        <Button href={siteConfig.githubUrl} external variant="secondary">
          Explore More on GitHub ↗
        </Button>
      </div>
      <p className="mt-8 max-w-2xl text-sm leading-relaxed text-muted">
        Each project reflects a practical problem, a focused stack, and an opportunity to improve how I design, build, and test software.
      </p>
    </Section>
    </div>
  );
}
