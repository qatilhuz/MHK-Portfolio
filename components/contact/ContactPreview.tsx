import Link from "next/link";
import { Section } from "@/components/ui/Section";
import { getActiveSocialLinks } from "@/data/social";
import { ContactForm } from "./ContactForm";

export function ContactPreview() {
  const socials = getActiveSocialLinks();

  return (
    <Section
      id="contact"
      eyebrow="Contact"
      title="Let’s talk"
      description="A short note is enough. No spam, no stored copies of your message on this site."
    >
      {socials.length > 0 ? (
        <p className="mb-6 text-sm text-muted">
          Also on{" "}
          {socials.map((link, index) => (
            <span key={link.platform}>
              <a
                href={link.url}
                className="text-foreground underline-offset-4 hover:underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                {link.label}
              </a>
              {index < socials.length - 1 ? " · " : ""}
            </span>
          ))}
        </p>
      ) : null}
      <ContactForm />
      <p className="mt-6 text-sm text-muted">
        <Link href="/about" className="text-foreground underline-offset-4 hover:underline">
          About
        </Link>
        {" · "}
        <Link href="/projects" className="text-foreground underline-offset-4 hover:underline">
          Projects
        </Link>
      </p>
    </Section>
  );
}
