"use client";

import { useEffect } from "react";
import { trackEvent } from "@/lib/analytics/client";

export function ContactStart() {
  useEffect(() => {
    trackEvent("contact_start", undefined, { onceKey: "contact" });
  }, []);
  return null;
}
