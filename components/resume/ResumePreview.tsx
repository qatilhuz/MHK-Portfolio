import { Section } from "@/components/ui/Section";
import { Card } from "@/components/ui/Card";
import { siteConfig } from "@/data/site";
import { ResumeActions } from "./ResumeActions";

export function ResumePreview() {
  return (
    <Section
      id="resume"
      eyebrow="CV"
      title="Resume"
      description="The résumé matches the experience, skills, education, and projects on this site."
    >
      {siteConfig.resumeAvailable ? (
        <ResumeActions />
      ) : (
        <Card className="border-dashed">
          <p className="label">Pending file</p>
          <h3 className="mt-3">PDF not in the repository yet</h3>
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted">
            Place the CV at public/resume/huzaifa-resume.pdf and set
            resumeAvailable in data/site.ts. View and download actions are
            ready; no placeholder PDF is served.
          </p>
        </Card>
      )}
    </Section>
  );
}
