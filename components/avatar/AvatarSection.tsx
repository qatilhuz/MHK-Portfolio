import { Section } from "@/components/ui/Section";
import { AvatarAssistant } from "./AvatarAssistant";

export function AvatarSection() {
  return (
    <Section
      id="avatar"
      eyebrow="ASK ME ANYTHING"
      title="Portfolio Assistant"
      description="Ask about Huzaifa’s experience, skills, projects, tech stack, or how he builds software."
    >
      <AvatarAssistant />
    </Section>
  );
}
