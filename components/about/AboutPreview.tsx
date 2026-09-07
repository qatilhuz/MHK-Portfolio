import { Section } from "@/components/ui/Section";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { siteConfig } from "@/data/site";

const focusAreas = [
  {
    title: "Development",
    body: "Web with Next.js and React, backend with PHP, Laravel, and .NET Core, mobile with Flutter.",
  },
  {
    title: "Quality",
    body: "Manual and functional testing, test cases, and bug reporting sit alongside the build work.",
  },
  {
    title: "Direction",
    body: "Clear interfaces, honest presentation of work, and software that can be inspected — not just demoed.",
  },
];

export function AboutPreview() {
  return (
    <Section
      id="about"
      eyebrow="About"
      title={`I’m ${siteConfig.displayName}.`}
      description="Developer with a QA streak: I write software across the stack and I also look for the ways it can fail."
    >
      <div className="grid gap-8 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)]">
        <div className="space-y-4">
          <p className="max-w-2xl leading-relaxed text-muted">
            This site is both a professional record and a workspace. Later it
            will include a 3D environment, an AI avatar that only answers from
            approved data, and interactive experiments. The written content
            stays available without any of that.
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
              <dd>Web · Backend · Mobile · QA</dd>
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
