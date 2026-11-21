// paintkit.js — the shared brushes every scene painter reaches for: skies,
// moons, glows, water, gulls and the wooden frame the pictures hang in. Each
// function takes the context first and works in whatever coordinate space the
// caller has set up (panel-local, 0..600, for the scenes).

// A vertical gradient wash between colour stops, returned ready to fill with.
export function skyGradient(ctx, x, y, w, h, stops) {
  const grad = ctx.createLinearGradient(x, y, x, y + h);
  for (const [at, colour] of stops) grad.addColorStop(at, colour);
  return grad;
}

// A filled circle.
export function disc(ctx, x, y, r, colour) {
  ctx.fillStyle = colour;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fill();
}

// A soft radial glow, the kind a lamp throws: bright at the heart, gone at r.
export function glow(ctx, x, y, r, colour) {
  const grad = ctx.createRadialGradient(x, y, 0, x, y, r);
  grad.addColorStop(0, colour);
  grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
  ctx.fillStyle = grad;
  ctx.fillRect(x - r, y - r, r * 2, r * 2);
}

// A path for a rounded rectangle, left current so the caller can fill or stroke.
export function roundedRectPath(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.arcTo(x + w, y, x + w, y + r, r);
  ctx.lineTo(x + w, y + h - r);
  ctx.arcTo(x + w, y + h, x + w - r, y + h, r);
  ctx.lineTo(x + r, y + h);
  ctx.arcTo(x, y + h, x, y + h - r, r);
  ctx.lineTo(x, y + r);
  ctx.arcTo(x, y, x + r, y, r);
  ctx.closePath();
}

// Pinprick stars scattered over a rectangle of sky.
export function starField(ctx, rng, x, y, w, h, count, colour) {
  ctx.fillStyle = colour;
  for (let i = 0; i < count; i++) {
    const sx = x + rng.next() * w;
    const sy = y + rng.next() * h;
    const r = rng.range(0.6, 1.7);
    ctx.globalAlpha = rng.range(0.25, 0.95);
    ctx.beginPath();
    ctx.arc(sx, sy, r, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
}

// A four-point sparkle, like light catching glass.
export function sparkle(ctx, x, y, r, colour) {
  ctx.fillStyle = colour;
  ctx.beginPath();
  ctx.moveTo(x, y - r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.quadraticCurveTo(x, y, x, y + r);
  ctx.quadraticCurveTo(x, y, x - r, y);
  ctx.quadraticCurveTo(x, y, x, y - r);
  ctx.fill();
}

// A scalloped band of water: a run of overlapping arcs along a baseline.
export function waveBand(ctx, rng, x, y, w, colour, lift) {
  ctx.strokeStyle = colour;
  ctx.lineWidth = 2;
  ctx.beginPath();
  const step = 26;
  for (let px = x; px < x + w; px += step) {
    const wobble = rng.range(-1.5, 1.5);
    ctx.arc(px + step / 2, y + wobble, step / 2, Math.PI * 1.08, Math.PI * 1.92);
  }
  ctx.globalAlpha = 0.55;
  ctx.stroke();
  ctx.globalAlpha = 1;
  void lift;
}

// A gull in flight: two shallow arcs meeting at the body. A scene can leave
// one out entirely — that absence is a difference.
export function gullShape(ctx, x, y, s, colour) {
  ctx.strokeStyle = colour;
  ctx.lineWidth = Math.max(2, s * 0.16);
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(x - s, y);
  ctx.quadraticCurveTo(x - s * 0.45, y - s * 0.62, x, y);
  ctx.quadraticCurveTo(x + s * 0.45, y - s * 0.62, x + s, y);
  ctx.stroke();
}

// A crescent moon: a pale disc with the sky's colour laid over it, offset.
export function crescentMoon(ctx, x, y, r, colour, skyColour) {
  disc(ctx, x, y, r, colour);
  disc(ctx, x + r * 0.42, y - r * 0.28, r * 0.86, skyColour);
}

// A cloud made of overlapping puffs, flat-bottomed.
export function cloudPuff(ctx, x, y, s, colour) {
  ctx.fillStyle = colour;
  const puffs = [
    [0, 0, 1],
    [-0.8, 0.18, 0.72],
    [0.8, 0.18, 0.78],
    [-0.35, -0.3, 0.66],
    [0.42, -0.26, 0.6],
  ];
  for (const [dx, dy, dr] of puffs) {
    ctx.beginPath();
    ctx.arc(x + dx * s, y + dy * s, dr * s * 0.55, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.fillRect(x - s * 1.15, y - s * 0.05, s * 2.3, s * 0.42);
}

// The wooden frame a picture hangs in: dark outer wood, a lighter inner lip
// and a thin gold line where frame meets paint.
export function panelFrame(ctx, x, y, w, h, ink) {
  ctx.fillStyle = ink.frameDark;
  roundedRectPath(ctx, x - 10, y - 10, w + 20, h + 20, 14);
  ctx.fill();
  ctx.fillStyle = ink.frameLight;
  roundedRectPath(ctx, x - 5, y - 5, w + 10, h + 10, 10);
  ctx.fill();
  ctx.strokeStyle = ink.gold;
  ctx.lineWidth = 2;
  roundedRectPath(ctx, x - 1.5, y - 1.5, w + 3, h + 3, 6);
  ctx.stroke();
}

// A vignette over a rectangle: transparent in the middle, dark at the edges,
// for the parlour-wall mood behind the cards.
export function vignette(ctx, x, y, w, h, strength) {
  const grad = ctx.createRadialGradient(
    x + w / 2, y + h / 2, Math.min(w, h) * 0.36,
    x + w / 2, y + h / 2, Math.max(w, h) * 0.74,
  );
  grad.addColorStop(0, 'rgba(0, 0, 0, 0)');
  grad.addColorStop(1, `rgba(0, 0, 0, ${strength})`);
  ctx.fillStyle = grad;
  ctx.fillRect(x, y, w, h);
}
