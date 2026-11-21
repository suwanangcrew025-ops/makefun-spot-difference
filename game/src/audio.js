// Sound, synthesised in code: no audio files ride along with the game.
// A find rings two bright notes, a miss thuds low, a hint chimes softly
// and a finished scene plays a short rising figure. The context is made
// lazily on the first sound after a player's gesture, as browsers require,
// and M (or the toggle the input file wires) silences the whole set.

let context = null;
let muted = false;

/** The shared AudioContext, created on first use; null where audio is unavailable. */
function audioContext() {
  if (context !== null) return context;
  const Maker = window.AudioContext ?? window.webkitAudioContext;
  if (Maker === undefined) return null;
  context = new Maker();
  return context;
}

/** One soft-edged tone: a sine that swells in fast and decays away. */
function tone(frequency, at, duration, volume, type = 'sine') {
  const ctx = audioContext();
  if (ctx === null || muted) return;
  const start = ctx.currentTime + at;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = type;
  osc.frequency.value = frequency;
  gain.gain.setValueAtTime(0, start);
  gain.gain.linearRampToValueAtTime(volume, start + 0.012);
  gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
  osc.connect(gain).connect(ctx.destination);
  osc.start(start);
  osc.stop(start + duration + 0.05);
}

/** The find sound: a bell struck twice, the second note a fifth above. */
export function playFind() {
  tone(1318.5, 0, 0.35, 0.16);
  tone(1975.5, 0.07, 0.45, 0.12);
}

/** The miss sound: one low, dull knock. */
export function playMiss() {
  tone(146.8, 0, 0.18, 0.2, 'triangle');
}

/** The hint sound: a single high, quiet ping. */
export function playHint() {
  tone(1568, 0, 0.5, 0.07);
}

/** The scene-complete sound: four notes climbing a major scale. */
export function playSceneComplete() {
  tone(523.25, 0, 0.3, 0.13);
  tone(659.25, 0.11, 0.3, 0.13);
  tone(783.99, 0.22, 0.3, 0.13);
  tone(1046.5, 0.33, 0.55, 0.15);
}

/** The game-complete sound: the climb, then a held chord. */
export function playGameComplete() {
  playSceneComplete();
  tone(1318.5, 0.55, 0.8, 0.1);
  tone(1568, 0.55, 0.8, 0.07);
}

/** Flip the mute; returns the new state so the HUD can show it. */
export function toggleMuted() {
  muted = !muted;
  return muted;
}

/** Whether sound is currently off. */
export function isMuted() {
  return muted;
}
