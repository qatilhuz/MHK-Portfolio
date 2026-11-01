"use client";

import { useCallback } from "react";
import { smoothScrollTo } from "@/lib/motion/scrollTo";

interface SkipProjectsButtonProps {
  /** Selector for the section that follows the reel. */
  targetSelector: string;
  /** Fallback when the target is missing: the end of this section. */
  fallbackRef: React.RefObject<HTMLElement | null>;
}

/**
 * Bottom-right escape hatch for the reel.
 *
 * Lives inside the sticky stage, so it is physically scoped to the section —
 * it cannot outlive it the way a `fixed` element would. CinemaReel fades the
 * wrapper in once the reel actually owns the screen and back out at the end.
 *
 * Deliberately no backdrop-blur: a backdrop-filter sitting over a scrubbing
 * 3D scene forces the compositor to re-read the layers beneath it every
 * frame, which is exactly the stutter this section was just tuned to remove.
 * The flat translucent surface plus a neon rim reads the same at a glance.
 */
export function SkipProjectsButton({
  targetSelector,
  fallbackRef,
}: SkipProjectsButtonProps) {
  const handleSkip = useCallback(() => {
    if (document.querySelector(targetSelector)) {
      // -1px so the next section lands flush under the sticky navbar rather
      // than one hairline short of it.
      smoothScrollTo(targetSelector, { duration: 1.5, offset: -1 });
      return;
    }
    const section = fallbackRef.current;
    if (section) {
      smoothScrollTo(section, {
        duration: 1.5,
        offset: section.offsetHeight,
      });
    }
  }, [targetSelector, fallbackRef]);

  return (
    <div
      data-reel-skip
      className="pointer-events-none absolute bottom-16 right-[var(--page-gutter)] z-50 sm:bottom-20 md:bottom-24"
    >
      <button
        type="button"
        onClick={handleSkip}
        className="group/skip pointer-events-auto inline-flex min-h-11 items-center gap-3 rounded-full border border-cyan-200/25 bg-[#0b0d13]/90 px-5 py-3 font-mono text-[10px] font-semibold uppercase tracking-[0.24em] text-cyan-100 shadow-[0_8px_30px_rgba(3,5,10,0.85),0_0_22px_rgba(34,211,238,0.14)] transition-[background-color,border-color,color,box-shadow,transform] duration-[var(--motion-micro)] ease-out hover:-translate-y-0.5 hover:border-cyan-100/70 hover:bg-accent hover:text-accent-foreground hover:shadow-[0_8px_30px_rgba(3,5,10,0.85),0_0_30px_rgba(59,130,246,0.5)] focus-visible:-translate-y-0.5 md:text-[11px]"
      >
        <span>Skip Projects</span>
        <span
          className="text-sm leading-none transition-transform duration-[var(--motion-micro)] ease-out group-hover/skip:translate-x-0.5 group-hover/skip:translate-y-0.5"
          aria-hidden="true"
        >
          ↘
        </span>
      </button>
    </div>
  );
}
