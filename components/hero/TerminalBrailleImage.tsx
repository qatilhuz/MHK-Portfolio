"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

const BRAILLE_BASE = 0x2800;
const CELL_WIDTH = 2;
const CELL_HEIGHT = 4;

/**
 * Unicode Braille dot positions read left-to-right, top-to-bottom.
 * The bit order is: 1 2 3 4 5 6 7 8.
 */
const BRAILLE_DOTS = [
  [0, 0], // dot 1
  [0, 1], // dot 2
  [0, 2], // dot 3
  [1, 0], // dot 4
  [1, 1], // dot 5
  [1, 2], // dot 6
  [0, 3], // dot 7
  [1, 3], // dot 8
] as const;

type ConverterStatus = "scanning" | "ready" | "failed";

type TerminalBrailleImageProps = {
  src?: string;
  columns?: number;
  threshold?: number;
  className?: string;
};

function loadImage(source: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    if (/^https?:\/\//.test(source)) {
      image.crossOrigin = "anonymous";
    }
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error(`Unable to load image: ${source}`));
    image.src = source;
  });
}

function luminance(data: Uint8ClampedArray, offset: number) {
  const alpha = data[offset + 3] / 255;
  return (0.2126 * data[offset] + 0.7152 * data[offset + 1] + 0.1522 * data[offset + 2]) * alpha;
}

function pixelsToBraille(data: Uint8ClampedArray, width: number, height: number, threshold: number) {
  const lines: string[] = [];

  for (let y = 0; y < height; y += CELL_HEIGHT) {
    let line = "";

    for (let x = 0; x < width; x += CELL_WIDTH) {
      let character = BRAILLE_BASE;

      BRAILLE_DOTS.forEach(([dotX, dotY], index) => {
        const pixelX = x + dotX;
        const pixelY = y + dotY;
        if (pixelX >= width || pixelY >= height) return;

        const offset = (pixelY * width + pixelX) * 4;
        if (luminance(data, offset) >= threshold) {
          character |= 1 << index;
        }
      });

      line += String.fromCharCode(character);
    }

    lines.push(line);
  }

  return lines;
}

function convertImageToBraille(image: HTMLImageElement, columns: number, threshold: number) {
  const sourceWidth = image.naturalWidth;
  const sourceHeight = image.naturalHeight;

  if (!sourceWidth || !sourceHeight) {
    throw new Error("The image does not report valid pixel dimensions.");
  }

  // Two terminal-spaces-to-one character-row keeps a square source visually square.
  const rows = Math.max(12, Math.round(columns * (sourceHeight / sourceWidth) * 0.5));
  const dotWidth = columns * CELL_WIDTH;
  const dotHeight = rows * CELL_HEIGHT;
  const canvas = document.createElement("canvas");
  canvas.width = dotWidth;
  canvas.height = dotHeight;

  const context = canvas.getContext("2d", { willReadFrequently: true });
  if (!context) {
    throw new Error("This browser could not create a readable 2D canvas.");
  }

  context.imageSmoothingEnabled = true;
  context.imageSmoothingQuality = "high";
  const scale = Math.max(dotWidth / sourceWidth, dotHeight / sourceHeight);
  const drawWidth = sourceWidth * scale;
  const drawHeight = sourceHeight * scale;
  const offsetX = (dotWidth - drawWidth) / 2;
  const offsetY = (dotHeight - drawHeight) / 2;

  context.drawImage(image, offsetX, offsetY, drawWidth, drawHeight);
  const { data } = context.getImageData(0, 0, dotWidth, dotHeight);
  return pixelsToBraille(data, dotWidth, dotHeight, threshold);
}

