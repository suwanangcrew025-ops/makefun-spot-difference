// Scene three: The Glasshouse. Morning in a Victorian glasshouse — a
// monstera by the door, pots on the bench, one butterfly with the run of
// the place. The painter draws the glasshouse once; the `altered` set
// names which of the seven differences take their changed form, so the
// two panels are the same painting but for exactly those seven places.
import { glow, roundedRect, verticalGradient } from './paintkit.js';

export const glasshouseScene = {
  id: 'glasshouse',
  title: 'The Glasshouse',
  differences: [
    { id: 'pane', x: 430, y: 130, r: 34 },
    { id: 'planter', x: 150, y: 205, r: 30 },
    { id: 'butterfly', x: 255, y: 300, r: 26 },
    { id: 'cactus', x: 330, y: 428, r: 36 },
    { id: 'snail', x: 120, y: 415, r: 22 },
    { id: 'can', x: 492, y: 545, r: 32 },
    { id: 'flower', x: 90, y: 596, r: 24 },
  ],
  paint,
};

/** A terracotta pot at (x, baseY): rim, tapered body and a soil line. */
function pot(ctx, x, baseY, width, height) {
  ctx.fillStyle = '#b2613a';
  ctx.beginPath();
  ctx.moveTo(x - width / 2, baseY - height);
  ctx.lineTo(x + width / 2, baseY - height);
  ctx.lineTo(x + width / 2 - 6, baseY);
  ctx.lineTo(x - width / 2 + 6, baseY);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = '#c97447';
  ctx.fillRect(x - width / 2 - 3, baseY - height - 8, width + 6, 10);
  ctx.fillStyle = '#4a3016';
  ctx.fillRect(x - width / 2, baseY - height - 2, width, 4);
}

/** A broad leaf: an ellipse with a pointed tip, rotated, with a midrib. */
function leaf(ctx, x, y, length, width, angle, colour) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(angle);
  ctx.fillStyle = colour;
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.quadraticCurveTo(length * 0.5, -width, length, 0);
  ctx.quadraticCurveTo(length * 0.5, width, 0, 0);
  ctx.fill();
  ctx.strokeStyle = 'rgba(20, 60, 30, 0.35)';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(4, 0);
  ctx.lineTo(length - 6, 0);
  ctx.stroke();
  ctx.restore();
}

/** A hanging planter: chains, a bowl, and leaves spilling over the rim. */
function hangingPlanter(ctx, x, chainTop) {
  ctx.strokeStyle = 'rgba(40, 50, 45, 0.8)';
  ctx.lineWidth = 1.6;
  for (const dx of [-16, 0, 16]) {
    ctx.beginPath();
    ctx.moveTo(x + dx * 0.4, chainTop);
    ctx.lineTo(x + dx, 196);
    ctx.stroke();
  }
  ctx.fillStyle = '#7a4a8e';
  ctx.beginPath();
  ctx.moveTo(x - 26, 196);
  ctx.lineTo(x + 26, 196);
  ctx.quadraticCurveTo(x + 18, 224, x, 224);
  ctx.quadraticCurveTo(x - 18, 224, x - 26, 196);
  ctx.fill();
  leaf(ctx, x - 8, 200, 44, 12, 2.6, '#3f7d3a');
  leaf(ctx, x + 6, 200, 40, 11, 0.5, '#4c8a44');
  leaf(ctx, x - 2, 198, 34, 10, 1.6, '#356e33');
}

