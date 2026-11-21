// scene-glasshouse.js — scene three: "The Glasshouse".
// Morning light through an arched glass roof, benches of pots, things growing
// everywhere. The painter draws the scene once; the `altered` set names which
// of its seven differences take their changed form on the second telling: a
// roof pane cracked, a hanging planter gone, a butterfly's wings another
// colour, a cactus become a shrub, a snail gone, a watering can gone, and a
// flower turned gold.

import { skyGradient, disc, glow, sparkle } from './paintkit.js';
import { makeRng } from './random.js';

export const glasshouseScene = {
  id: 'glasshouse',
  title: 'The Glasshouse',
  subtitle: 'Scene three · seven differences',
  timeLimit: 210,
  differences: [
    { id: 'pane', label: 'a roof pane, cracked', x: 180, y: 105, r: 30 },
    { id: 'planter', label: 'a hanging planter, gone', x: 450, y: 184, r: 28 },
    { id: 'butterfly', label: 'the butterfly, wings turned violet', x: 350, y: 300, r: 22 },
    { id: 'cactus', label: 'the cactus, become a shrub', x: 140, y: 352, r: 34 },
    { id: 'flower', label: 'the tall flower, turned gold', x: 430, y: 420, r: 20 },
    { id: 'snail', label: 'the snail, wandered off', x: 490, y: 502, r: 18 },
    { id: 'can', label: 'the watering can, taken away', x: 250, y: 512, r: 26 },
  ],
  paint,
};

function paint(ctx, rng, altered) {
  // Morning outside the glass: pale gold high, leaf-green low.
  ctx.fillStyle = skyGradient(ctx, 0, 0, 600, 600, [
    [0, '#f4dc9e'],
    [0.34, '#cfdca6'],
    [0.62, '#7d9b6e'],
    [1, '#4c6b4a'],
  ]);
  ctx.fillRect(0, 0, 600, 600);

  // Shafts of light falling through the roof.
  ctx.fillStyle = 'rgba(255, 244, 200, 0.16)';
  for (const [x0, x1] of [[90, 210], [300, 430], [470, 560]]) {
    ctx.beginPath();
    ctx.moveTo(x0, 30);
    ctx.lineTo(x1, 30);
    ctx.lineTo(x1 + 90, 600);
    ctx.lineTo(x0 + 40, 600);
    ctx.closePath();
    ctx.fill();
  }

  paintRoofGlass(ctx, altered);
  paintHangingPlanter(ctx, 150, 0.8);
  if (!altered.has('planter')) paintHangingPlanter(ctx, 450, 1);
  paintBackdropPlants(ctx, rng);
  paintBenches(ctx, altered, rng);
  paintButterfly(ctx, altered);
  paintFloor(ctx, rng);
  paintTallFlower(ctx, altered);
  paintBigPot(ctx, altered);
  if (!altered.has('can')) paintWateringCan(ctx);
  sparkle(ctx, 540, 120, 6, 'rgba(255, 250, 220, 0.7)');
  sparkle(ctx, 80, 300, 5, 'rgba(255, 250, 220, 0.5)');
}

// The arched glass roof: translucent panes between dark ribs. One pane, up
// on the left, is a difference — whole on the first telling, cracked on the
// second.
function paintRoofGlass(ctx, altered) {
  // Glass wash over the upper part of the scene.
  ctx.fillStyle = 'rgba(230, 244, 235, 0.20)';
  ctx.beginPath();
  ctx.moveTo(24, 246);
  ctx.lineTo(24, 150);
  ctx.quadraticCurveTo(300, -30, 576, 150);
  ctx.lineTo(576, 246);
  ctx.closePath();
  ctx.fill();
  // Ribs: five arches springing from the eaves line.
  ctx.strokeStyle = '#3c4a38';
  ctx.lineWidth = 6;
  for (const bx of [24, 162, 300, 438, 576]) {
    ctx.beginPath();
    ctx.moveTo(bx, 246);
    ctx.quadraticCurveTo(bx + (300 - bx) * 0.24, 40, 300 + (bx - 300) * 0.55, 26 + Math.abs(bx - 300) * 0.16);
    ctx.stroke();
  }
  // Two purlin arcs across the ribs.
  ctx.lineWidth = 4;
  for (const lift of [86, 158]) {
    ctx.beginPath();
    ctx.moveTo(24, 246 - lift * 0.55);
    ctx.quadraticCurveTo(300, 246 - lift - 66, 576, 246 - lift * 0.55);
    ctx.stroke();
  }
  ctx.lineWidth = 7;
  ctx.beginPath();
  ctx.moveTo(16, 246);
  ctx.lineTo(584, 246);
  ctx.stroke();

  // The marked pane: outlined on its own so its crack has somewhere to live.
  ctx.fillStyle = 'rgba(240, 250, 255, 0.13)';
  ctx.fillRect(132, 58, 96, 92);
  ctx.strokeStyle = '#3c4a38';
  ctx.lineWidth = 3.5;
  ctx.strokeRect(132, 58, 96, 92);
  if (altered.has('pane')) {
    // A star of cracks from one hard knock at the pane's heart.
    ctx.strokeStyle = 'rgba(250, 252, 255, 0.85)';
    ctx.lineWidth = 1.8;
    const cx = 180;
    const cy = 105;
    for (const [dx, dy] of [[-38, -30], [-8, -42], [30, -34], [44, 4], [22, 38], [-24, 34], [-44, -2]]) {
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(cx + dx * 0.45, cy + dy * 0.45);
      ctx.lineTo(cx + dx, cy + dy);
      ctx.stroke();
    }
    ctx.beginPath();
    ctx.arc(cx, cy, 12, 0, Math.PI * 2);
    ctx.stroke();
    disc(ctx, cx, cy, 3, 'rgba(250, 252, 255, 0.9)');
  }
}

