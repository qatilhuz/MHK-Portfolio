import { AmbientBackground } from "@/components/ui/AmbientBackground";
import { Section } from "@/components/ui/Section";
import { ArcadeBoard } from "./ArcadeBoard";

export function ArcadeSection() {
  return (
    <div className="relative">
      <AmbientBackground variant="arcade" />
      <Section
        id="arcade"
        eyebrow="Play"
        title="Dev Arcade"
        description="Small browser games that demonstrate interaction, state, and timing. They are portfolio exercises, not commercial products."
        className="relative bg-surface/40"
      >
        <ArcadeBoard />
      </Section>
    </div>
  );
}
