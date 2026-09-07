import { Section } from "@/components/ui/Section";
import { QaHunt } from "./QaHunt";

export function QaSection() {
  return (
    <Section
      id="qa"
      eyebrow="QA"
      title="QA Bug Hunt"
      description="Deliberate defects to practise identifying, classifying, and reporting issues. Not a client project."
    >
      <QaHunt />
    </Section>
  );
}
