import Link from "next/link";
import { Globe, Mail } from "lucide-react";
import { footerNavigation, siteConfig } from "@/data/site";
import { socialLinks } from "@/data/social";
import { Container } from "@/components/ui/Container";
import type { SocialPlatform } from "@/types";

function SocialIcon({ platform }: { platform: SocialPlatform }) {
  if (platform === "github") {
    return (
      <svg
        width="17"
        height="17"
        viewBox="0 0 24 24"
        fill="currentColor"
        aria-hidden="true"
      >
        <path d="M12 .5C5.37.5 0 5.87 0 12.5c0 5.3 3.44 9.79 8.21 10.37.6.11.82-.26.82-.58 0-.29-.01-1.04-.02-2.05-3.34.73-4.04-1.61-4.04-1.61-.55-1.39-1.33-1.76-1.33-1.76-1.09-.74.08-.73.08-.73 1.2.09 1.84 1.24 1.84 1.24 1.07 1.83 2.81 1.3 3.5 1 .11-.78.42-1.3.76-1.6-2.67-.3-5.47-1.33-5.47-5.93 0-1.31.47-2.38 1.24-3.22-.12-.3-.54-1.52.12-3.18 0 0 1.01-.32 3.3 1.23a11.5 11.5 0 0 1 6 0c2.29-1.55 3.3-1.23 3.3-1.23.66 1.66.24 2.88.12 3.18.77.84 1.24 1.91 1.24 3.22 0 4.61-2.81 5.62-5.49 5.92.43.37.81 1.1.81 2.22 0 1.61-.01 2.9-.01 3.3 0 .32.22.7.82.58A10.996 10.996 0 0 0 24 12.5C24 5.87 18.63.5 12 .5Z" />
      </svg>
    );
  }

  return platform === "email" ? (
    <Mail size={17} aria-hidden="true" />
  ) : (
    <Globe size={17} aria-hidden="true" />
  );
}

export function Footer() {
  return (
    <footer className="border-t border-border py-10">
      <Container className="flex flex-col gap-8 md:flex-row md:items-start md:justify-between">
        <div className="max-w-sm">
          <Link href="/" className="font-medium text-foreground">
            {siteConfig.displayName}
          </Link>
          <p className="mt-2 max-w-xs text-sm text-muted">
            {siteConfig.footerDescription}
          </p>
        </div>

        <nav aria-label="Footer">
          <ul className="flex flex-wrap gap-x-5 gap-y-2 text-sm">
            {footerNavigation.map((item) => (
              <li key={item.href + item.label}>
                <Link
                  href={item.href}
                  className="text-muted transition-colors duration-[var(--motion-micro)] hover:text-foreground"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>

          <ul className="mt-5 flex flex-wrap gap-4 text-sm">
            {socialLinks.map((item) => (
              <li key={item.label}>
                {item.url ? (
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-muted transition-colors duration-[var(--motion-micro)] hover:text-foreground"
                  >
                    <SocialIcon platform={item.icon} />
                    <span>{item.label}</span>
                  </a>
                ) : (
                  <span className="inline-flex items-center gap-1.5 text-muted">
                    <SocialIcon platform={item.icon} />
                    <span>{item.label}</span>
                  </span>
                )}
              </li>
            ))}
          </ul>

          <p className="mt-5 text-sm text-muted">
            © 2026 Muhammad Huzaifa Khan. All rights reserved.{" "}
            <Link
              href="#top"
              className="text-foreground underline underline-offset-4 hover:text-accent"
            >
              Back to Top ↑
            </Link>
          </p>
        </nav>
      </Container>
    </footer>
  );
}
