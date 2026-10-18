import { AboutPreview } from "@/components/about/AboutPreview";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "About",
  description:
    "About Huzaifa Khan, a full-stack developer in Karachi specializing in Next.js, React, TypeScript, modern web development, and software testing.",
  path: "/about",
});

export default function AboutPage() {
  return <AboutPreview headingLevel="h1" />;
}
