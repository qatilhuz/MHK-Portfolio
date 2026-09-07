"use client";

import { useCallback, useEffect, useState } from "react";
import { speechSynthesisSupported } from "@/lib/assistant/voice";

export function useSpeechSynthesis() {
  const [supported] = useState(() =>
    typeof window === "undefined" ? false : speechSynthesisSupported(),
  );
  const [muted, setMuted] = useState(false);
  const [speaking, setSpeaking] = useState(false);

  const cancel = useCallback(() => {
    if (typeof window === "undefined") return;
    window.speechSynthesis?.cancel();
    setSpeaking(false);
  }, []);

  const speak = useCallback(
    (text: string, onEnd?: () => void) => {
      if (!supported || muted || !text) {
        onEnd?.();
        return;
      }
      cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1;
      utterance.onend = () => {
        setSpeaking(false);
        onEnd?.();
      };
      utterance.onerror = () => {
        setSpeaking(false);
        onEnd?.();
      };
      setSpeaking(true);
      window.speechSynthesis.speak(utterance);
    },
    [cancel, muted, supported],
  );

  useEffect(() => () => cancel(), [cancel]);

  return { supported, muted, setMuted, speaking, speak, cancel };
}
