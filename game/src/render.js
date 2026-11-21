// render.js — everything the parlour shows: the wall, the header with its
// counter of what remains, the time bar, the two tellings of the scene inside
// their frames, the gold rings and tick seals on differences found, the
// dashed ring of a hint, the sparks and ripples of clicks, and the cards for
// title, pause, a finished scene, a finished game and a faded clock. It only
// reads the engine's state; it never changes it.

import {
  VIEW, PANEL, TIME_BAR, STATUS, LEGEND, INK, FONT_DISPLAY, FONT_BODY,
} from './config.js';
import { makeRng, sceneSeed } from './random.js';
import { SCENES, sceneAt, allDifferenceIds } from './scenes.js';
import { panelFrame, roundedRectPath, vignette } from './paintkit.js';

export function drawFrame(ctx, game, now) {
  drawWall(ctx);
  if (game.screen === 'title') {
    drawPanels(ctx, game, 0);
    ctx.fillStyle = INK.veil;
    ctx.fillRect(0, 0, VIEW.width, VIEW.height);
    drawTitleCard(ctx, game, now);
    return;
  }
  drawHeader(ctx, game);
  drawTimeBar(ctx, game);
  drawPanels(ctx, game, game.sceneIndex);
  drawStatusLine(ctx, game);
  if (game.screen === 'paused') {
    veilOver(ctx);
    drawCentredCard(ctx, 560, 240, (c) => {
      c.fillStyle = INK.parchment;
      c.font = `44px ${FONT_DISPLAY}`;
      c.fillText('Paused', VIEW.width / 2, VIEW.height / 2 - 16);
      c.fillStyle = INK.parchmentDim;
      c.font = `17px ${FONT_BODY}`;
      c.fillText('The pictures wait, holding their breath.', VIEW.width / 2, VIEW.height / 2 + 28);
      c.fillText('P — resume · R — restart the scene', VIEW.width / 2, VIEW.height / 2 + 62);
    });
  } else if (game.screen === 'sceneDone') {
    veilOver(ctx);
    drawSceneDoneCard(ctx, game);
  } else if (game.screen === 'gameDone') {
    veilOver(ctx);
    drawGameDoneCard(ctx, game);
  } else if (game.screen === 'timeUp') {
    veilOver(ctx);
    drawCentredCard(ctx, 620, 260, (c) => {
      c.fillStyle = INK.parchment;
      c.font = `40px ${FONT_DISPLAY}`;
      c.fillText('The Light Has Faded', VIEW.width / 2, VIEW.height / 2 - 40);
      c.fillStyle = INK.parchmentDim;
      c.font = `18px ${FONT_BODY}`;
      c.fillText(
        `Out of time, with ${game.remaining()} difference${game.remaining() === 1 ? '' : 's'} still hidden.`,
        VIEW.width / 2, VIEW.height / 2 + 8,
      );
      c.fillText('R — try the scene again', VIEW.width / 2, VIEW.height / 2 + 52);
    });
  }
}

// The parlour wall: a deep teal gradient, darker at the floor.
function drawWall(ctx) {
  const grad = ctx.createLinearGradient(0, 0, 0, VIEW.height);
  grad.addColorStop(0, INK.wallTop);
  grad.addColorStop(1, INK.wallBottom);
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, VIEW.width, VIEW.height);
}

