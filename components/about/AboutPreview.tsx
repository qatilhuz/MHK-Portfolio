import Link from "next/link";
import { Section } from "@/components/ui/Section";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { education } from "@/data/education";
import { siteConfig } from "@/data/site";

const focusAreas = [
  {
    title: "Frontend",
    body: "Next.js, React, Angular, HTML, CSS, JavaScript, TypeScript, and GSAP.",
  },
  {
    title: "Full stack",
    body: ".NET and C# at Techcose Solutions; PHP and Flutter on selected projects.",
  },
  {
    title: "Delivery",
    body: "Responsive UI, API integration, cross-browser work, and team collaboration.",
  },
];

export function AboutPreview() {
  return (
    <Section
      id="about"
      eyebrow="About"
      title={`I’m ${siteConfig.displayName}.`}
      description={`${siteConfig.role} in ${siteConfig.location}, specializing in ${siteConfig.specialization}.`}
    >
      <div className="grid gap-8 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)]">
        <div className="space-y-4">
          <p className="max-w-2xl leading-relaxed text-muted">
            {siteConfig.legalName} builds web and mobile software across
            frontend and backend. Current work is .NET development; previous
            work was Next.js and React.
          </p>
          <p className="max-w-2xl leading-relaxed text-muted">
            Languages spoken: {siteConfig.spokenLanguages.join(" and ")}. See{" "}
            <Link href="/experience" className="text-foreground underline-offset-4 hover:underline">
              experience
            </Link>
            ,{" "}
            <Link href="/projects" className="text-foreground underline-offset-4 hover:underline">
              projects
            </Link>
            , and the{" "}
            <Link href="/#avatar" className="text-foreground underline-offset-4 hover:underline">
              assistant
            </Link>
            .
          </p>
          <div className="grid gap-4 sm:grid-cols-3">
            {focusAreas.map((item) => (
              <Card key={item.title} className="p-5">
                <h3 className="text-sm">{item.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">
                  {item.body}
                </p>
              </Card>
            ))}
          </div>
          <div>
            <h3 className="text-sm">Education</h3>
            <ul className="mt-3 space-y-1 text-sm text-muted">
              {education.map((item) => (
                <li key={item.id}>
                  {item.credential} — {item.institution} ({item.startYear}
                  {item.endYear !== item.startYear ? `–${item.endYear}` : ""})
                </li>
              ))}
            </ul>
          </div>
        </div>

        <aside
          className="rounded-[var(--radius-lg)] border border-border bg-surface p-6"
          data-scene-slot="avatar"
          aria-label="Developer identity card"
        >
          <p className="label">Digital ID</p>
          <div className="mt-5 flex h-28 items-center justify-center rounded-[var(--radius-md)] border border-dashed border-border bg-surface-secondary font-mono text-xs text-muted">
            No portrait on file
          </div>
          <dl className="mt-5 space-y-3 text-sm">
            <div className="flex justify-between gap-4">
              <dt className="text-muted">Name</dt>
              <dd>{siteConfig.legalName}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-muted">Role</dt>
              <dd>{siteConfig.role}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-muted">Location</dt>
              <dd>{siteConfig.location}</dd>
            </div>
          </dl>
          <div className="mt-5 flex flex-wrap gap-2">
            <Badge>CV-backed</Badge>
            <Badge>Likeness later</Badge>
          </div>
        </aside>
      </div>
    </Section>
  );
}
