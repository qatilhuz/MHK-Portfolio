import type { ArcadeGameId, ArcadeGameMeta } from "./gameTypes";

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

export const futureCabinets = [
  { id: "lane", title: "Neon Lane", note: "Coming online" },
  { id: "orbit", title: "Orbit Drift", note: "Coming online" },
] as const;

export function isArcadeGameId(value: string): value is ArcadeGameId {
  return arcadeGames.some((game) => game.id === value);
}
