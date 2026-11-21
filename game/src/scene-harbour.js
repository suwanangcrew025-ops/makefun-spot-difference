// Scene 1 — Dusk at Lanternwick Harbour (5 differences, 150s).
// A dusk harbour: striped lighthouse, two sailboats, gulls, a quay cat.
// Each painter draws the scene once and takes an `altered` set naming
// which differences take their changed form. Anything that can vanish
// textures itself from its own seeded stream, so the two panels stay
// pixel-identical everywhere else.
import { glow, gull, moon, skyGradient, starField } from './paintkit.js';
import { sceneStream, streamFor } from './random.js';

export const HARBOUR = {
  id: 'harbour',
  name: 'Dusk at Lanternwick Harbour',
  seconds: 150,
  differences: [
    { id: 'lamp', x: 110, y: 180, r: 28, label: 'the lighthouse lamp' },
    { id: 'sail', x: 315, y: 335, r: 34, label: 'the sail' },
    { id: 'stripe', x: 435, y: 425, r: 24, label: 'the boat stripe' },
    { id: 'gull', x: 270, y: 95, r: 20, label: 'the middle gull' },
    { id: 'cat', x: 472, y: 502, r: 24, label: 'the quay cat' },
  ],
};

const HORIZON = 330;
const QUAY_TOP = 480;

function paintSky(ctx, rng) {
  skyGradient(ctx, 560, 560, [
    [0, '#1b2140'],
    [0.45, '#4a3560'],
    [0.62, '#c96f4a'],
    [0.66, '#e8a35c'],
    [1, '#2e4a5e'],
  ]);
  starField(ctx, rng, 560, 46, 8, 200);
  moon(ctx, 482, 78, 26);
  // Low sun glow on the horizon.
  glow(ctx, 300, HORIZON, 150, '#f2a65e', 0.5);
}

function paintSea(ctx) {
  const g = ctx.createLinearGradient(0, HORIZON, 0, QUAY_TOP);
  g.addColorStop(0, '#3d5a6e');
  g.addColorStop(1, '#1d3242');
  ctx.fillStyle = g;
  ctx.fillRect(0, HORIZON, 560, QUAY_TOP - HORIZON);
  // Shimmer lines, from their own stream so nothing else depends on them.
  const rng = streamFor('harbour', 'shimmer');
  ctx.save();
  ctx.strokeStyle = 'rgba(242, 200, 130, 0.35)';
  ctx.lineWidth = 2;
  for (let i = 0; i < 26; i += 1) {
    const y = HORIZON + 8 + rng() * (QUAY_TOP - HORIZON - 16);
    const x = rng() * 560;
    const len = 14 + rng() * 42;
    ctx.globalAlpha = 0.25 + rng() * 0.5;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + len, y);
    ctx.stroke();
  }
  ctx.restore();
}

function paintBoat1(ctx, altered) {
  // Hull.
  ctx.save();
  ctx.fillStyle = '#5a3226';
  ctx.beginPath();
  ctx.moveTo(272, 398);
  ctx.lineTo(338, 398);
  ctx.lineTo(326, 420);
  ctx.lineTo(284, 420);
  ctx.closePath();
  ctx.fill();
  // Mast and sail. The sail is the difference: cream, or rust-red.
  ctx.strokeStyle = '#3a241a';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(305, 398);
  ctx.lineTo(305, 262);
  ctx.stroke();
  ctx.fillStyle = altered.has('sail') ? '#b4502e' : '#f3e6c8';
  ctx.beginPath();
  ctx.moveTo(308, 266);
  ctx.lineTo(308, 392);
  ctx.lineTo(352, 392);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = 'rgba(58, 36, 26, 0.6)';
  ctx.lineWidth = 1.5;
  ctx.stroke();
  ctx.restore();
}

