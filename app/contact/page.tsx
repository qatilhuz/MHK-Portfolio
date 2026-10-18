import { ContactForm } from "@/components/contact/ContactForm";
import { getActiveSocialLinks } from "@/data/social";
import { Section } from "@/components/ui/Section";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Contact",
  description:
    "Contact Huzaifa Khan about relevant development and software engineering opportunities.",
  path: "/contact",
});

export default function ContactPage() {
  const socials = getActiveSocialLinks();

  return (
    <Section
      eyebrow="LET’S CONNECT"
      headingLevel="h1"
      title="Have an Opportunity in Mind?"
      description="Tell me about your project, role, or idea. I’m currently open to relevant development and software engineering opportunities."
    >
      <p className="label mb-3">Prefer another way?</p>
      {socials.length > 0 ? (
        <ul className="mb-10 space-y-2">
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
      ) : null}
      <ContactForm />
    </Section>
  );
}
