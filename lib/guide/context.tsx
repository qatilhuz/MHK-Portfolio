"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { usePathname } from "next/navigation";
import { guidedSections } from "@/data/guide";
import { hitReactions, poseClip, sectionClip, type CharacterClip } from "@/data/character";
import { trackEvent } from "@/lib/analytics/client";
import type { GuidePhase, GuidePose } from "./types";
import { cancelGuideSpeech, guideSpeechSupported, speakGuideText } from "./speak";
import { guideAlreadyFinished, markGuideFinished } from "./storage";

interface GuideContextValue {
  visible: boolean;
  guided: boolean;
  phase: GuidePhase;
  index: number;
  pose: GuidePose;
  clip: CharacterClip;
  look: { x: number; y: number };
  message: string;
  reaction: string | null;
  muted: boolean;
  voiceSupported: boolean;
  voiceBlocked: boolean;
  enableVoice: () => void;
  setMuted: (value: boolean) => void;
  setLook: (x: number, y: number) => void;
  react: (region: "head" | "hand" | "body") => void;
  skip: () => void;
}

const GuideContext = createContext<GuideContextValue | null>(null);

export function useGuide(): GuideContextValue | null {
  return useContext(GuideContext);
}

function sectionEl(id: string) {
  return document.getElementById(id);
}

function readingDelay(ms: number, reduced: boolean) {
  return reduced ? Math.min(ms, 2200) : ms;
}