function paintBoat2(ctx, altered) {
  ctx.save();
  ctx.fillStyle = '#33455c';
  ctx.beginPath();
  ctx.moveTo(400, 414);
  ctx.lineTo(468, 414);
  ctx.lineTo(456, 438);
  ctx.lineTo(412, 438);
  ctx.closePath();
  ctx.fill();
  // Hull stripe: red, or teal when altered.
  ctx.fillStyle = altered.has('stripe') ? '#2e7f7b' : '#c0392b';
  ctx.fillRect(404, 420, 60, 7);
  // Little cabin and mast.
  ctx.fillStyle = '#d9c9a3';
  ctx.fillRect(424, 398, 22, 16);
  ctx.strokeStyle = '#2a2438';
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.moveTo(435, 398);
  ctx.lineTo(435, 372);
  ctx.stroke();
  ctx.fillStyle = '#e8b64c';
  ctx.beginPath();
  ctx.moveTo(435, 372);
  ctx.lineTo(435, 388);
  ctx.lineTo(452, 388);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

function paintLighthouse(ctx, altered) {
  const lit = !altered.has('lamp');
  ctx.save();
  if (lit) {
    // Reflection shimmering on the water below the lamp. It is drawn
    // before the tower, so the tower occludes it where they overlap —
    // the tower stands in front of the water.
    const rng = streamFor('harbour', 'lamp-reflection');
    ctx.strokeStyle = 'rgba(255, 233, 168, 0.5)';
    ctx.lineWidth = 3;
    for (let i = 0; i < 12; i += 1) {
      const y = HORIZON + 6 + i * 11;
      const w = 8 + rng() * 26;
      ctx.globalAlpha = 0.35 + rng() * 0.45;
      ctx.beginPath();
      ctx.moveTo(110 - w / 2, y);
      ctx.lineTo(110 + w / 2, y);
      ctx.stroke();
    }
    ctx.globalAlpha = 1;
  }
  // Tower: cream with rust bands.
  ctx.fillStyle = '#efe3c2';
  ctx.beginPath();
  ctx.moveTo(88, QUAY_TOP);
  ctx.lineTo(94, 210);
  ctx.lineTo(126, 210);
  ctx.lineTo(132, QUAY_TOP);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = '#b4502e';
  ctx.fillRect(90, 300, 40, 26);
  ctx.fillRect(92, 380, 36, 26);
  ctx.strokeStyle = 'rgba(60, 40, 20, 0.55)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(88, QUAY_TOP);
  ctx.lineTo(94, 210);
  ctx.lineTo(126, 210);
  ctx.lineTo(132, QUAY_TOP);
  ctx.closePath();
  ctx.stroke();
  // Gallery and lamp room.
  ctx.fillStyle = '#2a2438';
  ctx.fillRect(86, 196, 48, 14);
  ctx.fillRect(96, 168, 28, 28);
  if (lit) {
    glow(ctx, 110, 182, 70, '#ffe9a8', 0.65);
    // Beam across the sky and the sea.
    ctx.fillStyle = 'rgba(255, 233, 168, 0.28)';
    ctx.beginPath();
    ctx.moveTo(110, 182);
    ctx.lineTo(560, 120);
    ctx.lineTo(560, 210);
    ctx.closePath();
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(110, 182);
    ctx.lineTo(0, 150);
    ctx.lineTo(0, 205);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#fff3c4';
    ctx.beginPath();
    ctx.arc(110, 182, 11, 0, Math.PI * 2);
    ctx.fill();
  } else {
    // Dark lamp: dull glass, no beam, no reflection.
    ctx.fillStyle = '#3a3f4d';
    ctx.beginPath();
    ctx.arc(110, 182, 11, 0, Math.PI * 2);
    ctx.fill();
  }
  // Lamp-room roof.
  ctx.fillStyle = '#2a2438';
  ctx.beginPath();
  ctx.moveTo(92, 168);
  ctx.lineTo(128, 168);
  ctx.lineTo(110, 148);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

function paintGulls(ctx, altered) {
  gull(ctx, 178, 112, 13);
  if (!altered.has('gull')) gull(ctx, 270, 95, 14);
  gull(ctx, 362, 138, 12);
}

function paintQuay(ctx, altered) {
  ctx.save();
  ctx.fillStyle = '#6b5a48';
  ctx.fillRect(0, QUAY_TOP, 560, 80);
  ctx.fillStyle = '#7d6c58';
  ctx.fillRect(0, QUAY_TOP, 560, 10);
  // Stone seams.
  ctx.strokeStyle = 'rgba(40, 30, 20, 0.5)';
  ctx.lineWidth = 2;
  for (let x = 40; x < 560; x += 80) {
    ctx.beginPath();
    ctx.moveTo(x, QUAY_TOP + 10);
    ctx.lineTo(x, 560);
    ctx.stroke();
  }
  // Bollards and crates.
  ctx.fillStyle = '#2a2438';
  ctx.fillRect(30, 452, 14, 28);
  ctx.fillRect(30, 444, 22, 10);
  ctx.fillStyle = '#8a6a3e';
  ctx.fillRect(520, 500, 34, 34);
  ctx.fillRect(528, 486, 22, 14);
  ctx.strokeStyle = 'rgba(40, 30, 20, 0.6)';
  ctx.strokeRect(520, 500, 34, 34);
  if (!altered.has('cat')) {
    // The quay cat, sitting and watching the boats.
    ctx.fillStyle = '#241f2e';
    ctx.beginPath();
    ctx.ellipse(472, 512, 13, 16, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(472, 488, 10, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(464, 480);
    ctx.lineTo(466, 470);
    ctx.lineTo(470, 479);
    ctx.moveTo(478, 479);
    ctx.lineTo(482, 470);
    ctx.lineTo(484, 480);
    ctx.closePath();
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(484, 520);
    ctx.quadraticCurveTo(500, 516, 496, 500);
    ctx.quadraticCurveTo(494, 512, 486, 514);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#e8b64c';
    ctx.beginPath();
    ctx.arc(468, 487, 1.8, 0, Math.PI * 2);
    ctx.arc(476, 487, 1.8, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

export function paintHarbour(ctx, altered, w = 560, h = 560) {
  const rng = sceneStream('harbour');
  paintSky(ctx, rng);
  paintSea(ctx);
  paintBoat1(ctx, altered);
  paintBoat2(ctx, altered);
  paintLighthouse(ctx, altered);
  paintGulls(ctx, altered);
  paintQuay(ctx, altered);
}
