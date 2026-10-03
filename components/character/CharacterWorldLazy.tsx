"use client";

import dynamic from "next/dynamic";
import { Suspense, useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { characterConfig } from "@/data/characterConfig";
import { CharacterFallback } from "./CharacterFallback";

const World = dynamic(() => import("./CharacterWorld").then((mod) => mod.CharacterWorld), {
  ssr: false,
  loading: () => <CharacterFallback label="Guide loading" />,
});

export function CharacterWorldLazy() {
  const path = usePathname();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    if (path !== "/") {
      setMounted(false);
      return undefined;
    }

    const frame = window.requestAnimationFrame(() => setMounted(true));
    const fallback = window.setTimeout(() => setMounted(true), 600);
    return () => {
      window.cancelAnimationFrame(frame);
      window.clearTimeout(fallback);
    };
  }, [path]);

  if (!characterConfig.enabled || !characterConfig.is3DModelEnabled) return null;
  if (path !== "/") return null;
  if (!mounted) return <CharacterFallback label="Guide loading" />;

  return (
    <Suspense fallback={<CharacterFallback label="Guide loading" />}>
      <World />
    </Suspense>
  );
}