export function GuideProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const home = pathname === "/";
  const [phase, setPhase] = useState<GuidePhase>("idle");
  const [index, setIndex] = useState(0);
  const [muted, setMutedState] = useState(false);
  const [voiceBlocked, setVoiceBlocked] = useState(false);
  const [look, setLookState] = useState({ x: 0, y: 0 });
  const [reaction, setReaction] = useState<string | null>(null);
  const [reactionClip, setReactionClip] = useState<CharacterClip | null>(null);
  const [voiceSupported] = useState(() =>
    typeof window === "undefined" ? false : guideSpeechSupported(),
  );
  const phaseRef = useRef(phase);
  const indexRef = useRef(index);
  const mutedRef = useRef(muted);
  const timerRef = useRef<number | null>(null);
  const startedRef = useRef(false);
  const completingRef = useRef<number | null>(null);
  phaseRef.current = phase;
  indexRef.current = index;
  mutedRef.current = muted;

  const clearTimer = () => {
    if (timerRef.current) {
      window.clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  };

  const finish = useCallback((reason: "skipped" | "complete") => {
    clearTimer();
    cancelGuideSpeech();
    markGuideFinished(reason);
    setPhase(reason === "skipped" ? "skipped" : "complete");
    if (reason === "skipped") trackEvent("guided_intro_skip");
    else trackEvent("guided_intro_complete");
  }, []);

  const skip = useCallback(() => {
    if (phaseRef.current === "skipped" || phaseRef.current === "complete") return;
    if (phaseRef.current === "idle" && !startedRef.current) return;
    finish("skipped");
  }, [finish]);

  const completeSection = useCallback(() => {
    if (completingRef.current === indexRef.current) return;
    completingRef.current = indexRef.current;
    clearTimer();
    cancelGuideSpeech();
    const next = indexRef.current + 1;
    if (next >= guidedSections.length) {
      finish("complete");
      return;
    }
    setPhase("waiting");
  }, [finish]);

  const speakCurrent = useCallback(
    (sectionIndex: number) => {
      const section = guidedSections[sectionIndex];
      if (!section) return;
      clearTimer();
      cancelGuideSpeech();
      completingRef.current = null;
      setIndex(sectionIndex);
      setPhase(sectionIndex === 0 ? "greeting" : "speaking");

      const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const fallback = () => {
        timerRef.current = window.setTimeout(
          completeSection,
          readingDelay(section.readingMs, reduced),
        );
      };

      if (mutedRef.current || !voiceSupported || voiceBlocked) {
        fallback();
        return;
      }

      speakGuideText(section.voiceText, { onEnd: completeSection });
      window.setTimeout(() => {
        if (mutedRef.current) return;
        if (window.speechSynthesis?.speaking || window.speechSynthesis?.pending) return;
        setVoiceBlocked(true);
        fallback();
      }, 450);
    },
    [completeSection, voiceBlocked, voiceSupported],
  );

  const enableVoice = useCallback(() => {
    setVoiceBlocked(false);
    setMutedState(false);
    mutedRef.current = false;
    speakCurrent(indexRef.current);
  }, [speakCurrent]);

  const setLook = useCallback((x: number, y: number) => {
    setLookState({ x, y });
  }, []);

  const react = useCallback((region: "head" | "hand" | "body") => {
    const next = hitReactions[region];
    setReaction(next.message);
    setReactionClip(next.clip);
    window.setTimeout(() => {
      setReaction(null);
      setReactionClip(null);
    }, 1600);
  }, []);

  const setMuted = useCallback(
    (value: boolean) => {
      setMutedState(value);
      mutedRef.current = value;
      if (value) {
        cancelGuideSpeech();
        if (phaseRef.current === "speaking" || phaseRef.current === "greeting") {
          completeSection();
        }
      }
    },
    [completeSection],
  );

  useEffect(() => {
    if (!home) {
      cancelGuideSpeech();
      setPhase("idle");
      startedRef.current = false;
      return;
    }
    if (guideAlreadyFinished()) {
      setPhase("complete");
      return;
    }
    startedRef.current = true;
    trackEvent("guided_intro_start");
    const start = window.setTimeout(() => speakCurrent(0), 400);
    return () => window.clearTimeout(start);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- start once per home visit
  }, [home]);

  useEffect(() => {
    const onSkipEvent = () => skip();
    window.addEventListener("mhk-guide-skip", onSkipEvent);
    return () => window.removeEventListener("mhk-guide-skip", onSkipEvent);
  }, [skip]);

  useEffect(() => {
    if (!home) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      const menu = document.getElementById("mobile-nav");
      if (menu && !menu.hidden) return;
      skip();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [home, skip]);

  useEffect(() => {
    const active =
      home &&
      phase !== "idle" &&
      phase !== "skipped" &&
      phase !== "complete";
    if (!active) return;

    const maxScroll = () => {
      const waiting = phaseRef.current === "waiting";
      const unlocked = waiting
        ? Math.min(indexRef.current + 1, guidedSections.length - 1)
        : indexRef.current;
      const target = guidedSections[unlocked]?.target;
      if (!target) return Number.POSITIVE_INFINITY;
      const node = sectionEl(target);
      if (!node) return Number.POSITIVE_INFINITY;
      const top = node.getBoundingClientRect().top + window.scrollY;
      return waiting ? top + 48 : top + node.offsetHeight * 0.35;
    };

    const clamp = () => {
      const limit = maxScroll();
      if (window.scrollY > limit) {
        window.scrollTo({ top: limit, behavior: "auto" });
      }
    };

    const onWheel = (event: WheelEvent) => {
      if (event.deltaY <= 0) return;
      const limit = maxScroll();
      if (window.scrollY + event.deltaY > limit) {
        event.preventDefault();
        window.scrollTo({ top: limit, behavior: "auto" });
      }
    };

    let lastY = 0;
    const onTouch = (event: TouchEvent) => {
      if (event.touches.length !== 1) return;
      const y = event.touches[0].clientY;
      const goingDown = y < lastY - 2;
      lastY = y;
      if (!goingDown) return;
      const limit = maxScroll();
      if (window.scrollY > limit - 8) event.preventDefault();
    };

    const onKey = (event: KeyboardEvent) => {
      const keys = ["PageDown", "ArrowDown", " ", "End"];
      if (!keys.includes(event.key)) return;
      const limit = maxScroll();
      if (event.key === "End" || window.scrollY >= limit - 4) {
        event.preventDefault();
      }
    };

    window.addEventListener("wheel", onWheel, { passive: false });
    window.addEventListener("touchmove", onTouch, { passive: false });
    window.addEventListener("keydown", onKey, { passive: false });
    window.addEventListener("scroll", clamp, { passive: true });
    return () => {
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("touchmove", onTouch);
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("scroll", clamp);
    };
  }, [home, phase]);

  useEffect(() => {
    const active =
      home &&
      phase !== "idle" &&
      phase !== "skipped" &&
      phase !== "complete";
    if (!active) return;

    const observers: IntersectionObserver[] = [];
    guidedSections.forEach((section, i) => {
      const node = sectionEl(section.target);
      if (!node) return;
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (!entry?.isIntersecting) return;
          if (phaseRef.current !== "waiting") return;
          if (i !== indexRef.current + 1) return;
          setPhase("transitioning");
          speakCurrent(i);
        },
        { threshold: 0.32 },
      );
      observer.observe(node);
      observers.push(observer);
    });
    return () => observers.forEach((item) => item.disconnect());
  }, [home, phase, speakCurrent]);

  const guided =
    home && phase !== "idle" && phase !== "skipped" && phase !== "complete";
  const section = guidedSections[index];
  const clip: CharacterClip = reactionClip
    ? reactionClip
    : phase === "transitioning"
      ? "Walk"
      : sectionClip[section?.id ?? ""] ?? poseClip[section?.pose ?? "idle"];

  const value = useMemo<GuideContextValue>(
    () => ({
      visible: home,
      guided,
      phase,
      index,
      pose: section?.pose ?? "idle",
      clip,
      look,
      message: guided ? section?.message ?? "" : "",
      reaction,
      muted,
      voiceSupported,
      voiceBlocked,
      enableVoice,
      setMuted,
      setLook,
      react,
      skip,
    }),
    [
      clip,
      enableVoice,
      guided,
      home,
      index,
      look,
      muted,
      phase,
      react,
      reaction,
      section?.message,
      section?.pose,
      setLook,
      setMuted,
      skip,
      voiceBlocked,
      voiceSupported,
    ],
  );

  return <GuideContext.Provider value={value}>{children}</GuideContext.Provider>;
}
