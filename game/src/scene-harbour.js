// scene-harbour.js — scene one: "Dusk at Lanternwick Harbour".
// A lighthouse point on the left, a fishing boat riding the middle water, a
// stone quay in front. The painter draws the scene once; the `altered` set
// names which of its five differences take their changed form on the second
// telling: the lighthouse lamp dark, the boat's stripe another colour, the
// sail another colour, one gull gone, the quay cat gone.

import {
  skyGradient, disc, glow, starField, waveBand, gullShape, crescentMoon, sparkle,
} from './paintkit.js';

export const harbourScene = {
  id: 'harbour',
  title: 'Dusk at Lanternwick Harbour',
  subtitle: 'Scene one · five differences',
  timeLimit: 150,
  differences: [
    { id: 'lamp', label: 'the lighthouse lamp, gone dark', x: 120, y: 194, r: 26 },
    { id: 'sail', label: 'the sail, dyed rust-red', x: 340, y: 400, r: 32 },
    { id: 'stripe', label: 'the boat stripe, painted teal', x: 330, y: 482, r: 30 },
    { id: 'gull', label: 'a gull, flown away', x: 455, y: 140, r: 22 },
    { id: 'cat', label: 'the quay cat, vanished', x: 520, y: 490, r: 24 },
  ],
  paint,
};

function paint(ctx, rng, altered) {
  // Sky: indigo over violet over ember, down to a lit horizon.
  ctx.fillStyle = skyGradient(ctx, 0, 0, 600, 600, [
    [0, '#1c2342'],
    [0.42, '#47355e'],
    [0.66, '#a8543f'],
    [0.72, '#e08a52'],
    [1, '#e08a52'],
  ]);
  ctx.fillRect(0, 0, 600, 434);
  starField(ctx, rng, 0, 0, 600, 250, 70, '#ffeecb');
  crescentMoon(ctx, 508, 74, 25, '#f6e7bd', '#232a4c');
  sparkle(ctx, 120, 90, 7, 'rgba(255, 238, 203, 0.8)');
  sparkle(ctx, 330, 60, 5, 'rgba(255, 238, 203, 0.6)');

  // Gulls riding the dusk. The middle one is a difference: on the second
  // telling it has flown away.
  gullShape(ctx, 250, 92, 17, '#2c2440');
  if (!altered.has('gull')) gullShape(ctx, 455, 140, 15, '#2c2440');
  gullShape(ctx, 385, 118, 12, '#2c2440');

  // The far headland, a dark shoulder on the right.
  ctx.fillStyle = '#33243e';
  ctx.beginPath();
  ctx.moveTo(430, 434);
  ctx.quadraticCurveTo(500, 372, 600, 398);
  ctx.lineTo(600, 434);
  ctx.closePath();
  ctx.fill();

  // Sea: a deep band with scalloped wave lines and lamplight shimmer.
  ctx.fillStyle = skyGradient(ctx, 0, 434, 600, 90, [
    [0, '#4b3a55'],
    [0.25, '#2e3352'],
    [1, '#1a2138'],
  ]);
  ctx.fillRect(0, 434, 600, 88);
  waveBand(ctx, rng, 8, 452, 584, '#8d7ba6', 0);
  waveBand(ctx, rng, 8, 478, 584, '#6f5f8c', 0);
  waveBand(ctx, rng, 8, 502, 584, '#57496f', 0);

  paintLighthouse(ctx, altered);
  paintFishingBoat(ctx, altered);
  paintRowboat(ctx);

  // The quay: a stone wall across the front, its top edge catching the dusk.
  ctx.fillStyle = '#3b3247';
  ctx.fillRect(0, 522, 600, 78);
  ctx.fillStyle = '#584a63';
  ctx.fillRect(0, 522, 600, 7);
  ctx.strokeStyle = 'rgba(0, 0, 0, 0.28)';
  ctx.lineWidth = 2;
  for (let x = 44; x < 600; x += 74) {
    ctx.beginPath();
    ctx.moveTo(x, 532);
    ctx.lineTo(x, 600);
    ctx.stroke();
  }
  ctx.beginPath();
  ctx.moveTo(0, 562);
  ctx.lineTo(600, 562);
  ctx.stroke();

  paintLanternPost(ctx, 205);
  paintLanternPost(ctx, 428);
  if (!altered.has('cat')) paintCat(ctx);
}

