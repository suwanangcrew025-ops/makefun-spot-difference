// audio.js — the parlour's sounds, every one synthesised with WebAudio: a
// two-note chime when a difference is found, a soft thud for a miss, a ping
// for a hint, a tick for the last seconds, and a small arpeggio when a scene
// is finished. No audio files: the kit is built from oscillators and gain
// envelopes, and it stays silent until the first gesture wakes it, as
// browsers require.

export class SoundKit {
  constructor() {
    this.ctx = null; // created lazily on the first user gesture
    this.master = null;
    this.muted = false;
  }

  // Wake the audio context. Safe to call on every gesture; it only builds
  // the graph once and resumes it when the browser has suspended it.
  wake() {
    if (!this.ctx) {
      const AudioCtor = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtor) return;
      this.ctx = new AudioCtor();
      this.master = this.ctx.createGain();
      this.master.gain.value = this.muted ? 0 : 0.5;
      this.master.connect(this.ctx.destination);
    }
    if (this.ctx.state === 'suspended') void this.ctx.resume();
  }

  setMuted(muted) {
    this.muted = muted;
    if (this.master && this.ctx) {
      this.master.gain.setTargetAtTime(muted ? 0 : 0.5, this.ctx.currentTime, 0.02);
    }
  }

  // One shaped tone: an oscillator with an attack-and-decay envelope.
  tone(freq, { type = 'sine', at = 0, dur = 0.18, vol = 0.5, slide = 0 } = {}) {
    if (!this.ctx || this.muted) return;
    const t0 = this.ctx.currentTime + at;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, t0);
    if (slide) osc.frequency.exponentialRampToValueAtTime(Math.max(30, freq + slide), t0 + dur);
    gain.gain.setValueAtTime(0, t0);
    gain.gain.linearRampToValueAtTime(vol, t0 + 0.012);
    gain.gain.exponentialRampToValueAtTime(0.0008, t0 + dur);
    osc.connect(gain);
    gain.connect(this.master);
    osc.start(t0);
    osc.stop(t0 + dur + 0.05);
  }

  // A found difference: a bright two-note chime, like a spoon on glass.
  find() {
    this.tone(1318.5, { type: 'sine', dur: 0.22, vol: 0.42 });
    this.tone(1760, { type: 'sine', at: 0.07, dur: 0.3, vol: 0.38 });
    this.tone(2637, { type: 'triangle', at: 0.07, dur: 0.18, vol: 0.12 });
  }

  // A miss: a low, soft thud that slides down — felt more than heard.
  miss() {
    this.tone(196, { type: 'square', dur: 0.16, vol: 0.16, slide: -70 });
    this.tone(98, { type: 'sine', dur: 0.2, vol: 0.3, slide: -30 });
  }

  // A hint: a gentle ping that rises, as if pointing.
  hint() {
    this.tone(880, { type: 'sine', dur: 0.16, vol: 0.3 });
    this.tone(1174.7, { type: 'sine', at: 0.09, dur: 0.24, vol: 0.3 });
  }

  // The clock's last seconds: a dry tick.
  tick() {
    this.tone(1568, { type: 'square', dur: 0.045, vol: 0.1 });
  }

  // A small click for keys and buttons.
  ui() {
    this.tone(660, { type: 'triangle', dur: 0.07, vol: 0.2 });
  }

  // A scene finished: a rising arpeggio in a major key.
  sceneDone() {
    const notes = [523.25, 659.25, 783.99, 1046.5];
    notes.forEach((f, i) => this.tone(f, { type: 'triangle', at: i * 0.09, dur: 0.34, vol: 0.32 }));
  }

  // The whole game finished: the arpeggio, finished with a chord.
  gameDone() {
    const notes = [523.25, 659.25, 783.99, 1046.5];
    notes.forEach((f, i) => this.tone(f, { type: 'triangle', at: i * 0.09, dur: 0.4, vol: 0.3 }));
    [523.25, 659.25, 783.99].forEach((f) => this.tone(f, { type: 'sine', at: 0.42, dur: 0.7, vol: 0.2 }));
  }

  // Time run out: two low notes, falling.
  timeUp() {
    this.tone(392, { type: 'triangle', dur: 0.3, vol: 0.3 });
    this.tone(311.1, { type: 'triangle', at: 0.22, dur: 0.5, vol: 0.3 });
  }
}
