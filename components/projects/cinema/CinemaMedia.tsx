"use client";

import { useEffect, useRef, useState } from "react";
import type { CinemaProject } from "@/types";

/**
 * Virtual desktop viewport every embed is rendered at before being scaled
 * down. Without this an iframe inherits the card's real width and the framed
 * site snaps to its mobile breakpoint, which looks nothing like the product.
 */
const VIRTUAL_WIDTH = 1440;
const VIRTUAL_HEIGHT = 900;

interface MediaProps {
  project: CinemaProject;
  /**
   * Mount the real element. The reel keeps this false until the card has been
   * reached once, then leaves it true for the rest of the session.
   */
  load: boolean;
  /** True only for the card currently centred in the reel. */
  active: boolean;
}

/* ------------------------------------------------------------------ *
 * Shared chrome
 * ------------------------------------------------------------------ */

function Scanlines() {
  return (
    <div
      className="pointer-events-none absolute inset-0 z-20 opacity-[0.18] [background-image:repeating-linear-gradient(to_bottom,rgba(255,255,255,0.05)_0px,rgba(255,255,255,0.05)_1px,transparent_1px,transparent_3px)]"
      aria-hidden="true"
    />
  );
}

function Skeleton({ label }: { label: string }) {
  return (
    <div
      className="absolute inset-0 z-0 flex items-center justify-center bg-[radial-gradient(ellipse_70%_60%_at_50%_40%,rgba(59,130,246,0.14),rgba(9,9,11,0)_72%)]"
      aria-hidden="true"
    >
      <div className="flex items-center gap-3 font-mono text-[10px] uppercase tracking-[0.3em] text-muted">
        <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-accent shadow-[0_0_12px_rgba(59,130,246,0.9)]" />
        {label}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ *
 * Pending slate — stands in for media that has not been captured yet
 * ------------------------------------------------------------------ */

function PendingSlate({ project }: { project: CinemaProject }) {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-[linear-gradient(145deg,#0b0f17,#0a0a0e_45%,#0d0a14)] px-6 text-center">
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.14] [background-image:linear-gradient(rgba(255,255,255,0.07)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.07)_1px,transparent_1px)] [background-size:56px_56px]"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_60%_55%_at_50%_45%,rgba(124,58,237,0.16),rgba(9,9,11,0)_70%)]"
        aria-hidden="true"
      />
      <p className="relative font-mono text-[10px] uppercase tracking-[0.34em] text-cyan-100/70">
        {project.mediaType === "embed" ? "Embed pending" : "Reel pending"}
      </p>
      <p className="relative max-w-sm text-balance text-sm leading-relaxed text-muted">
        Drop the capture at the path below and set{" "}
        <code className="text-cyan-100/80">pending: false</code> in{" "}
        <code className="text-cyan-100/80">data/cinemaProjects.ts</code>.
      </p>
      <code className="relative max-w-full truncate border border-border bg-background/70 px-3 py-2 font-mono text-[11px] text-foreground/80">
        {project.mediaUrl}
      </code>
    </div>
  );
}

/* ------------------------------------------------------------------ *
 * Blocked embed — the site refuses to be framed, so show the still
 * ------------------------------------------------------------------ */

function BlockedSlate({ project }: { project: CinemaProject }) {
  return (
    <div className="absolute inset-0 overflow-hidden bg-[#06070b]">
      {project.poster ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={project.poster}
          alt=""
          className="absolute inset-0 h-full w-full object-cover object-top"
        />
      ) : (
        <div
          className="absolute inset-0 bg-[linear-gradient(145deg,#0b0f17,#0a0a0e_45%,#0d0a14)]"
          aria-hidden="true"
        >
          <div className="absolute inset-0 opacity-[0.14] [background-image:linear-gradient(rgba(255,255,255,0.07)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.07)_1px,transparent_1px)] [background-size:56px_56px]" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_55%_at_50%_42%,rgba(59,130,246,0.18),rgba(9,9,11,0)_70%)]" />
        </div>
      )}
      <p className="absolute left-1/2 top-1/2 w-full max-w-sm -translate-x-1/2 -translate-y-1/2 px-6 text-center font-mono text-[10px] uppercase leading-5 tracking-[0.26em] text-cyan-100/70">
        Live site blocks embedding
        <span className="mt-2 block text-[9px] tracking-[0.22em] text-muted">
          Open it in a new tab instead
        </span>
      </p>
      <Scanlines />
    </div>
  );
}

