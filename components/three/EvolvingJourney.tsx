"use client";

import dynamic from "next/dynamic";

const EvolvingJourneyCanvas = dynamic(
  () => import("./EvolvingJourneyCanvas").then((mod) => mod.EvolvingJourneyCanvas),
  {
    ssr: false,
    loading: () => (
      <div
        className="pointer-events-none absolute right-[12%] top-[8%] -z-10 h-36 w-36 rounded-full bg-[radial-gradient(circle,rgba(103,232,249,0.14),rgba(34,211,238,0.04)_38%,transparent_70%)] blur-sm"
        aria-hidden="true"
      />
    ),
  },
);

export function EvolvingJourney() {
  return <EvolvingJourneyCanvas />;
}
