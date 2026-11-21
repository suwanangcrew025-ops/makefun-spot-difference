// Seeded randomness for Twice-Told Tides. Every panel is painted twice
// (original and altered) from the same seeds, so the two pictures are
// pixel-identical except at the designed difference spots. Anything that
// can vanish gets its own stream (seeded from its name), so its absence
// never shifts the random numbers the rest of the scene draws.

/** mulberry32: a small deterministic PRNG. */
export function mulberry32(seed) {
  let a = seed >>> 0;
  return function next() {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Turn a short string into a stable 32-bit seed. */
export function hashStr(text) {
  let h = 2166136261;
  for (let i = 0; i < text.length; i += 1) {
    h ^= text.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/** A fresh stream for one named element of one scene. */
export function streamFor(sceneId, element) {
  return mulberry32(hashStr(`${sceneId}:${element}`));
}

/** A fresh stream for the scene as a whole (shared, fixed-order use). */
export function sceneStream(sceneId) {
  return mulberry32(hashStr(`scene:${sceneId}`));
}

export function range(rng, lo, hi) {
  return lo + rng() * (hi - lo);
}

export function pick(rng, items) {
  return items[Math.floor(rng() * items.length)];
}