// The lighthouse on its rocks, and its lamp — the scene's first difference.
function paintLighthouse(ctx, altered) {
  // Rocks: a tumble of dark shapes at the water's edge.
  ctx.fillStyle = '#241d31';
  for (const [x, y, r] of [[70, 452, 42], [128, 458, 52], [182, 452, 36], [104, 436, 34]]) {
    ctx.beginPath();
    ctx.arc(x, y, r, Math.PI, Math.PI * 2);
    ctx.fill();
  }
  ctx.fillRect(28, 448, 210, 14);

  // Tower: a tapering stack of cream and rust bands.
  const bands = ['#e8dcc2', '#b4503f', '#e8dcc2', '#b4503f', '#e8dcc2'];
  const topW = 21;
  const botW = 33;
  const topY = 208;
  const botY = 446;
  for (let i = 0; i < bands.length; i++) {
    const y0 = topY + ((botY - topY) * i) / bands.length;
    const y1 = topY + ((botY - topY) * (i + 1)) / bands.length;
    const w0 = topW + ((botW - topW) * i) / bands.length;
    const w1 = topW + ((botW - topW) * (i + 1)) / bands.length;
    ctx.fillStyle = bands[i];
    ctx.beginPath();
    ctx.moveTo(120 - w0, y0);
    ctx.lineTo(120 + w0, y0);
    ctx.lineTo(120 + w1, y1);
    ctx.lineTo(120 - w1, y1);
    ctx.closePath();
    ctx.fill();
  }
  // A small door and two windows up the tower.
  ctx.fillStyle = '#33262b';
  ctx.fillRect(112, 408, 16, 30);
  ctx.fillRect(114, 322, 11, 15);
  ctx.fillRect(114, 262, 11, 15);

  // Gallery deck and lamp room.
  ctx.fillStyle = '#2c2434';
  ctx.fillRect(94, 196, 52, 12);
  ctx.fillStyle = altered.has('lamp') ? '#3d4457' : '#ffd97a';
  ctx.fillRect(103, 172, 34, 26);
  ctx.strokeStyle = '#2c2434';
  ctx.lineWidth = 3;
  ctx.strokeRect(103, 172, 34, 26);
  ctx.beginPath();
  ctx.moveTo(120, 198);
  ctx.lineTo(120, 172);
  ctx.stroke();
  // Roof: a shallow cap.
  ctx.fillStyle = '#59332e';
  ctx.beginPath();
  ctx.moveTo(96, 172);
  ctx.lineTo(120, 152);
  ctx.lineTo(144, 172);
  ctx.closePath();
  ctx.fill();

  if (!altered.has('lamp')) {
    // The lamp is lit: a glow, a beam over the water, and its reflection.
    glow(ctx, 120, 185, 66, 'rgba(255, 205, 100, 0.5)');
    disc(ctx, 120, 185, 8, '#fff3c4');
    ctx.fillStyle = 'rgba(255, 214, 120, 0.13)';
    ctx.beginPath();
    ctx.moveTo(126, 178);
    ctx.lineTo(430, 128);
    ctx.lineTo(430, 268);
    ctx.lineTo(126, 196);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = 'rgba(255, 190, 90, 0.5)';
    ctx.lineWidth = 2;
    for (let i = 0; i < 6; i++) {
      const y = 446 + i * 12;
      const wob = (i % 2 === 0 ? -5 : 5);
      ctx.beginPath();
      ctx.moveTo(102 + wob, y);
      ctx.lineTo(138 + wob, y);
      ctx.stroke();
    }
  }
}

