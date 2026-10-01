"use client";

import { useLayoutEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { CharacterWorldLazy } from "@/components/character/CharacterWorldLazy";
import { GuideProvider } from "@/lib/guide/context";
import { AmbientBackground } from "@/components/ui/AmbientBackground";
import { ARCADE_EXIT_FLAG, ARCADE_SPATIAL_SCALE } from "@/lib/arcade/session";
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
        const root = spatialRootRef.current;
        if (root) {
          root.style.transformOrigin = "50% 50%";
          root.style.transform = `scale(${ARCADE_SPATIAL_SCALE}) translateZ(0)`;
          root.style.opacity = "0";
          root.style.pointerEvents = "none";
          root.style.willChange = "transform, opacity";
        }
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
