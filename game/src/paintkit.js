// Shared brushes for the three scene painters: gradients, glows, the
// moon, stars, lantern light and small helpers. Nothing here reads a
// clock or a random stream of its own; callers pass their own rng.

/** Vertical sky gradient across the panel. */
export function skyGradient(ctx, w, h, stops) {
  const g = ctx.createLinearGradient(0, 0, 0, h);
  for (const [at, colour] of stops) g.addColorStop(at, colour);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, w, h);
}

/** A soft radial glow centred at (x, y). */
export function glow(ctx, x, y, radius, colour, alpha = 0.55) {
  const g = ctx.createRadialGradient(x, y, 0, x, y, radius);
  g.addColorStop(0, colour);
  g.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.fillStyle = g;
  ctx.fillRect(x - radius, y - radius, radius * 2, radius * 2);
  ctx.restore();
}

/** A field of tiny four-point stars in the upper part of the panel. */
export function starField(ctx, rng, w, count, top, bottom) {
  ctx.save();
  ctx.fillStyle = '#fff8e0';
  for (let i = 0; i < count; i += 1) {
    const x = rng() * w;
    const y = top + rng() * (bottom - top);
    const r = 0.8 + rng() * 1.6;
    ctx.globalAlpha = 0.35 + rng() * 0.6;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

/** A full moon disc with a soft halo. */
export function moon(ctx, x, y, r) {
  glow(ctx, x, y, r * 2.6, '#fdf6d8', 0.5);
  ctx.save();
  ctx.fillStyle = '#fdf3cf';
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = 'rgba(214, 196, 150, 0.55)';
  ctx.beginPath();
  ctx.arc(x - r * 0.3, y - r * 0.2, r * 0.22, 0, Math.PI * 2);
  ctx.arc(x + r * 0.35, y + r * 0.3, r * 0.16, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

/** A simple gull: two curved wing strokes. */
export function gull(ctx, x, y, size, colour = '#2a2438') {
  ctx.save();
  ctx.strokeStyle = colour;
  ctx.lineWidth = 2.4;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(x - size, y);
  ctx.quadraticCurveTo(x - size * 0.4, y - size * 0.7, x, y);
  ctx.quadraticCurveTo(x + size * 0.4, y - size * 0.7, x + size, y);
  ctx.stroke();
  ctx.restore();
}

/** A paper lantern: glowing rounded body with ribs and a tassel. */
export function lantern(ctx, x, y, r, colour) {
  ctx.save();
  glow(ctx, x, y, r * 2.2, colour, 0.45);
  ctx.fillStyle = colour;
  ctx.beginPath();
  ctx.ellipse(x, y, r, r * 1.15, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = 'rgba(90, 40, 20, 0.5)';
  ctx.lineWidth = 1.5;
  for (let i = -2; i <= 2; i += 1) {
    ctx.beginPath();
    ctx.ellipse(x, y, Math.abs(i) * r * 0.32, r * 1.15, 0, -Math.PI / 2, Math.PI / 2);
    ctx.stroke();
  }
  ctx.fillStyle = '#7a4a1e';
  ctx.fillRect(x - 4, y - r * 1.15 - 5, 8, 6);
  ctx.strokeStyle = '#c0392b';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(x, y + r * 1.15);
  ctx.lineTo(x, y + r * 1.15 + 12);
  ctx.stroke();
  ctx.restore();
}

/** Rounded-rectangle path helper. */
export function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}
