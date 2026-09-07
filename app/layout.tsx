import type { Metadata, Viewport } from "next";
import { AnalyticsProvider } from "@/components/analytics/AnalyticsProvider";
import { SiteShell } from "@/components/layout/SiteShell";
import { JsonLd } from "@/components/seo/JsonLd";
import { siteConfig } from "@/data/site";
import { getSiteUrl, personJsonLd, websiteJsonLd } from "@/lib/seo";
import "./globals.css";

const metadataBase = getSiteUrl() ? new URL(getSiteUrl()) : undefined;

export const metadata: Metadata = {
  metadataBase,
  title: {
    default: `${siteConfig.displayName} — ${siteConfig.role}`,
    template: `%s | ${siteConfig.displayName}`,
  },
  description: siteConfig.description,
  applicationName: siteConfig.shortName,
  authors: [{ name: siteConfig.displayName }],
  openGraph: {
    title: `${siteConfig.displayName} — ${siteConfig.role}`,
    description: siteConfig.description,
    type: "website",
    siteName: siteConfig.displayName,
    locale: "en_US",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  themeColor: "#09090b",
  colorScheme: "dark",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="bg-background font-sans text-foreground antialiased">
        <JsonLd data={personJsonLd()} />
        <JsonLd data={websiteJsonLd()} />
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[60] focus:rounded-[var(--radius-md)] focus:bg-accent focus:px-3 focus:py-2 focus:text-accent-foreground"
        >
          Skip to content
        </a>
        <SiteShell>
          <AnalyticsProvider />
          {children}
        </SiteShell>
      </body>
    </html>
  );
}
