"use client";

import { Smile } from "lucide-react";
import { requestEmote } from "@/lib/character/emoteBus";

export function CharacterFallback({ label = "Guide online" }: { label?: string }) {
  return (
    <>
      <div
        className="pointer-events-none fixed bottom-4 left-4 z-[90] flex flex-col items-center gap-2"
        data-character-world
        data-character-fallback
        aria-hidden
      >
        <div className="relative h-28 w-20 drop-shadow-[0_0_22px_rgba(56,189,248,0.38)]">
          <div className="absolute left-1/2 top-0 h-8 w-10 -translate-x-1/2 rounded-[1rem] border border-cyan-200/55 bg-slate-200 shadow-[inset_0_0_10px_rgba(15,23,42,0.18)]">
            <div className="absolute left-1/2 top-3 h-2 w-7 -translate-x-1/2 rounded-full bg-cyan-400 shadow-[0_0_12px_rgba(56,189,248,0.9)]" />
          </div>
          <div className="absolute left-1/2 top-8 h-14 w-16 -translate-x-1/2 rounded-[1.25rem] border border-cyan-300/35 bg-slate-900 shadow-[inset_0_0_18px_rgba(56,189,248,0.18)]">
            <div className="absolute left-1/2 top-4 h-5 w-5 -translate-x-1/2 rounded-full border border-cyan-100/70 bg-cyan-400 shadow-[0_0_18px_rgba(56,189,248,0.95)]" />
            <div className="absolute left-2 top-5 h-8 w-1 rounded-full bg-cyan-300/75" />
            <div className="absolute right-2 top-5 h-8 w-1 rounded-full bg-cyan-300/75" />
          </div>
          <div className="absolute left-0 top-12 h-9 w-3 -rotate-12 rounded-full bg-slate-700" />
          <div className="absolute right-0 top-12 h-9 w-3 rotate-12 rounded-full bg-slate-700" />
          <div className="absolute bottom-0 left-6 h-9 w-3 rounded-full bg-slate-700" />
          <div className="absolute bottom-0 right-6 h-9 w-3 rounded-full bg-slate-700" />
        </div>
        <div className="rounded-full border border-cyan-300/25 bg-slate-950/80 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.16em] text-cyan-100 shadow-[0_0_18px_rgba(56,189,248,0.16)]">
          {label}
        </div>
      </div>
      <button
        type="button"
        className="pointer-events-auto fixed bottom-3 right-3 z-[100] flex h-11 w-11 items-center justify-center rounded-full border border-border bg-surface/95 text-accent shadow-[var(--shadow)] transition-[transform,filter] duration-[var(--transition-fast)] hover:brightness-110 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
        aria-label="Open character emotes"
        data-character-ui
        onClick={() => requestEmote("wave")}
      >
        <Smile className="h-5 w-5" aria-hidden />
      </button>
    </>
  );
}
