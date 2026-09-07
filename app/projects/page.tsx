import type { Metadata } from "next";
import { Section } from "@/components/ui/Section";
import { projects } from "@/data/projects";

export const metadata: Metadata = {
  title: "Projects",
  description: "Selected development work.",
};

export default function ProjectsPage() {
  return (
    <Section
      eyebrow="Work"
      title="Projects"
      description="Each project will have its own page at /projects/[slug] with a type-aware presentation."
    >
      {projects.length === 0 ? (
        <p className="text-muted">
          Project data is empty until real case studies are added.
        </p>
      ) : null}
    </Section>
  );
}
