import { Section } from "@/components/ui/Section";
import { TerminalWindow } from "./TerminalWindow";

export function TerminalSection() {
  return (
    <Section
      id="terminal"
      eyebrow="CLI"
      title="Developer Terminal"
      description="A simulated command surface over the same portfolio data as the rest of the site. It is not a real shell and cannot run system commands."
    >
      <TerminalWindow />
    </Section>
  );
}
