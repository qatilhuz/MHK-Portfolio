import { Section } from "@/components/ui/Section";
import { Badge } from "@/components/ui/Badge";
import { experience } from "@/data/experience";

export function ExperiencePreview() {
  return (
    <Section
      id="experience"
      eyebrow="Timeline"
      title="Experience"
      description="Roles render from data/experience.ts. Nothing is invented while that list is empty."
    >
      {experience.length === 0 ? (
        <ol className="relative border-l border-border pl-6">
          <li className="relative pb-2">
            <span
              className="absolute -left-[1.54rem] top-1.5 h-3 w-3 rounded-full border border-accent bg-background"
              aria-hidden="true"
            />
            <p className="label">Pending verified details</p>
            <h3 className="mt-2">Employment history</h3>
            <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted">
              Company, role, dates, description, and technologies will appear
              here. QA work will be listed alongside development when those
              facts are provided — not before.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <Badge>Development</Badge>
              <Badge>QA / Testing</Badge>
            </div>
          </li>
        </ol>
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
      )}
    </Section>
  );
}
