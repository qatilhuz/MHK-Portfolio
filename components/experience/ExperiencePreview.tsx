import Link from "next/link";
import { Section } from "@/components/ui/Section";
import { Badge } from "@/components/ui/Badge";
import { experience } from "@/data/experience";

export function ExperiencePreview() {
  return (
    <Section
      id="experience"
      eyebrow="Career"
      title="Experience"
      description="Roles from Huzaifa’s CV. No extra employers or invented dates."
    >
      <ol className="relative border-l border-border pl-6">
        {experience.map((item) => (
          <li key={item.id} className="relative mb-10 last:mb-0">
            <span
              className="absolute -left-[1.54rem] top-1.5 h-3 w-3 rounded-full border border-accent bg-background"
              aria-hidden="true"
            />
            <p className="label">
              {item.startDate} — {item.endDate ?? "Present"} · {item.location}
            </p>
            <h3 className="mt-2">
              {item.role} · {item.company}
            </h3>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted">
              {item.description}
            </p>
            {item.responsibilities.length > 0 ? (
              <ul className="mt-3 max-w-2xl list-disc space-y-1 pl-5 text-sm text-muted">
                {item.responsibilities.map((line) => (
                  <li key={line}>{line}</li>
                ))}
              </ul>
            ) : null}
            {item.technologies.length > 0 ? (
              <ul className="mt-3 flex flex-wrap gap-2">
                {item.technologies.map((tech) => (
                  <li key={tech}>
                    <Badge>{tech}</Badge>
                  </li>
                ))}
              </ul>
            ) : null}
          </li>
        ))}
      </ol>
      <p className="mt-8 text-sm text-muted">
        <Link href="/projects" className="text-foreground underline-offset-4 hover:underline">
          Projects
        </Link>{" "}
        and{" "}
        <Link href="/contact" className="text-foreground underline-offset-4 hover:underline">
          contact
        </Link>
        .
      </p>
    </Section>
  );
}
