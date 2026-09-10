"use client";

import { useEffect, useId, useRef, useState } from "react";
import { Smile } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { EMOTES } from "@/data/emotes";
import { requestEmote } from "@/lib/character/emoteBus";
import { beginSpeechVisemes, endSpeechVisemes } from "@/lib/character/visemes";
import { useGuide } from "@/lib/guide/context";

export function CharacterHud({
  x,
  y,
  line,
}: {
  x: number;
  y: number;
  line: string | null;
}) {
  const guide = useGuide();
  const [open, setOpen] = useState(false);
  const panel = useRef<HTMLDivElement>(null);
  const menuId = useId();

  const text = line ?? (guide?.guided ? guide.message : null);

  useEffect(() => {
    if (text) beginSpeechVisemes(text);
    else endSpeechVisemes();
  }, [text]);

  useEffect(() => {
    if (!open) return;
    const onDoc = (event: MouseEvent) => {
      if (panel.current && !panel.current.contains(event.target as Node)) setOpen(false);
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    window.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  if (!guide?.visible) return null;

  const vw = typeof window !== "undefined" ? window.innerWidth : 360;
  const vh = typeof window !== "undefined" ? window.innerHeight : 640;
  const bubbleW = Math.min(272, Math.max(160, vw - 24));
  const placed = x > 1 && y > 1;
  const preferRight = placed && x < vw * 0.45;
  let left = 12;
  if (placed) {
    left = preferRight ? x + 12 : x - bubbleW - 12;
    left = Math.min(vw - bubbleW - 12, Math.max(12, left));
  }
  const top = placed ? Math.min(vh - 140, Math.max(8, y - 96)) : undefined;

  return (
    <>
      {text || guide.guided ? (
        <div
          className="pointer-events-none fixed z-[56] max-w-[calc(100vw-24px)]"
          style={placed ? { left, top, width: bubbleW } : { left: 12, right: 12, bottom: 16 }}
          aria-label="Portfolio host"
        >
          <div className="pointer-events-auto w-full max-w-[calc(100vw-24px)] overflow-hidden rounded-[var(--radius-md)] border border-border bg-surface/95 px-3 py-2 shadow-[var(--shadow)]">
            {text ? (
              <p className="break-words text-sm leading-relaxed text-foreground" aria-live="polite">
                {text}
              </p>
            ) : null}
            {guide.guided ? (
              <div className={text ? "mt-2 flex flex-wrap gap-2" : "flex flex-wrap gap-2"}>
                <Button type="button" size="sm" variant="secondary" onClick={guide.skip}>
                  Skip Intro
                </Button>
                {guide.voiceSupported && guide.voiceBlocked && !guide.muted ? (
                  <Button type="button" size="sm" onClick={guide.enableVoice}>
                    Enable Voice
                  </Button>
                ) : (
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    onClick={() => guide.setMuted(!guide.muted)}
                    aria-pressed={guide.muted}
                  >
                    {guide.muted ? "Unmute" : "Mute"}
                  </Button>
                )}
              </div>
            ) : null}
          </div>
        </div>
      ) : null}

      <div ref={panel} className="pointer-events-auto fixed bottom-3 right-3 z-[58]">
        {open ? (
          <div
            id={menuId}
            role="menu"
            aria-label="Character emotes"
            className="mb-2 grid max-h-[min(52vh,420px)] w-[min(calc(100vw-24px),280px)] grid-cols-2 gap-1 overflow-y-auto rounded-[var(--radius-md)] border border-border bg-surface/95 p-2 shadow-[var(--shadow)]"
          >
            {EMOTES.map((emote) => (
              <button
                key={emote.id}
                type="button"
                role="menuitem"
                className="flex min-h-11 items-center gap-2 rounded-[var(--radius-md)] px-2 py-1.5 text-left text-sm text-foreground transition-colors hover:bg-surface-secondary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
                onClick={() => {
                  requestEmote(emote.id);
                  setOpen(false);
                }}
              >
                <span aria-hidden className="text-base">
                  {emote.icon}
                </span>
                {emote.label}
              </button>
            ))}
          </div>
        ) : null}
        <button
          type="button"
          className="ml-auto flex h-11 w-11 items-center justify-center rounded-full border border-border bg-surface/95 text-accent shadow-[var(--shadow)] transition-[transform,filter] duration-[var(--transition-fast)] hover:brightness-110 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
          aria-label="Open character emotes"
          aria-expanded={open}
          aria-controls={menuId}
          onClick={() => setOpen((value) => !value)}
        >
          <Smile className="h-5 w-5" aria-hidden />
        </button>
      </div>
    </>
  );
}
