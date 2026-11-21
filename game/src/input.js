// input.js — the player's hands: mouse clicks on the panels and the parlour's
// keys. Clicks are translated from page coordinates into panel-local ones
// (the canvas may be scaled by the page), and every gesture first wakes the
// sound kit, as browsers only allow audio after a gesture.

import { VIEW, PANEL } from './config.js';

// Where a page point falls: which panel, and the point in that panel's own
// 0..600 space — or null when the click missed both pictures.
export function panelPoint(canvas, clientX, clientY) {
  const rect = canvas.getBoundingClientRect();
  const x = ((clientX - rect.left) / rect.width) * VIEW.width;
  const y = ((clientY - rect.top) / rect.height) * VIEW.height;
  if (y < PANEL.top || y > PANEL.top + PANEL.height) return null;
  if (x >= PANEL.leftX && x <= PANEL.leftX + PANEL.width) {
    return { panel: 0, x: x - PANEL.leftX, y: y - PANEL.top };
  }
  if (x >= PANEL.rightX && x <= PANEL.rightX + PANEL.width) {
    return { panel: 1, x: x - PANEL.rightX, y: y - PANEL.top };
  }
  return null;
}

export function wireInput(canvas, game, sound) {
  canvas.addEventListener('pointerdown', (event) => {
    sound.wake();
    if (game.screen === 'title') {
      game.startGame();
      return;
    }
    if (game.screen === 'sceneDone') {
      game.nextScene();
      return;
    }
    if (game.screen === 'gameDone') {
      game.startGame();
      return;
    }
    if (game.screen === 'timeUp') {
      game.restartScene();
      return;
    }
    if (game.screen === 'paused') {
      game.togglePause();
      return;
    }
    const point = panelPoint(canvas, event.clientX, event.clientY);
    if (point) game.clickPanel(point.panel, point.x, point.y);
  });

  window.addEventListener('keydown', (event) => {
    const key = event.key.toLowerCase();
    sound.wake();
    if (key === 'enter') {
      if (game.screen === 'title' || game.screen === 'gameDone') game.startGame();
      else if (game.screen === 'sceneDone') game.nextScene();
      else if (game.screen === 'timeUp') game.restartScene();
      return;
    }
    if (key === 'h') {
      game.useHint();
    } else if (key === 'p' || key === 'escape') {
      game.togglePause();
    } else if (key === 'm') {
      sound.setMuted(!sound.muted);
      game.announce(sound.muted ? 'Sound off.' : 'Sound on.');
    } else if (key === 'r') {
      if (game.screen === 'gameDone') game.startGame();
      else game.restartScene();
    } else if (key === 'n') {
      game.nextScene();
    } else {
      return;
    }
    if (['h', 'p', 'm', 'r', 'n'].includes(key)) sound.ui();
  });
}
