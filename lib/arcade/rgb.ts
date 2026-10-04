import { Color } from "three";

const RGB_STOPS = [
  new Color("#22d3ee"),
  new Color("#3b82f6"),
  new Color("#8b5cf6"),
  new Color("#d946ef"),
  new Color("#22d3ee"),
];

export function arcadeRgbAt(time: number, out: Color, phase = 0) {
  const u = ((((time + phase) % 1) + 1) % 1) * (RGB_STOPS.length - 1);
  const index = Math.min(Math.floor(u), RGB_STOPS.length - 2);
  return out.lerpColors(RGB_STOPS[index], RGB_STOPS[index + 1], u - index);
}

export function arcadeBreath(time: number, phase = 0, min = 0.65, max = 1) {
  const wave = 0.5 + 0.5 * Math.sin(time + phase * Math.PI * 2);
  return min + (max - min) * wave;
}
