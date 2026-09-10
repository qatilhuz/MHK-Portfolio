/** Text/rhythm visemes — not phoneme-timed (SpeechSynthesis has no reliable phonemes). */

export type VisemeSample = { open: number; wide: number };

type Event = { t: number; open: number; wide: number };

let schedule: { start: number; end: number; events: Event[] } | null = null;

function shapeFor(ch: string): VisemeSample {
  const c = ch.toLowerCase();
  if ("aeéà".includes(c)) return { open: 0.95, wide: 1.15 };
  if ("iy".includes(c)) return { open: 0.45, wide: 1.28 };
  if ("oô".includes(c)) return { open: 0.85, wide: 0.78 };
  if ("uw".includes(c)) return { open: 0.55, wide: 0.72 };
  if ("mbp".includes(c)) return { open: 0.12, wide: 0.9 };
  if ("fv".includes(c)) return { open: 0.28, wide: 1.05 };
  if ("sz".includes(c)) return { open: 0.32, wide: 1.12 };
  if (" .,!?".includes(c)) return { open: 0.18, wide: 1 };
  return { open: 0.48, wide: 1 };
}

export function beginSpeechVisemes(text: string, rate = 1.02) {
  const clean = text.trim();
  if (!clean) {
    schedule = null;
    return;
  }
  const events: Event[] = [{ t: 0, open: 0.2, wide: 1 }];
  let t = 0.04;
  for (const ch of clean) {
    const step = (ch === " " ? 0.09 : /[.,!?]/.test(ch) ? 0.18 : 0.055) / rate;
    t += step;
    events.push({ t, ...shapeFor(ch) });
  }
  events.push({ t: t + 0.12, open: 0.2, wide: 1 });
  schedule = { start: performance.now(), end: performance.now() + (t + 0.18) * 1000, events };
}

export function endSpeechVisemes() {
  schedule = null;
}

export function sampleViseme(now = performance.now()): VisemeSample | null {
  if (!schedule) return null;
  if (now >= schedule.end) {
    schedule = null;
    return { open: 0.2, wide: 1 };
  }
  const t = (now - schedule.start) / 1000;
  const list = schedule.events;
  let i = 0;
  while (i < list.length - 1 && list[i + 1].t < t) i += 1;
  const a = list[i];
  const b = list[Math.min(i + 1, list.length - 1)];
  const span = Math.max(0.001, b.t - a.t);
  const u = Math.min(1, Math.max(0, (t - a.t) / span));
  return {
    open: a.open + (b.open - a.open) * u,
    wide: a.wide + (b.wide - a.wide) * u,
  };
}
