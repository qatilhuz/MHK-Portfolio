import { Section } from "@/components/ui/Section";
import { PlaceholderPanel } from "@/components/ui/PlaceholderPanel";

export function TerminalPlaceholder() {
  return (
    <Section id="terminal" eyebrow="CLI" title="Developer Terminal">
      <PlaceholderPanel
        title="Interactive terminal"
        note="Commands such as help, about, skills, and projects will read from real portfolio data. Not implemented yet."
      />
    </Section>
  );
}