// The header: the scene's name at the left; in the middle the count of what
// remains with a pip for every difference; at the right the clock and the
// hints that are left.
function drawHeader(ctx, game) {
  const scene = game.scene;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'alphabetic';
  ctx.fillStyle = INK.gold;
  ctx.font = `13px ${FONT_BODY}`;
  ctx.fillText('T W I C E - T O L D   T I D E S', 24, 28);
  ctx.fillStyle = INK.parchment;
  ctx.font = `25px ${FONT_DISPLAY}`;
  ctx.fillText(scene.title, 24, 60);

  // Centre: the remaining counter and its pips.
  ctx.textAlign = 'center';
  ctx.fillStyle = INK.parchment;
  ctx.font = `30px ${FONT_DISPLAY}`;
  const remaining = game.remaining();
  ctx.fillText(remaining === 0 ? 'All found' : `${remaining} to find`, VIEW.width / 2, 42);
  const total = scene.differences.length;
  const pipGap = 17;
  const startX = VIEW.width / 2 - ((total - 1) * pipGap) / 2;
  scene.differences.forEach((d, i) => {
    const x = startX + i * pipGap;
    ctx.beginPath();
    ctx.arc(x, 58, 5.5, 0, Math.PI * 2);
    if (game.found.has(d.id)) {
      ctx.fillStyle = INK.found;
      ctx.fill();
    } else {
      ctx.strokeStyle = INK.parchmentDim;
      ctx.lineWidth = 1.6;
      ctx.stroke();
    }
  });

  // Right: the clock, the hints, and the mute state.
  ctx.textAlign = 'right';
  ctx.fillStyle = game.timeLeft <= 10 && game.screen === 'playing' ? INK.miss : INK.parchment;
  ctx.font = `30px ${FONT_DISPLAY}`;
  ctx.fillText(formatTime(game.timeLeft), VIEW.width - 24, 42);
  ctx.fillStyle = INK.parchmentDim;
  ctx.font = `13px ${FONT_BODY}`;
  const soundNote = game.sound.muted ? ' · sound off (M)' : '';
  ctx.fillText(`Hints left: ${game.hintsLeft} (H)${soundNote}`, VIEW.width - 24, 62);
  ctx.textAlign = 'left';
}

// The time bar: a full-width track whose fill drains with the clock and
// shifts green to amber to red as it empties.
function drawTimeBar(ctx, game) {
  const scene = game.scene;
  const fraction = Math.max(0, Math.min(1, game.timeLeft / scene.timeLimit));
  ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
  roundedRectPath(ctx, TIME_BAR.x, TIME_BAR.y, TIME_BAR.width, TIME_BAR.height, TIME_BAR.radius);
  ctx.fill();
  if (fraction > 0) {
    ctx.fillStyle = timeColour(fraction);
    roundedRectPath(ctx, TIME_BAR.x, TIME_BAR.y, TIME_BAR.width * fraction, TIME_BAR.height, TIME_BAR.radius);
    ctx.fill();
  }
  ctx.strokeStyle = 'rgba(243, 230, 200, 0.25)';
  ctx.lineWidth = 1;
  roundedRectPath(ctx, TIME_BAR.x, TIME_BAR.y, TIME_BAR.width, TIME_BAR.height, TIME_BAR.radius);
  ctx.stroke();
}

function timeColour(fraction) {
  const lerp = (a, b, t) => Math.round(a + (b - a) * t);
  const green = [87, 201, 138];
  const amber = [232, 179, 74];
  const red = [217, 95, 74];
  const [from, to, t] = fraction > 0.5 ? [amber, green, (fraction - 0.5) * 2] : [red, amber, fraction * 2];
  return `rgb(${lerp(from[0], to[0], t)}, ${lerp(from[1], to[1], t)}, ${lerp(from[2], to[2], t)})`;
}

// Both tellings of a scene, in their frames, with every marker and effect
// that belongs to the hunt drawn over them.
function drawPanels(ctx, game, sceneIndex) {
  const scene = sceneAt(sceneIndex);
  const isLiveScene = sceneIndex === game.sceneIndex && game.screen !== 'title';
  drawPanelLabel(ctx, PANEL.leftX, 'THE FIRST TELLING', 'left');
  drawPanelLabel(ctx, PANEL.rightX + PANEL.width, 'THE SECOND TELLING', 'right');
  for (const panel of [0, 1]) {
    const x = panel === 0 ? PANEL.leftX : PANEL.rightX;
    panelFrame(ctx, x, PANEL.top, PANEL.width, PANEL.height, INK);
    ctx.save();
    roundedRectPath(ctx, x, PANEL.top, PANEL.width, PANEL.height, 4);
    ctx.clip();
    ctx.translate(x, PANEL.top);
    const altered = panel === 1 ? allDifferenceIds(scene) : new Set();
    scene.paint(ctx, makeRng(sceneSeed(sceneIndex)), altered);
    // A vignette inside each panel, centred on the panel itself, so it
    // shades both tellings in exactly the same way.
    vignette(ctx, 0, 0, PANEL.width, PANEL.height, 0.15);
    if (isLiveScene) {
      drawHintRing(ctx, game);
      for (const d of scene.differences) {
        if (game.found.has(d.id)) drawFoundMarker(ctx, d);
      }
      for (const fx of game.effects) {
        if (fx.panel === 'both' || fx.panel === panel) drawEffect(ctx, fx);
      }
    }
    ctx.restore();
  }
}

