// scene-market.js — scene two: "The Night Market".
// Three stalls under strings of lights, a moon over the rooftops. The painter
// draws the scene once; the `altered` set names which of its six differences
// take their changed form on the second telling: the full moon thinned to a
// crescent, one bulb gone violet, the middle awning's stripes swapped, apples
// turned to oranges, one bunting flag missing, one jar gone from the shelf.

import {
  skyGradient, disc, glow, starField, crescentMoon, sparkle,
} from './paintkit.js';

export const marketScene = {
  id: 'market',
  title: 'The Night Market',
  subtitle: 'Scene two · six differences',
  timeLimit: 180,
  differences: [
    { id: 'moon', label: 'the full moon, thinned to a crescent', x: 505, y: 92, r: 30 },
    { id: 'bulb', label: 'a string-light bulb, gone violet', x: 300, y: 142, r: 16 },
    { id: 'bunting', label: 'a bunting flag, missing', x: 300, y: 226, r: 18 },
    { id: 'awning', label: 'the middle awning, stripes swapped', x: 300, y: 282, r: 40 },
    { id: 'jar', label: 'a jar, gone from the shelf', x: 504, y: 332, r: 18 },
    { id: 'fruit', label: 'the apples, turned to oranges', x: 68, y: 490, r: 30 },
  ],
  paint,
};

function paint(ctx, rng, altered) {
  // Night sky over rooftop silhouettes.
  ctx.fillStyle = skyGradient(ctx, 0, 0, 600, 600, [
    [0, '#131a36'],
    [0.55, '#1f2148'],
    [1, '#2b2350'],
  ]);
  ctx.fillRect(0, 0, 600, 600);
  starField(ctx, rng, 0, 0, 600, 210, 60, '#ffeecb');
  ctx.fillStyle = '#0e1226';
  ctx.beginPath();
  ctx.moveTo(0, 236);
  ctx.lineTo(0, 196);
  ctx.lineTo(70, 196);
  ctx.lineTo(96, 168);
  ctx.lineTo(150, 168);
  ctx.lineTo(150, 236);
  ctx.lineTo(452, 236);
  ctx.lineTo(452, 182);
  ctx.lineTo(520, 182);
  ctx.lineTo(548, 206);
  ctx.lineTo(600, 206);
  ctx.lineTo(600, 236);
  ctx.closePath();
  ctx.fill();

  paintMoon(ctx, altered);
  paintStringLights(ctx, altered);
  paintBunting(ctx, altered);

  // Ground: lamplit cobbles.
  ctx.fillStyle = '#262036';
  ctx.fillRect(0, 540, 600, 60);
  ctx.strokeStyle = 'rgba(255, 220, 160, 0.10)';
  ctx.lineWidth = 2;
  for (let i = 0; i < 26; i++) {
    const x = rng.range(6, 580);
    const y = rng.range(548, 592);
    ctx.beginPath();
    ctx.arc(x, y, rng.range(7, 13), Math.PI * 1.1, Math.PI * 1.9);
    ctx.stroke();
  }

  paintStall(ctx, 26, ['#7a4a6e', '#efe3c2'], 'left', altered);
  paintStall(ctx, 212, altered.has('awning') ? ['#2f8f83', '#efe3c2'] : ['#b03a34', '#efe3c2'], 'middle', altered);
  paintStall(ctx, 404, ['#6e7a3a', '#efe3c2'], 'right', altered);
  paintCrowd(ctx, rng);
}

// The moon: full and cratered on the first telling, a crescent on the second.
function paintMoon(ctx, altered) {
  glow(ctx, 505, 92, 62, 'rgba(246, 231, 189, 0.28)');
  if (altered.has('moon')) {
    crescentMoon(ctx, 505, 92, 29, '#f6e7bd', '#181f42');
  } else {
    disc(ctx, 505, 92, 29, '#f6e7bd');
    ctx.fillStyle = 'rgba(190, 170, 130, 0.5)';
    for (const [dx, dy, r] of [[-9, -6, 6], [8, 4, 8], [-2, 12, 5], [12, -11, 4]]) {
      ctx.beginPath();
      ctx.arc(505 + dx, 92 + dy, r, 0, Math.PI * 2);
      ctx.fill();
    }
  }
}

