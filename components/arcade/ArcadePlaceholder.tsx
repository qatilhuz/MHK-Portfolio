import { Section } from "@/components/ui/Section";
import { PlaceholderPanel } from "@/components/ui/PlaceholderPanel";

export function ArcadePlaceholder() {
  return (
    <Section id="arcade" eyebrow="Play" title="Dev Arcade">
      <PlaceholderPanel
        title="Arcade cabinet → 2D games"
        note="Rock Paper Scissors, Snake, Memory, and Reaction tests will live here. The 3D machine is not built in this batch."
      />
    </Section>
  );
}
