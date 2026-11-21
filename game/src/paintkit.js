// The painter's kit: small drawing helpers every scene shares — gradients,
// glows, stars, water, birds and the parlour cat — so the three scenes read
// as one artist's work and each scene file only has to arrange them. Every
// helper takes the context first and paints in panel coordinates.
import { createRandom } from './random.js';

/** Trace a rounded rectangle path (the caller fills or strokes it). */
export function roundedRect(ctx, x, y, width, height, radius) {
  const r = Math.min(radius, width / 2, height / 2);
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + width - r, y);
  ctx.arcTo(x + width, y, x + width, y + r, r);
  ctx.lineTo(x + width, y + height - r);
  ctx.arcTo(x + width, y + height, x + width - r, y + height, r);
  ctx.lineTo(x + r, y + height);
  ctx.arcTo(x, y + height, x, y + height - r, r);
  ctx.lineTo(x, y + r);
  ctx.arcTo(x, y, x + r, y, r);
  ctx.closePath();
}

/** Fill the rect with a vertical gradient through the given colour stops. */
export function verticalGradient(ctx, x, y, width, height, stops) {
  const gradient = ctx.createLinearGradient(0, y, 0, y + height);
  for (const [at, colour] of stops) gradient.addColorStop(at, colour);
  ctx.fillStyle = gradient;
  ctx.fillRect(x, y, width, height);
}

/** A soft round glow: a radial gradient that fades to nothing at its rim. */
export function glow(ctx, x, y, radius, colour) {
  const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
  gradient.addColorStop(0, colour);
  gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
  ctx.fillStyle = gradient;
  ctx.fillRect(x - radius, y - radius, radius * 2, radius * 2);
}

/** A field of still stars scattered from a seed over the top of the panel. */
export function starField(ctx, seed, count, width, height) {
  const next = createRandom(seed);
  ctx.fillStyle = '#ffffff';
  for (let i = 0; i < count; i += 1) {
    const x = next() * width;
    const y = next() * height;
    const r = 0.6 + next() * 1.4;
    ctx.globalAlpha = 0.25 + next() * 0.65;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
}

/** The moon: a disc, or a crescent when `crescent` — the cut is a sky-coloured disc offset over it. */
export function moon(ctx, x, y, radius, crescent, skyColour) {
  ctx.fillStyle = '#f6ead0';
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = 'rgba(214, 196, 160, 0.5)';
  ctx.beginPath();
  ctx.arc(x - radius * 0.3, y + radius * 0.25, radius * 0.16, 0, Math.PI * 2);
  ctx.arc(x + radius * 0.25, y - radius * 0.35, radius * 0.12, 0, Math.PI * 2);
  ctx.fill();
  if (crescent) {
    ctx.fillStyle = skyColour;
    ctx.beginPath();
    ctx.arc(x + radius * 0.55, y - radius * 0.3, radius * 0.88, 0, Math.PI * 2);
    ctx.fill();
  }
}

/** A gull in flight: two arcs meeting at the body, sized by `span`. */
export function gull(ctx, x, y, span, colour = 'rgba(240, 240, 235, 0.9)') {
  ctx.strokeStyle = colour;
  ctx.lineWidth = Math.max(1.6, span / 9);
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(x - span / 2, y);
  ctx.quadraticCurveTo(x - span / 4, y - span / 3, x, y);
  ctx.quadraticCurveTo(x + span / 4, y - span / 3, x + span / 2, y);
  ctx.stroke();
}

/** Rows of short shimmer strokes for water, scattered from a seed. */
export function waterShimmer(ctx, seed, top, bottom, width, colour) {
  const next = createRandom(seed);
  ctx.strokeStyle = colour;
  ctx.lineCap = 'round';
  for (let row = 0; row < 14; row += 1) {
    const y = top + ((bottom - top) * row) / 14 + next() * 6;
    const dashes = 3 + Math.floor(next() * 4);
    for (let d = 0; d < dashes; d += 1) {
      const x = next() * width;
      const len = 14 + next() * 42;
      ctx.globalAlpha = 0.1 + next() * 0.3;
      ctx.lineWidth = 1.4 + next() * 1.4;
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(Math.min(x + len, width), y);
      ctx.stroke();
    }
  }
  ctx.globalAlpha = 1;
}

/**
 * The parlour cat, sitting: a silhouette with a curled tail, drawn facing
 * left at (x, y) where y is the ground it sits on and `size` its height.
 */
export function sittingCat(ctx, x, y, size, colour) {
  const s = size / 60;
  ctx.fillStyle = colour;
  // Tail, curled around the feet.
  ctx.strokeStyle = colour;
  ctx.lineWidth = 7 * s;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(x + 16 * s, y - 4 * s);
  ctx.quadraticCurveTo(x + 34 * s, y - 2 * s, x + 30 * s, y - 14 * s);
  ctx.stroke();
  // Body: a soft teardrop.
  ctx.beginPath();
  ctx.moveTo(x - 14 * s, y);
  ctx.quadraticCurveTo(x - 20 * s, y - 34 * s, x - 4 * s, y - 44 * s);
  ctx.quadraticCurveTo(x + 10 * s, y - 48 * s, x + 13 * s, y - 30 * s);
  ctx.quadraticCurveTo(x + 16 * s, y - 12 * s, x + 14 * s, y);
  ctx.closePath();
  ctx.fill();
  // Head with two ears, looking out to sea.
  ctx.beginPath();
  ctx.arc(x - 2 * s, y - 50 * s, 11 * s, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(x - 12 * s, y - 56 * s);
  ctx.lineTo(x - 10 * s, y - 68 * s);
  ctx.lineTo(x - 3 * s, y - 59 * s);
  ctx.closePath();
  ctx.moveTo(x + 2 * s, y - 59 * s);
  ctx.lineTo(x + 7 * s, y - 68 * s);
  ctx.lineTo(x + 9 * s, y - 56 * s);
  ctx.closePath();
  ctx.fill();
}

/** A hanging lantern: cap, glass and (when lit) a halo, hanging from `topY` to its centre. */
export function hangingLantern(ctx, x, topY, drop, lit, glassColour = '#ffd98a') {
  ctx.strokeStyle = 'rgba(20, 16, 10, 0.85)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(x, topY);
  ctx.lineTo(x, topY + drop - 16);
  ctx.stroke();
  const cy = topY + drop;
  if (lit) glow(ctx, x, cy, 44, 'rgba(255, 190, 90, 0.35)');
  ctx.fillStyle = '#241a10';
  ctx.beginPath();
  ctx.moveTo(x - 11, cy - 16);
  ctx.lineTo(x + 11, cy - 16);
  ctx.lineTo(x + 6, cy - 22);
  ctx.lineTo(x - 6, cy - 22);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = lit ? glassColour : 'rgba(120, 125, 135, 0.55)';
  roundedRect(ctx, x - 9, cy - 15, 18, 26, 6);
  ctx.fill();
  ctx.fillStyle = '#241a10';
  ctx.fillRect(x - 8, cy + 11, 16, 4);
}
