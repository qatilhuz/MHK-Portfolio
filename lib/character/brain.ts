import { characterConfig } from "@/data/characterConfig";
import { sectionClip, type CharacterClip } from "@/data/character";
import type { CharacterBrainState, CharacterDecision } from "./types";

const AUTONOMOUS: CharacterDecision[] = ["OBSERVE", "WANDER", "LOOK_AT_USER", "GREETING"];

export function nextAutonomousDecision(last: CharacterDecision): CharacterDecision {
  if (!characterConfig.interaction.autonomousBehavior) return "RETURN_TO_IDLE";
  const pool = AUTONOMOUS.filter((item) => item !== last);
  return pool[Math.floor(Math.random() * pool.length)] ?? "OBSERVE";
}

export function clipForDecision(decision: CharacterDecision, sectionId?: string): CharacterClip {
  switch (decision) {
    case "GREETING":
      return "Wave";
    case "OBSERVE":
      return "LookAround";
    case "WANDER":
      return "Walk";
    case "SHOW_SECTION":
      return sectionClip[sectionId ?? ""] ?? "Idle";
    case "PLAYFUL_REACTION":
      return "Playful";
    case "REACT_TO_CLICK":
      return "Talk";
    default:
      return "Idle";
  }
}

export function brainFromMovement(
  walking: boolean,
  interacting: boolean,
  clip: CharacterClip,
): CharacterBrainState {
  if (clip === "Fall") return "FALLING";
  if (clip === "GetUp" || clip === "Recover") return "RECOVERING";
  if (clip === "Surprise") return "SURPRISED";
  if (clip === "Stagger") return "STAGGERING";
  if (interacting) return "INTERACTING";
  if (walking) return "WALKING";
  if (clip === "Wave" || clip === "Greet") return "GREETING";
  if (clip === "Talk") return "TALKING";
  if (clip === "LookAround") return "OBSERVING";
  return "IDLE";
}
