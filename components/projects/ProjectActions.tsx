import { Button } from "@/components/ui/Button";
import { primaryActionLabel } from "@/lib/projects";
import type { Project } from "@/types";

export function ProjectActions({ project }: { project: Project }) {
  return (
    <div className="flex flex-wrap gap-3">
      <Button href={`/projects/${project.slug}`} variant="secondary">
        {primaryActionLabel(project)}
      </Button>
      {project.liveUrl ? (
        <Button href={project.liveUrl} external>
          Live Demo
        </Button>
      ) : null}
      {project.githubUrl ? (
        <Button href={project.githubUrl} external variant="ghost">
          GitHub
        </Button>
      ) : null}
    </div>
  );
}
