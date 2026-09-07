import { ExperiencePreview } from "@/components/experience/ExperiencePreview";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Experience",
  description:
    "Development and QA focus of Huzaifa Khan: frontend, Next.js, and software testing — without an invented employment timeline.",
  path: "/experience",
});

export default function ExperiencePage() {
  return <ExperiencePreview />;
}