function drawPanelLabel(ctx, x, text, align) {
  ctx.fillStyle = INK.parchmentDim;
  ctx.font = `12px ${FONT_BODY}`;
  ctx.textAlign = align;
  ctx.fillText(text, x, 82);
  ctx.textAlign = 'left';
}

// The mark of a find: a gold ring around the difference, and a small round
// seal with a tick riding on the ring's shoulder — drawn on both tellings.
function drawFoundMarker(ctx, d) {
  const ringR = d.r + 9;
  ctx.strokeStyle = 'rgba(0, 0, 0, 0.35)';
  ctx.lineWidth = 5.5;
  ctx.beginPath();
  ctx.arc(d.x, d.y, ringR, 0, Math.PI * 2);
  ctx.stroke();
  ctx.strokeStyle = INK.found;
  ctx.lineWidth = 3.2;
  ctx.beginPath();
  ctx.arc(d.x, d.y, ringR, 0, Math.PI * 2);
  ctx.stroke();
  // The seal: a gold disc on the ring at its upper right, ticked in ink.
  const sx = d.x + ringR * Math.cos(-0.72);
  const sy = d.y + ringR * Math.sin(-0.72);
  ctx.fillStyle = INK.gold;
  ctx.beginPath();
  ctx.arc(sx, sy, 10, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#5d4128';
  ctx.lineWidth = 1.6;
  ctx.stroke();
  ctx.strokeStyle = '#3a2a12';
  ctx.lineWidth = 2.6;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(sx - 5, sy + 0.5);
  ctx.lineTo(sx - 1.4, sy + 4.2);
  ctx.lineTo(sx + 5.4, sy - 3.8);
  ctx.stroke();
}

// The hint: a dashed gold ring that breathes around the difference it means,
// turning slowly so the eye catches it.
function drawHintRing(ctx, game) {
  if (!game.hintId) return;
  const d = game.scene.differences.find((item) => item.id === game.hintId);
  if (!d) return;
  const t = game.frozen ? game.stagePhase : game.gameTime;
  const r = d.r + 14 + Math.sin(t * 4) * 3;
  ctx.save();
  ctx.strokeStyle = INK.goldBright;
  ctx.lineWidth = 3;
  ctx.setLineDash([9, 7]);
  ctx.lineDashOffset = -t * 26;
  ctx.beginPath();
  ctx.arc(d.x, d.y, r, 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();
}

// One click effect: the starburst of a find, or the ripple of a miss with
// its lost seconds floating up.
function drawEffect(ctx, fx) {
  const p = Math.min(1, fx.age / fx.life);
  if (fx.kind === 'spark') {
    ctx.save();
    ctx.globalAlpha = 1 - p;
    ctx.strokeStyle = INK.goldBright;
    ctx.lineWidth = 2.6;
    ctx.lineCap = 'round';
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2 + 0.39;
      const r1 = 9 + p * 12;
      const r2 = 17 + p * 26;
      ctx.beginPath();
      ctx.moveTo(fx.x + Math.cos(a) * r1, fx.y + Math.sin(a) * r1);
      ctx.lineTo(fx.x + Math.cos(a) * r2, fx.y + Math.sin(a) * r2);
      ctx.stroke();
    }
    ctx.strokeStyle = INK.found;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(fx.x, fx.y, 10 + p * 30, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  } else {
    ctx.save();
    ctx.globalAlpha = (1 - p) * 0.9;
    ctx.strokeStyle = INK.miss;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(fx.x, fx.y, 6 + p * 30, 0, Math.PI * 2);
    ctx.stroke();
    ctx.fillStyle = INK.miss;
    ctx.font = `bold 15px ${FONT_BODY}`;
    ctx.textAlign = 'center';
    ctx.fillText('-4s', fx.x, fx.y - 16 - p * 18);
    ctx.restore();
  }
}

// The spoken status line and the key legend, under the panels.
function drawStatusLine(ctx, game) {
  ctx.textAlign = 'center';
  ctx.fillStyle = INK.parchment;
  ctx.font = `italic 17px ${FONT_DISPLAY}`;
  ctx.fillText(game.status, VIEW.width / 2, STATUS.y, VIEW.width - 80);
  ctx.fillStyle = INK.parchmentDim;
  ctx.font = `12.5px ${FONT_BODY}`;
  ctx.fillText(
    'Click a difference to mark it · H hint · P pause · M sound · R restart scene · N next scene · Enter begin',
    VIEW.width / 2, LEGEND.y,
  );
  ctx.textAlign = 'left';
}

function veilOver(ctx) {
  ctx.fillStyle = INK.veil;
  ctx.fillRect(0, 0, VIEW.width, VIEW.height);
}

// A centred card with a gold-ruled frame; the painter callback draws its
// words, centred, at the canvas middle.
function drawCentredCard(ctx, w, h, painter) {
  const x = (VIEW.width - w) / 2;
  const y = (VIEW.height - h) / 2;
  ctx.fillStyle = 'rgba(10, 24, 30, 0.97)';
  roundedRectPath(ctx, x, y, w, h, 16);
  ctx.fill();
  ctx.strokeStyle = INK.gold;
  ctx.lineWidth = 2;
  roundedRectPath(ctx, x, y, w, h, 16);
  ctx.stroke();
  ctx.strokeStyle = 'rgba(232, 179, 74, 0.35)';
  ctx.lineWidth = 1;
  roundedRectPath(ctx, x + 8, y + 8, w - 16, h - 16, 11);
  ctx.stroke();
  ctx.save();
  ctx.textAlign = 'center';
  painter(ctx);
  ctx.restore();
}

// The title card: the game's name, its premise, the three scenes with the
// stars they have earned, and the way in.
function drawTitleCard(ctx, game, now) {
  drawCentredCard(ctx, 760, 430, (c) => {
    const cy = VIEW.height / 2;
    c.fillStyle = INK.gold;
    c.font = `15px ${FONT_BODY}`;
    c.fillText('A  S P O T - T H E - D I F F E R E N C E   P A R L O U R', VIEW.width / 2, cy - 168);
    c.fillStyle = INK.parchment;
    c.font = `62px ${FONT_DISPLAY}`;
    c.fillText('Twice-Told Tides', VIEW.width / 2, cy - 104);
    c.fillStyle = INK.parchmentDim;
    c.font = `italic 18px ${FONT_DISPLAY}`;
    c.fillText('Every picture here is told twice — and the second telling always changes something.', VIEW.width / 2, cy - 62);
    c.font = `16px ${FONT_BODY}`;
    c.fillText('Find each change before the clock runs out. A miss costs 4 seconds; a hint costs 8.', VIEW.width / 2, cy - 34);
    // The three scenes, with the stars they hold so far.
    SCENES.forEach((scene, i) => {
      const y = cy + 12 + i * 40;
      const result = game.results.find((r) => r.sceneId === scene.id);
      c.fillStyle = INK.parchment;
      c.font = `19px ${FONT_DISPLAY}`;
      c.textAlign = 'left';
      c.fillText(`${['I', 'II', 'III'][i]}.  ${scene.title}`, VIEW.width / 2 - 268, y);
      c.textAlign = 'center';
      c.fillStyle = INK.parchmentDim;
      c.font = `14px ${FONT_BODY}`;
      c.textAlign = 'right';
      c.fillText(`${scene.differences.length} differences · ${scene.timeLimit}s`, VIEW.width / 2 + 192, y);
      c.textAlign = 'center';
      for (let s = 0; s < 3; s++) {
        drawStar(c, VIEW.width / 2 + 218 + s * 26, y - 6, 9, result ? s < result.stars : false);
      }
    });
    const pulse = 0.65 + 0.35 * Math.sin(now * 2.4);
    c.globalAlpha = pulse;
    c.fillStyle = INK.goldBright;
    c.font = `20px ${FONT_DISPLAY}`;
    c.fillText('Click, or press Enter, to begin', VIEW.width / 2, cy + 168);
    c.globalAlpha = 1;
  });
}

// A finished scene's card: its stars, its numbers, and the way on.
function drawSceneDoneCard(ctx, game) {
  const result = game.results[game.results.length - 1];
  if (!result) return;
  drawCentredCard(ctx, 640, 330, (c) => {
    const cy = VIEW.height / 2;
    c.fillStyle = INK.parchment;
    c.font = `38px ${FONT_DISPLAY}`;
    c.fillText('Scene Complete', VIEW.width / 2, cy - 104);
    c.fillStyle = INK.parchmentDim;
    c.font = `italic 19px ${FONT_DISPLAY}`;
    c.fillText(result.title, VIEW.width / 2, cy - 68);
    for (let s = 0; s < 3; s++) {
      drawStar(c, VIEW.width / 2 + (s - 1) * 62, cy - 12, 24, s < result.stars);
    }
    c.fillStyle = INK.parchment;
    c.font = `16.5px ${FONT_BODY}`;
    c.fillText(
      `Time to spare ${formatTime(result.timeLeft)} · Misses ${result.misses} · Hints used ${result.hintsUsed}`,
      VIEW.width / 2, cy + 52,
    );
    c.fillStyle = INK.parchmentDim;
    c.font = `15px ${FONT_BODY}`;
    const last = game.sceneIndex + 1 >= SCENES.length;
    c.fillText(last ? 'N — see how the parlour scored you · R — play it again' : 'N — next scene · R — play it again', VIEW.width / 2, cy + 92);
  });
}

// The whole game's card: every scene with its stars, and the total.
function drawGameDoneCard(ctx, game) {
  drawCentredCard(ctx, 680, 400, (c) => {
    const cy = VIEW.height / 2;
    c.fillStyle = INK.parchment;
    c.font = `40px ${FONT_DISPLAY}`;
    c.fillText('The Parlour Is Complete', VIEW.width / 2, cy - 140);
    c.fillStyle = INK.parchmentDim;
    c.font = `italic 17px ${FONT_DISPLAY}`;
    c.fillText('Every telling compared, every difference found.', VIEW.width / 2, cy - 104);
    game.results.forEach((result, i) => {
      const y = cy - 48 + i * 44;
      c.fillStyle = INK.parchment;
      c.font = `19px ${FONT_DISPLAY}`;
      c.textAlign = 'left';
      c.fillText(result.title, VIEW.width / 2 - 250, y);
      c.textAlign = 'center';
      for (let s = 0; s < 3; s++) {
        drawStar(c, VIEW.width / 2 + 158 + s * 34, y - 7, 12, s < result.stars);
      }
    });
    c.fillStyle = INK.gold;
    c.font = `26px ${FONT_DISPLAY}`;
    c.fillText(`${game.totalStars()} of ${SCENES.length * 3} stars`, VIEW.width / 2, cy + 118);
    c.fillStyle = INK.parchmentDim;
    c.font = `15px ${FONT_BODY}`;
    c.fillText('R — play again · Enter — play again', VIEW.width / 2, cy + 156);
  });
}

// A five-pointed star, filled in gold or left as a dim outline.
export function drawStar(ctx, cx, cy, r, filled) {
  ctx.beginPath();
  for (let i = 0; i < 10; i++) {
    const rad = i % 2 === 0 ? r : r * 0.45;
    const a = -Math.PI / 2 + (i * Math.PI) / 5;
    const x = cx + Math.cos(a) * rad;
    const y = cy + Math.sin(a) * rad;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.closePath();
  if (filled) {
    ctx.fillStyle = INK.gold;
    ctx.fill();
  } else {
    ctx.strokeStyle = INK.parchmentDim;
    ctx.lineWidth = 1.6;
    ctx.stroke();
  }
}

// Seconds as a clock face: 2:07, 0:43.
export function formatTime(seconds) {
  const whole = Math.max(0, Math.ceil(seconds));
  const m = Math.floor(whole / 60);
  const s = whole % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}
