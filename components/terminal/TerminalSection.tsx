import { AmbientBackground } from "@/components/ui/AmbientBackground";
import { Section } from "@/components/ui/Section";
import { TerminalWindow } from "./TerminalWindow";

export function TerminalSection() {
  return (
    <div className="relative">
      <AmbientBackground variant="terminal" />
      <Section
        id="terminal"
        eyebrow="INTERACTIVE PORTFOLIO"
        title="Developer Terminal"
        description="Explore the portfolio through a simulated command-line experience powered by HuzaifaOS."
        className="relative"
      >
        <TerminalWindow />
        <p className="mt-6 text-sm text-muted">Less clicking. More exploring.</p>
      </Section>
    </div>
  );
}
