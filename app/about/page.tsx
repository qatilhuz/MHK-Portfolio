import { AboutPreview } from "@/components/about/AboutPreview";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "About",
  description:
    "About Muhammad Huzaifa Khan, a full-stack developer in Karachi specializing in Next.js, React, and .NET.",
  path: "/about",
});

export default function AboutPage() {
  return <AboutPreview />;
}
