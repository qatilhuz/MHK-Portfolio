import { GUIDE_SKIP_KEY } from "@/data/guide";

export function guideAlreadyFinished(): boolean {
  try {
    const value = sessionStorage.getItem(GUIDE_SKIP_KEY);
    return value === "skipped" || value === "complete";
  } catch {
    return false;
  }
}

export function markGuideFinished(reason: "skipped" | "complete") {
  try {
    sessionStorage.setItem(GUIDE_SKIP_KEY, reason);
  } catch {
    /* private mode */
  }
}
