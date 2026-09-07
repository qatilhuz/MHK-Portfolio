import { Section } from "@/components/ui/Section";
import { experience } from "@/data/experience";

export function ExperiencePreview() {
  return (
    <Section
      id="experience"
      eyebrow="Experience"
      title="Experience"
      description="Employment history will render from data/experience.ts once verified."
    >
      {experience.length === 0 ? (
        <p className="text-sm text-muted">
          Experience list is empty by design until real roles are provided.
        </p>
      ) : null}
    </Section>
  );
}
