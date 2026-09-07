import { Section } from "@/components/ui/Section";
import { ArcadeBoard } from "./ArcadeBoard";

export function ArcadeSection() {
  return (
    <Section
      id="arcade"
      eyebrow="Play"
      title="Dev Arcade"
      description="Small browser games that demonstrate interaction, state, and timing. They are portfolio exercises, not commercial products."
      className="bg-surface/40"
    >
      <ArcadeBoard />
    </Section>
  );
}
