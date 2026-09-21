/** Monitor bezel 0.96 wide at x=0.02 → edges ±0.48 from center. */
export const MONITOR_X = 0.02;
export const MONITOR_HALF = 0.48;
export const MONITOR_LEFT = MONITOR_X - MONITOR_HALF;
export const MONITOR_RIGHT = MONITOR_X + MONITOR_HALF;

export const SPEAKER_WIDTH = 0.09;
export const SPEAKER_Y = 0.142;
export const SPEAKER_Z = -0.07;

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

export const DESK_SIZE: [number, number, number] = [2.02, 0.05, 0.98];
export const PC_POS: [number, number, number] = [0.8, 0.312, 0.0];
export const PC_YAW = 0.4;
