"use client";

import dynamic from "next/dynamic";
import { useState } from "react";
import type { ArcadeGameId } from "@/lib/arcade/gameTypes";
import { ArcadeMenu } from "./ArcadeMenu";

const RockPaperScissors = dynamic(() =>
  import("./games/RockPaperScissors").then((mod) => mod.RockPaperScissors),
);
const Snake = dynamic(() => import("./games/Snake").then((mod) => mod.Snake));
const MemoryGame = dynamic(() =>
  import("./games/MemoryGame").then((mod) => mod.MemoryGame),
);
const ReactionTest = dynamic(() =>
  import("./games/ReactionTest").then((mod) => mod.ReactionTest),
);

export function ArcadeBoard() {
  const [game, setGame] = useState<ArcadeGameId | null>(null);
  const back = () => setGame(null);

  if (game === "rps") return <RockPaperScissors onBack={back} />;
  if (game === "snake") return <Snake onBack={back} />;
  if (game === "memory") return <MemoryGame onBack={back} />;
  if (game === "reaction") return <ReactionTest onBack={back} />;

  return <ArcadeMenu onSelect={setGame} />;
}
