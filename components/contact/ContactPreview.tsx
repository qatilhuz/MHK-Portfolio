import Link from "next/link";
import { Section } from "@/components/ui/Section";
import { Button } from "@/components/ui/Button";
import { getActiveSocialLinks } from "@/data/social";

export function ContactPreview() {
  const socials = getActiveSocialLinks();

  return (
    <Section
      id="contact"
      eyebrow="Contact"
      title="Contact"
      description="Reach Huzaifa Khan through listed profiles. Email and LinkedIn are omitted until they are provided."
    >
      <div className="flex flex-wrap gap-3">
        <Button href="/contact" variant="secondary">
          Contact page
        </Button>
        {socials.map((link) => (
          <Button key={link.platform} href={link.url} external variant="ghost">
            {link.label}
          </Button>
        ))}
      </div>
      <p className="mt-6 text-sm text-muted">
        Also see{" "}
        <Link href="/about" className="text-foreground underline-offset-4 hover:underline">
          about
        </Link>{" "}
        and{" "}
        <Link href="/projects" className="text-foreground underline-offset-4 hover:underline">
          projects
        </Link>
        .
      </p>
    </Section>
  );
}
