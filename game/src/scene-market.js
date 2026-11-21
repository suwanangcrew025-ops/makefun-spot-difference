// Scene two: The Night Market. Three stalls under strings of lights, the
// moon over the rooftops, everything for sale and half of it glowing. The
// painter draws the market once; the `altered` set names which of the six
// differences take their changed form, so the two panels are the same
// painting but for exactly those six places.
import { glow, hangingLantern, moon, starField, verticalGradient } from './paintkit.js';

export const marketScene = {
  id: 'market',
  title: 'The Night Market',
  differences: [
    { id: 'moon', x: 84, y: 70, r: 30 },
    { id: 'bulb', x: 413, y: 142, r: 24 },
    { id: 'flag', x: 262, y: 252, r: 24 },
    { id: 'awning', x: 307, y: 288, r: 46 },
    { id: 'apples', x: 118, y: 438, r: 36 },
    { id: 'jar', x: 520, y: 396, r: 26 },
  ],
  paint,
};

/** One stall's striped awning: a slanted canopy with a scalloped hem. */
function awning(ctx, x0, x1, colourA, colourB) {
  ctx.save();
  ctx.beginPath();
  ctx.moveTo(x0 - 6, 310);
  ctx.lineTo(x0 + 10, 272);
  ctx.lineTo(x1 - 10, 272);
  ctx.lineTo(x1 + 6, 310);
  ctx.closePath();
  ctx.clip();
  const stripe = 22;
  for (let x = x0 - stripe, i = 0; x < x1 + stripe; x += stripe, i += 1) {
    ctx.fillStyle = i % 2 === 0 ? colourA : colourB;
    ctx.fillRect(x, 266, stripe, 50);
  }
  ctx.restore();
  ctx.fillStyle = colourA;
  for (let x = x0 + 2; x < x1 - 4; x += 18) {
    ctx.beginPath();
    ctx.arc(x + 7, 310, 7, 0, Math.PI);
    ctx.fill();
  }
  ctx.strokeStyle = 'rgba(14, 10, 6, 0.6)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(x0 - 6, 310);
  ctx.lineTo(x0 + 10, 272);
  ctx.lineTo(x1 - 10, 272);
  ctx.lineTo(x1 + 6, 310);
  ctx.stroke();
}

/** A stall: posts, a lamplit interior, a counter, and the awning above. */
function stall(ctx, x0, x1, awningColours) {
  // Interior, warm against the night.
  verticalGradient(ctx, x0, 308, x1 - x0, 252, [[0, '#3a2438'], [1, '#241626']]);
  // Posts.
  ctx.fillStyle = '#17100b';
  ctx.fillRect(x0 + 2, 300, 8, 260);
  ctx.fillRect(x1 - 10, 300, 8, 260);
  // Counter.
  ctx.fillStyle = '#5a4030';
  ctx.fillRect(x0 - 2, 452, x1 - x0 + 4, 16);
  ctx.fillStyle = '#453122';
  ctx.fillRect(x0 - 2, 468, x1 - x0 + 4, 92);
  ctx.strokeStyle = 'rgba(0, 0, 0, 0.4)';
  ctx.lineWidth = 2;
  for (let x = x0 + 26; x < x1 - 8; x += 30) {
    ctx.beginPath();
    ctx.moveTo(x, 472);
    ctx.lineTo(x, 556);
    ctx.stroke();
  }
  awning(ctx, x0, x1, awningColours[0], awningColours[1]);
}

