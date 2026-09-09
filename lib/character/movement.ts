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

export function createLocomotion(start: CharacterWorldPosition): Locomotion {
  return {
    position: { ...start },
    target: { ...start },
    velocity: { x: 0, y: 0, z: 0 },
    yaw: 0,
    targetYaw: 0,
    speed: 1.65,
    state: "idle",
    busyUntil: 0,
  };
}

export function setDestination(loco: Locomotion, dest: CharacterWorldPosition, reason: CharacterMovementState) {
  loco.target = { ...dest };
  const dx = dest.x - loco.position.x;
  const dz = dest.z - loco.position.z;
  if (Math.hypot(dx, dest.y - loco.position.y, dz) > 0.04) {
    loco.targetYaw = Math.atan2(dx, 0.35 + Math.abs(dz));
    loco.state = reason;
  }
}

export function stepLocomotion(loco: Locomotion, delta: number, reduced: boolean) {
  const dx = loco.target.x - loco.position.x;
  const dy = loco.target.y - loco.position.y;
  const dz = loco.target.z - loco.position.z;
  const dist = Math.hypot(dx, dy, dz);
  const accel = reduced ? 8 : 3.2;
  const max = reduced ? 3.4 : loco.speed;

  if (dist < 0.06) {
    loco.velocity.x *= 0.7;
    loco.velocity.y *= 0.7;
    loco.velocity.z *= 0.7;
    if (Math.hypot(loco.velocity.x, loco.velocity.y) < 0.02) {
      loco.velocity = { x: 0, y: 0, z: 0 };
      if (loco.state === "walking" || loco.state === "moving-to-section") loco.state = "idle";
    }
    return dist;
  }

  const dirx = dx / dist;
  const diry = dy / dist;
  const dirz = dz / dist;
  loco.velocity.x += dirx * accel * delta;
  loco.velocity.y += diry * accel * delta;
  loco.velocity.z += dirz * accel * delta;
  const mag = Math.hypot(loco.velocity.x, loco.velocity.y, loco.velocity.z);
  if (mag > max) {
    loco.velocity.x = (loco.velocity.x / mag) * max;
    loco.velocity.y = (loco.velocity.y / mag) * max;
    loco.velocity.z = (loco.velocity.z / mag) * max;
  }
  const step = Math.min(mag * delta, dist);
  loco.position.x += dirx * step;
  loco.position.y += diry * step;
  loco.position.z += dirz * step;
  loco.targetYaw = Math.atan2(dx, 0.4);
  const turn = reduced ? 10 : 4.2;
  const dyaw = loco.targetYaw - loco.yaw;
  const wrapped = Math.atan2(Math.sin(dyaw), Math.cos(dyaw));
  loco.yaw += wrapped * Math.min(1, turn * delta);
  if (loco.state === "idle") loco.state = "walking";
  return dist;
}
