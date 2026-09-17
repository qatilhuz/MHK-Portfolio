import { SiteChrome } from "./SiteChrome";

export function SiteShell({ children }: { children: React.ReactNode }) {
  return <SiteChrome>{children}</SiteChrome>;
}
