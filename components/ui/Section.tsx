import { cn } from "@/lib/utils";
import { SECTION_CLASS } from "@/lib/constants";
import { TextReveal, type TextRevealVariant } from "@/components/motion/TextReveal";
import { TypeIn } from "@/components/motion/TypeIn";
import { Container } from "./Container";

interface SectionProps {
  id?: string;
  eyebrow?: string;
  title?: string;
  description?: string;
  headingLevel?: "h1" | "h2";
  titleMotion?: TextRevealVariant;
  children?: React.ReactNode;
  className?: string;
}

export function Section({
  id,
  eyebrow,
  title,
  description,
  headingLevel = "h2",
  titleMotion = "words",
  children,
  className,
}: SectionProps) {
  return (
    <section id={id} className={cn(SECTION_CLASS, className)}>
      <Container>
        {(eyebrow || title || description) && (
          <header className="mb-10 max-w-2xl">
            {eyebrow ? (
              <TextReveal as="p" className="label mb-3" text={eyebrow} variant="scan" />
            ) : null}
            {title ? (
              <TextReveal as={headingLevel} className="text-foreground" text={title} variant={titleMotion} />
            ) : null}
            {description ? (
              <TypeIn as="p" className="mt-3 text-muted leading-relaxed" text={description} />
            ) : null}
          </header>
        )}
        {children}
      </Container>
    </section>
  );
}