/** A pyramid of round fruit on the left stall's counter. */
function fruitPile(ctx, altered) {
  const colour = altered.has('apples') ? '#e08a2e' : '#c93b2e';
  const shade = altered.has('apples') ? '#b96f22' : '#9c2b21';
  const spots = [[94, 444], [118, 444], [142, 444], [106, 426], [130, 426], [118, 408]];
  for (const [x, y] of spots) {
    ctx.fillStyle = colour;
    ctx.beginPath();
    ctx.arc(x, y, 12, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = shade;
    ctx.beginPath();
    ctx.arc(x - 3, y + 4, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#4a3016';
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.moveTo(x, y - 11);
    ctx.quadraticCurveTo(x + 2, y - 15, x + 5, y - 15);
    ctx.stroke();
  }
}

/** Small jars on a shelf: body, neck and a cork, in a row. */
function jarRow(ctx, xs, y, skipIndex = -1) {
  xs.forEach((x, i) => {
    if (i === skipIndex) return;
    ctx.fillStyle = i % 2 === 0 ? 'rgba(150, 190, 200, 0.75)' : 'rgba(190, 160, 110, 0.8)';
    ctx.beginPath();
    ctx.moveTo(x - 10, y);
    ctx.lineTo(x - 10, y - 22);
    ctx.quadraticCurveTo(x - 10, y - 30, x - 4, y - 30);
    ctx.lineTo(x - 4, y - 36);
    ctx.lineTo(x + 4, y - 36);
    ctx.lineTo(x + 4, y - 30);
    ctx.quadraticCurveTo(x + 10, y - 30, x + 10, y - 22);
    ctx.lineTo(x + 10, y);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#8a6844';
    ctx.fillRect(x - 4, y - 40, 8, 5);
  });
}

/** The string of lights across the sky, one bulb of which changes colour. */
function stringLights(ctx, altered) {
  const p0 = { x: 6, y: 92 };
  const p1 = { x: 300, y: 196 };
  const p2 = { x: 594, y: 104 };
  ctx.strokeStyle = 'rgba(10, 8, 14, 0.9)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(p0.x, p0.y);
  ctx.quadraticCurveTo(p1.x, p1.y, p2.x, p2.y);
  ctx.stroke();
  for (let i = 0; i <= 13; i += 1) {
    const t = i / 13;
    const x = (1 - t) * (1 - t) * p0.x + 2 * (1 - t) * t * p1.x + t * t * p2.x;
    const y = (1 - t) * (1 - t) * p0.y + 2 * (1 - t) * t * p1.y + t * t * p2.y;
    const isDiff = i === 9;
    const colour = isDiff && altered.has('bulb') ? '#9fd4ff' : '#ffca7a';
    glow(ctx, x, y + 8, 20, isDiff && altered.has('bulb') ? 'rgba(140, 200, 255, 0.4)' : 'rgba(255, 180, 90, 0.35)');
    ctx.fillStyle = colour;
    ctx.beginPath();
    ctx.arc(x, y + 8, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#191008';
    ctx.fillRect(x - 2, y - 1, 4, 5);
  }
}

/** Bunting across the stall tops; one flag of the row is a difference. */
function bunting(ctx, altered) {
  const colours = ['#c93b2e', '#e8b64c', '#2f7f7a', '#7a4a9e', '#e2703a'];
  ctx.strokeStyle = 'rgba(10, 8, 14, 0.85)';
  ctx.lineWidth = 1.6;
  ctx.beginPath();
  ctx.moveTo(8, 238);
  ctx.quadraticCurveTo(300, 262, 592, 238);
  ctx.stroke();
  for (let i = 0; i < 16; i += 1) {
    const t = (i + 0.5) / 16;
    const x = (1 - t) * (1 - t) * 8 + 2 * (1 - t) * t * 300 + t * t * 592;
    const y = (1 - t) * (1 - t) * 238 + 2 * (1 - t) * t * 262 + t * t * 238;
    if (altered.has('flag') && Math.abs(x - 262) < 18) continue;
    ctx.fillStyle = colours[i % colours.length];
    ctx.beginPath();
    ctx.moveTo(x - 10, y);
    ctx.lineTo(x + 10, y);
    ctx.lineTo(x, y + 22);
    ctx.closePath();
    ctx.fill();
  }
}

function paint(ctx, altered) {
  verticalGradient(ctx, 0, 0, 600, 260, [[0, '#0e1430'], [0.7, '#241c48'], [1, '#37255c']]);
  starField(ctx, 7201, 70, 600, 170);
  moon(ctx, 84, 70, 30, altered.has('moon'), '#141b3d');
  // Rooftops along the horizon.
  ctx.fillStyle = '#0d0f22';
  ctx.beginPath();
  ctx.moveTo(0, 262);
  ctx.lineTo(0, 226);
  ctx.lineTo(70, 226);
  ctx.lineTo(104, 202);
  ctx.lineTo(150, 226);
  ctx.lineTo(268, 226);
  ctx.lineTo(300, 208);
  ctx.lineTo(336, 226);
  ctx.lineTo(470, 226);
  ctx.lineTo(512, 204);
  ctx.lineTo(548, 226);
  ctx.lineTo(600, 226);
  ctx.lineTo(600, 262);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = 'rgba(255, 201, 122, 0.85)';
  for (const [x, y] of [[36, 240], [196, 242], [428, 240], [566, 242]]) ctx.fillRect(x, y, 7, 9);
  stringLights(ctx, altered);
  bunting(ctx, altered);
  // The three stalls.
  stall(ctx, 26, 208, ['#c93b2e', '#efe3c2']);
  stall(ctx, 216, 398, altered.has('awning') ? ['#c93b2e', '#efe3c2'] : ['#2f7f5f', '#efe3c2']);
  stall(ctx, 406, 580, ['#7a4a9e', '#efe3c2']);
  // Goods. Left stall: the fruit pile and a lantern.
  fruitPile(ctx, altered);
  jarRow(ctx, [52, 82, 176], 408);
  hangingLantern(ctx, 117, 316, 30, true);
  // Middle stall: sacks of spice, bright mounds in open sacks.
  for (const [x, colour] of [[252, '#d9a441'], [292, '#b8482e'], [332, '#7a9e3f'], [366, '#8a5aa0']]) {
    ctx.fillStyle = '#6e5136';
    ctx.beginPath();
    ctx.ellipse(x, 446, 19, 10, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillRect(x - 19, 446, 38, 14);
    ctx.fillStyle = colour;
    ctx.beginPath();
    ctx.ellipse(x, 444, 15, 7, 0, 0, Math.PI * 2);
    ctx.fill();
  }
  hangingLantern(ctx, 307, 316, 30, true, '#ffc4a3');
  // Right stall: a shelf of jars (one jar is a difference) and cloth bolts.
  ctx.fillStyle = '#4a3423';
  ctx.fillRect(420, 408, 146, 7);
  jarRow(ctx, [448, 484, 520, 556], 408, altered.has('jar') ? 2 : -1);
  for (const [x, colour] of [[436, '#2f7f7a'], [466, '#c93b2e'], [496, '#e8b64c']]) {
    ctx.fillStyle = colour;
    ctx.fillRect(x, 470, 22, 62);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.18)';
    ctx.fillRect(x, 470, 22, 8);
  }
  hangingLantern(ctx, 493, 316, 30, true);
  // Cobbles and pools of lamplight.
  verticalGradient(ctx, 0, 560, 600, 80, [[0, '#241a30'], [1, '#120d1c']]);
  for (const x of [117, 307, 493]) glow(ctx, x, 596, 90, 'rgba(255, 180, 90, 0.13)');
  ctx.fillStyle = 'rgba(200, 190, 220, 0.10)';
  for (let i = 0; i < 26; i += 1) {
    const x = (i * 67) % 600;
    const y = 574 + ((i * 29) % 56);
    ctx.beginPath();
    ctx.ellipse(x, y, 16, 5, 0, 0, Math.PI * 2);
    ctx.fill();
  }
  // Two shoppers, silhouettes in the foreground.
  for (const [x, s] of [[52, 1], [556, 0.85]]) {
    ctx.fillStyle = '#0a0714';
    ctx.beginPath();
    ctx.arc(x, 640 - 62 * s, 13 * s, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(x - 20 * s, 640);
    ctx.quadraticCurveTo(x - 18 * s, 640 - 48 * s, x, 640 - 50 * s);
    ctx.quadraticCurveTo(x + 18 * s, 640 - 48 * s, x + 20 * s, 640);
    ctx.closePath();
    ctx.fill();
  }
}
