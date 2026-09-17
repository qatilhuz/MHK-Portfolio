import { AmbientBackground } from "@/components/ui/AmbientBackground";
import { Section } from "@/components/ui/Section";
import { ArcadeSetup } from "./ArcadeSetup";

export function ArcadeSection() {
  return (
    <div className="relative">
      <AmbientBackground variant="arcade" />
      <Section
        id="arcade"
        eyebrow="Arcade"
        title="Dev Arcade"
        description="A private rig on the desk. Enter the monitor for a full-screen game world — portfolio exercises, not commercial products."
        className="relative bg-surface/40"
      >
        <ArcadeSetup />
      </Section>
    </div>
  );
}
