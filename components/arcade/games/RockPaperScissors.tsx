"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { ArcadeShell } from "../ArcadeShell";
import { randomInt } from "@/lib/arcade/gameUtils";
import { maxScore } from "@/lib/arcade/storage";

const CHOICES = ["Rock", "Paper", "Scissors"] as const;
type Choice = (typeof CHOICES)[number];

function outcome(player: Choice, cpu: Choice) {
  if (player === cpu) return "draw";
  if (
    (player === "Rock" && cpu === "Scissors") ||
    (player === "Paper" && cpu === "Rock") ||
    (player === "Scissors" && cpu === "Paper")
  ) {
    return "win";
  }
  return "loss";
}

export function RockPaperScissors({ onBack }: { onBack: () => void }) {
  const [wins, setWins] = useState(0);
  const [losses, setLosses] = useState(0);
  const [draws, setDraws] = useState(0);
  const [last, setLast] = useState("Choose a move.");
  const [best, setBest] = useState(() =>
    typeof window === "undefined" ? 0 : maxScore("rps-wins", 0),
  );

  const play = (player: Choice) => {
    const cpu = CHOICES[randomInt(3)];
    const result = outcome(player, cpu);
    if (result === "win") {
      const next = wins + 1;
      setWins(next);
      setBest(maxScore("rps-wins", next));
      setLast(`You: ${player}. Computer: ${cpu}. You win.`);
    } else if (result === "loss") {
      setLosses((value) => value + 1);
      setLast(`You: ${player}. Computer: ${cpu}. You lose.`);
    } else {
      setDraws((value) => value + 1);
      setLast(`You: ${player}. Computer: ${cpu}. Draw.`);
    }
  };

  const restart = () => {
    setWins(0);
    setLosses(0);
    setDraws(0);
    setLast("Choose a move.");
  };

  return (
    <ArcadeShell
      title="Rock Paper Scissors"
      instructions="Keyboard: focus a move and press Enter. Best win streak this session is stored locally."
      status={`${last} Wins ${wins} · Losses ${losses} · Draws ${draws} · Best wins ${best}`}
      onBack={onBack}
      onRestart={restart}
    >
      <div className="flex flex-wrap gap-3">
        {CHOICES.map((choice) => (
          <Button key={choice} type="button" onClick={() => play(choice)}>
            {choice}
          </Button>
        ))}
      </div>
    </ArcadeShell>
  );
}
