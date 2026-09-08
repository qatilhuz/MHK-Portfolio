"use client";

import dynamic from "next/dynamic";
import { usePathname } from "next/navigation";

const World = dynamic(
  () => import("./CharacterWorld").then((mod) => mod.CharacterWorld),
  { ssr: false },
);

export function CharacterWorldLazy() {
  const path = usePathname();
  if (path !== "/") return null;
  return <World />;
}
