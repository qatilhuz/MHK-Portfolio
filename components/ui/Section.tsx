import { cn } from "@/lib/utils";
import { SECTION_CLASS } from "@/lib/constants";
import { Container } from "./Container";

interface SectionProps {
  id?: string;
  eyebrow?: string;
  title?: string;
  description?: string;
  headingLevel?: "h1" | "h2";
  children?: React.ReactNode;
  className?: string;
}

export function Section({
  id,
  eyebrow,
  title,
  description,
  headingLevel = "h2",
  children,
  className,
}: SectionProps) {
  const Heading = headingLevel;
  return (
    <section id={id} className={cn(SECTION_CLASS, className)}>
      <Container>
        {(eyebrow || title || description) && (
          <header className="mb-10 max-w-2xl">
            {eyebrow ? <p className="label mb-3">{eyebrow}</p> : null}
            {title ? <Heading className="text-foreground">{title}</Heading> : null}
            {description ? (
              <p className="mt-3 text-muted leading-relaxed">{description}</p>
            ) : null}
          </header>
        )}
        {children}
      </Container>
    </section>
  );
}
