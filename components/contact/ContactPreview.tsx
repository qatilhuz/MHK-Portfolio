import { Section } from "@/components/ui/Section";
import { Button } from "@/components/ui/Button";

export function ContactPreview() {
  return (
    <Section
      id="contact"
      eyebrow="Contact"
      title="Contact"
      description="A secure contact form will be added later. This section keeps the journey complete."
    >
      <Button href="/contact" variant="secondary">
        Open contact
      </Button>
    </Section>
  );
}
