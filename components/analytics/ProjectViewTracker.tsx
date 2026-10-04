"use client";

import { useEffect } from "react";
import { trackEvent } from "@/lib/analytics/client";

export function ProjectViewTracker({
  slug,
  projectType,
}: {
  slug: string;
  projectType: string;
}) {
  useEffect(() => {
    trackEvent("project_view", { slug, projectType }, { onceKey: `project:${slug}` });
  }, [projectType, slug]);

  return null;
}