// Two swags of string lights. Every bulb is drawn from the curve itself, so
// the special bulb — amber on the first telling, violet on the second — sits
// exactly where its difference marker expects it.
function paintStringLights(ctx, altered) {
  const strands = [
    { p0: [16, 50], pc: [300, 148], p1: [584, 50], special: false },
    { p0: [16, 88], pc: [300, 196], p1: [584, 88], special: true },
  ];
  const palette = ['#ffd97a', '#ff9d6b', '#ffe9a8', '#ffb3c1'];
  let n = 0;
  for (const s of strands) {
    ctx.strokeStyle = 'rgba(10, 10, 20, 0.85)';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(s.p0[0], s.p0[1]);
    ctx.quadraticCurveTo(s.pc[0], s.pc[1], s.p1[0], s.p1[1]);
    ctx.stroke();
    for (let i = 0; i <= 12; i++) {
      const t = 0.04 + (i / 12) * 0.92;
      const x = (1 - t) * (1 - t) * s.p0[0] + 2 * (1 - t) * t * s.pc[0] + t * t * s.p1[0];
      const y = (1 - t) * (1 - t) * s.p0[1] + 2 * (1 - t) * t * s.pc[1] + t * t * s.p1[1];
      const isSpecial = s.special && i === 6;
      ctx.strokeStyle = 'rgba(10, 10, 20, 0.85)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x, y + 7);
      ctx.stroke();
      if (isSpecial) {
        const colour = altered.has('bulb') ? '#b18cff' : '#ffc94d';
        glow(ctx, x, y + 13, 26, altered.has('bulb') ? 'rgba(177, 140, 255, 0.55)' : 'rgba(255, 201, 77, 0.55)');
        disc(ctx, x, y + 13, 6.5, colour);
      } else {
        const colour = palette[n++ % palette.length];
        glow(ctx, x, y + 12, 15, 'rgba(255, 190, 100, 0.30)');
        disc(ctx, x, y + 12, 4.6, colour);
      }
    }
  }
}

// A swag of bunting between the stall poles; on the second telling the
// middle flag is gone, leaving a gap in the run.
function paintBunting(ctx, altered) {
  const p0 = [36, 196];
  const pc = [300, 252];
  const p1 = [564, 196];
  ctx.strokeStyle = 'rgba(240, 230, 200, 0.6)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(p0[0], p0[1]);
  ctx.quadraticCurveTo(pc[0], pc[1], p1[0], p1[1]);
  ctx.stroke();
  const colours = ['#c03a30', '#e8b34a', '#2f8f83', '#b18cff', '#ff9d6b'];
  for (let i = 0; i < 9; i++) {
    const t = 0.08 + (i / 8) * 0.84;
    if (altered.has('bunting') && i === 4) continue; // the missing flag
    const x = (1 - t) * (1 - t) * p0[0] + 2 * (1 - t) * t * pc[0] + t * t * p1[0];
    const y = (1 - t) * (1 - t) * p0[1] + 2 * (1 - t) * t * pc[1] + t * t * p1[1];
    ctx.fillStyle = colours[i % colours.length];
    ctx.beginPath();
    ctx.moveTo(x - 11, y);
    ctx.lineTo(x + 11, y);
    ctx.lineTo(x, y + 22);
    ctx.closePath();
    ctx.fill();
  }
}

