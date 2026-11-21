// Scene 2 — The Night Market (6 differences, 180s).
// A night market under string lights: moon, three stalls, bunting,
// a shelf of jars. Same discipline as the harbour: fixed-order drawing,
// per-element seeded streams for anything that can vanish.
import { glow, lantern, moon, skyGradient, starField } from './paintkit.js';
import { sceneStream, streamFor } from './random.js';

export const MARKET = {
  id: 'market',
  name: 'The Night Market',
  seconds: 180,
  differences: [
    { id: 'moon', x: 450, y: 80, r: 32, label: 'the moon' },
    { id: 'bulb', x: 280, y: 149, r: 18, label: 'the violet bulb' },
    { id: 'awning', x: 280, y: 275, r: 30, label: 'the middle awning' },
    { id: 'fruit', x: 280, y: 398, r: 28, label: 'the fruit' },
    { id: 'bunting', x: 320, y: 244, r: 18, label: 'the missing flag' },
    { id: 'jar', x: 475, y: 355, r: 20, label: 'the jar' },
  ],
};

const GROUND_Y = 460;

/** Point on the string-light curve at parameter t (0..1). */
function wirePoint(t) {
  const x = t * 560;
  const y = (1 - t) * (1 - t) * 70 + 2 * (1 - t) * t * 200 + t * t * 70;
  return { x, y };
}

function paintSky(ctx, rng) {
  skyGradient(ctx, 560, 560, [
    [0, '#0c1020'],
    [0.5, '#1a2340'],
    [1, '#2c2a4a'],
  ]);
  starField(ctx, rng, 560, 60, 6, 190);
}

