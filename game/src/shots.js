// shots.js — the screenshot staging. With a ?shot= name in the address, the
// game arranges itself into a posed, frozen moment of real play — a hunt in
// mid-course, some differences ringed, some still hidden, the counter and
// the clock where play would put them — and holds it still for the camera.
// Nothing here is drawn that play itself could not produce: the staging only
// sets the engine's own state, and the ordinary renderer draws the frame.

import { sceneAt } from './scenes.js';

// Pose the game for the named shot. Returns true when a shot was staged.
export function stageShot(game, search) {
  const shot = new URLSearchParams(search).get('shot');
  if (!shot) return false;
  game.frozen = true;
  if (shot === 'cover') {
    // The harbour, mid-hunt: the lamp and the stripe found, three to go,
    // and the spark of the last find still in the air.
    game.beginScene(0);
    const scene = sceneAt(0);
    game.found = new Set(['lamp', 'stripe']);
    game.timeLeft = 117;
    const stripe = scene.differences.find((d) => d.id === 'stripe');
    game.effects = [{ kind: 'spark', x: stripe.x, y: stripe.y, panel: 'both', age: 0.3, life: 0.65 }];
    game.announce('Found: the boat stripe, painted teal. 3 to go.');
  } else if (shot === 'market') {
    // The night market, mid-hunt: the bulb and the jar found, four to go.
    game.beginScene(1);
    game.found = new Set(['bulb', 'jar']);
    game.timeLeft = 131;
    game.hintsLeft = 2;
    game.announce('Found: a jar, gone from the shelf. 4 to go.');
  } else if (shot === 'glass') {
    // The glasshouse, mid-hunt: three found, and a hint ring circling the
    // butterfly while four still hide.
    game.beginScene(2);
    game.found = new Set(['pane', 'cactus', 'can']);
    game.timeLeft = 148;
    game.hintsLeft = 2;
    game.hintId = 'butterfly';
    game.hintTimeLeft = 5;
    game.announce('A hint glimmers somewhere in the picture. 4 to go.');
  } else if (shot === 'end') {
    // The parlour complete: the last scene fully found behind the card that
    // shows every scene's stars.
    game.beginScene(2);
    const scene = sceneAt(2);
    game.found = new Set(scene.differences.map((d) => d.id));
    game.timeLeft = 52;
    game.results = [
      { sceneId: 'harbour', title: 'Dusk at Lanternwick Harbour', stars: 3, timeLeft: 41, misses: 1, hintsUsed: 0 },
      { sceneId: 'market', title: 'The Night Market', stars: 2, timeLeft: 18, misses: 3, hintsUsed: 1 },
      { sceneId: 'glasshouse', title: 'The Glasshouse', stars: 3, timeLeft: 52, misses: 0, hintsUsed: 0 },
    ];
    game.screen = 'gameDone';
    game.announce('The parlour is complete: 8 of 9 stars. Press R to play again.');
  } else {
    game.frozen = false;
    return false;
  }
  return true;
}
