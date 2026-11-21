// The game's rules, with no drawing and no DOM: which scene is up, which
// differences are found, what the clock says, what a click does. The
// renderer reads this state; the input file feeds it clicks and keys.
// Effects (rings where a find landed, ripples where a miss did) live here
// as timestamps on the game clock so a screenshot can freeze them mid-ring.
import { FIND_RADIUS, HINTS_PER_SCENE, HINT_COST_SECONDS, MISS_PENALTY_SECONDS, SCENE_SECONDS } from './config.js';
import { SCENES } from './scenes.js';
import { playFind, playGameComplete, playHint, playMiss, playSceneComplete } from './audio.js';

export const SCREEN = {
  TITLE: 'title',
  PLAY: 'play',
  PAUSED: 'paused',
  SCENE_DONE: 'scene-done',
  GAME_DONE: 'game-done',
};

/** A fresh game, sitting on its title screen. */
export function createGame() {
  return {
    screen: SCREEN.TITLE,
    sceneIndex: 0,
    found: new Set(),
    secondsLeft: SCENE_SECONDS[0],
    sceneSeconds: SCENE_SECONDS[0],
    hintsLeft: HINTS_PER_SCENE,
    hintId: null,
    hintUntil: 0,
    clock: 0,
    effects: [],
    mistakes: 0,
    hintsUsed: 0,
    totalFound: 0,
    totalSeconds: 0,
    timedOut: false,
  };
}

/** Put a scene on the table: nothing found, a full clock, fresh hints. */
export function loadScene(game, index) {
  game.sceneIndex = index;
  game.found = new Set();
  game.sceneSeconds = SCENE_SECONDS[index];
  game.secondsLeft = SCENE_SECONDS[index];
  game.hintsLeft = HINTS_PER_SCENE;
  game.hintId = null;
  game.hintUntil = 0;
  game.effects = [];
  game.timedOut = false;
}

/** Start from the title screen: totals cleared, first scene loaded. */
export function startGame(game) {
  game.mistakes = 0;
  game.hintsUsed = 0;
  game.totalFound = 0;
  game.totalSeconds = 0;
  loadScene(game, 0);
  game.screen = SCREEN.PLAY;
}

/** The scene currently on the table. */
export function currentScene(game) {
  return SCENES[game.sceneIndex];
}

/** How many differences of the current scene are still hidden. */
export function remaining(game) {
  return currentScene(game).differences.length - game.found.size;
}

/** Advance the clock; a play screen whose time runs out ends the scene. */
export function update(game, dt) {
  game.clock += dt;
  game.effects = game.effects.filter((effect) => game.clock - effect.at < effect.span);
  if (game.screen !== SCREEN.PLAY) return;
  game.secondsLeft -= dt;
  if (game.secondsLeft <= 0) {
    game.secondsLeft = 0;
    game.timedOut = true;
    finishScene(game);
  }
}

/** Close the current scene and move to its results card. */
function finishScene(game) {
  game.totalSeconds += game.sceneSeconds - Math.max(0, Math.round(game.secondsLeft));
  game.totalFound += game.found.size;
  const last = game.sceneIndex === SCENES.length - 1;
  if (last && !game.timedOut && remaining(game) === 0) {
    game.screen = SCREEN.GAME_DONE;
    playGameComplete();
  } else {
    game.screen = SCREEN.SCENE_DONE;
    if (!game.timedOut) playSceneComplete();
  }
}

/**
 * A click inside a panel, in panel coordinates. A click within a hidden
 * difference's radius finds it (on both panels at once); any other click
 * is a miss and costs clock. Returns what happened, for the input's log.
 */
export function clickPanel(game, panel, x, y) {
  if (game.screen !== SCREEN.PLAY) return 'ignored';
  const scene = currentScene(game);
  let best = null;
  let bestDistance = Infinity;
  for (const difference of scene.differences) {
    if (game.found.has(difference.id)) continue;
    const distance = Math.hypot(x - difference.x, y - difference.y);
    const reach = Math.max(FIND_RADIUS, difference.r);
    if (distance <= reach && distance < bestDistance) {
      best = difference;
      bestDistance = distance;
    }
  }
  if (best !== null) {
    game.found.add(best.id);
    if (game.hintId === best.id) game.hintId = null;
    game.effects.push({ kind: 'ring', x: best.x, y: best.y, r: best.r, at: game.clock, span: 0.9 });
    game.effects.push({ kind: 'spark', x: best.x, y: best.y, r: best.r, at: game.clock, span: 0.7 });
    playFind();
    if (remaining(game) === 0) finishScene(game);
    return 'found';
  }
  game.mistakes += 1;
  game.secondsLeft = Math.max(0, game.secondsLeft - MISS_PENALTY_SECONDS);
  game.effects.push({ kind: 'ripple', panel, x, y, r: 16, at: game.clock, span: 0.55 });
  playMiss();
  if (game.secondsLeft <= 0) {
    game.timedOut = true;
    finishScene(game);
  }
  return 'miss';
}

/**
 * Spend a hint: the first still-hidden difference (in the scene's own
 * order) pulses for a few seconds. Costs clock and one of the scene's
 * hints; refuses when none are left or nothing is hidden.
 */
export function useHint(game) {
  if (game.screen !== SCREEN.PLAY) return false;
  if (game.hintsLeft <= 0) return false;
  const target = currentScene(game).differences.find((difference) => !game.found.has(difference.id));
  if (target === undefined) return false;
  game.hintsLeft -= 1;
  game.hintsUsed += 1;
  game.secondsLeft = Math.max(0, game.secondsLeft - HINT_COST_SECONDS);
  game.hintId = target.id;
  game.hintUntil = game.clock + 2.4;
  playHint();
  return true;
}

/** Whether the hint ring should be showing, and on which difference. */
export function activeHint(game) {
  if (game.hintId === null || game.clock > game.hintUntil) return null;
  return currentScene(game).differences.find((difference) => difference.id === game.hintId) ?? null;
}

/** Pause or resume a scene in play. */
export function togglePause(game) {
  if (game.screen === SCREEN.PLAY) game.screen = SCREEN.PAUSED;
  else if (game.screen === SCREEN.PAUSED) game.screen = SCREEN.PLAY;
}

/** From a scene's results card: on to the next scene, or the final card. */
export function advance(game) {
  if (game.screen === SCREEN.GAME_DONE) {
    startGame(game);
    return;
  }
  if (game.screen !== SCREEN.SCENE_DONE) return;
  if (game.sceneIndex === SCENES.length - 1) {
    game.screen = SCREEN.GAME_DONE;
    return;
  }
  loadScene(game, game.sceneIndex + 1);
  game.screen = SCREEN.PLAY;
}

/** Replay the scene on the table (from its results card, or mid-play). */
export function retryScene(game) {
  if (game.screen === SCREEN.SCENE_DONE) {
    game.totalFound -= game.found.size;
    game.totalSeconds -= game.sceneSeconds - Math.max(0, Math.round(game.secondsLeft));
  }
  loadScene(game, game.sceneIndex);
  game.screen = SCREEN.PLAY;
}

/** Stars for a finished run: three for a clean sweep, fewer as the hunt roughens. */
export function stars(game) {
  if (game.totalFound < SCENES.reduce((sum, scene) => sum + scene.differences.length, 0)) return 1;
  if (game.mistakes === 0 && game.hintsUsed === 0) return 3;
  if (game.mistakes <= 4 && game.hintsUsed <= 2) return 2;
  return 1;
}
