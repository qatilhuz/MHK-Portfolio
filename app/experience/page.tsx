import type { Metadata } from "next";
import { Section } from "@/components/ui/Section";
import { experience } from "@/data/experience";

export const metadata: Metadata = {
  title: "Experience",
  description: "Professional experience.",
};

export default function ExperiencePage() {
  return (
    <Section
      eyebrow="Career"
      title="Experience"
      description="Roles will be listed from typed experience data."
    >
      {experience.length === 0 ? (
        <p className="text-muted">
          No employment records have been added yet.
        </p>
      ) : null}
    </Section>
  );
}
