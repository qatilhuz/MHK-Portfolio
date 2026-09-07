"use client";

import { FormEvent, useRef, useState } from "react";
import { Button } from "@/components/ui/Button";
import { runTerminalCommand } from "@/lib/terminal/registry";
import type { TerminalOutput } from "@/lib/terminal/types";
import { TerminalOutputView } from "./TerminalOutputView";

interface Line {
  id: number;
  prompt: string;
  output: TerminalOutput | null;
}

export function TerminalWindow() {
  const [lines, setLines] = useState<Line[]>([
    {
      id: 0,
      prompt: "help",
      output: runTerminalCommand("help") as TerminalOutput,
    },
  ]);
  const [value, setValue] = useState("");
  const [history, setHistory] = useState<string[]>([]);
  const [cursor, setCursor] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const logRef = useRef<HTMLDivElement>(null);

  const execute = (command: string) => {
    const trimmed = command.trim();
    if (!trimmed) return;
    const result = runTerminalCommand(trimmed);
    if (result === "clear") {
      setLines([]);
    } else {
      setLines((prev) => [
        ...prev,
        { id: Date.now(), prompt: trimmed, output: result },
      ]);
    }
    setHistory((prev) => [...prev, trimmed]);
    setCursor(-1);
    setValue("");
    requestAnimationFrame(() => {
      logRef.current?.scrollTo({ top: logRef.current.scrollHeight });
    });
  };

  const onSubmit = (event: FormEvent) => {
    event.preventDefault();
    execute(value);
  };

  const onKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "ArrowUp") {
      event.preventDefault();
      if (!history.length) return;
      const next = cursor < 0 ? history.length - 1 : Math.max(0, cursor - 1);
      setCursor(next);
      setValue(history[next]);
    }
    if (event.key === "ArrowDown") {
      event.preventDefault();
      if (cursor < 0) return;
      const next = cursor + 1;
      if (next >= history.length) {
        setCursor(-1);
        setValue("");
        return;
      }
      setCursor(next);
      setValue(history[next]);
    }
  };

  return (
    <div className="overflow-hidden rounded-[var(--radius-lg)] border border-border bg-surface shadow-[var(--shadow)]">
      <div className="flex items-center gap-2 border-b border-border bg-surface-secondary px-4 py-2">
        <span className="h-2.5 w-2.5 rounded-full bg-border" aria-hidden />
        <span className="h-2.5 w-2.5 rounded-full bg-border" aria-hidden />
        <span className="h-2.5 w-2.5 rounded-full bg-accent/70" aria-hidden />
        <p className="ml-2 font-mono text-xs text-muted">huzaifa@portfolio — simulated</p>
      </div>
      <div
        ref={logRef}
        className="max-h-[22rem] space-y-4 overflow-y-auto p-4"
        role="log"
        aria-live="polite"
        aria-relevant="additions"
      >
        {lines.map((line) => (
          <div key={line.id} className="space-y-2">
            <p className="font-mono text-sm">
              <span className="text-muted">guest@mhk</span>
              <span className="text-accent">:~$</span> {line.prompt}
            </p>
            {line.output ? <TerminalOutputView output={line.output} /> : null}
          </div>
        ))}
      </div>
      <form
        className="flex flex-col gap-2 border-t border-border p-3 sm:flex-row sm:items-center"
        onSubmit={onSubmit}
      >
        <label htmlFor="terminal-input" className="sr-only">
          Terminal command
        </label>
        <span className="hidden font-mono text-sm text-muted sm:inline" aria-hidden>
          guest@mhk:~$
        </span>
        <input
          ref={inputRef}
          id="terminal-input"
          value={value}
          onChange={(event) => setValue(event.target.value)}
          onKeyDown={onKeyDown}
          autoComplete="off"
          spellCheck={false}
          className="h-11 flex-1 rounded-[var(--radius-md)] border border-border bg-background px-3 font-mono text-sm"
          placeholder="Type a command, then Enter"
        />
        <Button type="submit">Run</Button>
      </form>
    </div>
  );
}
