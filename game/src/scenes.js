// The scene shelf: the three paintings, in the order they are played.
// Each scene module brings its own painter and its own list of differences
// (panel coordinates and the radius a click must land inside), so adding a
// scene is adding a file and a line here.
import { harbourScene } from './scene-harbour.js';
import { marketScene } from './scene-market.js';
import { glasshouseScene } from './scene-glasshouse.js';

export const SCENES = [harbourScene, marketScene, glasshouseScene];

/** The ids of every difference a scene hides, as a set — the right panel's altered set. */
export function allDifferenceIds(scene) {
  return new Set(scene.differences.map((difference) => difference.id));
}

/** The total number of differences in the whole game. */
export function totalDifferences() {
  return SCENES.reduce((sum, scene) => sum + scene.differences.length, 0);
}
