// scenes.js — the scene book: the three pictures of Twice-Told Tides, in the
// order they are played. Each scene module brings its own painter and its own
// list of differences; this file only puts them in order and hands them out.

import { harbourScene } from './scene-harbour.js';
import { marketScene } from './scene-market.js';
import { glasshouseScene } from './scene-glasshouse.js';

export const SCENES = [harbourScene, marketScene, glasshouseScene];

export function sceneAt(index) {
  return SCENES[index];
}

// The set of every difference id a scene has: the altered set the right-hand
// panel is painted with, since the second telling changes at exactly those
// spots.
export function allDifferenceIds(scene) {
  return new Set(scene.differences.map((d) => d.id));
}

// The difference whose mark covers a panel-local point, or null. When marks
// overlap, the nearest centre wins, so a click lands on the difference the
// player most plainly meant.
export function differenceAt(scene, x, y) {
  let best = null;
  let bestDist = Infinity;
  for (const d of scene.differences) {
    const dist = Math.hypot(x - d.x, y - d.y);
    if (dist <= d.r && dist < bestDist) {
      best = d;
      bestDist = dist;
    }
  }
  return best;
}
