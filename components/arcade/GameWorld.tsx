"use client";

import dynamic from "next/dynamic";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { trackEvent } from "@/lib/analytics/client";
import type { ArcadeGameId } from "@/lib/arcade/gameTypes";
import { arcadeGames } from "./ArcadeMenu";

const RockPaperScissors = dynamic(() =>
  import("./games/RockPaperScissors").then((mod) => mod.RockPaperScissors),
);
const Snake = dynamic(() => import("./games/Snake").then((mod) => mod.Snake));
const MemoryGame = dynamic(() => import("./games/MemoryGame").then((mod) => mod.MemoryGame));
const ReactionTest = dynamic(() =>
  import("./games/ReactionTest").then((mod) => mod.ReactionTest),
);

const futureSlots = [
  { id: "lane", title: "Neon Lane", note: "Coming online" },
  { id: "orbit", title: "Orbit Drift", note: "Coming online" },
];

export function GameWorld({ onExit }: { onExit: () => void }) {
  const [game, setGame] = useState<ArcadeGameId | null>(null);

  const back = () => setGame(null);
  const select = (id: ArcadeGameId) => {
    trackEvent("arcade_game_start", { game: id });
    setGame(id);
  };

  if (game === "rps") return <RockPaperScissors onBack={back} />;
  if (game === "snake") return <Snake onBack={back} />;
  if (game === "memory") return <MemoryGame onBack={back} />;
  if (game === "reaction") return <ReactionTest onBack={back} />;

  return (
    <div className="arcade-world">
      <div className="arcade-world-grid" aria-hidden="true" />
      <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="label text-accent">Inside the monitor</p>
          <h3 className="mt-2">Game world</h3>
          <p className="mt-1 max-w-xl text-sm text-muted">
            Four playable prototypes live here. Extra cabinets are wired for later titles.
          </p>
        </div>
        <Button type="button" size="sm" variant="secondary" onClick={onExit}>
          Leave arcade
        </Button>
      </div>
      <ul className="grid gap-4 sm:grid-cols-2">
        {arcadeGames.map((item) => (
          <li key={item.id}>
            <div className="arcade-cabinet flex h-full flex-col p-5">
              <h3>{item.title}</h3>
              <p className="mt-2 flex-1 text-sm text-muted">{item.summary}</p>
              <Button className="mt-4" type="button" variant="secondary" onClick={() => select(item.id)}>
                Play {item.title}
              </Button>
            </div>
          </li>
        ))}
        {futureSlots.map((slot) => (
          <li key={slot.id}>
            <div className="arcade-cabinet arcade-cabinet-locked flex h-full flex-col p-5">
              <h3>{slot.title}</h3>
              <p className="mt-2 flex-1 text-sm text-muted">{slot.note}</p>
              <p className="mt-4 font-mono text-xs uppercase tracking-[0.16em] text-muted">Offline</p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
