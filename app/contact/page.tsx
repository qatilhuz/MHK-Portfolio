import type { Metadata } from "next";
import { Section } from "@/components/ui/Section";
import { getActiveSocialLinks } from "@/data/social";

export const metadata: Metadata = {
  title: "Contact",
  description: "Get in touch.",
};

export default function ContactPage() {
  const socials = getActiveSocialLinks();

  return (
    <Section
      eyebrow="Contact"
      title="Let’s talk"
      description="A validated contact form with spam protection will be added in a later batch. Use listed profiles for now."
    >
      {socials.length === 0 ? (
        <p className="text-muted">Contact channels will appear here when provided.</p>
      ) : (
        <ul className="space-y-2">
          {socials.map((link) => (
            <li key={link.platform}>
              <a
                href={link.url}
                className="text-accent hover:underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                {link.label}
              </a>
            </li>
          ))}
        </ul>
      )}
    </Section>
  );
}
