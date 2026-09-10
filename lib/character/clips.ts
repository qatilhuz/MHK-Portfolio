import { AnimationClip, NumberKeyframeTrack } from "three";

function loop(name: string, duration: number, tracks: NumberKeyframeTrack[]) {
  return new AnimationClip(name, duration, tracks);
}

export function createHostClips(): AnimationClip[] {
  return [
    loop("Idle", 5.2, [
      new NumberKeyframeTrack("Hips.position[y]", [0, 2.6, 5.2], [0, 0.022, 0]),
      new NumberKeyframeTrack("Spine.rotation[y]", [0, 2.6, 5.2], [0, 0.04, 0]),
      new NumberKeyframeTrack("Chest.rotation[x]", [0, 2.6, 5.2], [0.015, -0.025, 0.015]),
      new NumberKeyframeTrack("Head.rotation[x]", [0, 1.3, 2.6, 3.9, 5.2], [0.02, -0.03, 0.01, -0.02, 0.02]),
      new NumberKeyframeTrack("LeftShoulder.rotation[z]", [0, 2.6, 5.2], [0.06, 0.12, 0.06]),
      new NumberKeyframeTrack("RightShoulder.rotation[z]", [0, 2.6, 5.2], [-0.06, -0.12, -0.06]),
      new NumberKeyframeTrack("RightHand.rotation[z]", [0, 2.6, 5.2], [0, 0.08, 0]),
    ]),
    loop("Greet", 2.4, [
      new NumberKeyframeTrack("RightArm.rotation[z]", [0, 0.4, 1.2, 2.4], [0.2, -2.05, -1.55, 0.2]),
      new NumberKeyframeTrack("RightArm.rotation[x]", [0, 0.4, 2.4], [0, -0.35, 0]),
      new NumberKeyframeTrack("Head.rotation[y]", [0, 0.5, 2.4], [0, 0.18, 0]),
    ]),
    loop("Wave", 1.8, [
      new NumberKeyframeTrack("RightArm.rotation[z]", [0, 0.3, 0.6, 0.9, 1.2, 1.8], [
        0.15, -2.15, -1.45, -2.15, -1.45, 0.15,
      ]),
    ]),
    loop("Nod", 1.2, [
      new NumberKeyframeTrack("Head.rotation[x]", [0, 0.25, 0.5, 0.75, 1.2], [0, 0.32, 0, 0.24, 0]),
    ]),
    loop("Point", 2, [
      new NumberKeyframeTrack("RightArm.rotation[x]", [0, 0.4, 2], [0, -1.2, -0.15]),
      new NumberKeyframeTrack("RightArm.rotation[y]", [0, 0.4, 2], [0, -0.5, 0]),
      new NumberKeyframeTrack("Chest.rotation[y]", [0, 0.4, 2], [0, 0.2, 0]),
    ]),
    loop("Talk", 2, [
      new NumberKeyframeTrack("RightArm.rotation[x]", [0, 0.5, 1, 1.5, 2], [0, -0.4, -0.12, -0.42, 0]),
      new NumberKeyframeTrack("LeftArm.rotation[x]", [0, 0.5, 1, 1.5, 2], [0, -0.18, -0.35, -0.12, 0]),
      new NumberKeyframeTrack("Spine.rotation[y]", [0, 1, 2], [0, 0.09, 0]),
    ]),
    loop("Think", 2.2, [
      new NumberKeyframeTrack("LeftArm.rotation[x]", [0, 0.5, 2.2], [0, -1.45, -0.2]),
      new NumberKeyframeTrack("LeftArm.rotation[z]", [0, 0.5, 2.2], [0, 0.75, 0]),
      new NumberKeyframeTrack("Head.rotation[x]", [0, 0.5, 2.2], [0, 0.2, 0]),
    ]),
    loop("Walk", 0.8, [
      new NumberKeyframeTrack("LeftUpLeg.rotation[x]", [0, 0.2, 0.4, 0.6, 0.8], [0.55, 0, -0.5, 0, 0.55]),
      new NumberKeyframeTrack("RightUpLeg.rotation[x]", [0, 0.2, 0.4, 0.6, 0.8], [-0.5, 0, 0.55, 0, -0.5]),
      new NumberKeyframeTrack("LeftArm.rotation[x]", [0, 0.4, 0.8], [-0.35, 0.35, -0.35]),
      new NumberKeyframeTrack("RightArm.rotation[x]", [0, 0.4, 0.8], [0.35, -0.35, 0.35]),
      new NumberKeyframeTrack("Hips.position[y]", [0, 0.2, 0.4, 0.6, 0.8], [0, 0.035, 0, 0.035, 0]),
    ]),
    loop("Turn", 0.9, [
      new NumberKeyframeTrack("Hips.rotation[y]", [0, 0.45, 0.9], [0, 0.55, 0]),
      new NumberKeyframeTrack("Chest.rotation[y]", [0, 0.45, 0.9], [0, 0.25, 0]),
    ]),
    loop("LookAround", 2.6, [
      new NumberKeyframeTrack("Head.rotation[y]", [0, 0.7, 1.4, 2.1, 2.6], [0, 0.62, -0.55, 0.2, 0]),
      new NumberKeyframeTrack("Chest.rotation[y]", [0, 1.3, 2.6], [0, 0.16, 0]),
    ]),
    loop("Curious", 1.6, [
      new NumberKeyframeTrack("Head.rotation[z]", [0, 0.4, 1.6], [0, 0.18, 0]),
      new NumberKeyframeTrack("Head.rotation[x]", [0, 0.4, 1.6], [0, 0.12, 0]),
    ]),
    loop("Surprise", 0.7, [
      new NumberKeyframeTrack("Head.rotation[x]", [0, 0.15, 0.7], [0, -0.38, 0.08]),
      new NumberKeyframeTrack("Spine.position[y]", [0, 0.15, 0.7], [0, 0.05, 0]),
      new NumberKeyframeTrack("LeftArm.rotation[z]", [0, 0.15, 0.7], [0, 0.45, 0]),
      new NumberKeyframeTrack("RightArm.rotation[z]", [0, 0.15, 0.7], [0, -0.45, 0]),
    ]),
    loop("Stagger", 0.55, [
      new NumberKeyframeTrack("Hips.rotation[z]", [0, 0.25, 0.55], [0, -0.22, 0.18]),
      new NumberKeyframeTrack("Spine.rotation[x]", [0, 0.25, 0.55], [0, -0.2, 0.12]),
      new NumberKeyframeTrack("LeftUpLeg.rotation[x]", [0, 0.25, 0.55], [0, 0.25, 0.1]),
    ]),
    loop("Fall", 0.95, [
      new NumberKeyframeTrack("Hips.rotation[x]", [0, 0.35, 0.95], [0, 0.55, 1.15]),
      new NumberKeyframeTrack("Hips.rotation[z]", [0, 0.35, 0.95], [0, 0.35, 0.55]),
      new NumberKeyframeTrack("Hips.position[y]", [0, 0.35, 0.95], [0, -0.18, -0.48]),
      new NumberKeyframeTrack("Spine.rotation[x]", [0, 0.35, 0.95], [0, 0.35, 0.7]),
      new NumberKeyframeTrack("LeftArm.rotation[z]", [0, 0.4, 0.95], [0, 1.1, 0.4]),
      new NumberKeyframeTrack("RightArm.rotation[z]", [0, 0.4, 0.95], [0, -1.2, -0.35]),
      new NumberKeyframeTrack("LeftUpLeg.rotation[x]", [0, 0.45, 0.95], [0, 0.6, 0.9]),
      new NumberKeyframeTrack("RightUpLeg.rotation[x]", [0, 0.45, 0.95], [0, -0.15, 0.35]),
    ]),
    loop("Recover", 0.7, [
      new NumberKeyframeTrack("Hips.rotation[x]", [0, 0.7], [1.15, 0.4]),
      new NumberKeyframeTrack("Hips.position[y]", [0, 0.7], [-0.48, -0.18]),
    ]),
    loop("GetUp", 1.15, [
      new NumberKeyframeTrack("Hips.rotation[x]", [0, 0.5, 1.15], [0.4, 0.12, 0]),
      new NumberKeyframeTrack("Hips.rotation[z]", [0, 0.5, 1.15], [0.55, 0.12, 0]),
      new NumberKeyframeTrack("Hips.position[y]", [0, 0.5, 1.15], [-0.18, -0.06, 0]),
      new NumberKeyframeTrack("Spine.rotation[x]", [0, 0.5, 1.15], [0.7, 0.15, 0]),
    ]),
    loop("Playful", 1.4, [
      new NumberKeyframeTrack("Head.rotation[z]", [0, 0.35, 0.7, 1.4], [0, 0.2, -0.15, 0]),
      new NumberKeyframeTrack("Hips.rotation[y]", [0, 0.7, 1.4], [0, 0.2, 0]),
    ]),
    loop("Annoyed", 1.8, [
      new NumberKeyframeTrack("Head.rotation[x]", [0, 0.25, 0.7, 1.8], [0, 0.18, 0.12, 0]),
      new NumberKeyframeTrack("Head.rotation[z]", [0, 0.35, 1.8], [0, -0.16, 0]),
      new NumberKeyframeTrack("LeftArm.rotation[x]", [0, 0.4, 1.8], [0, -0.85, 0]),
      new NumberKeyframeTrack("RightArm.rotation[x]", [0, 0.4, 1.8], [0, -0.9, 0]),
      new NumberKeyframeTrack("Chest.rotation[z]", [0, 0.3, 1.8], [0, -0.06, 0]),
    ]),
    loop("Interaction", 1.5, [
      new NumberKeyframeTrack("RightArm.rotation[x]", [0, 0.4, 1.5], [0, -0.7, 0]),
      new NumberKeyframeTrack("Head.rotation[y]", [0, 0.4, 1.5], [0, 0.2, 0]),
    ]),
  ];
}