// One market stall: posts, a striped awning, a counter and its own goods.
// `which` says what the stall sells; the middle stall's awning stripes are a
// difference, so its colours arrive already swapped or not.
function paintStall(ctx, x, awningColours, which, altered) {
  const w = 170;
  // Posts and back shadow.
  ctx.fillStyle = 'rgba(8, 8, 18, 0.35)';
  ctx.fillRect(x + 6, 300, w - 12, 176);
  ctx.fillStyle = '#4a3423';
  ctx.fillRect(x + 4, 296, 9, 182);
  ctx.fillRect(x + w - 13, 296, 9, 182);
  // Awning: a sloped canopy with stripes, clipped to its outline.
  ctx.save();
  ctx.beginPath();
  ctx.moveTo(x - 8, 306);
  ctx.lineTo(x + w + 8, 306);
  ctx.lineTo(x + w - 8, 252);
  ctx.lineTo(x + 8, 252);
  ctx.closePath();
  ctx.clip();
  const stripeW = 21;
  for (let sx = x - 8, i = 0; sx < x + w + 8; sx += stripeW, i++) {
    ctx.fillStyle = awningColours[i % 2];
    ctx.fillRect(sx, 246, stripeW, 66);
  }
  ctx.fillStyle = 'rgba(0, 0, 0, 0.16)';
  ctx.fillRect(x - 8, 292, w + 16, 20);
  ctx.restore();
  ctx.strokeStyle = '#33241a';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(x - 8, 306);
  ctx.lineTo(x + w + 8, 306);
  ctx.stroke();
  // Counter.
  ctx.fillStyle = '#5d4128';
  ctx.fillRect(x, 432, w, 46);
  ctx.fillStyle = '#77552f';
  ctx.fillRect(x, 432, w, 8);
  // A hanging lantern at the stall's front corner.
  glow(ctx, x + w - 16, 330, 24, 'rgba(255, 196, 92, 0.4)');
  disc(ctx, x + w - 16, 330, 6, '#ffd97a');

  if (which === 'left') paintFruitCrates(ctx, x, altered);
  if (which === 'middle') paintBreadCounter(ctx, x);
  if (which === 'right') paintJarShelves(ctx, x, altered);
}

