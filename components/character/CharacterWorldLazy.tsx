"use client";

import dynamic from "next/dynamic";
import { Suspense, useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { bootConfig } from "@/data/bootConfig";
import { characterConfig } from "@/data/characterConfig";
import { isPageRevealed, onPageRevealed } from "@/lib/boot/reveal";

const World = dynamic(() => import("./CharacterWorld").then((mod) => mod.CharacterWorld), {
  ssr: false,
  loading: () => null,
});

export function CharacterWorldLazy() {
  const path = usePathname();
  const [ready, setReady] = useState(!bootConfig.ENABLE_INITIAL_LOADER || isPageRevealed());
  const [idleReady, setIdleReady] = useState(false);

  useEffect(() => {
    if (path !== "/") return undefined;
    const reveal = () => setReady(true);
    const off = onPageRevealed(reveal);
    const fallback = window.setTimeout(reveal, 3200);
    return () => {
      off();
      window.clearTimeout(fallback);
    };
  }, [path]);

  useEffect(() => {
    if (path !== "/" || !ready) {
      setIdleReady(false);
      return undefined;
    }
    const idle = window.setTimeout(() => setIdleReady(true), 120);
    return () => window.clearTimeout(idle);
  }, [path, ready]);

  if (!characterConfig.enabled || !characterConfig.is3DModelEnabled) return null;
  if (path !== "/") return null;
  if (!ready || !idleReady) return null;

  return (
    <Suspense fallback={null}>
      <World />
    </Suspense>
  );
}
