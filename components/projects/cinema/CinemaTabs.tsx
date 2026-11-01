"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { cinemaCategories } from "@/data/cinemaProjects";
import { cn } from "@/lib/utils";
import type { CinemaCategoryId } from "@/types";

interface CinemaTabsProps {
  active: CinemaCategoryId;
  counts: Record<CinemaCategoryId, number>;
  onChange: (id: CinemaCategoryId) => void;
}

/**
 * Sticky category switcher for the reel.
 *
 * The highlight is one absolutely-positioned pill that slides to the measured
 * geometry of the selected tab, rather than a per-button background: it keeps
 * a single compositor layer moving and reads as one continuous object.
 */
export function CinemaTabs({ active, counts, onChange }: CinemaTabsProps) {
  const listRef = useRef<HTMLDivElement>(null);
  const tabRefs = useRef(new Map<CinemaCategoryId, HTMLButtonElement>());
  const [marker, setMarker] = useState({ left: 0, width: 0, ready: false });

  const measure = useCallback(() => {
    const list = listRef.current;
    const node = tabRefs.current.get(active);
    if (!list || !node) return;
    setMarker({
      left: node.offsetLeft,
      width: node.offsetWidth,
      ready: true,
    });
  }, [active]);

  useLayoutEffect(measure, [measure]);

  useEffect(() => {
    if (typeof ResizeObserver === "undefined") {
      window.addEventListener("resize", measure);
      return () => window.removeEventListener("resize", measure);
    }
    const observer = new ResizeObserver(measure);
    if (listRef.current) observer.observe(listRef.current);
    return () => observer.disconnect();
  }, [measure]);

  // Fonts landing after hydration shift tab widths; re-measure once they do.
  useEffect(() => {
    const fonts = document.fonts;
    if (!fonts?.ready) return;
    let cancelled = false;
    void fonts.ready.then(() => {
      if (!cancelled) measure();
    });
    return () => {
      cancelled = true;
    };
  }, [measure]);

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key !== "ArrowRight" && event.key !== "ArrowLeft") return;
    event.preventDefault();
    const order = cinemaCategories.map((category) => category.id);
    const current = order.indexOf(active);
    const step = event.key === "ArrowRight" ? 1 : -1;
    const next = order[(current + step + order.length) % order.length];
    onChange(next);
    tabRefs.current.get(next)?.focus();
  };

  return (
    <div
      ref={listRef}
      role="tablist"
      aria-label="Project categories"
      onKeyDown={handleKeyDown}
      className="relative inline-flex flex-wrap items-center gap-1 rounded-full border border-white/[0.08] bg-black/45 p-1.5"
    >
      <span
        aria-hidden="true"
        className={cn(
          "pointer-events-none absolute left-0 top-1.5 bottom-1.5 rounded-full border border-cyan-200/35 bg-accent/15 shadow-[0_0_24px_rgba(59,130,246,0.35),inset_0_1px_0_rgba(255,255,255,0.1)]",
          marker.ready
            ? "opacity-100 transition-[transform,width,opacity] duration-[550ms] ease-[cubic-bezier(0.22,1,0.36,1)]"
            : "opacity-0",
        )}
        style={{
          transform: `translate3d(${marker.left}px,0,0)`,
          width: marker.width,
        }}
      />

      {cinemaCategories.map((category) => {
        const selected = category.id === active;
        return (
          <button
            key={category.id}
            ref={(node) => {
              if (node) tabRefs.current.set(category.id, node);
              else tabRefs.current.delete(category.id);
            }}
            type="button"
            role="tab"
            id={`reel-tab-${category.id}`}
            aria-selected={selected}
            aria-controls="reel-stage"
            tabIndex={selected ? 0 : -1}
            onClick={() => onChange(category.id)}
            className={cn(
              "relative z-10 inline-flex items-center gap-2 rounded-full px-4 py-2 font-mono text-[10px] uppercase tracking-[0.22em] transition-colors duration-[var(--motion-micro)] md:px-5 md:text-[11px]",
              selected
                ? "text-cyan-50"
                : "text-muted hover:text-foreground/85",
            )}
          >
            {category.label}
            <span
              className={cn(
                "text-[9px] tabular-nums transition-colors duration-[var(--motion-micro)]",
                selected ? "text-cyan-200/80" : "text-muted/60",
              )}
            >
              {String(counts[category.id] ?? 0).padStart(2, "0")}
            </span>
          </button>
        );
      })}
    </div>
  );
}
