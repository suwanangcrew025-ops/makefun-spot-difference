// The screenshot scenes behind ?shot=cover|harbour|glasshouse|complete.
// Each stages a real game state — a scene part-hunted, its rings on the
// finds, the counter where a player would see it — and the boot code
// paints it and sets window.__shotReady. The states are fixed, so the
// same shot is the same frame every time it is taken.
import { loadScene, SCREEN } from './engine.js';
import { SCENES } from './scenes.js';

function stage(game, sceneIndex, foundIds) {
  loadScene(game, sceneIndex);
  game.clock = 5;
  for (const id of foundIds) game.found.add(id);
  game.screen = SCREEN.PLAY;
}

/** Stage the named scene; returns false when the name is not a shot. */
export function stageShot(game, name) {
  switch (name) {
    case 'cover': {
      stage(game, 0, ['lamp', 'sail']);
      game.secondsLeft = 103;
      game.mistakes = 1;
      // A ring still opening on the sail, as if clicked a moment ago.
      game.effects.push({ kind: 'ring', x: 390, y: 394, r: 42, at: 4.62, span: 0.9 });
      game.effects.push({ kind: 'spark', x: 390, y: 394, r: 42, at: 4.68, span: 0.7 });
      return true;
    }
    case 'harbour': {
      stage(game, 1, ['moon', 'apples', 'flag']);
      game.secondsLeft = 121;
      game.hintsLeft = 2;
      return true;
    }
    case 'glasshouse': {
      stage(game, 2, ['planter', 'butterfly']);
      game.secondsLeft = 158;
      game.hintId = 'cactus';
      game.hintUntil = game.clock + 99;
      return true;
    }
    case 'complete': {
      stage(game, 2, SCENES[2].differences.map((difference) => difference.id));
      game.totalFound = 18;
      game.totalSeconds = 512;
      game.mistakes = 3;
      game.hintsUsed = 2;
      game.screen = SCREEN.GAME_DONE;
      return true;
    }
    default:
      return false;
  }
}
