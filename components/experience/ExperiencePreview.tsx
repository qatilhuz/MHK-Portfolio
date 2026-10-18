import { Section } from "@/components/ui/Section";
import { Badge } from "@/components/ui/Badge";
import { experience } from "@/data/experience";
import { InView } from "@/components/motion/InView";

export function ExperiencePreview({
  headingLevel = "h2",
}: {
  headingLevel?: "h1" | "h2";
}) {
  return (
    <Section
      id="experience"
      eyebrow="WHERE I’VE WORKED"
      headingLevel={headingLevel}
      title="Experience in Practice"
      titleMotion="mask"
      description="Hands-on experience building responsive products, integrating APIs, solving problems, and supporting reliable software delivery."
    >
      <InView>
      <ol className="relative border-l border-border pl-6">
        {experience.map((item) => (
          <li key={item.id} data-in className="relative mb-10 last:mb-0">
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
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted">{item.description}</p>
            {item.responsibilities.length > 0 ? (
              <div className="mt-3 max-w-2xl">
                <p className="label">Focus areas</p>
                <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-muted">
                  {item.responsibilities.map((line) => (
                    <li key={line}>{line}</li>
                  ))}
                </ul>
              </div>
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
      </InView>
      <p className="mt-8 max-w-2xl text-sm leading-relaxed text-muted">
        Every project and role has strengthened how I think, build, test, and improve software.
      </p>
    </Section>
  );
}
