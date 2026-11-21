// The scene registry: the three painters, in play order, with their
// names, timers and difference lists. The engine and the renderer only
// ever talk to scenes through this list.
import { HARBOUR, paintHarbour } from './scene-harbour.js';
import { MARKET, paintMarket } from './scene-market.js';
import { GLASSHOUSE, paintGlasshouse } from './scene-glasshouse.js';

export const SCENES = [
  { ...HARBOUR, paint: paintHarbour },
  { ...MARKET, paint: paintMarket },
  { ...GLASSHOUSE, paint: paintGlasshouse },
];

export function sceneById(id) {
  return SCENES.find((scene) => scene.id === id) ?? null;
}

/** The altered set for a panel: which difference ids take changed form. */
export function alteredSet(scene, ids) {
  const known = new Set(scene.differences.map((d) => d.id));
  return new Set([...ids].filter((id) => known.has(id)));
}
