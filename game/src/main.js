// Boot and the one loop. The world advances on the engine's clock in
// fixed small steps, the renderer paints what the state says, and the
// status line follows for screen readers.
//
// ?shot=cover|harbour|glasshouse|complete stages that screenshot scene
// instead of running the loop: it paints the staged frame twice and sets
// window.__shotReady, which is how the screenshots in shots.json are made.
import { createGame, update } from './engine.js';
import { attachInput } from './input.js';
import { draw, statusText } from './render.js';
import { stageShot } from './shots.js';

const params = new URLSearchParams(window.location.search);
const shot = params.get('shot');

const canvas = document.getElementById('game');
const status = document.getElementById('status');
const ctx = canvas.getContext('2d');
const game = createGame();

let lastStatus = '';
function refreshStatus() {
  const text = statusText(game);
  if (text !== lastStatus) {
    lastStatus = text;
    status.textContent = text;
  }
}

if (shot !== null && stageShot(game, shot)) {
  draw(ctx, game);
  draw(ctx, game);
  refreshStatus();
  window.__shotReady = true;
} else {
  attachInput(canvas, game, refreshStatus);
  refreshStatus();
  let last = performance.now();
  const frame = (now) => {
    const dt = Math.min((now - last) / 1000, 0.25);
    last = now;
    update(game, dt);
    draw(ctx, game);
    refreshStatus();
    window.requestAnimationFrame(frame);
  };
  window.requestAnimationFrame(frame);
}
