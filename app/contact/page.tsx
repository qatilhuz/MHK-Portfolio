import { getActiveSocialLinks } from "@/data/social";
import { Button } from "@/components/ui/Button";
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
      description="GitHub is the public profile available today. A validated form will ship in a later batch — the fields below are inactive."
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

      <form
        className="max-w-lg space-y-4"
        aria-label="Contact form (not yet submitted)"
        action="#"
        method="post"
      >
        <div>
          <label htmlFor="name" className="mb-1 block text-sm">
            Name
          </label>
          <input
            id="name"
            name="name"
            disabled
            className="w-full rounded-[var(--radius-md)] border border-border bg-surface px-3 py-2 text-sm text-muted"
            placeholder="Available when the form backend is ready"
          />
        </div>
        <div>
          <label htmlFor="email" className="mb-1 block text-sm">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            disabled
            className="w-full rounded-[var(--radius-md)] border border-border bg-surface px-3 py-2 text-sm text-muted"
            placeholder="Not collected yet"
          />
        </div>
        <div>
          <label htmlFor="message" className="mb-1 block text-sm">
            Message
          </label>
          <textarea
            id="message"
            name="message"
            disabled
            rows={4}
            className="w-full rounded-[var(--radius-md)] border border-border bg-surface px-3 py-2 text-sm text-muted"
            placeholder="Form backend is deferred"
          />
        </div>
        <Button type="submit" disabled>
          Send (coming later)
        </Button>
      </form>
    </Section>
  );
}
