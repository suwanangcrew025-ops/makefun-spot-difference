// A small seeded random number maker (mulberry32). The scenes scatter
// their stars, sparkles and water lines from a seed, so the left and right
// panels — and every screenshot — agree exactly, visit after visit. Only
// the scatter uses it; the differences themselves are placed by hand.

/** Returns a function that yields the same stream of numbers in [0, 1) for the same seed. */
export function createRandom(seed) {
  let state = seed >>> 0;
  return function next() {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** A whole number from the stream, from `low` to `high` inclusive. */
export function randomInt(next, low, high) {
  return low + Math.floor(next() * (high - low + 1));
}

/** A scatter of points over a rectangle, from the seeded stream. */
export function scatter(next, count, width, height) {
  const points = [];
  for (let i = 0; i < count; i += 1) {
    points.push({ x: next() * width, y: next() * height, r: 0.6 + next() * 1.5 });
  }
  return points;
}
