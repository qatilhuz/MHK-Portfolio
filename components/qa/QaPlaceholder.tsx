import { Section } from "@/components/ui/Section";
import { PlaceholderPanel } from "@/components/ui/PlaceholderPanel";

export function QaPlaceholder() {
  return (
    <Section id="qa" eyebrow="QA" title="QA Bug Hunt">
      <PlaceholderPanel
        title="Interactive bug hunt"
        note="A later batch will add a deliberately buggy UI so visitors can log defects — title, type, severity, expected vs actual. This is the QA demonstration, not a game clone of the arcade."
      />
    </Section>
  );
}
