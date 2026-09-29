import gsap from "gsap";
import type { Camera } from "three";

export type ArcadePortalPoint = { x: number; y: number; z: number };
export type ArcadePortalView = {
  position: ArcadePortalPoint;
  look: ArcadePortalPoint;
};

export const PORTAL_START_POS = { x: 0.0, y: 0.92, z: 2.18 };
export const PORTAL_START_LOOK = { x: 0.03, y: 0.42, z: -0.08 };

const PORTAL_APPROACH_POS = { x: 0.02, y: 0.6, z: 0.92 };
const PORTAL_APPROACH_LOOK = { x: 0.02, y: 0.43, z: -0.18 };
const PORTAL_SCREEN_POS = { x: 0.02, y: 0.455, z: 0.22 };
const PORTAL_SCREEN_LOOK = { x: 0.02, y: 0.43, z: -0.42 };
const PORTAL_END_POS = { x: 0.02, y: 0.43, z: -0.055 };
const PORTAL_END_LOOK = { x: 0.02, y: 0.43, z: -0.72 };

type Look = ArcadePortalPoint;

function distance(a: ArcadePortalPoint, b: ArcadePortalPoint) {
  return Math.hypot(a.x - b.x, a.y - b.y, a.z - b.z);
}

export function getDefaultArcadePortalView(): ArcadePortalView {
  return {
    position: { ...PORTAL_START_POS },
    look: { ...PORTAL_START_LOOK },
  };
}

export function buildArcadePortalTimeline(
  camera: Camera,
  look: Look,
  startView: ArcadePortalView = getDefaultArcadePortalView(),
) {
  camera.position.set(startView.position.x, startView.position.y, startView.position.z);
  look.x = startView.look.x;
  look.y = startView.look.y;
  look.z = startView.look.z;

  const approachDuration = gsap.utils.clamp(
    0.56,
    0.9,
    distance(startView.position, PORTAL_APPROACH_POS) * 0.54,
  );
  const screenStart = approachDuration * 0.86;
  const portalStart = screenStart + 0.66;

  const tl = gsap.timeline({ paused: true, defaults: { ease: "power2.inOut" } });
  tl.to(camera.position, { ...PORTAL_APPROACH_POS, duration: approachDuration, ease: "sine.inOut" }, 0);
  tl.to(look, { ...PORTAL_APPROACH_LOOK, duration: approachDuration, ease: "sine.inOut" }, 0);
  tl.to(camera.position, { ...PORTAL_SCREEN_POS, duration: 0.76 }, screenStart);
  tl.to(look, { ...PORTAL_SCREEN_LOOK, duration: 0.76 }, screenStart);
  tl.to(camera.position, { ...PORTAL_END_POS, duration: 0.54, ease: "power3.in" }, portalStart);
  tl.to(look, { ...PORTAL_END_LOOK, duration: 0.54, ease: "power3.in" }, portalStart);
  return tl;
}

export const ARCADE_EXIT_FLAG = "arcade-portal";
