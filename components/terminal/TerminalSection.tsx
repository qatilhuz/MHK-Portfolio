import { AmbientBackground } from "@/components/ui/AmbientBackground";
import { Section } from "@/components/ui/Section";
import { TerminalWindow } from "./TerminalWindow";

export function TerminalSection() {
  return (
    <div className="relative">
      <AmbientBackground variant="terminal" />
      <Section
        id="terminal"
        eyebrow="CLI"
        title="Developer Terminal"
        description="A simulated command surface over the same portfolio data as the rest of the site. It is not a real shell and cannot run system commands."
        className="relative"
      >
        <TerminalWindow />
      </Section>
    </div>
  );
}
