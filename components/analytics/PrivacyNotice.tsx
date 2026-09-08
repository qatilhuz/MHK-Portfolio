"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { getConsent, setConsent } from "@/lib/analytics/client";

export function PrivacyNotice() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setOpen(getConsent() === null);
  }, []);

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Anonymous analytics notice"
      className="fixed bottom-4 left-4 right-4 z-[80] mx-auto max-w-lg rounded-[var(--radius-lg)] border border-border bg-surface p-4 shadow-[var(--shadow)]"
    >
      <p className="text-sm leading-relaxed text-muted">
        Anonymous, first-party usage stats (pages, sections, feature use) can
        help improve this portfolio. No names, messages, terminal text, or
        precise location are stored. You can opt out.
      </p>
      <div className="mt-3 flex flex-wrap gap-2">
        <Button
          type="button"
          size="sm"
          onClick={() => {
            setConsent("granted");
            setOpen(false);
          }}
        >
          OK
        </Button>
        <Button
          type="button"
          size="sm"
          variant="ghost"
          onClick={() => {
            setConsent("denied");
            setOpen(false);
          }}
        >
          Opt out
        </Button>
      </div>
    </div>
  );
}
