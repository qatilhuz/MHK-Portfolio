export const characterConfig = {
  enabled: true,
  interaction: {
    hoverGreeting: true,
    faceDoubleTap: true,
    pointerFollow: true,
    autonomousBehavior: true,
  },
  movement: {
    freeRoam: true,
    autonomousWalking: true,
  },
  accessibility: {
    reducedMotionRespect: true,
  },
} as const;