// A hanging planter: chains, a bowl, and leaves spilling over the rim. The
// one on the right is a difference: on the second telling it is simply gone.
// It textures itself from its own little seed, so whether it is present or
// absent never shifts the shared random stream the rest of the scene — and
// so both panels — are painted from.
function paintHangingPlanter(ctx, x, scale) {
  const rng = makeRng(Math.round(x * 13 + scale * 1000));
  const bowlY = 168 * scale + 30;
  ctx.strokeStyle = '#2e3a2c';
  ctx.lineWidth = 2.5;
  for (const dx of [-26, 0, 26]) {
    ctx.beginPath();
    ctx.moveTo(x + dx * scale, bowlY);
    ctx.lineTo(x, 26);
    ctx.stroke();
  }
  // Leaves first, spilling over where the bowl will be.
  ctx.fillStyle = '#4a7a3f';
  for (let i = 0; i < 7; i++) {
    const dx = rng.range(-34, 34) * scale;
    const len = rng.range(16, 40) * scale;
    ctx.beginPath();
    ctx.ellipse(x + dx, bowlY + len * 0.4, 6 * scale, len * 0.55, dx * 0.012, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.fillStyle = '#6e4f2c';
  ctx.beginPath();
  ctx.ellipse(x, bowlY, 40 * scale, 15 * scale, 0, 0, Math.PI);
  ctx.fill();
  ctx.fillStyle = '#59391d';
  ctx.fillRect(x - 40 * scale, bowlY - 3, 80 * scale, 5);
  // A tuft on top.
  ctx.fillStyle = '#5d8a46';
  for (const dx of [-16, 0, 16]) {
    ctx.beginPath();
    ctx.ellipse(x + dx * scale, bowlY - 10 * scale, 7 * scale, 12 * scale, dx * 0.02, 0, Math.PI * 2);
    ctx.fill();
  }
}

// Broad background leaves behind the benches, for depth.
function paintBackdropPlants(ctx, rng) {
  ctx.fillStyle = 'rgba(38, 66, 40, 0.55)';
  for (let i = 0; i < 9; i++) {
    const x = 30 + i * 68 + rng.range(-10, 10);
    const h = rng.range(90, 170);
    ctx.beginPath();
    ctx.ellipse(x, 420 - h / 2, 17, h / 2, rng.range(-0.24, 0.24), 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.fillStyle = 'rgba(24, 44, 28, 0.6)';
  ctx.fillRect(0, 396, 600, 10);
}

// Two benches of pots. On the left bench stands the scene's plant that
// changes its nature: a cactus on the first telling, a round shrub on the
// second.
function paintBenches(ctx, altered, rng) {
  for (const bx of [40, 320]) {
    ctx.fillStyle = '#5d4128';
    ctx.fillRect(bx, 400, 240, 12);
    ctx.fillRect(bx + 14, 412, 10, 66);
    ctx.fillRect(bx + 216, 412, 10, 66);
    ctx.fillStyle = '#4a3423';
    ctx.fillRect(bx, 408, 240, 4);
  }
  // Left bench: the changing plant, a fern, and seed trays.
  paintChangingPlant(ctx, altered);
  paintFernPot(ctx, 226, 400);
  ctx.fillStyle = '#77552f';
  ctx.fillRect(52, 384, 52, 16);
  ctx.fillStyle = '#5d8a46';
  for (let i = 0; i < 4; i++) disc(ctx, 62 + i * 12, 382, 4, '#5d8a46');
  // Right bench: three honest pots that never change.
  paintLeafyPot(ctx, 372, 400, '#8a4a6e');
  paintLeafyPot(ctx, 452, 400, '#b4503f');
  paintFernPot(ctx, 528, 400);
  void rng;
}

// A terracotta pot, shared by the bench plants.
function paintPot(ctx, x, baseY, w) {
  ctx.fillStyle = '#b4653f';
  ctx.beginPath();
  ctx.moveTo(x - w / 2, baseY - 30);
  ctx.lineTo(x + w / 2, baseY - 30);
  ctx.lineTo(x + w / 2 - 6, baseY);
  ctx.lineTo(x - w / 2 + 6, baseY);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = '#c97a4e';
  ctx.fillRect(x - w / 2 - 3, baseY - 36, w + 6, 8);
}

// The changing plant on the left bench: cactus, or shrub.
function paintChangingPlant(ctx, altered) {
  paintPot(ctx, 140, 400, 52);
  if (altered.has('cactus')) {
    // A round, clipped shrub in a ball of leaves.
    ctx.fillStyle = '#3f7031';
    disc(ctx, 140, 336, 27, '#3f7031');
    disc(ctx, 118, 352, 19, '#4a7d38');
    disc(ctx, 162, 352, 19, '#4a7d38');
    disc(ctx, 140, 356, 21, '#548c40');
    ctx.fillStyle = '#c03a30';
    for (const [dx, dy] of [[-12, -14], [10, -8], [0, 6], [16, 10], [-18, 4]]) {
      disc(ctx, 140 + dx, 340 + dy, 3, '#c03a30');
    }
  } else {
    // A cactus: a ribbed column with two arms and a flower on top.
    ctx.fillStyle = '#3f7a44';
    ctx.beginPath();
    ctx.ellipse(140, 334, 14, 34, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(118, 344, 8, 16, 0, 0, Math.PI * 2);
    ctx.ellipse(162, 330, 8, 20, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillRect(118, 344, 16, 7);
    ctx.fillRect(148, 330, 14, 7);
    ctx.strokeStyle = 'rgba(230, 255, 230, 0.5)';
    ctx.lineWidth = 1.4;
    for (const dx of [-7, 0, 7]) {
      ctx.beginPath();
      ctx.moveTo(140 + dx, 308);
      ctx.lineTo(140 + dx, 360);
      ctx.stroke();
    }
    disc(ctx, 140, 298, 6, '#e86a92');
    disc(ctx, 140, 298, 2.6, '#ffd97a');
  }
}

// A fern in a pot: arcs of fronds.
function paintFernPot(ctx, x, baseY) {
  paintPot(ctx, x, baseY, 40);
  ctx.strokeStyle = '#4a7a3f';
  ctx.lineWidth = 3;
  for (const [dx, lift] of [[-26, 26], [-13, 38], [0, 44], [13, 38], [26, 26]]) {
    ctx.beginPath();
    ctx.moveTo(x, baseY - 32);
    ctx.quadraticCurveTo(x + dx * 0.5, baseY - 32 - lift, x + dx, baseY - 22 - lift * 0.55);
    ctx.stroke();
  }
}

// A leafy pot with a coloured bloom or two.
function paintLeafyPot(ctx, x, baseY, bloom) {
  paintPot(ctx, x, baseY, 44);
  ctx.fillStyle = '#4a7a3f';
  for (const [dx, dy, r] of [[-13, -44, 12], [0, -54, 14], [13, -44, 12], [0, -38, 12]]) {
    disc(ctx, x + dx, baseY + dy, r, '#4a7a3f');
  }
  disc(ctx, x - 6, baseY - 52, 5.5, bloom);
  disc(ctx, x + 9, baseY - 42, 5.5, bloom);
}

// The butterfly, drifting over the benches: amber wings on the first
// telling, violet on the second.
function paintButterfly(ctx, altered) {
  const wing = altered.has('butterfly') ? '#8a6ae8' : '#e8973a';
  const wingDark = altered.has('butterfly') ? '#6a4ac0' : '#c56a1d';
  ctx.fillStyle = wing;
  ctx.beginPath();
  ctx.ellipse(336, 290, 13, 8, -0.6, 0, Math.PI * 2);
  ctx.ellipse(364, 290, 13, 8, 0.6, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = wingDark;
  ctx.beginPath();
  ctx.ellipse(338, 308, 10, 6.5, 0.5, 0, Math.PI * 2);
  ctx.ellipse(362, 308, 10, 6.5, -0.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#2c2318';
  ctx.beginPath();
  ctx.ellipse(350, 300, 3.4, 10, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#2c2318';
  ctx.lineWidth = 1.6;
  ctx.beginPath();
  ctx.moveTo(348, 291);
  ctx.quadraticCurveTo(342, 282, 337, 280);
  ctx.moveTo(352, 291);
  ctx.quadraticCurveTo(358, 282, 363, 280);
  ctx.stroke();
}

// The tiled floor.
function paintFloor(ctx, rng) {
  ctx.fillStyle = '#8a6f52';
  ctx.fillRect(0, 540, 600, 60);
  ctx.strokeStyle = 'rgba(60, 40, 24, 0.4)';
  ctx.lineWidth = 2;
  for (let x = 0; x <= 600; x += 75) {
    ctx.beginPath();
    ctx.moveTo(x, 540);
    ctx.lineTo(x - 18, 600);
    ctx.stroke();
  }
  ctx.beginPath();
  ctx.moveTo(0, 570);
  ctx.lineTo(600, 570);
  ctx.stroke();
  ctx.fillStyle = 'rgba(255, 240, 200, 0.10)';
  for (let i = 0; i < 10; i++) {
    ctx.fillRect(rng.range(0, 580), rng.range(544, 592), rng.range(14, 40), 3);
  }
}

// A tall flower in a floor pot: crimson on the first telling, gold on the
// second.
function paintTallFlower(ctx, altered) {
  paintPot(ctx, 430, 516, 46);
  ctx.strokeStyle = '#3f7031';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(430, 490);
  ctx.quadraticCurveTo(424, 460, 430, 428);
  ctx.stroke();
  ctx.fillStyle = '#4a7d38';
  ctx.beginPath();
  ctx.ellipse(418, 466, 12, 5, -0.6, 0, Math.PI * 2);
  ctx.ellipse(443, 452, 12, 5, 0.6, 0, Math.PI * 2);
  ctx.fill();
  const petal = altered.has('flower') ? '#e8b34a' : '#c03a30';
  ctx.fillStyle = petal;
  for (let i = 0; i < 7; i++) {
    const a = (i / 7) * Math.PI * 2;
    disc(ctx, 430 + Math.cos(a) * 10, 420 + Math.sin(a) * 10, 6.4, petal);
  }
  disc(ctx, 430, 420, 5.6, '#7a4a1d');
}

// The great floor pot on the right, broad leaves on stems — and a snail
// that rests on its rim on the first telling only.
function paintBigPot(ctx, altered) {
  // Stems rising from the pot's mouth to the leaves.
  ctx.strokeStyle = '#3f7031';
  ctx.lineWidth = 4;
  for (const dx of [-26, 0, 26]) {
    ctx.beginPath();
    ctx.moveTo(505, 516);
    ctx.quadraticCurveTo(505 + dx * 0.4, 492, 505 + dx, 470);
    ctx.stroke();
  }
  ctx.fillStyle = '#4a7d38';
  for (const [dx, dy, r, tilt] of [[-30, -44, 15, -0.5], [0, -58, 17, 0], [30, -44, 15, 0.5], [-14, -30, 13, -0.2], [16, -30, 13, 0.2]]) {
    ctx.beginPath();
    ctx.ellipse(505 + dx, 512 + dy, r * 0.62, r, tilt, 0, Math.PI * 2);
    ctx.fill();
  }
  paintPot(ctx, 505, 548, 74);
  if (!altered.has('snail')) {
    // The snail: a coiled shell and a slow body along the pot's rim.
    ctx.fillStyle = '#c9a86a';
    ctx.beginPath();
    ctx.ellipse(492, 508, 13, 5.5, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#a8763a';
    disc(ctx, 486, 500, 9, '#a8763a');
    ctx.strokeStyle = '#7a4a1d';
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.arc(486, 500, 5.4, 0, Math.PI * 2);
    ctx.stroke();
    ctx.strokeStyle = '#c9a86a';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(502, 503);
    ctx.lineTo(506, 495);
    ctx.moveTo(499, 502);
    ctx.lineTo(500, 493);
    ctx.stroke();
  }
}

// A green watering can on the floorboards, spout and rose and all. On the
// second telling someone has taken it away.
function paintWateringCan(ctx) {
  glow(ctx, 250, 520, 40, 'rgba(255, 240, 190, 0.10)');
  ctx.fillStyle = '#3f7a5e';
  ctx.beginPath();
  ctx.ellipse(250, 518, 27, 19, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillRect(238, 488, 24, 14);
  ctx.fillStyle = '#356b50';
  ctx.beginPath();
  ctx.moveTo(228, 510);
  ctx.lineTo(198, 492);
  ctx.lineTo(204, 484);
  ctx.lineTo(234, 500);
  ctx.closePath();
  ctx.fill();
  disc(ctx, 200, 488, 7, '#2c5a44');
  ctx.strokeStyle = '#356b50';
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.arc(268, 508, 17, -1.1, 1.1);
  ctx.stroke();
}
