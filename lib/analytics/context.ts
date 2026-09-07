import type { SessionContext } from "./types";

export function collectSessionContext(): SessionContext {
  const ua = navigator.userAgent;
  const width = window.innerWidth;
  const ref = document.referrer;
  let referrerSource: SessionContext["referrerSource"] = "direct";
  if (ref) {
    try {
      const host = new URL(ref).hostname;
      if (/google|bing|duckduckgo|yahoo/.test(host)) referrerSource = "search";
      else if (/twitter|x\.com|linkedin|facebook|instagram/.test(host)) {
        referrerSource = "social";
      } else referrerSource = "other";
    } catch {
      referrerSource = "other";
    }
  }

  return {
    referrerSource,
    deviceCategory: width < 768 ? "mobile" : width < 1024 ? "tablet" : "desktop",
    browserCategory: /edg/i.test(ua)
      ? "edge"
      : /chrome|crios/i.test(ua)
        ? "chrome"
        : /firefox|fxios/i.test(ua)
          ? "firefox"
          : /safari/i.test(ua)
            ? "safari"
            : "other",
    osCategory: /iphone|ipad/i.test(ua)
      ? "ios"
      : /android/i.test(ua)
        ? "android"
        : /mac os/i.test(ua)
          ? "mac"
          : /windows/i.test(ua)
            ? "windows"
            : /linux/i.test(ua)
              ? "linux"
              : "other",
    viewportCategory: width < 768 ? "sm" : width < 1024 ? "md" : "lg",
  };
}
