"use client";

import { useEffect, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import Lenis from "lenis";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import "lenis/dist/lenis.css";
import { registerSmoothScroller } from "@/lib/motion/scrollTo";

/**
 * Global smooth scrolling.
 *
 * Lenis drives the real window scroll and GSAP's ticker drives Lenis, so every
 * ScrollTrigger on the site (Showcase pills, Experience horizontal track,
 * TextReveal, InView) stays perfectly in sync with the smoothed position.
 *
 * Pacing: a low `lerp` gives the scroll a heavier, lazier glide, and
 * `wheelMultiplier` trims the distance of each wheel tick. Lenis ignores
 * `duration`/`easing` whenever `lerp` is set, so only lerp is configured here.
 *
 * Nothing about the existing animations changes: no scrub value, trigger,
 * sticky wrapper, or timeline is touched here.
 */
export function SmoothScroll({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  useEffect(() => {
    // The arcade route runs its own full-screen 3D input handling.
    if (pathname === "/arcade") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    gsap.registerPlugin(ScrollTrigger);

    const lenis = new Lenis({
      lerp: 0.07,
      wheelMultiplier: 0.8,
      smoothWheel: true,
    });

    const updateScrollTrigger = () => ScrollTrigger.update();
    lenis.on("scroll", updateScrollTrigger);

    // Lenis owns the scroll position while it runs, so anything that wants to
    // jump the page (the Projects skip button, anchor links) has to go through
    // the instance rather than window.scrollTo.
    registerSmoothScroller(lenis);

    const raf = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(raf);
    gsap.ticker.lagSmoothing(0);
    lenis.start();

    // Returning from /arcade mounts this while the spatial root is still held
    // at scale(1.15) with `contain: paint style`, so measuring right now reads
    // every trigger through a scaled ancestor. Wait a frame here; the
    // authoritative pass is finalizeArcadeReturn() once the zoom has cleared.
    const refreshFrame = requestAnimationFrame(() => ScrollTrigger.refresh());

    return () => {
      cancelAnimationFrame(refreshFrame);
      registerSmoothScroller(null);
      lenis.off("scroll", updateScrollTrigger);
      gsap.ticker.remove(raf);
      gsap.ticker.lagSmoothing(500, 33);
      lenis.destroy();
      ScrollTrigger.refresh();
    };
  }, [pathname]);

  return <>{children}</>;
}
