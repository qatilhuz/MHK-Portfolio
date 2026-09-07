import { Section } from "@/components/ui/Section";
import { siteConfig } from "@/data/site";

export function AboutPreview() {
  return (
    <Section
      id="about"
      eyebrow="About"
      title={`About ${siteConfig.displayName}`}
      description="A concise professional introduction will be added from verified personal copy. This section is structural for now."
    >
      <p className="max-w-2xl text-muted leading-relaxed">
        The full about page will expand on background, approach, and the mix of
        development and QA thinking. No unverified biographical details are
        shown here.
      </p>
    </Section>
  );
}
