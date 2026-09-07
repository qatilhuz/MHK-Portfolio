import { Section } from "@/components/ui/Section";
import { PlaceholderPanel } from "@/components/ui/PlaceholderPanel";

export function QaPlaceholder() {
  return (
    <Section id="qa" eyebrow="QA" title="QA Bug Hunt">
      <PlaceholderPanel
        title="Interactive bug hunt"
        note="Visitors will inspect a deliberately buggy UI and log findings. Implementation is reserved for a later batch."
      />
    </Section>
  );
}
