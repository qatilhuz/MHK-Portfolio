"use client";

import { useCallback, useRef, useState } from "react";
import {
  createSpeechRecognition,
  speechRecognitionSupported,
} from "@/lib/assistant/voice";

export function useSpeechRecognition(onTranscript: (text: string) => void) {
  const [supported] = useState(() =>
    typeof window === "undefined" ? false : speechRecognitionSupported(),
  );
  const [listening, setListening] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const recRef = useRef<SpeechRecognition | null>(null);

  const stop = useCallback(() => {
    recRef.current?.stop();
    recRef.current = null;
    setListening(false);
  }, []);

  const start = useCallback(() => {
    if (!supported) {
      setError("Speech recognition is not supported in this browser.");
      return;
    }
    setError(null);
    const recognition = createSpeechRecognition();
    if (!recognition) {
      setError("Speech recognition is not supported in this browser.");
      return;
    }
    recRef.current = recognition;
    recognition.onresult = (event) => {
      const transcript = event.results[0]?.[0]?.transcript;
      if (transcript) onTranscript(transcript);
    };
    recognition.onerror = () => {
      setError("Microphone permission was denied or recognition failed.");
      setListening(false);
    };
    recognition.onend = () => setListening(false);
    try {
      recognition.start();
      setListening(true);
    } catch {
      setError("Could not start the microphone.");
      setListening(false);
    }
  }, [onTranscript, supported]);

  return { supported, listening, error, start, stop };
}
