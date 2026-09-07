import type { Metadata } from "next";
import { ExperiencePreview } from "@/components/experience/ExperiencePreview";

export const metadata: Metadata = {
  title: "Experience",
  description: "Professional development and QA experience.",
};

export default function ExperiencePage() {
  return <ExperiencePreview />;
}
