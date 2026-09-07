import type { Metadata } from "next";
import { Section } from "@/components/ui/Section";
import { ProjectGrid } from "@/components/projects/ProjectGrid";

export const metadata: Metadata = {
  title: "Projects",
  description: "Selected development work by Huzaifa.",
};

export default function ProjectsPage() {
  return (
    <Section
      eyebrow="Work"
      title="Projects"
      description="Each entry is driven by typed data and can later use browser, phone, or video previews."
    >
      <ProjectGrid />
    </Section>
  );
}
