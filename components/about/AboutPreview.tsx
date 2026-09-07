import Link from "next/link";
import { Section } from "@/components/ui/Section";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { siteConfig } from "@/data/site";

const focusAreas = [
  {
    title: "Frontend",
    body: "Interfaces with HTML, CSS, JavaScript, TypeScript, React, and Next.js.",
  },
  {
    title: "Full stack",
    body: "Backend work with PHP, Laravel, and .NET Core, plus Flutter for mobile.",
  },
  {
    title: "QA",
    body: "Software quality assurance, manual and functional testing, test cases, and bug reporting.",
  },
];

export function AboutPreview() {
  return (
    <Section
      id="about"
      eyebrow="About"
      title={`I’m ${siteConfig.displayName}.`}
      description="Full stack developer and QA practitioner. Building software and checking how it fails are two sides of the same job."
    >
      <div className="grid gap-8 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)]">
        <div className="space-y-4">
          <p className="max-w-2xl leading-relaxed text-muted">
            I work across frontend development, full-stack web applications,
            and Flutter. Time in software testing changes how I approach
            Next.js and React work: I care about what users can actually do,
            not only what a demo looks like.
          </p>
          <p className="max-w-2xl leading-relaxed text-muted">
            See{" "}
            <Link href="/#skills" className="text-foreground underline-offset-4 hover:underline">
              skills
            </Link>
            ,{" "}
            <Link href="/experience" className="text-foreground underline-offset-4 hover:underline">
              experience
            </Link>
            , and{" "}
            <Link href="/projects" className="text-foreground underline-offset-4 hover:underline">
              projects
            </Link>
            {" "}for the rest of the picture.
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
              <dd>{siteConfig.displayName}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-muted">Role</dt>
              <dd>{siteConfig.role}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-muted">Focus</dt>
              <dd>Frontend · Full stack · QA</dd>
            </div>
          </dl>
          <div className="mt-5 flex flex-wrap gap-2">
            <Badge>Verified copy only</Badge>
            <Badge>Avatar later</Badge>
          </div>
        </aside>
      </div>
    </Section>
  );
}
