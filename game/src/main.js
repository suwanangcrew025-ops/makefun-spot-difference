// Boot for Twice-Told Tides: wire the canvas, the status line and the
// input handlers, then run the frame loop. With ?shot=<name> the game
// stages that screenshot scene instead and renders one frozen frame.
import { CANVAS_H, CANVAS_W } from './config.js';
import { newGame, tick } from './engine.js';
import { draw } from './render.js';
import { canvasPoint, handleClick, handleKey } from './input.js';
import { stageShot } from './shots.js';
import { sfx } from './audio.js';

const canvas = document.getElementById('game');
const statusEl = document.getElementById('status');
const ctx = canvas.getContext('2d');
const game = newGame();

function announce(text) {
  if (text) statusEl.textContent = text;
}

announce('Twice-Told Tides. Three scenes, two panels each. Press Enter or click Begin to play.');

const params = new URLSearchParams(window.location.search);
const shot = params.get('shot');
if (shot) {
  const nowMs = stageShot(shot, game);
  draw(ctx, game, nowMs);
  window.__shotReady = true;
} else {
  canvas.addEventListener('click', (event) => {
    const point = canvasPoint(event, canvas);
    announce(handleClick(game, point.x, point.y, performance.now(), announce));
  });
  window.addEventListener('keydown', (event) => {
    if (['Enter', ' '].includes(event.key)) event.preventDefault();
    announce(handleKey(game, event.key, performance.now(), announce));
  });

  let last = performance.now();
  let lastWholeSecond = -1;
  function frame(nowMs) {
    const dt = Math.min(0.1, (nowMs - last) / 1000);
    last = nowMs;
    if (tick(game, dt) === 'timeUp') {
      sfx.miss();
      announce('Out of time! The tide came in.');
    }
    // Tick each second while the clock is nearly out.
    const whole = Math.ceil(game.timeLeft);
    if (game.screen === 'play' && whole <= 10 && whole !== lastWholeSecond && whole > 0) {
      lastWholeSecond = whole;
      sfx.tick();
    }
    draw(ctx, game, nowMs);
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
}

void CANVAS_W;
void CANVAS_H;
