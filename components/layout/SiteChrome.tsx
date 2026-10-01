"use client";

import { useLayoutEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { CharacterWorldLazy } from "@/components/character/CharacterWorldLazy";
import { GuideProvider } from "@/lib/guide/context";
import { AmbientBackground } from "@/components/ui/AmbientBackground";
import { ARCADE_EXIT_FLAG } from "@/lib/arcade/session";
import { clearArcadeSpatialZoom, runArcadeReturnZoom } from "@/lib/arcade/spatialZoom";
import { Footer } from "./Footer";
import { Navbar } from "./Navbar";

export function SiteChrome({ children }: { children: React.ReactNode }) {
  const path = usePathname();
  const arcade = path === "/arcade";
  const spatialRootRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    if (arcade) return;

    try {
      if (sessionStorage.getItem(ARCADE_EXIT_FLAG) === "exit") {
        runArcadeReturnZoom(spatialRootRef.current, () => {
          try {
            sessionStorage.removeItem(ARCADE_EXIT_FLAG);
          } catch {
            /* ignore blocked storage */
          }
        });
      } else {
        clearArcadeSpatialZoom(spatialRootRef.current);
      }
    } catch {
      /* keep route rendering resilient if storage is blocked */
    }
  }, [arcade]);

  if (arcade) {
    return <div className="min-h-dvh bg-background">{children}</div>;
  }

  return (
    <GuideProvider>
      <div ref={spatialRootRef} data-arcade-spatial-root className="relative isolate min-h-screen">
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