export function TerminalBrailleImage({
  src = "/images/mhk-braille-avatar.svg",
  columns = 58,
  threshold = 118,
  className,
}: TerminalBrailleImageProps) {
  const [brailleRows, setBrailleRows] = useState<string[]>([]);
  const [status, setStatus] = useState<ConverterStatus>("scanning");
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    const revealTimer = window.setTimeout(() => setRevealed(true), 1000);
    return () => window.clearTimeout(revealTimer);
  }, []);

  useEffect(() => {
    let cancelled = false;

    setStatus("scanning");
    setBrailleRows([]);

    loadImage(src)
      .then((image) => convertImageToBraille(image, columns, threshold))
      .then((rows) => {
        if (cancelled) return;
        setBrailleRows(rows);
        setStatus("ready");
      })
      .catch(() => {
        if (cancelled) return;
        setStatus("failed");
      });

    return () => {
      cancelled = true;
    };
  }, [columns, src, threshold]);

  const output = brailleRows.join("\n");
  const cellCount = brailleRows.length > 0 ? brailleRows.length * columns : 0;
  const shouldShowOutput = revealed && output.length > 0;

  return (
    <div
      data-in
      data-terminal-braille
      data-protocol="braille"
      className={cn(
        "terminal-braille-shell relative min-h-[420px] overflow-hidden rounded-[1.4rem] border border-cyan-200/15 bg-[linear-gradient(145deg,rgba(8,13,24,0.84),rgba(2,6,23,0.92))] backdrop-blur-2xl lg:min-h-[500px]",
        className,
      )}
    >
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(125,249,255,0.028)_1px,transparent_1px)] bg-[size:100%_7px] opacity-70" aria-hidden="true" />
      <div className="pointer-events-none absolute -right-20 -top-24 h-64 w-64 rounded-full bg-cyan-300/12 blur-3xl" aria-hidden="true" />
      <div className="pointer-events-none absolute -bottom-24 -left-16 h-64 w-64 rounded-full bg-violet-500/10 blur-3xl" aria-hidden="true" />

      <div className="relative flex h-10 items-center justify-between gap-3 border-b border-white/[0.08] bg-white/[0.035] px-4 font-mono sm:px-5">
        <div className="flex items-center gap-2" aria-hidden="true">
          <span className="h-3 w-3 rounded-full bg-rose-400 shadow-[0_0_14px_rgba(251,113,133,0.7)]" />
          <span className="h-3 w-3 rounded-full bg-amber-300 shadow-[0_0_14px_rgba(252,211,77,0.62)]" />
          <span className="h-3 w-3 rounded-full bg-emerald-300 shadow-[0_0_14px_rgba(110,231,183,0.65)]" />
        </div>
        <div className="min-w-0 truncate text-[10px] uppercase tracking-[0.2em] text-cyan-100/65">
          mhk@artifact:~/hero-protocol
        </div>
        <div className="hidden text-[10px] uppercase tracking-[0.2em] text-white/35 sm:block">utf-8</div>
      </div>

      <div className="relative flex min-h-[calc(100%-2.5rem)] flex-col p-3 font-mono sm:p-4 lg:p-5">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2 text-[10px] uppercase tracking-[0.18em]">
          <div className="text-white/40">
            <span className="text-cyan-200/85">mhk@artifact</span>
            <span className="text-fuchsia-300/70">:</span>
            <span className="text-cyan-300/70">~/image$</span>
          </div>
          <div className="inline-flex items-center gap-2 text-cyan-100/50">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-cyan-300 opacity-60" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-cyan-300" />
            </span>
            canvas-live
          </div>
        </div>

        <div className="rounded-2xl border border-cyan-200/[0.09] bg-black/32 p-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.045),inset_0_0_34px_rgba(34,211,238,0.035)] sm:p-4">
          <div className="mb-3 flex flex-wrap gap-x-2 gap-y-1 text-[11px] leading-relaxed text-white/70">
            <span className="text-emerald-300">$</span>
            <span className="break-all">
              render-image {src.replace("/images/", "./images/")} --protocol=braille --columns={columns}
            </span>
          </div>

          <div className="mb-3 flex flex-wrap gap-x-4 gap-y-1 border-y border-white/[0.06] py-2 text-[9px] uppercase tracking-[0.18em] text-white/36">
            <span>cell 2x4</span>
            <span>threshold {threshold}</span>
            <span>{status === "ready" ? `${cellCount} glyph cells` : "decoding pixels"}</span>
          </div>

          <div
            className="overflow-hidden rounded-xl border border-white/[0.055] bg-slate-950/62 px-2 py-3 shadow-[inset_0_0_28px_rgba(2,6,23,0.72)] sm:py-4"
            aria-live="polite"
          >
            {shouldShowOutput ? (
              <pre
                role="img"
                aria-label="Cyberpunk profile image rendered as Unicode Braille characters"
                className="braille-reveal mx-auto block max-w-full select-all overflow-hidden whitespace-pre text-center text-[clamp(0.375rem,0.7vw,0.625rem)] leading-[1.14] text-cyan-200 shadow-[0_0_18px_rgba(34,211,238,0.34)] [text-shadow:0_0_8px_rgba(103,232,249,0.72),0_0_20px_rgba(34,211,238,0.22)]"
              >
                {output}
              </pre>
            ) : (
              <div className="grid min-h-[232px] place-items-center text-center text-[10px] uppercase tracking-[0.24em] text-cyan-100/42">
                <div>
                  <span className="mb-2 block h-px w-28 bg-gradient-to-r from-transparent via-cyan-300/70 to-transparent" aria-hidden="true" />
                  {status === "failed" ? "image buffer unavailable" : revealed ? "sampling image cells…" : "arming unicode buffer…"}
                  <span className="mt-2 block h-px w-28 bg-gradient-to-r from-transparent via-cyan-300/70 to-transparent" aria-hidden="true" />
                </div>
              </div>
            )}
          </div>

          <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-[9px] uppercase tracking-[0.18em] text-white/35">
            <span className="text-cyan-100/55">
              {shouldShowOutput ? "process exited with code 0" : status === "failed" ? "renderer halted" : "renderer operating"}
            </span>
            <span className="hidden sm:inline">node-independent browser pipeline</span>
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between gap-3 text-[9px] uppercase tracking-[0.2em] text-white/38">
          <span className="inline-flex items-center gap-2 text-cyan-100/58">
            <span className="h-px w-8 bg-cyan-300/50" aria-hidden="true" />
            unicode U+2800 → U+28FF
          </span>
          <span>mhk hero/tty01</span>
        </div>
      </div>
    </div>
  );
}