// The fishing boat: hull, stripe, mast and sail — two differences live here.
function paintFishingBoat(ctx, altered) {
  // Hull, riding at y 455..505.
  ctx.fillStyle = '#5d3a2a';
  ctx.beginPath();
  ctx.moveTo(248, 458);
  ctx.lineTo(414, 458);
  ctx.lineTo(392, 502);
  ctx.lineTo(272, 502);
  ctx.closePath();
  ctx.fill();
  // The stripe along the hull: crimson on the first telling, teal on the second.
  ctx.fillStyle = altered.has('stripe') ? '#2f8f83' : '#c03a30';
  ctx.beginPath();
  ctx.moveTo(254, 474);
  ctx.lineTo(408, 474);
  ctx.lineTo(400, 490);
  ctx.lineTo(264, 490);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = '#3c2718';
  ctx.fillRect(244, 450, 176, 9);
  // Cabin block and a coil of rope.
  ctx.fillStyle = '#77512f';
  ctx.fillRect(352, 420, 44, 32);
  ctx.fillStyle = '#ffd97a';
  ctx.fillRect(364, 428, 12, 12);
  ctx.strokeStyle = '#caa06a';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(282, 442, 9, 0, Math.PI * 2);
  ctx.stroke();
  // Mast and rigging.
  ctx.strokeStyle = '#2e2019';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(318, 452);
  ctx.lineTo(318, 306);
  ctx.stroke();
  ctx.lineWidth = 1.6;
  ctx.beginPath();
  ctx.moveTo(318, 310);
  ctx.lineTo(250, 452);
  ctx.moveTo(318, 310);
  ctx.lineTo(404, 420);
  ctx.stroke();
  // The sail: cream on the first telling, rust-red on the second.
  ctx.fillStyle = altered.has('sail') ? '#b4503f' : '#efe3c2';
  ctx.beginPath();
  ctx.moveTo(324, 316);
  ctx.lineTo(324, 446);
  ctx.lineTo(402, 446);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = 'rgba(70, 50, 30, 0.45)';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(324, 356);
  ctx.lineTo(378, 446);
  ctx.moveTo(324, 398);
  ctx.lineTo(352, 446);
  ctx.stroke();
  // A pennant at the masthead.
  ctx.fillStyle = '#e8b34a';
  ctx.beginPath();
  ctx.moveTo(318, 306);
  ctx.lineTo(342, 312);
  ctx.lineTo(318, 320);
  ctx.closePath();
  ctx.fill();
}

// A small rowboat tied up on the right, with a pair of oars shipped.
function paintRowboat(ctx) {
  ctx.fillStyle = '#4c5a3a';
  ctx.beginPath();
  ctx.moveTo(452, 484);
  ctx.lineTo(544, 484);
  ctx.lineTo(528, 510);
  ctx.lineTo(468, 510);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = '#66754c';
  ctx.fillRect(448, 478, 100, 7);
  ctx.strokeStyle = '#8a6f45';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(478, 482);
  ctx.lineTo(452, 462);
  ctx.moveTo(516, 482);
  ctx.lineTo(544, 464);
  ctx.stroke();
}

// A gas lantern on an iron post, standing on the quay.
function paintLanternPost(ctx, x) {
  ctx.strokeStyle = '#1f1a26';
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.moveTo(x, 522);
  ctx.lineTo(x, 468);
  ctx.stroke();
  glow(ctx, x, 458, 30, 'rgba(255, 196, 92, 0.45)');
  ctx.fillStyle = '#ffd97a';
  ctx.fillRect(x - 6, 448, 12, 16);
  ctx.strokeStyle = '#1f1a26';
  ctx.lineWidth = 2.5;
  ctx.strokeRect(x - 6, 448, 12, 16);
  ctx.beginPath();
  ctx.moveTo(x - 9, 448);
  ctx.lineTo(x, 438);
  ctx.lineTo(x + 9, 448);
  ctx.stroke();
}

// The harbourmaster's cat, sitting on the quay with its tail curled round.
// On the second telling it has slipped away.
function paintCat(ctx) {
  ctx.fillStyle = '#191521';
  // Tail, curled along the stones.
  ctx.strokeStyle = '#191521';
  ctx.lineWidth = 6;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(534, 512);
  ctx.quadraticCurveTo(556, 512, 552, 494);
  ctx.stroke();
  // Body and head.
  ctx.beginPath();
  ctx.ellipse(520, 500, 16, 13, 0, 0, Math.PI * 2);
  ctx.fill();
  disc(ctx, 520, 478, 10.5, '#191521');
  // Ears.
  ctx.beginPath();
  ctx.moveTo(512, 472);
  ctx.lineTo(514, 461);
  ctx.lineTo(519, 470);
  ctx.closePath();
  ctx.moveTo(521, 470);
  ctx.lineTo(526, 461);
  ctx.lineTo(528, 472);
  ctx.closePath();
  ctx.fill();
  // One amber eye, watching the boats.
  disc(ctx, 517, 477, 1.6, '#e8b34a');
}
