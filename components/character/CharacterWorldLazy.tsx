"use client";

import dynamic from "next/dynamic";
import { Suspense, useEffect } from "react";
import { usePathname } from "next/navigation";
import { characterConfig } from "@/data/characterConfig";

const loadCharacterWorld = () => import("./CharacterWorld").then((mod) => mod.CharacterWorld);

const World = dynamic(loadCharacterWorld, {
  ssr: false,
  loading: () => null,
});

export function CharacterWorldLazy() {
  const path = usePathname();

  useEffect(() => {
    if (path === "/") void loadCharacterWorld();
  }, [path]);

  if (!characterConfig.enabled || !characterConfig.is3DModelEnabled) return null;
  if (path !== "/") return null;

  return (
    <Suspense fallback={null}>
      <World />
    </Suspense>
  );
}
