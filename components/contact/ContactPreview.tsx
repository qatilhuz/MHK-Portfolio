"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { InView } from "@/components/motion/InView";
import { Section } from "@/components/ui/Section";
import { getActiveSocialLinks } from "@/data/social";
import { ContactForm } from "./ContactForm";

const EarthCanvas = dynamic(
  () => import("@/components/contact/EarthCanvas").then((module) => module.EarthCanvas),
  {
    ssr: false,
    loading: () => (
      <div className="grid h-full w-full place-items-center" role="status">
        <p className="text-xs uppercase tracking-[0.22em] text-muted">Loading planet…</p>
      </div>
    ),
  },
);
const StarsCanvas = dynamic(
  () => import("@/components/contact/StarsCanvas").then((module) => module.StarsCanvas),
  { ssr: false },
);

export function ContactPreview() {
  const socials = getActiveSocialLinks();

  return (
    <Section
      id="contact"
      eyebrow="Contact"
      title="Let’s talk"
      description="A short note is enough. No spam, no stored copies of your message on this site."
      className="relative isolate overflow-hidden bg-[radial-gradient(ellipse_at_75%_46%,rgba(37,99,235,0.16),transparent_42%),linear-gradient(180deg,transparent,rgba(2,6,23,0.72))] [&>div>header]:relative [&>div>header]:z-10"
    >
      <StarsCanvas />
      <InView
        className="relative z-10 flex min-w-0 flex-col-reverse gap-10 xl:mt-12 xl:flex-row"
        stagger="[data-contact-panel]"
        y={22}
      >
        <div
          data-contact-panel
          className="flex-[0.75] rounded-2xl border border-border/80 bg-black/45 p-6 shadow-[0_24px_80px_-36px_rgba(37,99,235,0.55)] backdrop-blur-sm md:p-8"
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
        </div>

        <div
          data-contact-panel
          className="relative h-[350px] w-full min-w-0 md:h-[550px] xl:h-auto xl:min-h-[560px] xl:flex-1"
        >
          <EarthCanvas />
        </div>
      </InView>
    </Section>
  );
}
