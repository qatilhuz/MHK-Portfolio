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
        description="HuzaifaOS boots on arrival, prints the stack it is running on, and then hands you the prompt. Type help for the command list."
        className="relative"
      >
        <TerminalWindow />
        <p className="mt-6 font-mono text-[11px] uppercase tracking-[0.22em] text-muted">
          Less clicking. More exploring.
        </p>
      </Section>
    </div>
  );
}
