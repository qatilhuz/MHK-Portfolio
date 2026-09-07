"use client";

import { useEffect, useMemo, useState } from "react";
import { trackEvent } from "@/lib/analytics/client";
import { ArcadeShell } from "../ArcadeShell";
import { shuffle } from "@/lib/arcade/gameUtils";
import { minScore } from "@/lib/arcade/storage";
import { cn } from "@/lib/utils";

const ICONS = ["▲", "●", "■", "◆", "★", "✦", "▣", "◉"];

interface Card {
  id: number;
  icon: string;
  matched: boolean;
}

function deck(): Card[] {
  return shuffle(
    ICONS.flatMap((icon, index) => [
      { id: index * 2, icon, matched: false },
      { id: index * 2 + 1, icon, matched: false },
    ]),
  );
}

export function MemoryGame({ onBack }: { onBack: () => void }) {
  const [cards, setCards] = useState(deck);
  const [open, setOpen] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [best, setBest] = useState(() =>
    typeof window === "undefined" ? 0 : minScore("memory-best", Number.POSITIVE_INFINITY),
  );
  const complete = cards.every((card) => card.matched);

  useEffect(() => {
    if (complete && moves > 0) {
      trackEvent("arcade_game_complete", { game: "memory" });
    }
  }, [complete, moves]);

  const status = useMemo(() => {
    if (complete) {
      return `Complete in ${moves} moves. Best ${Number.isFinite(best) ? best : moves}.`;
    }
    return `Moves ${moves}. Match the pairs.`;
  }, [best, complete, moves]);

  const flip = (id: number) => {
    if (complete) return;
    const card = cards.find((item) => item.id === id);
    if (!card || card.matched || open.includes(id) || open.length === 2) return;
    const nextOpen = [...open, id];
    setOpen(nextOpen);
    if (nextOpen.length < 2) return;
    const [a, b] = nextOpen.map((item) => cards.find((cardItem) => cardItem.id === item)!);
    setMoves((value) => value + 1);
    if (a.icon === b.icon) {
      const next = cards.map((item) =>
        item.icon === a.icon ? { ...item, matched: true } : item,
      );
      setCards(next);
      setOpen([]);
      if (next.every((item) => item.matched)) {
        setBest(minScore("memory-best", moves + 1));
      }
    } else {
      window.setTimeout(() => setOpen([]), 700);
    }
  };

  const restart = () => {
    setCards(deck());
    setOpen([]);
    setMoves(0);
  };

  return (
    <ArcadeShell
      title="Memory Game"
      instructions="Flip two cards. Geometric marks only — no copyrighted art."
      status={status}
      onBack={onBack}
      onRestart={restart}
    >
      <ul className="grid grid-cols-4 gap-2 sm:gap-3">
        {cards.map((card) => {
          const shown = card.matched || open.includes(card.id);
          return (
            <li key={card.id}>
              <button
                type="button"
                aria-label={shown ? `Card ${card.icon}` : "Face-down card"}
                aria-pressed={shown}
                className={cn(
                  "flex aspect-square w-full items-center justify-center rounded-[var(--radius-md)] border text-xl",
                  shown
                    ? "border-accent bg-accent-soft text-foreground"
                    : "border-border bg-surface-secondary text-muted",
                )}
                onClick={() => flip(card.id)}
              >
                {shown ? card.icon : "?"}
              </button>
            </li>
          );
        })}
      </ul>
    </ArcadeShell>
  );
}
