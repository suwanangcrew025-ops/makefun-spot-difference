// Scene 3 — The Glasshouse (7 differences, 210s).
// A glasshouse interior: pitched glass roof, hanging planter, butterfly,
// cactus, tall flower, snail on the path, watering can. The planter and
// the snail texture themselves from their own seeded streams, so their
// absence never shifts the rest of the scene.
import { glow, skyGradient } from './paintkit.js';
import { streamFor } from './random.js';

export const GLASSHOUSE = {
  id: 'glasshouse',
  name: 'The Glasshouse',
  seconds: 210,
  differences: [
    { id: 'crack', x: 200, y: 62, r: 30, label: 'the cracked roof pane' },
    { id: 'planter', x: 140, y: 135, r: 32, label: 'the hanging planter' },
    { id: 'butterfly', x: 350, y: 200, r: 26, label: "the butterfly's wings" },
    { id: 'cactus', x: 120, y: 415, r: 32, label: 'the cactus' },
    { id: 'flower', x: 450, y: 290, r: 28, label: 'the tall flower' },
    { id: 'snail', x: 300, y: 505, r: 18, label: 'the snail' },
    { id: 'can', x: 500, y: 470, r: 26, label: 'the watering can' },
  ],
};

function paintGlass(ctx) {
  skyGradient(ctx, 560, 560, [
    [0, '#cfe8d8'],
    [0.5, '#dcefd9'],
    [1, '#b8d9b0'],
  ]);
  glow(ctx, 470, 60, 120, '#fff6c8', 0.55);
  // Pitched roof: two slopes meeting at the ridge.
  ctx.save();
  ctx.fillStyle = 'rgba(255, 255, 255, 0.28)';
  ctx.beginPath();
  ctx.moveTo(0, 130);
  ctx.lineTo(280, 18);
  ctx.lineTo(280, 130);
  ctx.closePath();
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(560, 130);
  ctx.lineTo(280, 18);
  ctx.lineTo(280, 130);
  ctx.closePath();
  ctx.fill();
  // Roof frame.
  ctx.strokeStyle = '#4a5a44';
  ctx.lineWidth = 6;
  ctx.beginPath();
  ctx.moveTo(0, 130);
  ctx.lineTo(280, 18);
  ctx.lineTo(560, 130);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(280, 18);
  ctx.lineTo(280, 130);
  ctx.stroke();
  // Roof pane seams.
  ctx.lineWidth = 2.5;
  ctx.strokeStyle = 'rgba(74, 90, 68, 0.7)';
  for (const x of [95, 190]) {
    ctx.beginPath();
    ctx.moveTo(x, 130 - (x / 280) * 112);
    ctx.lineTo(x, 18 + ((280 - x) / 280) * 112);
    ctx.stroke();
  }
  for (const x of [370, 465]) {
    ctx.beginPath();
    ctx.moveTo(x, 18 + ((x - 280) / 280) * 112);
    ctx.lineTo(x, 130 - ((560 - x) / 280) * 112);
    ctx.stroke();
  }
  // Wall mullions.
  ctx.lineWidth = 4;
  ctx.strokeStyle = '#4a5a44';
  for (let x = 80; x < 560; x += 80) {
    ctx.beginPath();
    ctx.moveTo(x, 130);
    ctx.lineTo(x, 460);
    ctx.stroke();
  }
  ctx.beginPath();
  ctx.moveTo(0, 300);
  ctx.lineTo(560, 300);
  ctx.stroke();
  ctx.restore();
}

function paintCrack(ctx, altered) {
  if (!altered.has('crack')) return;
  ctx.save();
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.95)';
  ctx.lineWidth = 2;
  ctx.lineCap = 'round';
  const cx = 200;
  const cy = 62;
  const arms = [
    [[0, 0], [-16, -12], [-26, -10]],
    [[0, 0], [14, -14], [24, -22]],
    [[0, 0], [18, 8], [30, 6]],
    [[0, 0], [-6, 16], [-14, 26]],
    [[0, 0], [4, 18], [2, 30]],
  ];
  for (const arm of arms) {
    ctx.beginPath();
    ctx.moveTo(cx + arm[0][0], cy + arm[0][1]);
    for (let i = 1; i < arm.length; i += 1) ctx.lineTo(cx + arm[i][0], cy + arm[i][1]);
    ctx.stroke();
  }
  ctx.restore();
}

