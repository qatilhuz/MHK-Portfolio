import { GuideDock } from "@/components/guide/GuideDock";
import { GuideProvider } from "@/lib/guide/context";
import { Footer } from "./Footer";
import { Navbar } from "./Navbar";

export function SiteShell({ children }: { children: React.ReactNode }) {
  return (
    <GuideProvider>
      <div className="flex min-h-screen flex-col">
        <Navbar />
        <main id="main-content" className="flex-1">
          {children}
        </main>
        <Footer />
        <GuideDock />
      </div>
    </GuideProvider>
  );
}
