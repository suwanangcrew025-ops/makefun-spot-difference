// Scene one: Dusk at Lanternwick Harbour. A lighthouse over a working
// quay at the blue hour — boats coming in, lanterns lit, the parlour cat
// watching from the crates. The painter draws the harbour once; the
// `altered` set names which of the five differences take their changed
// form, so the left panel (empty set) and the right panel (every id) are
// the same painting but for exactly those five places.
import { glow, gull, hangingLantern, moon, sittingCat, starField, verticalGradient, waterShimmer } from './paintkit.js';

export const harbourScene = {
  id: 'harbour',
  title: 'Dusk at Lanternwick Harbour',
  differences: [
    { id: 'lamp', x: 118, y: 214, r: 34 },
    { id: 'stripe', x: 118, y: 345, r: 36 },
    { id: 'sail', x: 390, y: 394, r: 42 },
    { id: 'gull', x: 428, y: 106, r: 28 },
    { id: 'cat', x: 500, y: 468, r: 32 },
  ],
  paint,
};

/** The lighthouse tower's outline, used to clip its stripes. */
function towerPath(ctx) {
  ctx.beginPath();
  ctx.moveTo(76, 505);
  ctx.lineTo(90, 252);
  ctx.lineTo(146, 252);
  ctx.lineTo(160, 505);
  ctx.closePath();
}

function paintLighthouse(ctx, altered) {
  // Rocks the tower stands on.
  ctx.fillStyle = '#20242f';
  for (const [x, y, rx, ry] of [[70, 512, 52, 22], [130, 518, 62, 24], [178, 510, 40, 18], [104, 500, 44, 18]]) {
    ctx.beginPath();
    ctx.ellipse(x, y, rx, ry, 0, Math.PI, Math.PI * 2);
    ctx.fill();
  }
  // Tower with its bands; the middle band is the stripe difference.
  towerPath(ctx);
  ctx.save();
  ctx.clip();
  ctx.fillStyle = '#e9e2d2';
  ctx.fillRect(70, 252, 96, 253);
  // Two red bands, and between them the band that is a difference:
  // lighthouse red on the left panel, harbour teal on the right.
  ctx.fillStyle = '#b8452f';
  ctx.fillRect(70, 294, 96, 42);
  ctx.fillRect(70, 420, 96, 42);
  ctx.fillStyle = altered.has('stripe') ? '#2f7f7a' : '#b8452f';
  ctx.fillRect(70, 336, 96, 42);
  ctx.restore();
  towerPath(ctx);
  ctx.strokeStyle = 'rgba(24, 18, 12, 0.55)';
  ctx.lineWidth = 2;
  ctx.stroke();
  // A small window halfway down.
  ctx.fillStyle = '#2b3448';
  ctx.fillRect(110, 386, 16, 22);
  ctx.strokeRect(110, 386, 16, 22);
  // Gallery deck and lamp room.
  ctx.fillStyle = '#33261a';
  ctx.fillRect(82, 240, 72, 12);
  ctx.fillRect(96, 196, 44, 44);
  const lit = !altered.has('lamp');
  ctx.fillStyle = lit ? '#ffd98a' : 'rgba(110, 118, 130, 0.6)';
  ctx.fillRect(102, 202, 32, 32);
  ctx.strokeStyle = '#1d150e';
  ctx.strokeRect(102, 202, 32, 32);
  ctx.beginPath();
  ctx.moveTo(118, 178);
  ctx.lineTo(140, 198);
  ctx.lineTo(96, 198);
  ctx.closePath();
  ctx.fillStyle = '#7a2e22';
  ctx.fill();
  if (lit) {
    glow(ctx, 118, 218, 90, 'rgba(255, 196, 92, 0.4)');
    // The beam, sweeping out over the water.
    const beam = ctx.createLinearGradient(130, 214, 560, 330);
    beam.addColorStop(0, 'rgba(255, 214, 120, 0.28)');
    beam.addColorStop(1, 'rgba(255, 214, 120, 0)');
    ctx.fillStyle = beam;
    ctx.beginPath();
    ctx.moveTo(128, 206);
    ctx.lineTo(560, 300);
    ctx.lineTo(560, 356);
    ctx.lineTo(128, 226);
    ctx.closePath();
    ctx.fill();
  }
}

function paintFishingBoat(ctx, altered) {
  // Mast and rigging.
  ctx.strokeStyle = 'rgba(16, 12, 8, 0.9)';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(402, 452);
  ctx.lineTo(402, 338);
  ctx.stroke();
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.moveTo(402, 340);
  ctx.lineTo(330, 450);
  ctx.moveTo(402, 340);
  ctx.lineTo(478, 448);
  ctx.stroke();
  // The sail — cream on the left panel, rust on the right.
  ctx.fillStyle = altered.has('sail') ? '#c96f3f' : '#efe3c2';
  ctx.beginPath();
  ctx.moveTo(408, 348);
  ctx.lineTo(408, 446);
  ctx.lineTo(458, 446);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = altered.has('sail') ? '#b25a30' : '#e2d3ac';
  ctx.beginPath();
  ctx.moveTo(396, 356);
  ctx.lineTo(396, 442);
  ctx.lineTo(364, 442);
  ctx.closePath();
  ctx.fill();
  // Hull, deep green with a cream sheer stripe.
  ctx.fillStyle = '#1f4d3a';
  ctx.beginPath();
  ctx.moveTo(322, 452);
  ctx.lineTo(488, 452);
  ctx.quadraticCurveTo(478, 486, 440, 494);
  ctx.lineTo(356, 494);
  ctx.quadraticCurveTo(330, 484, 322, 452);
  ctx.fill();
  ctx.fillStyle = '#efe3c2';
  ctx.fillRect(326, 456, 158, 5);
  // Cabin and a warm window.
  ctx.fillStyle = '#5a4030';
  ctx.fillRect(348, 428, 34, 24);
  ctx.fillStyle = '#ffd98a';
  ctx.fillRect(358, 434, 12, 10);
  // Reflection.
  ctx.fillStyle = 'rgba(20, 40, 44, 0.35)';
  ctx.beginPath();
  ctx.ellipse(405, 504, 78, 7, 0, 0, Math.PI * 2);
  ctx.fill();
}

