"use client";

import { Button } from "@/components/ui/Button";
import { siteConfig } from "@/data/site";
import { trackEvent } from "@/lib/analytics/client";

export function ResumeActions() {
  return (
    <div className="flex flex-wrap gap-3">
      <Button
        href={siteConfig.resumePath}
        external
        onClick={() => trackEvent("resume_view")}
      >
        View Resume
      </Button>
      <Button
        href={siteConfig.resumePath}
        variant="secondary"
        external
        onClick={() => trackEvent("resume_download")}
      >
        Download Resume
      </Button>
    </div>
  );
}
