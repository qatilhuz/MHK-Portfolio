import { Section } from "@/components/ui/Section";
import { Card } from "@/components/ui/Card";
import { resumePdfExists } from "@/lib/assets";
import { ResumeActions } from "./ResumeActions";

export function ResumePreview() {
  const available = resumePdfExists();

  return (
    <Section
      id="resume"
      eyebrow="MY RESUME"
      title="Want the Full Picture?"
      description="Download Huzaifa Khan’s resume or view it in your browser for a concise overview of his experience, skills, and projects."
    >
      {available ? (
        <>
          <ResumeActions />
          <p className="mt-4 text-xs text-muted">Available in PDF format.</p>
        </>
      ) : (
        <Card className="border-dashed">
          <p className="label">PDF format</p>
          <h3 className="mt-3">Resume PDF will appear here when published.</h3>
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted">
            The download and in-browser view are enabled only when the PDF file is present on the site.
          </p>
          <p className="mt-4 text-xs text-muted">Available in PDF format.</p>
        </Card>
      )}
    </Section>
  );
}
