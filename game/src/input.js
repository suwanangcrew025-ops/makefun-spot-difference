// Input for Twice-Told Tides: mouse clicks on the canvas (panels,
// header buttons, card buttons) and keyboard shortcuts. It translates
// a click into panel-local coordinates and hands the result to the
// engine, then reports what happened so the caller can announce it
// and play the matching sound.
import { CANVAS_H, CANVAS_W, PANEL_H, PANEL_LEFT_X, PANEL_RIGHT_X, PANEL_Y } from './config.js';
import {
  SCREEN_GAME_DONE, SCREEN_PAUSED, SCREEN_PLAY, SCREEN_SCENE_DONE,
  SCREEN_TIME_UP, SCREEN_TITLE, clickAt, currentScene,
  nextScene, startGame, startScene, toggleMute, togglePause, useHint,
} from './engine.js';
import { cardButtons, headerButtons } from './render.js';
import { setMuted, sfx } from './audio.js';

function inRect(x, y, rect) {
  return x >= rect.x && x <= rect.x + rect.w && y >= rect.y && y <= rect.y + rect.h;
}

/** Which panel (0 left, 1 right) a canvas point is in, or -1. */
export function panelAt(x, y) {
  if (y < PANEL_Y || y > PANEL_Y + PANEL_H) return -1;
  if (x >= PANEL_LEFT_X && x <= PANEL_LEFT_X + 560) return 0;
  if (x >= PANEL_RIGHT_X && x <= PANEL_RIGHT_X + 560) return 1;
  return -1;
}

function panelLocal(x, y, panel) {
  const ox = panel === 0 ? PANEL_LEFT_X : PANEL_RIGHT_X;
  return { x: x - ox, y: y - PANEL_Y };
}

export function makeAnnouncer(game, statusEl) {
  return function announce(text) {
    statusEl.textContent = text;
  };
}

/**
 * Handle a canvas click at canvas coordinates (x, y).
 * Returns an announcement string for the status line, or ''.
 */
export function handleClick(game, x, y, nowMs, announce) {
  // Header buttons work on every screen except the title card.
  if (game.screen !== SCREEN_TITLE) {
    for (const btn of headerButtons(game)) {
      if (!inRect(x, y, btn)) continue;
      if (btn.id === 'hint') {
        const target = useHint(game, nowMs);
        if (target) {
          sfx.hint();
          return `Hint: look near ${target.label}. 8 seconds lost. ${game.hintsLeft} hints left.`;
        }
        return 'No hints left.';
      }
      if (btn.id === 'pause') {
        const screen = togglePause(game);
        sfx.click();
        return screen === SCREEN_PAUSED ? 'Paused.' : 'Resumed.';
      }
      if (btn.id === 'mute') {
        const muted = toggleMute(game);
        setMuted(muted);
        return muted ? 'Sound off.' : 'Sound on.';
      }
    }
  }

  // Card buttons.
  for (const btn of cardButtons(game.screen)) {
    if (!inRect(x, y, btn)) continue;
    sfx.click();
    if (btn.id === 'start') {
      startGame(game);
      return `Scene 1: ${currentScene(game).name}. Find ${currentScene(game).differences.length} differences.`;
    }
    if (btn.id === 'next') {
      nextScene(game);
      return `Scene ${game.sceneIndex + 1}: ${currentScene(game).name}. Find ${currentScene(game).differences.length} differences.`;
    }
    if (btn.id === 'replay' || btn.id === 'retry') {
      startScene(game, game.sceneIndex);
      return `Scene restarted: ${currentScene(game).name}.`;
    }
    if (btn.id === 'again') {
      startGame(game);
      return `Scene 1: ${currentScene(game).name}. Find ${currentScene(game).differences.length} differences.`;
    }
    if (btn.id === 'resume') {
      togglePause(game);
      return 'Resumed.';
    }
  }

  // Title card: any other click starts the game.
  if (game.screen === SCREEN_TITLE) {
    startGame(game);
    return `Scene 1: ${currentScene(game).name}. Find ${currentScene(game).differences.length} differences.`;
  }

  // Panel clicks during play.
  if (game.screen === SCREEN_PLAY) {
    const panel = panelAt(x, y);
    if (panel === -1) return '';
    const local = panelLocal(x, y, panel);
    const result = clickAt(game, local.x, local.y, panel, nowMs);
    if (!result) return '';
    if (result.kind === 'found') {
      sfx.found();
      const scene = currentScene(game);
      if (game.screen === SCREEN_SCENE_DONE) {
        sfx.complete();
        return `Found ${result.diff.label} — the last one! Scene complete.`;
      }
      if (game.screen === SCREEN_GAME_DONE) {
        sfx.fanfare();
        return `Found ${result.diff.label} — the last one! Game complete.`;
      }
      return `Found ${result.diff.label}! ${game.found.size} of ${scene.differences.length} found.`;
    }
    sfx.miss();
    return `Not a difference. 4 seconds lost. ${Math.ceil(game.timeLeft)} seconds left.`;
  }
  return '';
}

/**
 * Handle a key press. Returns an announcement string, or ''.
 * Enter starts/advances, H hints, P pauses, M mutes, R restarts the
 * scene, N moves to the next scene when one is offered.
 */
export function handleKey(game, key, nowMs, announce) {
  const k = key.toLowerCase();
  if (k === 'enter') {
    if (game.screen === SCREEN_TITLE) {
      startGame(game);
      sfx.click();
      return `Scene 1: ${currentScene(game).name}. Find ${currentScene(game).differences.length} differences.`;
    }
    if (game.screen === SCREEN_SCENE_DONE) {
      nextScene(game);
      sfx.click();
      return `Scene ${game.sceneIndex + 1}: ${currentScene(game).name}.`;
    }
    if (game.screen === SCREEN_GAME_DONE || game.screen === SCREEN_TIME_UP) {
      startGame(game);
      sfx.click();
      return `Scene 1: ${currentScene(game).name}.`;
    }
    if (game.screen === SCREEN_PAUSED) {
      togglePause(game);
      return 'Resumed.';
    }
    return '';
  }
  if (k === 'h' && game.screen === SCREEN_PLAY) {
    const target = useHint(game, nowMs);
    if (target) {
      sfx.hint();
      return `Hint: look near ${target.label}. 8 seconds lost. ${game.hintsLeft} hints left.`;
    }
    return 'No hints left.';
  }
  if (k === 'p' && (game.screen === SCREEN_PLAY || game.screen === SCREEN_PAUSED)) {
    const screen = togglePause(game);
    sfx.click();
    return screen === SCREEN_PAUSED ? 'Paused.' : 'Resumed.';
  }
  if (k === 'm') {
    const muted = toggleMute(game);
    setMuted(muted);
    return muted ? 'Sound off.' : 'Sound on.';
  }
  if (k === 'r' && (game.screen === SCREEN_PLAY || game.screen === SCREEN_TIME_UP)) {
    startScene(game, game.sceneIndex);
    sfx.click();
    return `Scene restarted: ${currentScene(game).name}.`;
  }
  if (k === 'n' && game.screen === SCREEN_SCENE_DONE) {
    nextScene(game);
    sfx.click();
    return `Scene ${game.sceneIndex + 1}: ${currentScene(game).name}.`;
  }
  return '';
}

export function canvasPoint(event, canvas) {
  const rect = canvas.getBoundingClientRect();
  return {
    x: ((event.clientX - rect.left) / rect.width) * CANVAS_W,
    y: ((event.clientY - rect.top) / rect.height) * CANVAS_H,
  };
}