// In front of the left stall: a crate of round fruit — apples on the first
// telling, oranges on the second — beside a crate of bottled cordial that
// never changes.
function paintFruitCrates(ctx, x, altered) {
  const fruit = altered.has('fruit')
    ? { skin: '#e8862e', dark: '#c56a1d', leaf: null }
    : { skin: '#c03a30', dark: '#96281f', leaf: '#4a7a3a' };
  const cx = x + 42;
  const cy = 512;
  // The fruit crate: slatted wood with the fruit heaped above its rim.
  ctx.fillStyle = '#6e4f2c';
  ctx.fillRect(cx - 34, cy - 6, 68, 34);
  ctx.fillStyle = '#59391d';
  ctx.fillRect(cx - 34, cy + 6, 68, 4);
  ctx.fillRect(cx - 34, cy + 18, 68, 4);
  const heap = [[-20, -12], [0, -16], [20, -12], [-10, -24], [11, -25], [0, -34]];
  for (const [dx, dy] of heap) {
    disc(ctx, cx + dx, cy + dy, 11, fruit.skin);
    ctx.fillStyle = fruit.dark;
    ctx.fillRect(cx + dx - 1, cy + dy - 12, 2, 4);
    if (fruit.leaf) {
      ctx.fillStyle = fruit.leaf;
      ctx.beginPath();
      ctx.ellipse(cx + dx + 5, cy + dy - 12, 5, 2.4, -0.5, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  // The cordial crate: four green bottles, the same on both tellings.
  const bx = x + 118;
  ctx.fillStyle = '#6e4f2c';
  ctx.fillRect(bx - 34, cy - 6, 68, 34);
  ctx.fillStyle = '#59391d';
  ctx.fillRect(bx - 34, cy + 8, 68, 4);
  for (const dx of [-24, -8, 8, 24]) {
    ctx.fillStyle = '#3a6e46';
    ctx.fillRect(bx + dx - 6, cy - 26, 12, 22);
    ctx.fillRect(bx + dx - 3, cy - 36, 6, 11);
    ctx.fillStyle = '#caa06a';
    ctx.fillRect(bx + dx - 3, cy - 39, 6, 4);
  }
  // Loaves and a cheese wheel share the counter, unchanged.
  ctx.fillStyle = '#d9a75e';
  ctx.beginPath();
  ctx.ellipse(x + 84, 424, 26, 10, 0, 0, Math.PI * 2);
  ctx.fill();
}

// The middle stall sells bread: loaves on the counter, more on a back shelf.
function paintBreadCounter(ctx, x) {
  ctx.fillStyle = '#8a5a26';
  ctx.fillRect(x + 14, 372, 142, 7);
  for (let i = 0; i < 4; i++) {
    ctx.fillStyle = '#d9a75e';
    ctx.beginPath();
    ctx.ellipse(x + 36 + i * 36, 366, 15, 8, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#b3803a';
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.moveTo(x + 28 + i * 36, 362);
    ctx.lineTo(x + 44 + i * 36, 362);
    ctx.stroke();
  }
  for (let i = 0; i < 3; i++) {
    ctx.fillStyle = '#e0b96e';
    ctx.beginPath();
    ctx.ellipse(x + 42 + i * 44, 424, 19, 10, 0, 0, Math.PI * 2);
    ctx.fill();
  }
  // A string of dried peppers hangs at the side, for colour.
  ctx.strokeStyle = '#5d7a35';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(x + 158, 380);
  ctx.lineTo(x + 158, 424);
  ctx.stroke();
  for (let i = 0; i < 3; i++) {
    ctx.fillStyle = '#c03a30';
    ctx.beginPath();
    ctx.ellipse(x + 158, 390 + i * 13, 5, 8, 0.3, 0, Math.PI * 2);
    ctx.fill();
  }
}

// The right stall keeps preserves: two shelves of jars. On the second telling
// one jar on the top shelf is gone, leaving a pale gap among its neighbours.
function paintJarShelves(ctx, x, altered) {
  const contents = ['#c03a30', '#e8862e', '#7a9a3a', '#b18cff', '#e8b34a', '#c56a8d'];
  for (const shelfY of [348, 398]) {
    ctx.fillStyle = '#4a3423';
    ctx.fillRect(x + 16, shelfY, 138, 7);
  }
  const jarAt = (jx, shelfY, colour) => {
    ctx.fillStyle = colour;
    ctx.beginPath();
    ctx.moveTo(jx - 10, shelfY);
    ctx.lineTo(jx - 10, shelfY - 22);
    ctx.quadraticCurveTo(jx - 10, shelfY - 30, jx - 4, shelfY - 30);
    ctx.lineTo(jx + 4, shelfY - 30);
    ctx.quadraticCurveTo(jx + 10, shelfY - 30, jx + 10, shelfY - 22);
    ctx.lineTo(jx + 10, shelfY);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#caa06a';
    ctx.fillRect(jx - 7, shelfY - 36, 14, 7);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.28)';
    ctx.fillRect(jx - 7, shelfY - 26, 4, 18);
  };
  // Top shelf: four jars; the third is the difference.
  const topXs = [x + 40, x + 70, x + 100, x + 130];
  topXs.forEach((jx, i) => {
    if (altered.has('jar') && i === 2) return;
    jarAt(jx, 348, contents[i]);
  });
  // Bottom shelf: three jars and a small stack of bowls.
  [x + 44, x + 76, x + 108].forEach((jx, i) => jarAt(jx, 398, contents[i + 3]));
  ctx.fillStyle = '#8d99ae';
  for (let i = 0; i < 3; i++) {
    ctx.beginPath();
    ctx.ellipse(x + 136, 392 - i * 6, 13, 5, 0, 0, Math.PI);
    ctx.fill();
  }
}

// Shoppers as soft silhouettes along the front, heads and shoulders only.
function paintCrowd(ctx, rng) {
  ctx.fillStyle = '#0c0e1a';
  const spots = [58, 168, 262, 356, 452, 548];
  for (const baseX of spots) {
    const x = baseX + rng.range(-9, 9);
    const headY = 566 + rng.range(-4, 4);
    disc(ctx, x, headY, 13, '#0c0e1a');
    ctx.beginPath();
    ctx.ellipse(x, 612, 26, 24, 0, Math.PI, Math.PI * 2);
    ctx.fill();
  }
}
