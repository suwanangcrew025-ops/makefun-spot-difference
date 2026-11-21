// random.js — a small seeded random source (mulberry32) and the helpers the
// painters use. Scenes are painted from a fixed seed per scene, so the two
// panels, every repaint and every screenshot show the very same picture:
// randomness here is for texture (stars, sparkles, cobbles), never for layout
// that a difference depends on.

export function makeRng(seed) {
  let state = seed >>> 0;
  const next = () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  return {
    next,
    // A float in [min, max).
    range: (min, max) => min + next() * (max - min),
    // An integer in [min, max], both ends included.
    int: (min, max) => min + Math.floor(next() * (max - min + 1)),
    // True with probability p.
    chance: (p) => next() < p,
    // One member of the array.
    pick: (list) => list[Math.floor(next() * list.length)],
  };
}

// The seed a scene is painted with: fixed per scene so a scene always paints
// itself the same way, in the parlour and in the screenshots alike.
export function sceneSeed(sceneIndex) {
  return 7100 + sceneIndex * 1313;
}
