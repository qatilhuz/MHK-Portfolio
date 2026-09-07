import { cn } from "@/lib/utils";
import { SECTION_CLASS } from "@/lib/constants";
import { Container } from "./Container";

interface SectionProps {
  id?: string;
  eyebrow?: string;
  title?: string;
  description?: string;
  children?: React.ReactNode;
  className?: string;
}

export function Section({
  id,
  eyebrow,
  title,
  description,
  children,
  className,
}: SectionProps) {
  return (
    <section id={id} className={cn(SECTION_CLASS, className)}>
      <Container>
        {(eyebrow || title || description) && (
          <header className="mb-10 max-w-2xl">
            {eyebrow ? <p className="label mb-3">{eyebrow}</p> : null}
            {title ? <h2 className="text-foreground">{title}</h2> : null}
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
