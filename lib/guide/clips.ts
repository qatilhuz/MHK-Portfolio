import { AnimationClip, NumberKeyframeTrack } from "three";

function loop(name: string, duration: number, tracks: NumberKeyframeTrack[]) {
  return new AnimationClip(name, duration, tracks);
}

export function createHostClips(): AnimationClip[] {
  return [
    loop("Idle", 4, [
      new NumberKeyframeTrack("Hips.position[y]", [0, 2, 4], [0, 0.025, 0]),
      new NumberKeyframeTrack("Spine.rotation[y]", [0, 2, 4], [0, 0.04, 0]),
      new NumberKeyframeTrack("Head.rotation[x]", [0, 2, 4], [0.02, -0.03, 0.02]),
    ]),
    loop("Greet", 2.4, [
      new NumberKeyframeTrack("RightArm.rotation[z]", [0, 0.4, 1.2, 2.4], [0.2, -2.1, -1.6, 0.2]),
      new NumberKeyframeTrack("RightArm.rotation[x]", [0, 0.4, 2.4], [0, -0.3, 0]),
      new NumberKeyframeTrack("Head.rotation[y]", [0, 0.5, 2.4], [0, 0.15, 0]),
    ]),
    loop("Wave", 1.8, [
      new NumberKeyframeTrack("RightArm.rotation[z]", [0, 0.3, 0.6, 0.9, 1.2, 1.8], [
        0.15, -2.2, -1.5, -2.2, -1.5, 0.15,
      ]),
    ]),
    loop("Nod", 1.2, [
      new NumberKeyframeTrack("Head.rotation[x]", [0, 0.25, 0.5, 0.75, 1.2], [0, 0.28, 0, 0.22, 0]),
    ]),
    loop("Point", 2, [
      new NumberKeyframeTrack("RightArm.rotation[x]", [0, 0.4, 2], [0, -1.15, -0.2]),
      new NumberKeyframeTrack("RightArm.rotation[y]", [0, 0.4, 2], [0, -0.45, 0]),
      new NumberKeyframeTrack("Chest.rotation[y]", [0, 0.4, 2], [0, 0.18, 0]),
    ]),
    loop("Talk", 2, [
      new NumberKeyframeTrack("RightArm.rotation[x]", [0, 0.5, 1, 1.5, 2], [0, -0.35, -0.1, -0.4, 0]),
      new NumberKeyframeTrack("LeftArm.rotation[x]", [0, 0.5, 1, 1.5, 2], [0, -0.15, -0.32, -0.1, 0]),
      new NumberKeyframeTrack("Spine.rotation[y]", [0, 1, 2], [0, 0.08, 0]),
    ]),
    loop("Think", 2.2, [
      new NumberKeyframeTrack("LeftArm.rotation[x]", [0, 0.5, 2.2], [0, -1.4, -0.2]),
      new NumberKeyframeTrack("LeftArm.rotation[z]", [0, 0.5, 2.2], [0, 0.7, 0]),
      new NumberKeyframeTrack("Head.rotation[x]", [0, 0.5, 2.2], [0, 0.18, 0]),
    ]),
    loop("Walk", 0.8, [
      new NumberKeyframeTrack("LeftUpLeg.rotation[x]", [0, 0.2, 0.4, 0.6, 0.8], [0.4, 0, -0.4, 0, 0.4]),
      new NumberKeyframeTrack("RightUpLeg.rotation[x]", [0, 0.2, 0.4, 0.6, 0.8], [-0.4, 0, 0.4, 0, -0.4]),
      new NumberKeyframeTrack("Hips.position[y]", [0, 0.2, 0.4, 0.6, 0.8], [0, 0.03, 0, 0.03, 0]),
    ]),
  ];
}
