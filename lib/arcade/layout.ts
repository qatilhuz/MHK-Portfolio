/** Full reference-inspired monitor wall: central display plus angled portrait side screens. */
export const MONITOR_X = 0.02;
export const MONITOR_HALF = 0.61;
export const MONITOR_LEFT = MONITOR_X - MONITOR_HALF;
export const MONITOR_RIGHT = MONITOR_X + MONITOR_HALF;

export const SPEAKER_WIDTH = 0.09;
export const SPEAKER_Y = 0.145;
export const SPEAKER_Z = -0.045;

export const SPEAKER_LEFT: [number, number, number] = [
  MONITOR_LEFT - SPEAKER_WIDTH / 2,
  SPEAKER_Y,
  SPEAKER_Z,
];
export const SPEAKER_RIGHT: [number, number, number] = [
  MONITOR_RIGHT + SPEAKER_WIDTH / 2,
  SPEAKER_Y,
  SPEAKER_Z,
];

export const DESK_SIZE: [number, number, number] = [2.42, 0.05, 1.02];
export const PC_POS: [number, number, number] = [0.98, 0.384, 0.02];
export const PC_YAW = 0.18;
