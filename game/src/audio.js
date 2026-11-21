// Synthesised sound for Twice-Told Tides: WebAudio only, no audio
// files. Every effect is a few oscillators with an envelope; the
// context is created lazily on the first user gesture.

let ctx = null;
let muted = false;

export function setMuted(value) {
  muted = value;
}

function ensureContext() {
  if (ctx === null) {
    const AudioContext = window.AudioContext ?? window.webkitAudioContext;
    if (!AudioContext) return null;
    ctx = new AudioContext();
  }
  if (ctx.state === 'suspended') void ctx.resume();
  return ctx;
}

/** One short tone: frequency, duration, wave shape, gain. */
function tone(freq, dur, type = 'sine', gain = 0.16, when = 0, slideTo = null) {
  if (muted) return;
  const ac = ensureContext();
  if (!ac) return;
  const t0 = ac.currentTime + when;
  const osc = ac.createOscillator();
  const amp = ac.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t0);
  if (slideTo !== null) osc.frequency.exponentialRampToValueAtTime(slideTo, t0 + dur);
  amp.gain.setValueAtTime(0.0001, t0);
  amp.gain.exponentialRampToValueAtTime(gain, t0 + 0.015);
  amp.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  osc.connect(amp);
  amp.connect(ac.destination);
  osc.start(t0);
  osc.stop(t0 + dur + 0.05);
}

export const sfx = {
  /** A bright two-note chime when a difference is found. */
  found() {
    tone(880, 0.16, 'sine', 0.18);
    tone(1318, 0.28, 'sine', 0.16, 0.09);
  },
  /** A low thud when the player clicks empty picture. */
  miss() {
    tone(140, 0.22, 'triangle', 0.22, 0, 70);
  },
  /** A soft blip when a hint is spent. */
  hint() {
    tone(660, 0.1, 'sine', 0.14);
    tone(990, 0.14, 'sine', 0.12, 0.08);
  },
  /** The one-second tick when the clock is nearly out. */
  tick() {
    tone(1050, 0.06, 'square', 0.05);
  },
  /** A rising arpeggio when a scene is complete. */
  complete() {
    [523, 659, 784, 1047].forEach((f, i) => tone(f, 0.22, 'sine', 0.16, i * 0.11));
  },
  /** A longer fanfare when the whole game is complete. */
  fanfare() {
    [523, 659, 784, 1047, 784, 1047, 1319].forEach((f, i) => tone(f, 0.26, 'triangle', 0.14, i * 0.12));
  },
  /** A single click for buttons and cards. */
  click() {
    tone(520, 0.07, 'sine', 0.1);
  },
};
