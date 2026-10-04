import { beginSpeechVisemes, endSpeechVisemes } from "@/lib/character/visemes";

type EndHandler = () => void;

let current: SpeechSynthesisUtterance | null = null;

export function guideSpeechSupported(): boolean {
  return typeof window !== "undefined" && "speechSynthesis" in window;
}

export function cancelGuideSpeech() {
  if (typeof window === "undefined") return;
  current = null;
  endSpeechVisemes();
  window.speechSynthesis?.cancel();
}

export function speakGuideText(
  text: string,
  { onEnd }: { onEnd: EndHandler },
): { started: boolean } {
  if (!guideSpeechSupported() || !text) {
    onEnd();
    return { started: false };
  }
  cancelGuideSpeech();
  beginSpeechVisemes(text, 1.02);
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.rate = 1.02;
  utterance.pitch = 1;
  utterance.lang = "en-US";
  utterance.onend = () => {
    if (current === utterance) current = null;
    endSpeechVisemes();
    onEnd();
  };
  utterance.onerror = () => {
    if (current === utterance) current = null;
    endSpeechVisemes();
    onEnd();
  };
  current = utterance;
  window.speechSynthesis.speak(utterance);
  return { started: window.speechSynthesis.speaking || window.speechSynthesis.pending };
}
