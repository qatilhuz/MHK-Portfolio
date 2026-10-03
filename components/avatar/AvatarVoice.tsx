"use client";

import { Button } from "@/components/ui/Button";

interface AvatarVoiceProps {
  recognitionSupported: boolean;
  synthesisSupported: boolean;
  listening: boolean;
  muted: boolean;
  onListen: () => void;
  onStopListen: () => void;
  onToggleMute: () => void;
}

export function AvatarVoice({
  recognitionSupported,
  synthesisSupported,
  listening,
  muted,
  onListen,
  onStopListen,
  onToggleMute,
}: AvatarVoiceProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {recognitionSupported ? (
        <Button
          type="button"
          variant="secondary"
          size="sm"
          onClick={listening ? onStopListen : onListen}
        >
          {listening ? "Stop listening" : "Ask with voice"}
        </Button>
      ) : (
        <p className="text-xs text-muted">Voice input is not available here.</p>
      )}
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={onToggleMute}
        disabled={!synthesisSupported}
      >
        {muted || !synthesisSupported ? "Voice output off" : "Voice output on"}
      </Button>
    </div>
  );
}
