"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { trackEvent } from "@/lib/analytics/client";
import { motionEngine, prefersReducedMotion } from "@/lib/motion/engine";
import { GameWorld } from "./GameWorld";
import { GamingSetup } from "./GamingSetup";

type Stage = "setup" | "world";

export function ArcadeExperience() {
  const [stage, setStage] = useState<Stage>("setup");
  const [busy, setBusy] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const overlay = useRef<HTMLDivElement>(null);
  const setup = useRef<HTMLDivElement>(null);

  useEffect(() => {
    trackEvent("arcade_open", undefined, { onceKey: "arcade_open" });
  }, []);

  const enter = useCallback(() => {
    if (busy || stage === "world") return;
    setBusy(true);

    if (prefersReducedMotion()) {
      setStage("world");
      setBusy(false);
      return;
    }

    const gsap = motionEngine();
    const veil = overlay.current;
    const desk = setup.current;
    if (!veil || !desk) {
      setStage("world");
      setBusy(false);
      return;
    }

    const ctx = gsap.context(() => {
      gsap.set(veil, { autoAlpha: 1, clipPath: "circle(8% at 48% 38%)", filter: "blur(0px)" });
      const tl = gsap.timeline({
        defaults: { ease: "power3.inOut" },
        onComplete: () => {
          setStage("world");
          gsap.set(veil, { autoAlpha: 0, clipPath: "circle(0% at 50% 50%)" });
          setBusy(false);
          ctx.revert();
        },
      });
      tl.to(desk, { scale: 1.55, y: -28, duration: 0.72, transformOrigin: "48% 36%" }, 0);
      tl.to(desk, { filter: "blur(10px)", duration: 0.45 }, 0.28);
      tl.to(veil, { clipPath: "circle(140% at 48% 38%)", duration: 0.85 }, 0.18);
      tl.to(veil, { filter: "blur(18px)", opacity: 0.92, duration: 0.35 }, 0.55);
    }, root);

    return () => ctx.revert();
  }, [busy, stage]);

  const exit = useCallback(() => {
    setStage("setup");
  }, []);

  useEffect(() => {
    if (stage !== "world") return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") exit();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [exit, stage]);

  return (
    <div ref={root} className="arcade-rig relative overflow-hidden rounded-[var(--radius-lg)]">
      {stage === "setup" ? (
        <div ref={setup} className="arcade-setup-layer">
          <GamingSetup onEnter={enter} disabled={busy} />
        </div>
      ) : (
        <GameWorld onExit={exit} />
      )}
      <div ref={overlay} className="arcade-portal" aria-hidden="true" />
    </div>
  );
}
