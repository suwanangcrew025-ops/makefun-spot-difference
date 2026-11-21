// main.js — the bootstrap: find the canvas, build the sound kit and the
// game, wire the player's hands, pose a screenshot if the address asks for
// one, and run the frame loop. The loop advances the engine by the time
// since the last frame, draws what render.js makes of the state, and keeps
// the screen-reader status line in step with the game's own announcements.

import { Game } from './engine.js';
import { SoundKit } from './audio.js';
import { drawFrame } from './render.js';
import { wireInput } from './input.js';
import { stageShot } from './shots.js';

const canvas = document.getElementById('stage');
const ctx = canvas.getContext('2d');
const statusEl = document.getElementById('sr-status');

const sound = new SoundKit();
const game = new Game(sound);
wireInput(canvas, game, sound);
stageShot(game, window.location.search);

let last = performance.now();
let lastStatus = '';
function frame(nowMs) {
  const dt = Math.min(0.05, (nowMs - last) / 1000);
  last = nowMs;
  game.update(dt);
  drawFrame(ctx, game, nowMs / 1000);
  if (game.status !== lastStatus) {
    statusEl.textContent = game.status;
    lastStatus = game.status;
  }
  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);

// A handle for play-testing and screenshot tools: the game, its sound kit,
// and a reader for the current status line.
window.__tides = { game, sound, status: () => game.status };
