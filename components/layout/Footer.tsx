import Link from "next/link";
import { getActiveSocialLinks } from "@/data/social";
import { navigation, siteConfig } from "@/data/site";
import { Container } from "@/components/ui/Container";
import { Divider } from "@/components/ui/Divider";

function SocialIcon({ platform }: { platform: string }) {
  if (platform === "github") {
    return (
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="currentColor"
        aria-hidden="true"
      >
        <path d="M12 .5C5.37.5 0 5.87 0 12.5c0 5.3 3.44 9.79 8.21 10.37.6.11.82-.26.82-.58 0-.29-.01-1.04-.02-2.05-3.34.73-4.04-1.61-4.04-1.61-.55-1.39-1.33-1.76-1.33-1.76-1.09-.74.08-.73.08-.73 1.2.09 1.84 1.24 1.84 1.24 1.07 1.83 2.81 1.3 3.5 1 .11-.78.42-1.3.76-1.6-2.67-.3-5.47-1.33-5.47-5.93 0-1.31.47-2.38 1.24-3.22-.12-.3-.54-1.52.12-3.18 0 0 1.01-.32 3.3 1.23a11.5 11.5 0 0 1 6 0c2.29-1.55 3.3-1.23 3.3-1.23.66 1.66.24 2.88.12 3.18.77.84 1.24 1.91 1.24 3.22 0 4.61-2.81 5.62-5.49 5.92.43.37.81 1.1.81 2.22 0 1.61-.01 2.9-.01 3.3 0 .32.22.7.82.58A10.996 10.996 0 0 0 24 12.5C24 5.87 18.63.5 12 .5Z" />
      </svg>
    );
  }
  return null;
}

export function Footer() {
  const socials = getActiveSocialLinks();
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-border bg-surface">
      <Container className="py-12">
        <div className="grid gap-10 md:grid-cols-3">
          <div>
            <p className="font-medium text-foreground">{siteConfig.displayName}</p>
            <p className="mt-2 text-sm text-muted">{siteConfig.role}</p>
          </div>

          <nav aria-label="Footer">
            <p className="label mb-4">Navigate</p>
            <ul className="space-y-2">
              {navigation.map((item) => (
                <li key={item.href + item.label}>
                  <Link
                    href={item.href}
                    className="text-sm text-muted hover:text-foreground"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div>
            <p className="label mb-4">Connect</p>
            {socials.length === 0 ? (
              <p className="text-sm text-muted">
                Additional profiles will be linked when available.
              </p>
            ) : (
              <ul className="space-y-2">
                {socials.map((link) => (
                  <li key={link.platform}>
                    <a
                      href={link.url}
                      className="inline-flex items-center gap-2 text-sm text-muted hover:text-foreground"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <SocialIcon platform={link.icon} />
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        <Divider className="my-8" />
        <p className="text-xs text-muted">
          © {year} {siteConfig.displayName}. All rights reserved.
        </p>
      </Container>
    </footer>
  );
}
