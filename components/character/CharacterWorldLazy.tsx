"use client";

import dynamic from "next/dynamic";
import { usePathname } from "next/navigation";
import { characterConfig } from "@/data/characterConfig";

const World = dynamic(
  () => import("./CharacterWorld").then((mod) => mod.CharacterWorld),
  { ssr: false },
);

export function CharacterWorldLazy() {
  const path = usePathname();
  if (!characterConfig.enabled) return null;
  if (path !== "/") return null;
  return <World />;
}
