import { Section } from "@/components/ui/Section";
import { Badge } from "@/components/ui/Badge";
import { skills, skillCategories } from "@/data/skills";

export function SkillsPreview() {
  return (
    <Section
      id="skills"
      eyebrow="Skills"
      title="Skills"
      description="Skill entries are data-driven. Categories are ready; verified skills will be added later."
    >
      <div className="flex flex-wrap gap-2">
        {skillCategories.map((category) => (
          <Badge key={category}>{category}</Badge>
        ))}
      </div>
      {skills.length === 0 ? (
        <p className="mt-6 text-sm text-muted">
          No skill records yet. The UI will map over data/skills.ts.
        </p>
      ) : null}
    </Section>
  );
}
