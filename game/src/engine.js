// Game state for Twice-Told Tides: which screen is up, which scene,
// what has been found, the countdown, hints and stars. Pure logic —
// no canvas, no DOM — so the smoke test and the shot stager can drive
// it directly.
import { HINTS_PER_SCENE, HINT_PENALTY_S, MISS_PENALTY_S } from './config.js';
import { SCENES } from './scenes.js';

export const SCREEN_TITLE = 'title';
export const SCREEN_PLAY = 'play';
export const SCREEN_PAUSED = 'paused';
export const SCREEN_SCENE_DONE = 'sceneDone';
export const SCREEN_GAME_DONE = 'gameDone';
export const SCREEN_TIME_UP = 'timeUp';

export function newGame() {
  return {
    screen: SCREEN_TITLE,
    sceneIndex: 0,
    found: new Set(),
    hintsLeft: HINTS_PER_SCENE,
    hintsUsed: 0,
    misses: 0,
    timeLeft: SCENES[0].seconds,
    stars: [0, 0, 0],
    muted: false,
    hintTarget: null, // difference id the hint ring points at, or null
    hintUntil: 0, // ms timestamp when the hint ring fades
    foundAt: new Map(), // difference id -> ms timestamp of the find
    missAt: null, // {x, y, at} of the latest miss ripple, or null
    startedAt: 0,
  };
}

export function currentScene(game) {
  return SCENES[game.sceneIndex];
}

export function remainingCount(game) {
  return currentScene(game).differences.length - game.found.size;
}

export function startScene(game, index) {
  game.sceneIndex = index;
  game.screen = SCREEN_PLAY;
  game.found = new Set();
  game.hintsLeft = HINTS_PER_SCENE;
  game.hintsUsed = 0;
  game.misses = 0;
  game.timeLeft = SCENES[index].seconds;
  game.hintTarget = null;
  game.hintUntil = 0;
  game.foundAt = new Map();
  game.missAt = null;
}

export function startGame(game) {
  game.stars = [0, 0, 0];
  startScene(game, 0);
}

/** Stars for a finished scene: 3 when fast and clean, fewer otherwise. */
export function starsFor(game) {
  const scene = currentScene(game);
  const fraction = game.timeLeft / scene.seconds;
  let stars = 3;
  if (game.hintsUsed > 0 || game.misses >= 3) stars -= 1;
  if (fraction < 0.25) stars -= 1;
  return Math.max(1, stars);
}

export function completeScene(game) {
  game.stars[game.sceneIndex] = starsFor(game);
  game.hintTarget = null;
  game.screen = game.sceneIndex + 1 >= SCENES.length ? SCREEN_GAME_DONE : SCREEN_SCENE_DONE;
}

export function nextScene(game) {
  startScene(game, game.sceneIndex + 1);
}

/** Advance the countdown; returns 'timeUp' when the clock runs out. */
export function tick(game, dtSeconds) {
  if (game.screen !== SCREEN_PLAY) return null;
  game.timeLeft -= dtSeconds;
  if (game.timeLeft <= 0) {
    game.timeLeft = 0;
    game.screen = SCREEN_TIME_UP;
    return 'timeUp';
  }
  return null;
}

/**
 * Handle a click at panel-local coordinates (x, y) on either panel.
 * Returns { kind: 'found', diff } | { kind: 'miss' } | null (not playing).
 */
export function clickAt(game, x, y, panel, nowMs) {
  if (game.screen !== SCREEN_PLAY) return null;
  const scene = currentScene(game);
  for (const diff of scene.differences) {
    if (game.found.has(diff.id)) continue;
    const dx = x - diff.x;
    const dy = y - diff.y;
    if (dx * dx + dy * dy <= diff.r * diff.r) {
      game.found.add(diff.id);
      game.foundAt.set(diff.id, nowMs);
      if (game.found.size === scene.differences.length) completeScene(game);
      return { kind: 'found', diff };
    }
  }
  game.misses += 1;
  game.timeLeft = Math.max(0, game.timeLeft - MISS_PENALTY_S);
  game.missAt = { x, y, panel, at: nowMs };
  if (game.timeLeft === 0) game.screen = SCREEN_TIME_UP;
  return { kind: 'miss' };
}

/** Spend a hint: point at the first unfound difference. Returns it or null. */
export function useHint(game, nowMs) {
  if (game.screen !== SCREEN_PLAY || game.hintsLeft <= 0) return null;
  const scene = currentScene(game);
  const target = scene.differences.find((d) => !game.found.has(d.id));
  if (!target) return null;
  game.hintsLeft -= 1;
  game.hintsUsed += 1;
  game.timeLeft = Math.max(0, game.timeLeft - HINT_PENALTY_S);
  game.hintTarget = target.id;
  game.hintUntil = nowMs + 3500;
  if (game.timeLeft === 0) game.screen = SCREEN_TIME_UP;
  return target;
}

export function togglePause(game) {
  if (game.screen === SCREEN_PLAY) game.screen = SCREEN_PAUSED;
  else if (game.screen === SCREEN_PAUSED) game.screen = SCREEN_PLAY;
  return game.screen;
}

export function toggleMute(game) {
  game.muted = !game.muted;
  return game.muted;
}
