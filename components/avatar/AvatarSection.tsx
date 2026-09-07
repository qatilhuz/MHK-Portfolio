import { Section } from "@/components/ui/Section";
import { AvatarAssistant } from "./AvatarAssistant";

export function AvatarSection() {
  return (
    <Section
      id="avatar"
      eyebrow="Assistant"
      title="Digital Portfolio Assistant"
      description="Ask about Huzaifa’s verified background, stack, roles, projects, and education. Unverified topics are declined. The figure is a placeholder until a personal model is supplied."
    >
      <AvatarAssistant />
    </Section>
  );
}
