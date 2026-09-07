"use client";

import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import type { ProjectMedia } from "@/types";

export function ScreenshotGallery({ images }: { images: ProjectMedia[] }) {
  const [active, setActive] = useState<number | null>(null);

  const close = useCallback(() => setActive(null), []);
  const prev = useCallback(() => {
    setActive((index) =>
      index === null ? index : (index + images.length - 1) % images.length,
    );
  }, [images.length]);
  const next = useCallback(() => {
    setActive((index) =>
      index === null ? index : (index + 1) % images.length,
    );
  }, [images.length]);

  useEffect(() => {
    if (active === null) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") close();
      if (event.key === "ArrowLeft") prev();
      if (event.key === "ArrowRight") next();
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [active, close, next, prev]);

  if (images.length === 0) return null;

  return (
    <>
      <ul className="grid gap-4 sm:grid-cols-2">
        {images.map((image, index) => (
          <li key={image.src}>
            <button
              type="button"
              className="block w-full overflow-hidden rounded-[var(--radius-md)] border border-border text-left"
              onClick={() => setActive(index)}
            >
              <Image
                src={image.src}
                alt={image.alt}
                width={1280}
                height={720}
                className="h-auto w-full"
                loading="lazy"
              />
            </button>
          </li>
        ))}
      </ul>

      {active !== null ? (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={images[active].alt}
          className="fixed inset-0 z-[70] flex items-center justify-center bg-background/90 p-4"
        >
          <button
            type="button"
            className="absolute right-4 top-4 text-sm text-muted hover:text-foreground"
            onClick={close}
          >
            Close
          </button>
          {images.length > 1 ? (
            <>
              <button
                type="button"
                className="absolute left-4 top-1/2 -translate-y-1/2 text-sm text-muted hover:text-foreground"
                onClick={prev}
              >
                Previous
              </button>
              <button
                type="button"
                className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-muted hover:text-foreground"
                onClick={next}
              >
                Next
              </button>
            </>
          ) : null}
          <Image
            src={images[active].src}
            alt={images[active].alt}
            width={1600}
            height={900}
            className="max-h-[90vh] w-auto max-w-full"
            priority
          />
        </div>
      ) : null}
    </>
  );
}
