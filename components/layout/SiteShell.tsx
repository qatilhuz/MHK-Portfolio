import { CharacterWorldLazy } from "@/components/character/CharacterWorldLazy";
import { GuideProvider } from "@/lib/guide/context";
import { AmbientBackground } from "@/components/ui/AmbientBackground";
import { Footer } from "./Footer";
import { Navbar } from "./Navbar";

export function SiteShell({ children }: { children: React.ReactNode }) {
  return (
    <GuideProvider>
      <div className="relative isolate min-h-screen">
        <AmbientBackground variant="page" />
        <div className="relative z-[1] flex min-h-screen flex-col">
          <Navbar />
          <main id="main-content" className="flex-1">
            {children}
          </main>
          <Footer />
        </div>
        <CharacterWorldLazy />
      </div>
    </GuideProvider>
  );
}
