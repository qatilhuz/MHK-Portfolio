"use client";

import { Button } from "@/components/ui/Button";
import type { ArcadeGameId, ArcadeGameMeta } from "@/lib/arcade/gameTypes";

export const arcadeGames: ArcadeGameMeta[] = [
  {
    id: "rps",
    title: "Rock Paper Scissors",
    summary: "Classic three-move match against a random computer pick.",
  },
  {
    id: "snake",
    title: "Snake",
    summary: "Grow, avoid walls, and pick up food. Keyboard and swipe.",
  },
  {
    id: "memory",
    title: "Memory Game",
    summary: "Match geometric pairs. Fewer moves is better.",
  },
  {
    id: "reaction",
    title: "Reaction Speed Test",
    summary: "Wait for the signal, then tap. False starts count.",
  },
];

export function ArcadeMenu({
  onSelect,
}: {
  onSelect: (id: ArcadeGameId) => void;
}) {
  return (
    <ul className="grid gap-4 sm:grid-cols-2">
      {arcadeGames.map((game) => (
        <li key={game.id}>
          <div className="flex h-full flex-col rounded-[var(--radius-lg)] border border-border bg-surface p-5">
            <h3>{game.title}</h3>
            <p className="mt-2 flex-1 text-sm text-muted">{game.summary}</p>
            <Button
              className="mt-4"
              type="button"
              variant="secondary"
              onClick={() => onSelect(game.id)}
            >
              Play {game.title}
            </Button>
          </div>
        </li>
      ))}
    </ul>
  );
}
