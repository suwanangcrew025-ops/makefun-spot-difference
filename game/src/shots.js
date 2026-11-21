// The screenshot scenes behind ?shot=cover|night-market|glasshouse|
// complete. Each one sets the real game state to a frozen mid-hunt
// moment — found rings, a hint ring, the complete card — and the boot
// code renders it once with a fixed clock, so the frame is what a real
// game looks like and the same run always gives the same frame.
import { SCENES } from './scenes.js';
import { SCREEN_GAME_DONE, SCREEN_PLAY, startScene } from './engine.js';

function markFound(game, ids, nowMs, ageMs = 320) {
  const scene = SCENES[game.sceneIndex];
  for (const id of ids) {
    if (scene.differences.some((d) => d.id === id)) {
      game.found.add(id);
      game.foundAt.set(id, nowMs - ageMs);
    }
  }
}

/**
 * Put `game` into the named shot scene and return the fixed clock
 * (ms) the frame should be rendered with.
 */
export function stageShot(name, game) {
  const nowMs = 100000;
  if (name === 'night-market') {
    startScene(game, 1);
    game.timeLeft = 150;
    markFound(game, ['bulb', 'fruit'], nowMs);
  } else if (name === 'glasshouse') {
    startScene(game, 2);
    game.timeLeft = 182;
    markFound(game, ['flower'], nowMs);
    game.hintTarget = 'butterfly';
    game.hintUntil = nowMs + 3000;
  } else if (name === 'complete') {
    startScene(game, 2);
    game.timeLeft = 42;
    game.stars = [3, 2, 3];
    markFound(game, SCENES[2].differences.map((d) => d.id), nowMs, 2000);
    game.screen = SCREEN_GAME_DONE;
  } else {
    // cover: the harbour mid-hunt, one difference found, spark visible.
    startScene(game, 0);
    game.timeLeft = 118;
    markFound(game, ['sail'], nowMs);
  }
  game.screen = game.screen === SCREEN_GAME_DONE ? SCREEN_GAME_DONE : SCREEN_PLAY;
  return nowMs;
}
