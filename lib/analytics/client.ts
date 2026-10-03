"use client";

import { collectSessionContext } from "./context";
import { ANALYTICS_EVENT_NAMES, type AnalyticsEvent, type AnalyticsEventName } from "./types";

const CONSENT_KEY = "mhk-analytics-consent";
const SESSION_KEY = "mhk-analytics-session";
const queue: AnalyticsEvent[] = [];
const seen = new Set<string>();
let flushTimer: number | null = null;
let sessionId: string | null = null;

export function analyticsEnabled(): boolean {
  if (typeof window === "undefined") return false;
  if (process.env.NEXT_PUBLIC_ANALYTICS_ENABLED === "false") return false;
  return getConsent() === "granted";
}

export function getConsent(): "granted" | "denied" | null {
  try {
    const value = window.localStorage.getItem(CONSENT_KEY);
    if (value === "granted" || value === "denied") return value;
    return null;
  } catch {
    return "denied";
  }
}

export function setConsent(value: "granted" | "denied") {
  try {
    window.localStorage.setItem(CONSENT_KEY, value);
  } catch {
    /* blocked */
  }
  if (value === "granted") {
    ensureSession();
    trackEvent("page_view", undefined, {
      onceKey: `page:${window.location.pathname}`,
    });
    void flush();
  }
}

function ensureSession() {
  if (sessionId) return sessionId;
  try {
    const existing = window.sessionStorage.getItem(SESSION_KEY);
    if (existing) {
      sessionId = existing;
      return sessionId;
    }
    sessionId = crypto.randomUUID();
    window.sessionStorage.setItem(SESSION_KEY, sessionId);
  } catch {
    sessionId = crypto.randomUUID();
  }
  return sessionId;
}

export function trackEvent(
  name: AnalyticsEventName,
  meta?: AnalyticsEvent["meta"],
  options?: { onceKey?: string },
) {
  try {
    if (!ANALYTICS_EVENT_NAMES.includes(name)) return;
    if (!analyticsEnabled()) return;
    if (options?.onceKey) {
      if (seen.has(options.onceKey)) return;
      seen.add(options.onceKey);
    }
    ensureSession();
    queue.push({
      name,
      path: window.location.pathname,
      meta,
    });
    scheduleFlush();
  } catch {
    /* never break UI */
  }
}

function scheduleFlush() {
  if (flushTimer) return;
  flushTimer = window.setTimeout(() => {
    flushTimer = null;
    void flush();
  }, 800);
}

async function flush() {
  if (!analyticsEnabled() || queue.length === 0 || !sessionId) return;
  const events = queue.splice(0, queue.length);
  const body = JSON.stringify({
    sessionId,
    context: collectSessionContext(),
    events,
  });
  try {
    if (document.visibilityState === "hidden" && navigator.sendBeacon) {
      const blob = new Blob([body], { type: "application/json" });
      navigator.sendBeacon("/api/analytics", blob);
      return;
    }
    await fetch("/api/analytics", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body,
      keepalive: true,
    });
  } catch {
    /* drop */
  }
}

export function bindUnloadFlush() {
  const onHide = () => {
    void flush();
  };
  document.addEventListener("visibilitychange", onHide);
  window.addEventListener("pagehide", onHide);
}
