"use client";

import dynamic from "next/dynamic";

const CyberpunkRainCanvas = dynamic(
  () => import("./CyberpunkRainCanvas").then((mod) => mod.CyberpunkRainCanvas),
  {
    ssr: false,
    loading: () => (
      <div
        className="pointer-events-none absolute inset-0 z-0 bg-[radial-gradient(ellipse_at_50%_35%,rgba(8,145,178,0.08),transparent_58%),linear-gradient(180deg,rgba(2,6,23,0.2),transparent_45%,rgba(2,6,23,0.48))]"
        aria-hidden="true"
      />
    ),
  },
);

export function CyberpunkRain() {
  return <CyberpunkRainCanvas />;
}
