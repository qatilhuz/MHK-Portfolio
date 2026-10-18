import { Section } from "@/components/ui/Section";
import { QaHunt } from "./QaHunt";

export function QaSection() {
  return (
    <Section
      id="qa"
      eyebrow="TESTING IN ACTION"
      title="QA Bug Hunt"
      description="A hands-on testing challenge where you inspect deliberately introduced bugs, classify the issue, and see how a tester documents expected versus actual behavior."
    >
      <QaHunt />
    </Section>
  );
}
