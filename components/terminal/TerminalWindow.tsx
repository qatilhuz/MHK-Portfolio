"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  terminalIntro,
  type BootStatus,
  type IntroStep,
} from "@/data/terminalIntro";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { useTerminalIntro } from "@/hooks/useTerminalIntro";
import { identifyTerminalCommand } from "@/lib/analytics/classify";
import { trackEvent } from "@/lib/analytics/client";
import { runTerminalCommand } from "@/lib/terminal/registry";
import type { TerminalOutput } from "@/lib/terminal/types";
import { cn } from "@/lib/utils";
import { LiveStats } from "./LiveStats";
import { StackMatrix } from "./StackMatrix";
import { TerminalOutputView } from "./TerminalOutputView";

interface Line {
  id: number;
  prompt: string;
  output: TerminalOutput | null;
}

const USER = "guest@hyper-mind";

/* ------------------------------------------------------------------ *
 * Pieces
 * ------------------------------------------------------------------ */

function Caret() {
  return (
    <span
      className="inline-block h-[1em] w-[0.55em] translate-y-[0.12em] animate-pulse rounded-[1px] bg-cyan-300/90"
      aria-hidden="true"
    />
  );
}

function Prompt({
  command,
  caret = false,
}: {
  command: string;
  caret?: boolean;
}) {
  return (
    <p className="flex flex-wrap items-baseline gap-x-2 font-mono text-[12px] sm:text-sm">
      <span className="shrink-0 text-white/35">
        {USER}
        <span className="text-cyan-400">:~$</span>
      </span>
      <span className="min-w-0 break-all text-cyan-300">{command}</span>
      {caret ? <Caret /> : null}
    </p>
  );
}

const STATUS_GLYPH: Record<BootStatus, { text: string; className: string }> = {
  ok: { text: "OK", className: "text-green-400 border-green-400/25" },
  info: { text: "··", className: "text-cyan-300 border-cyan-300/25" },
  warn: { text: "»»", className: "text-amber-300 border-amber-300/25" },
};

function BootLine({
  label,
  value,
  status,
}: {
  label: string;
  value: string;
  status: BootStatus;
}) {
  const glyph = STATUS_GLYPH[status];
  return (
    <p className="flex items-center gap-2.5 font-mono text-[11px] sm:text-xs">
      <span
        className={cn(
          "w-9 shrink-0 rounded border bg-white/[0.03] py-0.5 text-center text-[10px] tracking-[0.1em]",
          glyph.className,
        )}
      >
        {glyph.text}
      </span>
      <span className="truncate text-white/55">{label}</span>
      {/* Dotted leader. A flex spacer rather than a run of literal dots, so it
          cannot wrap into a second line of punctuation on a narrow screen. */}
      <span
        className="h-px min-w-3 flex-1 border-b border-dotted border-white/15"
        aria-hidden="true"
      />
      <span className="shrink-0 text-green-400/85">{value}</span>
    </p>
  );
}

/* ------------------------------------------------------------------ *
 * Window
 * ------------------------------------------------------------------ */

