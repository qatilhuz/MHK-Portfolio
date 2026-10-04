import { Section } from "@/components/ui/Section";
import { Card } from "@/components/ui/Card";
import { resumePdfExists } from "@/lib/assets";
import { ResumeActions } from "./ResumeActions";

export function ResumePreview() {
  const available = resumePdfExists();

  return (
    <Section
      id="resume"
      eyebrow="CV"
      title="Resume"
      description="Full-stack developer résumé covering Next.js, React, .NET, and the projects on this site."
    >
      {available ? (
        <ResumeActions />
      ) : (
        <Card className="border-dashed">
          <p className="label">Coming soon</p>
          <h3 className="mt-3">Resume PDF coming soon</h3>
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted">
            View and download will appear here once the file is added at
            public/resume/huzaifa-resume.pdf. Nothing is served until then.
          </p>
        </Card>
      )}
    </Section>
  );
}
