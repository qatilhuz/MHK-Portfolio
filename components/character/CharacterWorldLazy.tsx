"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { bootConfig } from "@/data/bootConfig";
import { characterConfig } from "@/data/characterConfig";
import { isPageRevealed, onPageRevealed } from "@/lib/boot/reveal";

const World = dynamic(() => import("./CharacterWorld").then((mod) => mod.CharacterWorld), {
  ssr: false,
});

export function CharacterWorldLazy() {
  const path = usePathname();
  const [ready, setReady] = useState(!bootConfig.ENABLE_INITIAL_LOADER || isPageRevealed());

  useEffect(() => onPageRevealed(() => setReady(true)), []);

  if (!characterConfig.enabled || !characterConfig.is3DModelEnabled) return null;
  if (path !== "/") return null;
  if (!ready) return null;
  return <World />;
}