function paintMoon(ctx, altered) {
  moon(ctx, 450, 80, 30);
  if (altered.has('moon')) {
    // Thinned to a crescent: cover part of the disc with the same sky
    // gradient, so the crescent is a clean cut, not a painted patch.
    const g = ctx.createLinearGradient(0, 0, 0, 560);
    g.addColorStop(0, '#0c1020');
    g.addColorStop(0.5, '#1a2340');
    g.addColorStop(1, '#2c2a4a');
    ctx.save();
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(464, 72, 27, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}

function paintStringLights(ctx, altered) {
  ctx.save();
  ctx.strokeStyle = '#3a2f22';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(0, 70);
  ctx.quadraticCurveTo(280, 200, 560, 70);
  ctx.stroke();
  // Bulbs hang from the wire at fixed steps; the one near x=300 is the
  // difference: warm yellow, or violet when altered.
  for (let i = 0; i <= 12; i += 1) {
    const t = i / 12;
    const p = wirePoint(t);
    const isDiff = Math.abs(p.x - 300) < 24;
    const colour = isDiff && altered.has('bulb') ? '#8a5fd0' : '#ffd27a';
    ctx.strokeStyle = '#3a2f22';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(p.x, p.y);
    ctx.lineTo(p.x, p.y + 8);
    ctx.stroke();
    glow(ctx, p.x, p.y + 14, 14, colour, 0.5);
    ctx.fillStyle = colour;
    ctx.beginPath();
    ctx.arc(p.x, p.y + 14, 6, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

function paintBunting(ctx, altered) {
  ctx.save();
  ctx.strokeStyle = '#3a2f22';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(20, 190);
  ctx.quadraticCurveTo(280, 235, 540, 190);
  ctx.stroke();
  const colours = ['#c0392b', '#e8b64c', '#2e7f7b', '#d97b29'];
  const flagXs = [60, 125, 190, 255, 320, 385, 450, 515];
  flagXs.forEach((x, i) => {
    if (x === 320 && altered.has('bunting')) return; // the missing flag
    const t = (x - 20) / 520;
    const y = 190 + 40 * Math.sin(Math.PI * t);
    ctx.fillStyle = colours[i % colours.length];
    ctx.beginPath();
    ctx.moveTo(x - 14, y);
    ctx.lineTo(x + 14, y);
    ctx.lineTo(x, y + 30);
    ctx.closePath();
    ctx.fill();
  });
  ctx.restore();
}

function paintAwning(ctx, x, w, y, h, stripeA, stripeB) {
  ctx.save();
  const stripes = 7;
  const sw = w / stripes;
  for (let i = 0; i < stripes; i += 1) {
    ctx.fillStyle = i % 2 === 0 ? stripeA : stripeB;
    ctx.fillRect(x + i * sw, y, sw, h);
  }
  // Scalloped hem.
  ctx.fillStyle = stripeA;
  for (let i = 0; i < stripes; i += 1) {
    ctx.beginPath();
    ctx.arc(x + i * sw + sw / 2, y + h, sw / 2, 0, Math.PI);
    ctx.fill();
  }
  ctx.restore();
}

function paintStalls(ctx, altered) {
  ctx.save();
  // Stall frames and counters.
  for (const [x, w] of [[20, 160], [200, 160], [380, 160]]) {
    ctx.fillStyle = '#4a3524';
    ctx.fillRect(x, 300, 8, 160);
    ctx.fillRect(x + w - 8, 300, 8, 160);
    ctx.fillStyle = '#7a5a3a';
    ctx.fillRect(x - 6, 380, w + 12, 16);
    ctx.fillStyle = '#5a4028';
    ctx.fillRect(x, 396, w, 64);
  }
  // Awnings: left and right red/cream; the middle one swaps to teal
  // when altered.
  paintAwning(ctx, 20, 160, 250, 44, '#c0392b', '#f3e6c8');
  paintAwning(
    ctx, 200, 160, 250, 44,
    altered.has('awning') ? '#2e7f7b' : '#c0392b', '#f3e6c8',
  );
  paintAwning(ctx, 380, 160, 250, 44, '#c0392b', '#f3e6c8');

  // Left stall: hanging lanterns and baskets.
  lantern(ctx, 60, 330, 15, '#ff9a3c');
  lantern(ctx, 140, 330, 13, '#e8b64c');
  ctx.fillStyle = '#8a6a3e';
  ctx.beginPath();
  ctx.ellipse(100, 372, 26, 12, 0, 0, Math.PI * 2);
  ctx.fill();

  // Middle stall: fruit on the counter — apples, or oranges.
  const fruitColour = altered.has('fruit') ? '#e07b1f' : '#c0392b';
  const fruitSpots = [[248, 372], [268, 366], [288, 372], [258, 380], [278, 380], [298, 380], [268, 388]];
  ctx.fillStyle = fruitColour;
  for (const [fx, fy] of fruitSpots) {
    ctx.beginPath();
    ctx.arc(fx, fy, 9, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,0.35)';
    ctx.beginPath();
    ctx.arc(fx - 3, fy - 3, 2.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = fruitColour;
  }
  ctx.strokeStyle = '#2e5d23';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(268, 358);
  ctx.lineTo(268, 352);
  ctx.stroke();

  // Right stall: a shelf of jars; one jar is the difference.
  ctx.fillStyle = '#7a5a3a';
  ctx.fillRect(396, 372, 128, 8);
  const jarXs = [415, 445, 475, 505];
  jarXs.forEach((jx, i) => {
    if (jx === 475 && altered.has('jar')) return;
    const tint = ['#d9a05a', '#7fae6a', '#c97b8a', '#6a8ab0'][i];
    ctx.fillStyle = tint;
    ctx.globalAlpha = 0.9;
    ctx.fillRect(jx - 11, 340, 22, 32);
    ctx.globalAlpha = 1;
    ctx.fillStyle = '#4a3524';
    ctx.fillRect(jx - 12, 334, 24, 7);
    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    ctx.fillRect(jx - 7, 344, 3, 22);
  });
  // Pots under the shelf.
  ctx.fillStyle = '#a06838';
  ctx.fillRect(410, 396, 30, 26);
  ctx.fillRect(470, 396, 30, 26);
  ctx.restore();
}

function paintGround(ctx) {
  ctx.save();
  ctx.fillStyle = '#3a3348';
  ctx.fillRect(0, GROUND_Y, 560, 100);
  const rng = streamFor('market', 'cobbles');
  ctx.fillStyle = 'rgba(255, 240, 200, 0.10)';
  for (let i = 0; i < 60; i += 1) {
    ctx.beginPath();
    ctx.ellipse(rng() * 560, GROUND_Y + 8 + rng() * 84, 8 + rng() * 14, 5 + rng() * 6, 0, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

export function paintMarket(ctx, altered) {
  const rng = sceneStream('market');
  paintSky(ctx, rng);
  paintMoon(ctx, altered);
  paintStringLights(ctx, altered);
  paintBunting(ctx, altered);
  paintStalls(ctx, altered);
  paintGround(ctx);
}
