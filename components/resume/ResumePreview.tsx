import { Section } from "@/components/ui/Section";
import { Button } from "@/components/ui/Button";
import { siteConfig } from "@/data/site";

export function ResumePreview() {
  return (
    <Section
      id="resume"
      eyebrow="Resume"
      title="Resume"
      description="Resume viewing and download will be wired when a file is supplied at the configured path."
    >
      <Button href={siteConfig.resumePath} variant="secondary">
        Resume path (file pending)
      </Button>
    </Section>
  );
}
