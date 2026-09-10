import { FACE_USER_YAW } from "./forward";
import type { CharacterMovementState, CharacterWorldPosition } from "./types";

export type Locomotion = {
  position: CharacterWorldPosition;
  target: CharacterWorldPosition;
  velocity: CharacterWorldPosition;
  yaw: number;
  targetYaw: number;
  speed: number;
  state: CharacterMovementState;
  busyUntil: number;
};

/** In-place walk cycle length (s) and world travel per cycle. speed = stride / cycle. */
export const WALK_CYCLE = 1;
export const WALK_STRIDE = 0.7;

function travelYaw(dx: number, dz: number) {
  if (Math.abs(dx) < 0.002 && Math.abs(dz) < 0.002) return FACE_USER_YAW;
  return Math.atan2(dx, dz);
}

export function createLocomotion(start: CharacterWorldPosition): Locomotion {
  return {
    position: { ...start },
    target: { ...start },
    velocity: { x: 0, y: 0, z: 0 },
    yaw: 0,
    targetYaw: 0,
    speed: WALK_STRIDE / WALK_CYCLE,
    state: "idle",
    busyUntil: 0,
  };
}

export function setDestination(loco: Locomotion, dest: CharacterWorldPosition, reason: CharacterMovementState) {
  loco.target = { ...dest };
  const dx = dest.x - loco.position.x;
  const dz = dest.z - loco.position.z;
  if (Math.hypot(dx, dest.y - loco.position.y, dz) > 0.04) {
    loco.targetYaw = travelYaw(dx, dz);
    loco.state = reason;
  }
}

export function stepLocomotion(loco: Locomotion, delta: number, reduced: boolean) {
  const dx = loco.target.x - loco.position.x;
  const dy = loco.target.y - loco.position.y;
  const dz = loco.target.z - loco.position.z;
  const dist = Math.hypot(dx, dy, dz);
  const accel = reduced ? 8 : 2.4;
  const cruise = reduced ? 2.2 : loco.speed;
  const max = dist < 0.55 ? cruise * Math.max(0.28, dist / 0.55) : cruise;

  if (dist < 0.07) {
    loco.velocity.x *= 0.62;
    loco.velocity.y *= 0.62;
    loco.velocity.z *= 0.62;
    if (Math.hypot(loco.velocity.x, loco.velocity.y, loco.velocity.z) < 0.02) {
      loco.velocity = { x: 0, y: 0, z: 0 };
      if (loco.state === "walking" || loco.state === "moving-to-section" || loco.state === "turning") {
        loco.state = "idle";
      }
    }
    const turn = reduced ? 10 : 3.4;
    const dyaw = FACE_USER_YAW - loco.yaw;
    const wrapped = Math.atan2(Math.sin(dyaw), Math.cos(dyaw));
    loco.yaw += wrapped * Math.min(1, turn * delta);
    return dist;
  }

  loco.targetYaw = travelYaw(dx, dz);
  const dyaw = loco.targetYaw - loco.yaw;
  const wrapped = Math.atan2(Math.sin(dyaw), Math.cos(dyaw));
  const turn = reduced ? 10 : 3.1;
  loco.yaw += wrapped * Math.min(1, turn * delta);
  if (Math.abs(wrapped) > 0.55) {
    loco.velocity = { x: 0, y: 0, z: 0 };
    loco.state = "turning";
    return dist;
  }

  const facing = Math.max(0, Math.cos(wrapped));
  const dirx = dx / dist;
  const diry = dy / dist;
  const dirz = dz / dist;
  loco.velocity.x += dirx * accel * delta;
  loco.velocity.y += diry * accel * delta;
  loco.velocity.z += dirz * accel * delta;
  const mag = Math.hypot(loco.velocity.x, loco.velocity.y, loco.velocity.z);
  const cap = max * facing;
  if (mag > cap && cap > 0.001) {
    loco.velocity.x = (loco.velocity.x / mag) * cap;
    loco.velocity.y = (loco.velocity.y / mag) * cap;
    loco.velocity.z = (loco.velocity.z / mag) * cap;
  }
  const step = Math.min(Math.hypot(loco.velocity.x, loco.velocity.y, loco.velocity.z) * delta, dist);
  loco.position.x += dirx * step;
  loco.position.y += diry * step;
  loco.position.z += dirz * step;
  if (loco.state === "idle" || loco.state === "turning") loco.state = "walking";
  return dist;
}
