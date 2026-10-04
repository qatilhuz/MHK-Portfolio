"use client";

import { useEffect } from "react";
import { bindUnloadFlush } from "@/lib/analytics/client";
import { usePageView } from "@/hooks/usePageView";
import { useSectionTracking } from "@/hooks/useSectionTracking";
import { PrivacyNotice } from "./PrivacyNotice";

export function AnalyticsProvider() {
  usePageView();
  useSectionTracking();

  useEffect(() => {
    bindUnloadFlush();
  }, []);

  return <PrivacyNotice />;
}