/** The bench plant that changes: a cactus, or a round shrub in the same pot. */
function benchPlant(ctx, altered) {
  pot(ctx, 330, 470, 44, 34);
  if (altered.has('cactus')) {
    // A round shrub: layered blobs with lighter flecks.
    ctx.fillStyle = '#3e7c37';
    for (const [dx, dy, r] of [[-16, -18, 17], [14, -20, 18], [0, -32, 20], [-4, -12, 19]]) {
      ctx.beginPath();
      ctx.arc(330 + dx, 436 + dy, r, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.fillStyle = '#5da354';
    for (const [dx, dy] of [[-14, -34], [8, -44], [18, -24], [-2, -22]]) {
      ctx.beginPath();
      ctx.arc(330 + dx, 436 + dy, 3.4, 0, Math.PI * 2);
      ctx.fill();
    }
  } else {
    // A cactus: a ribbed column with one arm and a flower on top.
    ctx.fillStyle = '#3f8452';
    roundedRect(ctx, 318, 388, 24, 52, 11);
    ctx.fill();
    roundedRect(ctx, 296, 404, 12, 24, 6);
    ctx.fill();
    roundedRect(ctx, 296, 420, 24, 11, 5);
    ctx.fill();
    ctx.strokeStyle = 'rgba(220, 240, 210, 0.5)';
    ctx.lineWidth = 1.4;
    for (const dx of [324, 330, 336]) {
      ctx.beginPath();
      ctx.moveTo(dx, 392);
      ctx.lineTo(dx, 436);
      ctx.stroke();
    }
    ctx.fillStyle = '#e2703a';
    ctx.beginPath();
    ctx.arc(330, 386, 6, 0, Math.PI * 2);
    ctx.fill();
  }
}

/** The snail: a spiral shell on a soft body, out for a morning crawl. */
function snail(ctx, x, y) {
  ctx.fillStyle = '#c9b18a';
  ctx.beginPath();
  ctx.ellipse(x + 2, y + 6, 16, 6, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#c9b18a';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(x + 14, y + 2);
  ctx.quadraticCurveTo(x + 20, y - 8, x + 24, y - 10);
  ctx.stroke();
  ctx.fillStyle = '#a4713a';
  ctx.beginPath();
  ctx.arc(x - 4, y - 2, 12, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#7a4f24';
  ctx.lineWidth = 1.8;
  ctx.beginPath();
  ctx.arc(x - 4, y - 2, 7.5, 0.4, Math.PI * 1.7);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(x - 4, y - 2, 3.6, Math.PI * 0.9, Math.PI * 2.6);
  ctx.stroke();
}

/** The watering can: body, spout with a rose, and a handle over the top. */
function wateringCan(ctx, x, y) {
  ctx.fillStyle = '#3f6d8e';
  ctx.beginPath();
  ctx.moveTo(x - 26, y + 26);
  ctx.lineTo(x - 22, y - 14);
  ctx.lineTo(x + 22, y - 14);
  ctx.lineTo(x + 26, y + 26);
  ctx.closePath();
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(x - 20, y + 2);
  ctx.lineTo(x - 44, y - 16);
  ctx.lineTo(x - 38, y - 22);
  ctx.lineTo(x - 14, y - 6);
  ctx.closePath();
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(x - 44, y - 19, 7, 5, -0.7, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#33597a';
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.moveTo(x + 24, y + 8);
  ctx.quadraticCurveTo(x + 40, y - 18, x + 12, y - 26);
  ctx.stroke();
  ctx.fillStyle = 'rgba(255, 255, 255, 0.25)';
  ctx.fillRect(x - 18, y - 10, 8, 32);
}

/** The butterfly: two wings a side and a dark body, mid-hover. */
function butterfly(ctx, x, y, altered) {
  const wing = altered.has('butterfly') ? '#7a4a9e' : '#e2703a';
  const wingDark = altered.has('butterfly') ? '#5c3580' : '#b9542a';
  ctx.fillStyle = wing;
  for (const s of [-1, 1]) {
    ctx.beginPath();
    ctx.ellipse(x + s * 13, y - 6, 13, 8, s * 0.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = wingDark;
    ctx.beginPath();
    ctx.ellipse(x + s * 11, y + 7, 10, 6, -s * 0.4, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = wing;
  }
  ctx.fillStyle = '#2c2018';
  ctx.beginPath();
  ctx.ellipse(x, y, 3, 11, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#2c2018';
  ctx.lineWidth = 1.3;
  ctx.beginPath();
  ctx.moveTo(x, y - 10);
  ctx.quadraticCurveTo(x - 6, y - 18, x - 9, y - 19);
  ctx.moveTo(x, y - 10);
  ctx.quadraticCurveTo(x + 6, y - 18, x + 9, y - 19);
  ctx.stroke();
}

/** The crack in the high pane: a star of thin jagged lines. */
function crackedPane(ctx, x, y) {
  ctx.strokeStyle = 'rgba(240, 250, 255, 0.85)';
  ctx.lineWidth = 1.3;
  const spokes = [[-26, -14], [-8, -26], [16, -20], [28, 4], [12, 22], [-16, 18], [-28, -2]];
  for (const [dx, dy] of spokes) {
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + dx * 0.55, y + dy * 0.55 + 3);
    ctx.lineTo(x + dx, y + dy);
    ctx.stroke();
  }
  ctx.beginPath();
  ctx.arc(x, y, 9, 0, Math.PI * 2);
  ctx.stroke();
}

function paint(ctx, altered) {
  // Morning sky and the garden beyond the glass.
  verticalGradient(ctx, 0, 0, 600, 640, [[0, '#9fc4ae'], [0.45, '#cfe0b4'], [1, '#e8e4bc']]);
  glow(ctx, 92, 84, 150, 'rgba(255, 240, 180, 0.55)');
  ctx.fillStyle = 'rgba(90, 130, 84, 0.35)';
  for (const [x, y, r] of [[60, 300, 66], [540, 280, 80], [330, 240, 54], [470, 360, 60], [140, 380, 58]]) {
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }
  // Sunbeams slanting through the roof.
  ctx.fillStyle = 'rgba(255, 248, 205, 0.16)';
  for (const [x0, x1] of [[120, 210], [250, 330]]) {
    ctx.beginPath();
    ctx.moveTo(x0, 30);
    ctx.lineTo(x1, 30);
    ctx.lineTo(x1 + 190, 520);
    ctx.lineTo(x0 + 190, 520);
    ctx.closePath();
    ctx.fill();
  }
  // Stone floor.
  verticalGradient(ctx, 0, 516, 600, 124, [[0, '#9aa48e'], [1, '#767f6c']]);
  ctx.strokeStyle = 'rgba(50, 58, 46, 0.4)';
  ctx.lineWidth = 2;
  for (const x of [100, 200, 300, 400, 500]) {
    ctx.beginPath();
    ctx.moveTo(x, 516);
    ctx.lineTo(x - 14, 640);
    ctx.stroke();
  }
  ctx.beginPath();
  ctx.moveTo(0, 566);
  ctx.lineTo(600, 566);
  ctx.moveTo(0, 606);
  ctx.lineTo(600, 606);
  ctx.stroke();
  // The monstera by the door, and its snail.
  pot(ctx, 74, 588, 62, 46);
  ctx.strokeStyle = '#2f6b2f';
  ctx.lineWidth = 4;
  for (const [dx, dy] of [[-16, -70], [10, -88], [30, -58]]) {
    ctx.beginPath();
    ctx.moveTo(74, 548);
    ctx.quadraticCurveTo(74 + dx, 520, 74 + dx * 1.6, 548 + dy);
    ctx.stroke();
  }
  leaf(ctx, 52, 478, 74, 30, -0.5, '#2f7d3a');
  leaf(ctx, 88, 462, 82, 32, 0.35, '#3a8a42');
  leaf(ctx, 66, 500, 66, 26, 2.75, '#357f39');
  leaf(ctx, 96, 428, 62, 24, 0.9, '#2f7d3a');
  if (!altered.has('snail')) snail(ctx, 118, 414);
  // A fern and a tall grass at the back.
  ctx.strokeStyle = '#3c7a3c';
  ctx.lineWidth = 2.4;
  for (let i = 0; i < 7; i += 1) {
    const bx = 196 + i * 7;
    ctx.beginPath();
    ctx.moveTo(224, 520);
    ctx.quadraticCurveTo(bx, 452, bx + (i - 3) * 16, 408 - Math.abs(i - 3) * 6);
    ctx.stroke();
  }
  for (let i = 0; i < 6; i += 1) {
    ctx.beginPath();
    ctx.moveTo(452 + i * 5, 516);
    ctx.quadraticCurveTo(458 + i * 5, 440, 446 + i * 11, 396 - (i % 3) * 14);
    ctx.stroke();
  }
  // The bench and its pots.
  ctx.fillStyle = '#6e5136';
  ctx.fillRect(196, 470, 240, 10);
  ctx.fillRect(196, 492, 240, 6);
  ctx.fillStyle = '#2c3436';
  ctx.fillRect(204, 480, 8, 44);
  ctx.fillRect(420, 480, 8, 44);
  pot(ctx, 244, 470, 36, 28);
  leaf(ctx, 232, 442, 30, 11, -0.7, '#4c8a44');
  leaf(ctx, 248, 440, 30, 11, 0.6, '#3f7d3a');
  benchPlant(ctx, altered);
  pot(ctx, 398, 470, 38, 30);
  ctx.fillStyle = '#c93b6e';
  for (const [dx, dy] of [[-10, -44], [2, -52], [13, -42]]) {
    ctx.beginPath();
    ctx.arc(398 + dx, 470 + dy, 6.5, 0, Math.PI * 2);
    ctx.fill();
  }
  leaf(ctx, 386, 448, 28, 10, 2.9, '#3f7d3a');
  leaf(ctx, 404, 446, 28, 10, 0.25, '#4c8a44');
  // Hanging planters from the arch — the left one is a difference.
  if (!altered.has('planter')) hangingPlanter(ctx, 150, 108);
  hangingPlanter(ctx, 452, 96);
  // The watering can, gone from the right panel.
  if (!altered.has('can')) wateringCan(ctx, 492, 548);
  // The butterfly, out on its rounds.
  butterfly(ctx, 255, 300, altered);
  // The flower bed along the front.
  ctx.fillStyle = '#4a3826';
  ctx.fillRect(0, 606, 600, 34);
  const bed = [[42, '#c93b2e'], [90, null], [140, '#e8b64c'], [188, '#c93b6e'], [470, '#e2703a'], [516, '#c93b2e'], [556, '#e8b64c']];
  for (const [x, colour] of bed) {
    const c = colour ?? (altered.has('flower') ? '#e8b64c' : '#c93b2e');
    ctx.strokeStyle = '#356e33';
    ctx.lineWidth = 2.4;
    ctx.beginPath();
    ctx.moveTo(x, 612);
    ctx.lineTo(x, 598);
    ctx.stroke();
    ctx.fillStyle = c;
    for (let p = 0; p < 5; p += 1) {
      const a = (p / 5) * Math.PI * 2;
      ctx.beginPath();
      ctx.arc(x + Math.cos(a) * 6, 594 + Math.sin(a) * 6, 5, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.fillStyle = '#f3e5c8';
    ctx.beginPath();
    ctx.arc(x, 594, 3.4, 0, Math.PI * 2);
    ctx.fill();
  }
  // The glass and its frame, over everything: panes, mullions, the arch.
  ctx.fillStyle = 'rgba(220, 240, 245, 0.10)';
  ctx.fillRect(0, 0, 600, 640);
  ctx.strokeStyle = 'rgba(38, 66, 54, 0.9)';
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.moveTo(14, 640);
  ctx.lineTo(14, 190);
  ctx.quadraticCurveTo(14, 36, 300, 30);
  ctx.quadraticCurveTo(586, 36, 586, 190);
  ctx.lineTo(586, 640);
  ctx.stroke();
  ctx.lineWidth = 2.4;
  for (const x of [160, 300, 440]) {
    ctx.beginPath();
    ctx.moveTo(x, 640);
    ctx.lineTo(x, 120 - Math.abs(x - 300) * 0.18);
    ctx.stroke();
  }
  for (const y of [210, 340, 470]) {
    ctx.beginPath();
    ctx.moveTo(14, y);
    ctx.lineTo(586, y);
    ctx.stroke();
  }
  ctx.beginPath();
  ctx.moveTo(14, 190);
  ctx.quadraticCurveTo(300, 96, 586, 190);
  ctx.stroke();
  if (altered.has('pane')) crackedPane(ctx, 430, 130);
}
