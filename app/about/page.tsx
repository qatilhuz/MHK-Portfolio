import type { Metadata } from "next";
import { AboutPreview } from "@/components/about/AboutPreview";
import { siteConfig } from "@/data/site";

export const metadata: Metadata = {
  title: "About",
  description: `About ${siteConfig.displayName}, developer with web, backend, mobile, and QA experience.`,
};

export default function AboutPage() {
  return <AboutPreview />;
}
