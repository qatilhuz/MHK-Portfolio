"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { trackEvent } from "@/lib/analytics/client";

export function usePageView() {
  const pathname = usePathname();

  useEffect(() => {
    trackEvent("page_view", undefined, { onceKey: `page:${pathname}` });
  }, [pathname]);
}