function paintPlanter(ctx, altered) {
  if (altered.has('planter')) return;
  const rng = streamFor('glasshouse', 'planter');
  ctx.save();
  // Hanging strings from the roof beam.
  ctx.strokeStyle = '#4a5a44';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(118, 84);
  ctx.lineTo(132, 118);
  ctx.moveTo(162, 84);
  ctx.lineTo(148, 118);
  ctx.stroke();
  // Pot.
  ctx.fillStyle = '#a06838';
  ctx.beginPath();
  ctx.moveTo(120, 118);
  ctx.lineTo(160, 118);
  ctx.lineTo(154, 146);
  ctx.lineTo(126, 146);
  ctx.closePath();
  ctx.fill();
  // Trailing vines and leaves, from the planter's own stream.
  ctx.strokeStyle = '#3e7a3a';
  ctx.lineWidth = 2.5;
  for (let v = 0; v < 3; v += 1) {
    const bx = 128 + v * 12;
    const sway = (rng() - 0.5) * 22;
    ctx.beginPath();
    ctx.moveTo(bx, 146);
    ctx.quadraticCurveTo(bx + sway, 168, bx + sway * 1.4, 186 + rng() * 12);
    ctx.stroke();
  }
  ctx.fillStyle = '#4d8a44';
  for (let i = 0; i < 7; i += 1) {
    const lx = 122 + rng() * 36;
    const ly = 148 + rng() * 46;
    ctx.beginPath();
    ctx.ellipse(lx, ly, 6 + rng() * 4, 4 + rng() * 3, rng() * Math.PI, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

function paintButterfly(ctx, altered) {
  const wing = altered.has('butterfly') ? '#8a5fd0' : '#e07b1f';
  ctx.save();
  ctx.translate(350, 200);
  ctx.rotate(-0.25);
  ctx.fillStyle = wing;
  // Upper and lower wings, mirrored.
  for (const s of [-1, 1]) {
    ctx.beginPath();
    ctx.ellipse(s * 14, -8, 13, 10, s * 0.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(s * 11, 8, 9, 7, s * 0.6, 0, Math.PI * 2);
    ctx.fill();
  }
  // Wing spots.
  ctx.fillStyle = 'rgba(255, 255, 255, 0.75)';
  for (const s of [-1, 1]) {
    ctx.beginPath();
    ctx.arc(s * 14, -8, 3, 0, Math.PI * 2);
    ctx.fill();
  }
  // Body and antennae.
  ctx.strokeStyle = '#2a2438';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(-3, -12);
  ctx.quadraticCurveTo(-8, -20, -12, -22);
  ctx.moveTo(3, -12);
  ctx.quadraticCurveTo(8, -20, 12, -22);
  ctx.stroke();
  ctx.fillStyle = '#2a2438';
  ctx.beginPath();
  ctx.ellipse(0, 0, 3, 11, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function paintTallFlower(ctx, altered) {
  ctx.save();
  // Stem and leaves.
  ctx.strokeStyle = '#3e7a3a';
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.moveTo(450, 460);
  ctx.quadraticCurveTo(446, 380, 450, 306);
  ctx.stroke();
  ctx.fillStyle = '#4d8a44';
  ctx.beginPath();
  ctx.ellipse(428, 400, 18, 7, -0.5, 0, Math.PI * 2);
  ctx.ellipse(472, 430, 18, 7, 0.5, 0, Math.PI * 2);
  ctx.fill();
  // Bloom: pink, or gold when altered.
  const petal = altered.has('flower') ? '#e8b64c' : '#d96a8a';
  ctx.fillStyle = petal;
  for (let i = 0; i < 6; i += 1) {
    const a = (i / 6) * Math.PI * 2;
    ctx.beginPath();
    ctx.ellipse(450 + Math.cos(a) * 16, 290 + Math.sin(a) * 16, 12, 8, a, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.fillStyle = '#e8b64c';
  ctx.beginPath();
  ctx.arc(450, 290, 8, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function paintCactusOrShrub(ctx, altered) {
  ctx.save();
  // Terracotta pot.
  ctx.fillStyle = '#a06838';
  ctx.beginPath();
  ctx.moveTo(96, 440);
  ctx.lineTo(144, 440);
  ctx.lineTo(138, 470);
  ctx.lineTo(102, 470);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = '#8a5a30';
  ctx.fillRect(92, 434, 56, 9);
  if (!altered.has('cactus')) {
    // Cactus: column with two arms.
    ctx.fillStyle = '#4d8a44';
    ctx.beginPath();
    ctx.ellipse(120, 408, 11, 32, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(102, 416, 7, 16, -0.6, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(138, 412, 7, 18, 0.6, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#3e7a3a';
    ctx.fillRect(104, 400, 3, 8);
    ctx.fillRect(134, 396, 3, 8);
  } else {
    // Shrub: a rounded bush in the same pot.
    ctx.fillStyle = '#5a9a4a';
    for (const [sx, sy, sr] of [[104, 420, 14], [120, 406, 17], [136, 420, 14], [112, 432, 12], [128, 432, 12]]) {
      ctx.beginPath();
      ctx.arc(sx, sy, sr, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.fillStyle = 'rgba(255, 255, 255, 0.25)';
    ctx.beginPath();
    ctx.arc(114, 400, 5, 0, Math.PI * 2);
    ctx.arc(128, 414, 4, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

function paintBedAndPath(ctx) {
  ctx.save();
  // Soil bed along the bottom.
  ctx.fillStyle = '#5a4028';
  ctx.fillRect(0, 460, 560, 100);
  ctx.fillStyle = '#6b4e30';
  ctx.fillRect(0, 460, 560, 8);
  // Stone path down the middle.
  ctx.fillStyle = '#9a8a72';
  ctx.fillRect(240, 460, 120, 100);
  const rng = streamFor('glasshouse', 'path-stones');
  ctx.strokeStyle = 'rgba(60, 45, 30, 0.5)';
  ctx.lineWidth = 2;
  for (let i = 0; i < 5; i += 1) {
    const y = 470 + i * 18 + rng() * 6;
    ctx.beginPath();
    ctx.moveTo(240, y);
    ctx.lineTo(360, y);
    ctx.stroke();
  }
  // Side ferns.
  ctx.strokeStyle = '#3e7a3a';
  ctx.lineWidth = 3;
  for (const bx of [40, 200, 380, 530]) {
    for (let f = -2; f <= 2; f += 1) {
      ctx.beginPath();
      ctx.moveTo(bx, 470);
      ctx.quadraticCurveTo(bx + f * 12, 440, bx + f * 20, 424 + Math.abs(f) * 6);
      ctx.stroke();
    }
  }
  ctx.restore();
}

function paintSnail(ctx, altered) {
  if (altered.has('snail')) return;
  ctx.save();
  // Body and shell on the path.
  ctx.fillStyle = '#c98a5a';
  ctx.beginPath();
  ctx.ellipse(300, 510, 20, 8, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#8a5a30';
  ctx.beginPath();
  ctx.arc(296, 500, 11, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#5a4028';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(296, 500, 6, 0, Math.PI * 1.5);
  ctx.stroke();
  // Eye stalks.
  ctx.strokeStyle = '#c98a5a';
  ctx.beginPath();
  ctx.moveTo(316, 504);
  ctx.lineTo(320, 494);
  ctx.moveTo(312, 505);
  ctx.lineTo(314, 495);
  ctx.stroke();
  ctx.fillStyle = '#2a2438';
  ctx.beginPath();
  ctx.arc(320, 493, 2, 0, Math.PI * 2);
  ctx.arc(314, 494, 2, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function paintWateringCan(ctx, altered) {
  if (altered.has('can')) return;
  ctx.save();
  ctx.translate(500, 470);
  // Body, spout, handle.
  ctx.fillStyle = '#7a8a94';
  ctx.beginPath();
  ctx.roundRect(-22, -18, 40, 34, 6);
  ctx.fill();
  ctx.fillStyle = '#5f707a';
  ctx.beginPath();
  ctx.moveTo(18, -8);
  ctx.lineTo(34, -20);
  ctx.lineTo(38, -14);
  ctx.lineTo(20, 0);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = '#5f707a';
  ctx.beginPath();
  ctx.arc(36, -19, 6, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#5f707a';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.arc(-6, -14, 14, Math.PI, Math.PI * 1.9);
  ctx.stroke();
  ctx.restore();
}

export function paintGlasshouse(ctx, altered) {
  paintGlass(ctx);
  paintCrack(ctx, altered);
  paintPlanter(ctx, altered);
  paintButterfly(ctx, altered);
  paintTallFlower(ctx, altered);
  paintCactusOrShrub(ctx, altered);
  paintBedAndPath(ctx);
  paintSnail(ctx, altered);
  paintWateringCan(ctx, altered);
}
