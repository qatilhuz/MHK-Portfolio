import gsap from "gsap";
import type { Camera } from "three";

export const PORTAL_START_POS = { x: 0.12, y: 1.05, z: 1.72 };
export const PORTAL_START_LOOK = { x: 0.08, y: 0.28, z: 0.02 };

type Look = { x: number; y: number; z: number };

export function buildArcadePortalTimeline(camera: Camera, look: Look) {
  camera.position.set(PORTAL_START_POS.x, PORTAL_START_POS.y, PORTAL_START_POS.z);
  look.x = PORTAL_START_LOOK.x;
  look.y = PORTAL_START_LOOK.y;
  look.z = PORTAL_START_LOOK.z;

  const tl = gsap.timeline({ paused: true, defaults: { ease: "power2.inOut" } });
  tl.to(camera.position, { x: 0.02, y: 0.55, z: 0.85, duration: 0.7 }, 0);
  tl.to(look, { x: 0.02, y: 0.42, z: -0.16, duration: 0.7 }, 0);
  tl.to(camera.position, { x: 0.02, y: 0.43, z: 0.18, duration: 0.9 }, 0.55);
  tl.to(look, { z: -0.5, duration: 0.9 }, 0.55);
  tl.to(camera.position, { z: -0.05, duration: 0.55, ease: "power3.in" }, 1.35);
  return tl;
}

export const ARCADE_EXIT_FLAG = "arcade-portal";
