import type { Metadata } from "next";
import { Section } from "@/components/ui/Section";
import { siteConfig } from "@/data/site";

export const metadata: Metadata = {
  title: "About",
  description: `About ${siteConfig.displayName}, ${siteConfig.role}.`,
};

export default function AboutPage() {
  return (
    <Section
      eyebrow="About"
      title={siteConfig.displayName}
      description="Verified biographical copy will be added here. This page exists so the about route and metadata are in place."
    >
      <p className="max-w-2xl text-muted leading-relaxed">
        {siteConfig.description}
      </p>
    </Section>
  );
}
