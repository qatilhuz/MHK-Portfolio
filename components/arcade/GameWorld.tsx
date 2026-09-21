"use client";

import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { trackEvent } from "@/lib/analytics/client";
import { arcadeGames, futureCabinets } from "@/lib/arcade/registry";
import { ARCADE_EXIT_FLAG } from "@/lib/arcade/portal";
import type { ArcadeGameId } from "@/lib/arcade/gameTypes";

const RockPaperScissors = dynamic(() =>
  import("./games/RockPaperScissors").then((mod) => mod.RockPaperScissors),
);
const Snake = dynamic(() => import("./games/Snake").then((mod) => mod.Snake));
const MemoryGame = dynamic(() => import("./games/MemoryGame").then((mod) => mod.MemoryGame));
const ReactionTest = dynamic(() =>
  import("./games/ReactionTest").then((mod) => mod.ReactionTest),
);

export function GameWorld() {
  const router = useRouter();
  const [game, setGame] = useState<ArcadeGameId | null>(null);

  const exit = useCallback(() => {
    sessionStorage.setItem(ARCADE_EXIT_FLAG, "exit");
    router.push("/#arcade");
  }, [router]);

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        if (game) setGame(null);
        else exit();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [exit, game]);

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
    <div className="arcade-world relative min-h-dvh px-4 py-8 sm:px-8">
      <div className="arcade-world-grid" aria-hidden="true" />
      <div className="relative mx-auto max-w-5xl">
        <div className="mb-8 flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="label text-accent">Inside the monitor</p>
            <h1 className="mt-2">Game world</h1>
            <p className="mt-2 max-w-xl text-sm text-muted">
              Four playable prototypes. Extra cabinets stay offline until the next drop.
            </p>
          </div>
          <Button type="button" variant="secondary" onClick={exit}>
            Exit Arcade
          </Button>
        </div>
        <ul className="grid gap-4 sm:grid-cols-2">
          {arcadeGames.map((item) => (
            <li key={item.id}>
              <div className="arcade-cabinet flex h-full flex-col p-5">
                <h2 className="text-lg">{item.title}</h2>
                <p className="mt-2 flex-1 text-sm text-muted">{item.summary}</p>
                <Button className="mt-4" type="button" variant="secondary" onClick={() => select(item.id)}>
                  Play {item.title}
                </Button>
              </div>
            </li>
          ))}
          {futureCabinets.map((slot) => (
            <li key={slot.id}>
              <div className="arcade-cabinet arcade-cabinet-locked flex h-full flex-col p-5">
                <h2 className="text-lg">{slot.title}</h2>
                <p className="mt-2 flex-1 text-sm text-muted">{slot.note}</p>
                <p className="mt-4 font-mono text-xs uppercase tracking-[0.16em] text-muted">Offline</p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
