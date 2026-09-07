"use client";

import type { AnalyticsEventName } from "@/lib/analytics/types";
import { trackEvent } from "@/lib/analytics/client";

export function trackClick(
  name: AnalyticsEventName,
  meta?: Record<string, string | number | boolean>,
) {
  trackEvent(name, meta);
}
