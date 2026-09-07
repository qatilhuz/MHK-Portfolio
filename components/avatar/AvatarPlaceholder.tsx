import { Section } from "@/components/ui/Section";
import { PlaceholderPanel } from "@/components/ui/PlaceholderPanel";

export function AvatarPlaceholder() {
  return (
    <Section id="avatar" eyebrow="Assistant" title="AI Digital Avatar">
      <PlaceholderPanel
        title="Conversational digital twin"
        note="3D likeness, voice, subtitles, and FAQ answers from approved data. Architecture only in this batch."
      />
    </Section>
  );
}
