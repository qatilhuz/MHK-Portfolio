import { ExperiencePreview } from "@/components/experience/ExperiencePreview";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Experience",
  description:
    "Experience of Huzaifa Khan: .NET Developer at Techcose Solutions and previously Next.js & React Developer at Hudasoft.",
  path: "/experience",
});

export default function ExperiencePage() {
  return <ExperiencePreview headingLevel="h1" />;
}
