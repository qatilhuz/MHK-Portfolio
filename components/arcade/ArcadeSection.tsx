import { AmbientBackground } from "@/components/ui/AmbientBackground";
import { Section } from "@/components/ui/Section";
import { ArcadeExperience } from "./ArcadeExperience";

export function ArcadeSection() {
  return (
    <div className="relative">
      <AmbientBackground variant="arcade" />
      <Section
        id="arcade"
        eyebrow="Arcade"
        title="Dev Arcade"
        description="Step into a private rig, then through the monitor. Small browser games for interaction, state, and timing — portfolio exercises, not commercial products."
        className="relative bg-surface/40"
      >
        <ArcadeExperience />
      </Section>
    </div>
  );
}