/* ------------------------------------------------------------------ *
 * Embed — a live site, rendered at desktop width and scaled to fit
 * ------------------------------------------------------------------ */

function EmbedFrame({ project, load }: { project: CinemaProject; load: boolean }) {
  const hostRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const host = hostRef.current;
    if (!host || typeof ResizeObserver === "undefined") return;

    const measure = (width: number, height: number) => {
      if (!width || !height) return;
      // Cover, not contain: the frame should never letterbox inside the card.
      setScale(Math.max(width / VIRTUAL_WIDTH, height / VIRTUAL_HEIGHT));
    };

    const observer = new ResizeObserver((entries) => {
      const rect = entries[0]?.contentRect;
      if (rect) measure(rect.width, rect.height);
    });
    observer.observe(host);
    measure(host.clientWidth, host.clientHeight);

    return () => observer.disconnect();
  }, []);

  return (
    <div ref={hostRef} className="absolute inset-0 overflow-hidden bg-[#06070b]">
      <Skeleton label="Establishing live preview" />
      {load && scale > 0 ? (
        <iframe
          title={`${project.title} live preview`}
          src={project.mediaUrl}
          // Inert by design: the frame is scenery, never a scroll trap.
          tabIndex={-1}
          aria-hidden="true"
          scrolling="no"
          loading="lazy"
          referrerPolicy="no-referrer"
          sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
          onLoad={() => setLoaded(true)}
          style={{
            width: VIRTUAL_WIDTH,
            height: VIRTUAL_HEIGHT,
            transform: `translateX(-50%) scale(${scale})`,
            transformOrigin: "top center",
          }}
          className={`absolute left-1/2 top-0 z-10 border-0 bg-white transition-opacity duration-700 ease-out ${
            loaded ? "opacity-100" : "opacity-0"
          }`}
        />
      ) : null}
      <Scanlines />
    </div>
  );
}

/* ------------------------------------------------------------------ *
 * Video — plays only while its card owns the stage
 * ------------------------------------------------------------------ */

function VideoFrame({
  project,
  load,
  active,
}: {
  project: CinemaProject;
  load: boolean;
  active: boolean;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    if (active) {
      const played = video.play();
      if (played) played.catch(() => undefined);
    } else {
      video.pause();
    }
  }, [active, loaded]);

  return (
    <div className="absolute inset-0 overflow-hidden bg-[#06070b]">
      <Skeleton label="Cueing reel" />
      {load ? (
        <video
          ref={videoRef}
          src={project.mediaUrl}
          poster={project.poster}
          autoPlay
          loop
          muted
          playsInline
          preload="metadata"
          tabIndex={-1}
          aria-label={`${project.title} demo reel`}
          onLoadedData={() => setLoaded(true)}
          className={`absolute inset-0 z-10 h-full w-full object-cover transition-opacity duration-700 ease-out ${
            loaded ? "opacity-100" : "opacity-0"
          }`}
        />
      ) : null}
      <Scanlines />
    </div>
  );
}

/* ------------------------------------------------------------------ *
 * Public switch
 * ------------------------------------------------------------------ */

/**
 * Renders whichever media the card declares.
 *
 * Both branches are pointer-inert: the media is scenery for the scroll
 * sequence, so nothing inside it can swallow a wheel event or steal focus.
 * The outbound link on the card is the only way to actually reach the site.
 */
export function CinemaMedia({ project, load, active }: MediaProps) {
  return (
    <div
      className="pointer-events-none absolute inset-0 select-none [&_iframe]:pointer-events-none [&_video]:pointer-events-none"
      aria-hidden="true"
    >
      {project.pending ? (
        <PendingSlate project={project} />
      ) : project.mediaType === "embed" ? (
        project.embedBlocked ? (
          <BlockedSlate project={project} />
        ) : (
          <EmbedFrame project={project} load={load} />
        )
      ) : (
        <VideoFrame project={project} load={load} active={active} />
      )}
    </div>
  );
}
