export const characterConfig = {
  enabled: true,
  is3DModelEnabled: true,
  interaction: {
    hoverGreeting: true,
    faceDoubleTap: true,
    pointerFollow: true,
    autonomousBehavior: true,
  },
  movement: {
    freeRoam: false,
    autonomousWalking: true,
    bottomStageOnly: true,
  },
  accessibility: {
    reducedMotionRespect: true,
  },
} as const;

export const is3DModelEnabled = characterConfig.is3DModelEnabled && characterConfig.enabled;
