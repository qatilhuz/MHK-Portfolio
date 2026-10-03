"use client";

import { useEffect, useState } from "react";

export function detectWebGL(): boolean {
  try {
    const canvas = document.createElement("canvas");
    const gl =
      canvas.getContext("webgl2", { failIfMajorPerformanceCaveat: false }) ||
      canvas.getContext("webgl", { failIfMajorPerformanceCaveat: false });
    const ok = Boolean(gl);
    const lose = gl?.getExtension("WEBGL_lose_context");
    lose?.loseContext();
    return ok;
  } catch {
    return false;
  }
}

export function useWebGLSupport() {
  const [supported, setSupported] = useState<boolean | null>(null);

  useEffect(() => {
    setSupported(detectWebGL());
  }, []);

  return supported;
}
