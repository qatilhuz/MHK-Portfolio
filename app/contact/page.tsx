import { ContactForm } from "@/components/contact/ContactForm";
import { getActiveSocialLinks } from "@/data/social";
import { Section } from "@/components/ui/Section";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Contact",
  description:
    "Contact Huzaifa Khan, full stack developer and QA. GitHub is listed; email and LinkedIn will appear when provided.",
  path: "/contact",
});

export default function ContactPage() {
  const socials = getActiveSocialLinks();

  return (
    <Section
      eyebrow="Contact"
      title="Contact Huzaifa Khan"
      description="Send a short message. GitHub is also listed. Email and LinkedIn stay omitted until they are public."
    >
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
