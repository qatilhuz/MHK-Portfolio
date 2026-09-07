import Link from "next/link";
import { Section } from "@/components/ui/Section";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { experience } from "@/data/experience";

const focus = [
  {
    title: "Software development",
    body: "Frontend and full-stack work with Next.js, React, PHP, Laravel, .NET Core, and Flutter.",
  },
  {
    title: "QA and testing",
    body: "Software quality assurance, manual testing, functional testing, test cases, and bug reporting.",
  },
];

export function ExperiencePreview() {
  return (
    <Section
      id="experience"
      eyebrow="Focus"
      title="Experience"
      description="Verified employer names and dates are not listed yet. This is a focus summary, not a fabricated timeline."
    >
      {experience.length === 0 ? (
        <div className="grid gap-4 md:grid-cols-2">
          {focus.map((item) => (
            <Card key={item.title}>
              <h3>{item.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">
                {item.body}
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                {item.title.startsWith("QA") ? (
                  <>
                    <Badge>QA</Badge>
                    <Badge>Testing</Badge>
                  </>
                ) : (
                  <>
                    <Badge>Next.js</Badge>
                    <Badge>Frontend</Badge>
                  </>
                )}
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <ol className="relative border-l border-border pl-6">
          {experience.map((item) => (
            <li key={item.id} className="relative mb-10 last:mb-0">
              <span
                className="absolute -left-[1.54rem] top-1.5 h-3 w-3 rounded-full border border-accent bg-background"
                aria-hidden="true"
              />
              <p className="label">
                {item.startDate} — {item.endDate ?? "Present"}
              </p>
              <h3 className="mt-2">
                {item.role}
                {item.company ? ` · ${item.company}` : ""}
              </h3>
              {item.description ? (
                <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted">
                  {item.description}
                </p>
              ) : null}
            </li>
          ))}
        </ol>
      )}
      <p className="mt-8 text-sm text-muted">
        <Link href="/projects" className="text-foreground underline-offset-4 hover:underline">
          Projects
        </Link>{" "}
        and{" "}
        <Link href="/contact" className="text-foreground underline-offset-4 hover:underline">
          contact
        </Link>{" "}
        are the next stops.
      </p>
    </Section>
  );
}
