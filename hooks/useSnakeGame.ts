"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { randomInt } from "@/lib/arcade/gameUtils";
import { maxScore } from "@/lib/arcade/storage";

export type Dir = "up" | "down" | "left" | "right";

const SIZE = 14;

function spawn(occupied: { x: number; y: number }[]) {
  let cell = { x: randomInt(SIZE), y: randomInt(SIZE) };
  while (occupied.some((item) => item.x === cell.x && item.y === cell.y)) {
    cell = { x: randomInt(SIZE), y: randomInt(SIZE) };
  }
  return cell;
}

export function useSnakeGame() {
  const [snake, setSnake] = useState([{ x: 6, y: 6 }]);
  const [food, setFood] = useState({ x: 9, y: 6 });
  const [dir, setDir] = useState<Dir>("right");
  const [score, setScore] = useState(0);
  const [best, setBest] = useState(0);
  const [over, setOver] = useState(false);
  const [running, setRunning] = useState(false);
  const dirRef = useRef<Dir>("right");
  const snakeRef = useRef(snake);
  const foodRef = useRef(food);
  const overRef = useRef(false);

  useEffect(() => {
    setBest(maxScore("snake-best", 0));
  }, []);

  const reset = useCallback(() => {
    const start = [{ x: 6, y: 6 }];
    setSnake(start);
    snakeRef.current = start;
    const nextFood = { x: 9, y: 6 };
    setFood(nextFood);
    foodRef.current = nextFood;
    setDir("right");
    dirRef.current = "right";
    setScore(0);
    setOver(false);
    overRef.current = false;
    setRunning(true);
  }, []);

  const turn = useCallback((next: Dir) => {
    const current = dirRef.current;
    if (
      (current === "up" && next === "down") ||
      (current === "down" && next === "up") ||
      (current === "left" && next === "right") ||
      (current === "right" && next === "left")
    ) {
      return;
    }
    dirRef.current = next;
    setDir(next);
  }, []);

  useEffect(() => {
    if (!running || over) return;
    const delay = Math.max(70, 180 - score * 8);
    const id = window.setInterval(() => {
      const body = snakeRef.current;
      const head = body[0];
      const d = dirRef.current;
      const next = {
        x: head.x + (d === "left" ? -1 : d === "right" ? 1 : 0),
        y: head.y + (d === "up" ? -1 : d === "down" ? 1 : 0),
      };
      const hitWall =
        next.x < 0 || next.x >= SIZE || next.y < 0 || next.y >= SIZE;
      const hitSelf = body.some((cell) => cell.x === next.x && cell.y === next.y);
      if (hitWall || hitSelf) {
        overRef.current = true;
        setOver(true);
        setRunning(false);
        return;
      }
      const grew =
        next.x === foodRef.current.x && next.y === foodRef.current.y;
      const nextSnake = grew ? [next, ...body] : [next, ...body.slice(0, -1)];
      snakeRef.current = nextSnake;
      setSnake(nextSnake);
      if (grew) {
        const nextScore = score + 1;
        setScore((value) => {
          const updated = value + 1;
          setBest(maxScore("snake-best", updated));
          return updated;
        });
        const placed = spawn(nextSnake);
        foodRef.current = placed;
        setFood(placed);
        void nextScore;
      }
    }, delay);
    return () => window.clearInterval(id);
  }, [running, over, score]);

  return {
    size: SIZE,
    snake,
    food,
    dir,
    score,
    best,
    over,
    running,
    reset,
    turn,
    start: reset,
  };
}
