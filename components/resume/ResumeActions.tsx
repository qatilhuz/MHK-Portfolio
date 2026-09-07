"use client";

import { Button } from "@/components/ui/Button";
import { RESUME_PUBLIC_PATH } from "@/lib/assets-public";
import { trackEvent } from "@/lib/analytics/client";

export function ResumeActions() {
  return (
    <div className="flex flex-wrap gap-3">
      <Button
        href={RESUME_PUBLIC_PATH}
        external
        aria-label="View resume PDF"
        onClick={() => trackEvent("resume_view")}
      >
        View Resume
      </Button>
      <Button
        href={RESUME_PUBLIC_PATH}
        variant="secondary"
        external
        download="Huzaifa-Khan-Resume.pdf"
        aria-label="Download resume PDF"
        onClick={() => trackEvent("resume_download")}
      >
        Download Resume
      </Button>
    </div>
  );
}
