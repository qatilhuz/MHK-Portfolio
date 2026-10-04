/** Full reference-inspired monitor wall: central display plus angled portrait side screens. */
export const MONITOR_X = 0.02;

/** Main monitor lit-glass width from Monitor.tsx; speaker centers align to these two bottom screen corners. */
export const MAIN_SCREEN_WIDTH = 0.972;
export const MONITOR_HALF = MAIN_SCREEN_WIDTH / 2;
export const MONITOR_LEFT = MONITOR_X - MONITOR_HALF;
export const MONITOR_RIGHT = MONITOR_X + MONITOR_HALF;

export const SPEAKER_WIDTH = 0.09;
/** Micro-inset each cabinet from the main screen corners to tighten the speaker gap subtly. */
export const SPEAKER_CENTER_INSET = 0.018;
/** Speaker root Y places the small rubber feet exactly on the desk top at y=0.05. */
export const SPEAKER_Y = 0.153;
export const SPEAKER_Z = -0.045;

export const SPEAKER_LEFT: [number, number, number] = [
  MONITOR_LEFT + SPEAKER_CENTER_INSET,
  SPEAKER_Y,
  SPEAKER_Z,
];
export const SPEAKER_RIGHT: [number, number, number] = [
  MONITOR_RIGHT - SPEAKER_CENTER_INSET,
  SPEAKER_Y,
  SPEAKER_Z,
];

export const DESK_CENTER_X = 0.08;
export const DESK_CENTER_Z = 0.12;
export const DESK_SIZE: [number, number, number] = [2.86, 0.05, 1.12];
export const PC_POS: [number, number, number] = [1.16, 0.055, 0.015];
export const PC_YAW = -0.06;
