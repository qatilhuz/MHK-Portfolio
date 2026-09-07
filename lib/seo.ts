import type { Metadata } from "next";
import { siteConfig } from "@/data/site";
import { getActiveSocialLinks } from "@/data/social";

export function getSiteUrl(): string {
  return siteConfig.url.replace(/\/$/, "");
}

export function absoluteUrl(path: string): string | undefined {
  const base = getSiteUrl();
  if (!base) return undefined;
  if (path.startsWith("http")) return path;
  return `${base}${path.startsWith("/") ? path : `/${path}`}`;
}

export function pageMetadata({
  title,
  description,
  path,
  noIndex = false,
}: {
  title: string;
  description: string;
  path: string;
  noIndex?: boolean;
}): Metadata {
  const url = absoluteUrl(path);
  return {
    title,
    description,
    alternates: url ? { canonical: url } : undefined,
    openGraph: {
      title,
      description,
      type: "website",
      siteName: siteConfig.displayName,
      url,
      locale: "en_US",
    },
    twitter: {
      card: "summary",
      title,
      description,
    },
    robots: noIndex
      ? { index: false, follow: false }
      : { index: true, follow: true },
  };
}

export function personJsonLd() {
  const url = getSiteUrl();
  const sameAs = getActiveSocialLinks().map((link) => link.url);
  return {
    "@context": "https://schema.org",
    "@type": "Person",
    name: siteConfig.legalName,
    alternateName: siteConfig.displayName,
    jobTitle: siteConfig.role,
    address: {
      "@type": "PostalAddress",
      addressLocality: "Karachi",
      addressCountry: "PK",
    },
    ...(url ? { url } : {}),
    ...(sameAs.length ? { sameAs } : {}),
  };
}

export function projectJsonLd(project: {
  title: string;
  shortDescription: string;
  slug: string;
  technologies: string[];
}) {
  const url = absoluteUrl(`/projects/${project.slug}`);
  return {
    "@context": "https://schema.org",
    "@type": "CreativeWork",
    name: project.title,
    description: project.shortDescription,
    author: {
      "@type": "Person",
      name: siteConfig.legalName,
    },
    keywords: project.technologies.join(", "),
    ...(url ? { url } : {}),
  };
}

export function websiteJsonLd() {
  const url = getSiteUrl() || undefined;
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: `${siteConfig.legalName} — ${siteConfig.role}`,
    alternateName: siteConfig.displayName,
    url,
    description: siteConfig.description,
  };
}
