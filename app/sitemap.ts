import type { MetadataRoute } from "next";
import { getPublishedProjects } from "@/data/projects";
import { absoluteUrl, getSiteUrl } from "@/lib/seo";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = getSiteUrl();
  if (!base) {
    return [];
  }

  const staticRoutes = ["/", "/about", "/experience", "/projects", "/contact"];

  const pages: MetadataRoute.Sitemap = staticRoutes.map((path) => ({
    url: absoluteUrl(path) as string,
    changeFrequency: "monthly",
    priority: path === "/" ? 1 : 0.7,
  }));

  for (const project of getPublishedProjects()) {
    pages.push({
      url: absoluteUrl(`/projects/${project.slug}`) as string,
      changeFrequency: "monthly",
      priority: 0.6,
    });
  }

  return pages;
}
