import { ExperiencePreview } from "@/components/experience/ExperiencePreview";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Experience",
  description:
    "Huzaifa Khan’s experience in practice across .NET development at Techcose Solutions and Next.js and React development at Hudasoft.",
  path: "/experience",
});

export default function ExperiencePage() {
  return <ExperiencePreview headingLevel="h1" />;
}
