"use client";

import { useEffect, useRef } from "react";
import { Button } from "@/components/ui/Button";
import { ArcadeShell } from "../ArcadeShell";
import { useSnakeGame, type Dir } from "@/hooks/useSnakeGame";

export function Snake({ onBack }: { onBack: () => void }) {
  const game = useSnakeGame();
  const { start, turn } = game;
  const touch = useRef<{ x: number; y: number } | null>(null);
  const runningRef = useRef(game.running);
  runningRef.current = game.running;

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      const map: Record<string, Dir> = {
        ArrowUp: "up",
        ArrowDown: "down",
        ArrowLeft: "left",
        ArrowRight: "right",
        w: "up",
        s: "down",
        a: "left",
        d: "right",
      };
      const next = map[event.key];
      if (!next) return;
      event.preventDefault();
      if (!runningRef.current) start();
      turn(next);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [start, turn]);

  const onTouchStart = (event: React.TouchEvent) => {
    const point = event.changedTouches[0];
    touch.current = { x: point.clientX, y: point.clientY };
  };
  const onTouchEnd = (event: React.TouchEvent) => {
    if (!touch.current) return;
    const point = event.changedTouches[0];
    const dx = point.clientX - touch.current.x;
    const dy = point.clientY - touch.current.y;
    if (Math.max(Math.abs(dx), Math.abs(dy)) < 24) return;
    const next: Dir =
      Math.abs(dx) > Math.abs(dy)
        ? dx > 0
          ? "right"
          : "left"
        : dy > 0
          ? "down"
          : "up";
    if (!game.running) game.start();
    game.turn(next);
  };

  const cells = Array.from({ length: game.size * game.size }, (_, index) => {
    const x = index % game.size;
    const y = Math.floor(index / game.size);
    const isHead = game.snake[0]?.x === x && game.snake[0]?.y === y;
    const isBody = game.snake.some((cell) => cell.x === x && cell.y === y);
    const isFood = game.food.x === x && game.food.y === y;
    return { x, y, isHead, isBody, isFood };
  });

  return (
    <ArcadeShell
      title="Snake"
      instructions="Arrows or WASD. On touch, swipe the board or use the pads. Speed increases with score."
      status={
        game.over
          ? `Game over. Score ${game.score}. Best ${game.best}.`
          : `Score ${game.score} · Best ${game.best} · ${game.running ? "Playing" : "Press start or a direction"}`
      }
      onBack={onBack}
      onRestart={game.reset}
    >
      <div
        className="mx-auto grid max-w-md touch-none gap-px rounded-[var(--radius-md)] border border-border bg-border p-px"
        style={{ gridTemplateColumns: `repeat(${game.size}, minmax(0, 1fr))` }}
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
        role="img"
        aria-label="Snake board"
      >
        {cells.map((cell) => (
          <div
            key={`${cell.x}-${cell.y}`}
            className={
              cell.isHead
                ? "aspect-square bg-accent"
                : cell.isBody
                  ? "aspect-square bg-accent/50"
                  : cell.isFood
                    ? "aspect-square bg-foreground"
                    : "aspect-square bg-surface"
            }
          />
        ))}
      </div>
      <div className="mt-4 grid grid-cols-3 gap-2 sm:hidden">
        <span />
        <Button type="button" onClick={() => game.turn("up")}>
          Up
        </Button>
        <span />
        <Button type="button" onClick={() => game.turn("left")}>
          Left
        </Button>
        <Button type="button" onClick={game.start} variant="secondary">
          Start
        </Button>
        <Button type="button" onClick={() => game.turn("right")}>
          Right
        </Button>
        <span />
        <Button type="button" onClick={() => game.turn("down")}>
          Down
        </Button>
      </div>
    </ArcadeShell>
  );
}
