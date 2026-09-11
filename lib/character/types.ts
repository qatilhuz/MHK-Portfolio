export type CharacterWorldPosition = {
  x: number;
  y: number;
  z: number;
};

export type CharacterMovementState =
  | "idle"
  | "walking"
  | "turning"
  | "following-pointer"
  | "moving-to-section"
  | "interacting"
  | "recovering";

export type CharacterDecision =
  | "MOVE_TO_SAFE_ZONE"
  | "LOOK_AT_USER"
  | "FOLLOW_POINTER"
  | "GREETING"
  | "OBSERVE"
  | "WANDER"
  | "SHOW_SECTION"
  | "REACT_TO_CLICK"
  | "PLAYFUL_REACTION"
  | "RETURN_TO_IDLE";

export type CharacterBrainState =
  | "IDLE"
  | "OBSERVING"
  | "FOLLOWING_POINTER"
  | "TURNING"
  | "WALKING"
  | "GREETING"
  | "TALKING"
  | "GESTURING"
  | "PLAYFUL_REACTION"
  | "SURPRISED"
  | "STAGGERING"
  | "FALLING"
  | "RECOVERING"
  | "INTERACTING"
  | "SECTION_TRANSITION"
  | "SLEEP"
  | "WAKE";

export type CharacterSafeZone = {
  id: string;
  nx: number;
  ny: number;
  priority: number;
};
