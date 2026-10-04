"use client";

import { useEffect } from "react";
import { trackEvent } from "@/lib/analytics/client";

const SECTIONS = [
  "hero",
  "about",
  "skills",
  "experience",
  "projects",
  "qa",
  "arcade",
  "terminal",
  "avatar",
  "resume",
  "contact",
];

export function useSectionTracking() {
  useEffect(() => {
    const observed = new Set<string>();
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          const id = entry.target.id;
          if (!SECTIONS.includes(id) || observed.has(id)) continue;
          observed.add(id);
          trackEvent("section_view", { section: id }, { onceKey: `section:${id}` });
        }
      },
      { threshold: 0.35 },
    );

    for (const id of SECTIONS) {
      const node = document.getElementById(id);
      if (node) observer.observe(node);
    }

    return () => observer.disconnect();
  }, []);
}
