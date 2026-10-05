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
          className="relative flex-[0.75] overflow-hidden rounded-[2rem] border border-white/15 bg-white/[0.065] p-6 shadow-[0_30px_100px_-38px_rgba(2,6,23,0.95),0_0_70px_-36px_rgba(96,165,250,0.7),inset_0_1px_0_rgba(255,255,255,0.16)] backdrop-blur-2xl backdrop-saturate-150 md:p-9"
        >
          <div
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_12%_0%,rgba(255,255,255,0.13),transparent_36%),radial-gradient(circle_at_96%_88%,rgba(59,130,246,0.13),transparent_44%)]"
            aria-hidden="true"
          />
          <div
            className="pointer-events-none absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-white/45 to-transparent"
            aria-hidden="true"
          />
          {socials.length > 0 ? (
            <p className="relative z-10 mb-7 text-sm text-white/65">
              Also on{" "}
              {socials.map((link, index) => (
                <span key={link.platform}>
                  <a
                    href={link.url}
                    className="text-white underline-offset-4 transition-colors hover:text-blue-200 hover:underline"
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
          <div className="relative z-10">
            <ContactForm />
          </div>
          <p className="relative z-10 mt-7 border-t border-white/10 pt-5 text-sm text-white/55">
            <Link
              href="/about"
              className="text-white/85 underline-offset-4 transition-colors hover:text-blue-200 hover:underline"
            >
              About
            </Link>
            {" · "}
            <Link
              href="/projects"
              className="text-white/85 underline-offset-4 transition-colors hover:text-blue-200 hover:underline"
            >
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