function paintRowboat(ctx) {
  ctx.fillStyle = '#6e4630';
  ctx.beginPath();
  ctx.moveTo(478, 486);
  ctx.lineTo(566, 486);
  ctx.quadraticCurveTo(556, 504, 536, 507);
  ctx.lineTo(500, 507);
  ctx.quadraticCurveTo(484, 502, 478, 486);
  ctx.fill();
  ctx.strokeStyle = '#3d2716';
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.moveTo(520, 492);
  ctx.lineTo(548, 470);
  ctx.stroke();
}

function paintQuay(ctx, altered) {
  // The quay itself: dark planks with a lit front edge.
  verticalGradient(ctx, 0, 520, 600, 120, [[0, '#4a3826'], [0.12, '#3a2c1e'], [1, '#241a10']]);
  ctx.strokeStyle = 'rgba(0, 0, 0, 0.35)';
  ctx.lineWidth = 2;
  for (let x = 30; x < 600; x += 46) {
    ctx.beginPath();
    ctx.moveTo(x, 524);
    ctx.lineTo(x - 8, 640);
    ctx.stroke();
  }
  ctx.fillStyle = 'rgba(255, 190, 100, 0.12)';
  ctx.fillRect(0, 520, 600, 4);
  // Lantern posts, both lit on both panels.
  for (const x of [246, 566]) {
    ctx.strokeStyle = '#191008';
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(x, 618);
    ctx.lineTo(x, 548);
    ctx.stroke();
    hangingLantern(ctx, x, 520, 34, true);
  }
  // A barrel and a stack of crates on the right.
  ctx.fillStyle = '#7a5a38';
  ctx.beginPath();
  ctx.ellipse(408, 566, 24, 10, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillRect(384, 566, 48, 44);
  ctx.beginPath();
  ctx.ellipse(408, 610, 24, 9, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = 'rgba(30, 20, 10, 0.6)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(384, 582);
  ctx.lineTo(432, 582);
  ctx.moveTo(384, 596);
  ctx.lineTo(432, 596);
  ctx.stroke();
  ctx.fillStyle = '#8a6844';
  ctx.fillRect(452, 548, 96, 62);
  ctx.fillRect(464, 492, 78, 56);
  ctx.strokeStyle = 'rgba(30, 20, 10, 0.55)';
  ctx.strokeRect(452, 548, 96, 62);
  ctx.strokeRect(464, 492, 78, 56);
  ctx.beginPath();
  ctx.moveTo(452, 548);
  ctx.lineTo(548, 610);
  ctx.moveTo(548, 548);
  ctx.lineTo(452, 610);
  ctx.stroke();
  // The parlour cat on the top crate — gone from the right panel.
  if (!altered.has('cat')) sittingCat(ctx, 500, 492, 56, '#14100c');
}

function paint(ctx, altered) {
  // Sky and sea.
  verticalGradient(ctx, 0, 0, 600, 336, [[0, '#131f42'], [0.55, '#3c2c58'], [0.85, '#a34d33'], [1, '#c96f3f']]);
  starField(ctx, 7101, 60, 600, 190);
  moon(ctx, 498, 78, 26, true, '#1a2650');
  // A far headland and a ship smaller than a thumbnail.
  ctx.fillStyle = 'rgba(18, 22, 38, 0.85)';
  ctx.beginPath();
  ctx.moveTo(392, 336);
  ctx.quadraticCurveTo(470, 302, 600, 322);
  ctx.lineTo(600, 336);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = 'rgba(14, 18, 30, 0.9)';
  ctx.fillRect(292, 322, 26, 6);
  ctx.fillRect(302, 312, 3, 12);
  verticalGradient(ctx, 0, 336, 600, 186, [[0, '#274b5c'], [0.25, '#1d3a4c'], [1, '#12242f']]);
  waterShimmer(ctx, 7102, 348, 512, 600, '#cfe8ff');
  if (!altered.has('lamp')) {
    // The lamp's reflection, a broken column of gold under the tower.
    ctx.fillStyle = 'rgba(255, 196, 92, 0.25)';
    for (let i = 0; i < 6; i += 1) {
      ctx.fillRect(100 + (i % 3) * 8 - i * 2, 356 + i * 26, 34 - i * 3, 5);
    }
  }
  paintLighthouse(ctx, altered);
  paintFishingBoat(ctx, altered);
  paintRowboat(ctx);
  paintQuay(ctx, altered);
  // Gulls coming home; one of them flies only in the left panel.
  gull(ctx, 298, 92, 30);
  gull(ctx, 344, 138, 22);
  if (!altered.has('gull')) gull(ctx, 428, 106, 26);
}