export function TerminalWindow() {
  const shellRef = useRef<HTMLDivElement>(null);
  const logRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const reduced = useReducedMotion();
  /** The terminal has been seen; the intro may run. One-way. */
  const [awake, setAwake] = useState(false);
  /** The window is on screen right now; the stats sampler follows this. */
  const [visible, setVisible] = useState(false);
  /** The 3D entrance has landed, so the glass can afford a backdrop filter. */
  const [settled, setSettled] = useState(false);

  const intro = useTerminalIntro(terminalIntro, { enabled: awake, reduced });

  const [lines, setLines] = useState<Line[]>([]);
  const [value, setValue] = useState("");
  const [history, setHistory] = useState<string[]>([]);
  const [cursor, setCursor] = useState(-1);

  /* ---------------------------------------------------------------- *
   * Entrance
   * ---------------------------------------------------------------- */

  useGSAP(
    () => {
      const shell = shellRef.current;
      if (!shell) return;

      gsap.registerPlugin(useGSAP, ScrollTrigger);

      // Gates the frame-rate sampler. Created before the reduced-motion
      // bail-out so the readout still works when animation is turned off.
      ScrollTrigger.create({
        trigger: shell,
        start: "top bottom",
        end: "bottom top",
        onToggle: (self) => setVisible(self.isActive),
      });

      // The window has landed. Two things wait on this moment.
      //
      // The boot sequence used to start on first sight, which meant it was
      // typing — and re-rendering this tree a couple of dozen times a second —
      // while the 3D entrance was still being scrubbed. React reconciliation
      // layered on top of a scrubbed transform is what the stutter was. It
      // also reads better: the window arrives, *then* the OS comes up.
      //
      // The glass frosting waits for the same moment, for the same reason.
      ScrollTrigger.create({
        trigger: shell,
        start: reduced ? "top bottom-=10%" : "center center+=12%",
        end: "bottom top",
        onToggle: (self) => {
          setSettled(self.isActive);
          if (self.isActive) setAwake(true);
        },
      });

      if (reduced) return;

      gsap.set(shell, {
        transformPerspective: 1100,
        transformOrigin: "50% 65%",
        force3D: true,
      });

      // Cinematic arrival: the window comes in small and tilted off-axis and
      // squares up to the camera as it reaches the middle of the screen.
      // Linear, because the scrub is already the easing — a curve on top of a
      // scrub fights the scroll wheel.
      gsap.fromTo(
        shell,
        {
          autoAlpha: 0,
          scale: 0.82,
          rotateX: 12,
          rotateY: -8,
          yPercent: 7,
          rotationZ: 0.01,
        },
        {
          autoAlpha: 1,
          scale: 1,
          rotateX: 0,
          rotateY: 0,
          yPercent: 0,
          rotationZ: 0.01,
          ease: "none",
          force3D: true,
          scrollTrigger: {
            trigger: shell,
            start: "top bottom-=5%",
            end: "center center+=12%",
            scrub: 1.2,
            invalidateOnRefresh: true,
            // will-change is granted for the length of the move and handed
            // back afterwards, rather than pinning a layer for the whole page.
            onToggle: (self) =>
              gsap.set(shell, {
                willChange: self.isActive ? "transform, opacity" : "auto",
              }),
          },
        },
      );
    },
    { scope: shellRef, dependencies: [reduced], revertOnUpdate: true },
  );

  /* ---------------------------------------------------------------- *
   * Log autoscroll
   * ---------------------------------------------------------------- */

  /**
   * Scrolls the log, and only the log.
   *
   * Deliberately not bottomRef.scrollIntoView(): that walks up the tree and
   * scrolls *every* scrollable ancestor, the document included. With Lenis
   * driving the page that lands as a lurch, which is the exact problem the
   * data-lenis-prevent work above exists to stop. Setting scrollTop on the
   * container cannot escape it.
   */
  const scrollLogToBottom = (smooth: boolean) => {
    const log = logRef.current;
    if (!log) return;
    log.scrollTo({
      top: log.scrollHeight,
      behavior: smooth && !reduced ? "smooth" : "auto",
    });
  };

  // A submitted command always wins. The visitor just asked for this output,
  // so take them to it even if they had scrolled back up to read something.
  useEffect(() => {
    if (!lines.length) return;
    scrollLogToBottom(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lines.length]);

  // The intro only chases the bottom if the visitor is already down there,
  // and never smoothly: one queued smooth scroll per typed character would
  // fight itself.
  useEffect(() => {
    const log = logRef.current;
    if (!log || intro.complete) return;
    const distance = log.scrollHeight - log.scrollTop - log.clientHeight;
    if (distance < 160) scrollLogToBottom(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [intro.done, intro.typed, intro.complete]);

  /* ---------------------------------------------------------------- *
   * REPL
   * ---------------------------------------------------------------- */

  const execute = (command: string) => {
    const trimmed = command.trim();
    if (!trimmed) return;
    trackEvent("terminal_command_used", {
      commandId: identifyTerminalCommand(trimmed),
    });
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
  };

  /**
   * Skipping is an explicit request for the prompt, so hand it over. Focus
   * without scrolling: the window may be only partly on screen, and yanking
   * the page to it would be worse than the intro they just dismissed.
   */
  const handleSkip = () => {
    intro.skip();
    requestAnimationFrame(() =>
      inputRef.current?.focus({ preventScroll: true }),
    );
  };

  const onSubmit = (event: FormEvent) => {
    event.preventDefault();
    execute(value);
  };

  const onKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Escape" && !intro.complete) {
      event.preventDefault();
      handleSkip();
      return;
    }
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

  /* ---------------------------------------------------------------- *
   * Intro rendering
   * ---------------------------------------------------------------- */

  const renderStep = (step: IntroStep, index: number) => {
    const running = index === intro.done;

    // A command is the only step visible while it is still in flight: the
    // characters land one at a time. Everything else appears once its beat
    // has elapsed.
    if (step.kind === "command") {
      if (index > intro.done) return null;
      return (
        <Prompt
          key={step.id}
          command={running ? intro.typed : step.text}
          caret={running}
        />
      );
    }

    if (index >= intro.done) return null;

    if (step.kind === "boot") {
      return (
        <BootLine
          key={step.id}
          label={step.label}
          value={step.value}
          status={step.status}
        />
      );
    }

    if (step.kind === "note") {
      return (
        <p
          key={step.id}
          className="border-l-2 border-green-400/40 pl-3 font-mono text-[11px] text-green-300/80 sm:text-xs"
        >
          {step.text}
        </p>
      );
    }

    return (
      <div key={step.id} className="pl-1">
        {step.render === "stack" ? (
          <StackMatrix />
        ) : (
          <LiveStats live={visible} />
        )}
      </div>
    );
  };

  /* ---------------------------------------------------------------- *
   * Render
   * ---------------------------------------------------------------- */

  return (
    <div ref={shellRef} className="relative [backface-visibility:hidden]">
      <div
        className={cn(
          "relative overflow-hidden rounded-2xl border border-white/10",
          // Was bg-black/60 + backdrop-blur-xl. A 24px backdrop filter has to
          // re-read and re-blur everything behind the panel every frame, and
          // the ambient blobs back there never stop drifting — so it was
          // burning GPU time continuously, not just during the entrance. The
          // surface is now mostly opaque and the filter is a token 4px, which
          // keeps the glass edge without paying for it.
          "bg-[#0a0b0f]/90",
          "shadow-[0_40px_120px_-50px_rgba(34,211,238,0.45),inset_0_1px_0_rgba(255,255,255,0.07)]",
          settled && "backdrop-blur-sm",
        )}
      >
        {/* ---------- title bar ---------- */}
        <header className="relative flex items-center gap-2 border-b border-white/10 bg-white/[0.035] px-4 py-3">
          <span className="flex shrink-0 gap-2" aria-hidden="true">
            <span className="h-3 w-3 rounded-full bg-[#ff5f57]" />
            <span className="h-3 w-3 rounded-full bg-[#febc2e]" />
            <span className="h-3 w-3 rounded-full bg-[#28c840]" />
          </span>

          <p className="pointer-events-none absolute inset-x-0 text-center font-mono text-[11px] tracking-tight text-white/45 sm:text-xs">
            huzaifa@hyper-mind: ~
          </p>

          <span className="ml-auto shrink-0">
            {intro.complete ? (
              <span className="flex items-center gap-1.5 font-mono text-[9px] uppercase tracking-[0.2em] text-green-400/80">
                <span className="h-1 w-1 animate-pulse rounded-full bg-green-400" />
                live
              </span>
            ) : (
              <button
                type="button"
                onClick={handleSkip}
                className="rounded border border-white/10 px-2 py-1 font-mono text-[9px] uppercase tracking-[0.2em] text-white/40 transition-colors duration-[var(--motion-micro)] hover:border-cyan-300/40 hover:text-cyan-200"
              >
                skip intro
              </button>
            )}
          </span>
        </header>

        {/* ---------- output ---------- */}
        <div
          ref={logRef}
          // Lenis swallows wheel events globally; this attribute is the
          // documented opt-out. Lenis checks the event's composedPath for it
          // and bails, handing the gesture back to the browser so this div
          // scrolls natively. overscroll-contain then stops the scroll
          // chaining to the page once the log hits its end.
          data-lenis-prevent
          className="panel-scroll max-h-[26rem] min-h-[20rem] space-y-2.5 overflow-y-auto overscroll-contain p-5 leading-relaxed sm:max-h-[30rem] sm:p-6"
        >
          {/* aria-live is off here on purpose: a boot sequence announced line
              by line would bury a screen reader. The text stays readable by
              normal navigation, and the REPL below announces properly. */}
          <div className="space-y-2" aria-live="off">
            {terminalIntro.map(renderStep)}
          </div>

          <div
            className="space-y-4 pt-2"
            role="log"
            aria-live="polite"
            aria-relevant="additions"
          >
            {lines.map((line) => (
              <div key={line.id} className="space-y-2">
                <Prompt command={line.prompt} />
                {line.output ? (
                  <TerminalOutputView output={line.output} />
                ) : null}
              </div>
            ))}
          </div>

          {/* End-of-log marker. Doubles as breathing room so the last line is
              never flush against the edge of the scroll box. */}
          <div ref={bottomRef} className="h-2" aria-hidden="true" />
        </div>

        {/* ---------- prompt ---------- */}
        <form
          className="flex items-center gap-2.5 border-t border-white/10 bg-white/[0.02] px-5 py-3.5 sm:px-6"
          onSubmit={onSubmit}
          onClick={() => {
            if (!intro.complete) handleSkip();
          }}
        >
          <label htmlFor="terminal-input" className="sr-only">
            Terminal command
          </label>
          <span
            className="hidden shrink-0 font-mono text-sm text-white/35 sm:inline"
            aria-hidden="true"
          >
            {USER}
            <span className="text-cyan-400">:~$</span>
          </span>
          <input
            ref={inputRef}
            id="terminal-input"
            value={value}
            onChange={(event) => setValue(event.target.value)}
            onKeyDown={onKeyDown}
            autoComplete="off"
            spellCheck={false}
            disabled={!intro.complete}
            className="h-10 min-w-0 flex-1 rounded-lg border border-white/[0.08] bg-white/[0.03] px-3 font-mono text-sm text-cyan-200 caret-cyan-300 outline-none transition-colors duration-[var(--motion-micro)] placeholder:text-white/25 focus:border-cyan-400/40 focus:ring-1 focus:ring-cyan-500/50 disabled:cursor-pointer disabled:text-white/30"
            placeholder={
              intro.complete ? "help, about, skills, projects…" : "booting…"
            }
          />
          <button
            type="submit"
            disabled={!intro.complete}
            className="h-10 shrink-0 rounded-lg border border-cyan-300/25 bg-cyan-300/10 px-4 font-mono text-[10px] uppercase tracking-[0.2em] text-cyan-200 outline-none transition-colors duration-[var(--motion-micro)] hover:border-cyan-200/60 hover:bg-cyan-300/20 focus:ring-1 focus:ring-cyan-500/50 disabled:opacity-30"
          >
            run
          </button>
        </form>
      </div>
    </div>
  );
}
