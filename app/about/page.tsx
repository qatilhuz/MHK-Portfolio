import { AboutPreview } from "@/components/about/AboutPreview";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "About",
  description:
    "About Huzaifa Khan — full stack developer and QA practitioner working with Next.js, React, Flutter, and software testing.",
  path: "/about",
});

export default function AboutPage() {
  return <AboutPreview />;
}
