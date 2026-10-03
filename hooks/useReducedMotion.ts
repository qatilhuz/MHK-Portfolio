"use client";

import { useEffect, useState } from "react";
import { REDUCED_MOTION_MEDIA } from "@/lib/constants";

export function useReducedMotion() {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const media = window.matchMedia(REDUCED_MOTION_MEDIA);
    const update = () => setReduced(media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);

  return reduced;
}
