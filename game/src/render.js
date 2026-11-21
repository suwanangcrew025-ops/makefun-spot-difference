// Drawing for Twice-Told Tides: the HUD, the two panels, found rings,
// sparks, ripples, hint rings and the cards. All text uses generic
// font families only, so the game needs no font files.
import {
  BTN_GAP, BTN_H, BTN_W, BTN_Y, CANVAS_H, CANVAS_W, FOOTER_Y,
  HINT_RING_MS, PALETTE, PANEL_H, PANEL_LEFT_X, PANEL_RIGHT_X, PANEL_W, PANEL_Y,
  RIPPLE_MS, SPARK_MS,
} from './config.js';
import { alteredSet, SCENES } from './scenes.js';
import {
  SCREEN_GAME_DONE, SCREEN_PAUSED, SCREEN_PLAY, SCREEN_SCENE_DONE,
  SCREEN_TIME_UP, SCREEN_TITLE, currentScene, remainingCount,
} from './engine.js';
import { hashStr, mulberry32 } from './random.js';
import { roundRect } from './paintkit.js';

export const CARD = { x: 360, y: 190, w: 560, h: 400 };

/** Header buttons, laid out from the right edge. Order: Hint, Pause, Sound. */
export function headerButtons(game) {
  const total = 3 * BTN_W + 2 * BTN_GAP;
  const x0 = CANVAS_W - 48 - total;
  return [
    { id: 'hint', label: `Hint (${game.hintsLeft})`, x: x0, y: BTN_Y, w: BTN_W, h: BTN_H },
    { id: 'pause', label: game.screen === SCREEN_PAUSED ? 'Resume' : 'Pause', x: x0 + BTN_W + BTN_GAP, y: BTN_Y, w: BTN_W, h: BTN_H },
    { id: 'mute', label: game.muted ? 'Unmute' : 'Mute', x: x0 + 2 * (BTN_W + BTN_GAP), y: BTN_Y, w: BTN_W, h: BTN_H },
  ];
}

/** Buttons on the overlay cards, by screen. */
export function cardButtons(screen) {
  const y = CARD.y + CARD.h - 78;
  const mk = (id, label, x) => ({ id, label, x, y, w: 200, h: 48 });
  if (screen === SCREEN_TITLE) return [mk('start', 'Begin the hunt', CARD.x + 180)];
  if (screen === SCREEN_SCENE_DONE) {
    return [mk('next', 'Next scene  →', CARD.x + 40), mk('replay', 'Replay scene', CARD.x + 320)];
  }
  if (screen === SCREEN_GAME_DONE) return [mk('again', 'Play again', CARD.x + 180)];
  if (screen === SCREEN_TIME_UP) return [mk('retry', 'Retry scene', CARD.x + 180)];
  if (screen === SCREEN_PAUSED) return [mk('resume', 'Resume', CARD.x + 180)];
  return [];
}

function formatTime(seconds) {
  const s = Math.max(0, Math.ceil(seconds));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
}

function drawStars(ctx, x, y, count, size = 26) {
  ctx.save();
  ctx.font = `${size}px sans-serif`;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  for (let i = 0; i < 3; i += 1) {
    ctx.fillStyle = i < count ? PALETTE.gold : 'rgba(255,255,255,0.25)';
    ctx.fillText('★', x + i * (size + 6), y);
  }
  ctx.restore();
}

function drawPanelLabel(ctx, x, label) {
  ctx.save();
  ctx.font = '600 13px sans-serif';
  ctx.fillStyle = PALETTE.paper;
  ctx.globalAlpha = 0.85;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(label, x + PANEL_W / 2, PANEL_Y - 14);
  ctx.restore();
}

function drawPanels(ctx, game, nowMs) {
  const scene = currentScene(game);
  const original = new Set();
  const changed = alteredSet(scene, scene.differences.map((d) => d.id));
  const panels = [
    { x: PANEL_LEFT_X, altered: original },
    { x: PANEL_RIGHT_X, altered: changed },
  ];
  for (const panel of panels) {
    ctx.save();
    ctx.beginPath();
    ctx.rect(panel.x, PANEL_Y, PANEL_W, PANEL_H);
    ctx.clip();
    ctx.translate(panel.x, PANEL_Y);
    scene.paint(ctx, panel.altered);
    ctx.restore();
    // Frame.
    ctx.save();
    ctx.strokeStyle = PALETTE.panelEdge;
    ctx.lineWidth = 4;
    ctx.strokeRect(panel.x, PANEL_Y, PANEL_W, PANEL_H);
    ctx.restore();
  }
  drawPanelLabel(ctx, PANEL_LEFT_X, 'O R I G I N A L');
  drawPanelLabel(ctx, PANEL_RIGHT_X, 'C H A N G E D');
  drawMarks(ctx, game, nowMs);
}

function drawFoundRing(ctx, px, py, diff, nowMs, foundAt) {
  ctx.save();
  // Gold ring with a tick seal.
  ctx.strokeStyle = PALETTE.gold;
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.arc(px, py, diff.r + 6, 0, Math.PI * 2);
  ctx.stroke();
  ctx.strokeStyle = PALETTE.goldDeep;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(px, py, diff.r + 11, 0, Math.PI * 2);
  ctx.stroke();
  ctx.fillStyle = PALETTE.gold;
  ctx.beginPath();
  ctx.arc(px, py, 13, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#1c2438';
  ctx.lineWidth = 3;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(px - 6, py);
  ctx.lineTo(px - 1, py + 5);
  ctx.lineTo(px + 7, py - 5);
  ctx.stroke();
  // Spark burst, fading over SPARK_MS after the find.
  const age = nowMs - (foundAt ?? nowMs);
  if (age < SPARK_MS) {
    const t = age / SPARK_MS;
    const rng = mulberry32(hashStr(`spark:${diff.id}`));
    for (let i = 0; i < 10; i += 1) {
      const angle = rng() * Math.PI * 2;
      const dist = (diff.r + 8) + t * 34;
      const sx = px + Math.cos(angle) * dist;
      const sy = py + Math.sin(angle) * dist;
      ctx.globalAlpha = 1 - t;
      ctx.fillStyle = i % 2 === 0 ? '#ffe9a8' : PALETTE.gold;
      ctx.beginPath();
      ctx.arc(sx, sy, 3.5 - t * 2, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  }
  ctx.restore();
}

function drawMarks(ctx, game, nowMs) {
  const scene = currentScene(game);
  const origins = [PANEL_LEFT_X, PANEL_RIGHT_X];
  // Found rings on both panels.
  for (const diff of scene.differences) {
    if (!game.found.has(diff.id)) continue;
    for (const ox of origins) {
      drawFoundRing(ctx, ox + diff.x, PANEL_Y + diff.y, diff, nowMs, game.foundAt.get(diff.id));
    }
  }
  // Hint ring: a dashed pulsing circle on the unfound difference.
  if (game.hintTarget && nowMs < game.hintUntil) {
    const diff = scene.differences.find((d) => d.id === game.hintTarget);
    if (diff) {
      const pulse = 1 + 0.12 * Math.sin(nowMs / 130);
      ctx.save();
      ctx.strokeStyle = PALETTE.gold;
      ctx.lineWidth = 4;
      ctx.setLineDash([10, 8]);
      ctx.lineDashOffset = -nowMs / 40;
      for (const ox of origins) {
        ctx.beginPath();
        ctx.arc(ox + diff.x, PANEL_Y + diff.y, (diff.r + 10) * pulse, 0, Math.PI * 2);
        ctx.stroke();
      }
      ctx.restore();
    }
  }
  // Miss ripple on the panel that was clicked.
  if (game.missAt && nowMs - game.missAt.at < RIPPLE_MS) {
    const t = (nowMs - game.missAt.at) / RIPPLE_MS;
    const ox = game.missAt.panel === 0 ? PANEL_LEFT_X : PANEL_RIGHT_X;
    ctx.save();
    ctx.globalAlpha = 1 - t;
    ctx.strokeStyle = '#ff6b5e';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(ox + game.missAt.x, PANEL_Y + game.missAt.y, 8 + t * 42, 0, Math.PI * 2);
    ctx.stroke();
    ctx.fillStyle = '#ff6b5e';
    ctx.font = '700 20px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('−4s', ox + game.missAt.x, PANEL_Y + game.missAt.y - 26 - t * 18);
    ctx.restore();
  }
}

function drawHud(ctx, game) {
  const scene = currentScene(game);
  ctx.save();
  // Title and scene name.
  ctx.fillStyle = PALETTE.paper;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.font = '700 24px Georgia, serif';
  ctx.fillText('Twice-Told Tides', 48, 30);
  ctx.font = '400 14px sans-serif';
  ctx.globalAlpha = 0.8;
  ctx.fillText(scene.name, 48, 56);
  ctx.globalAlpha = 1;

  // Timer bar.
  const barX = 400;
  const barY = 24;
  const barW = 330;
  const fraction = Math.max(0, game.timeLeft / scene.seconds);
  const barColour = fraction > 0.5 ? PALETTE.good : fraction > 0.25 ? PALETTE.warn : PALETTE.bad;
  ctx.fillStyle = 'rgba(255,255,255,0.18)';
  roundRect(ctx, barX, barY, barW, 18, 9);
  ctx.fill();
  ctx.fillStyle = barColour;
  if (fraction > 0) {
    roundRect(ctx, barX, barY, Math.max(18, barW * fraction), 18, 9);
    ctx.fill();
  }
  ctx.font = '700 18px sans-serif';
  ctx.fillStyle = PALETTE.paper;
  ctx.fillText(formatTime(game.timeLeft), barX + barW + 14, barY + 9);
  ctx.font = '400 12px sans-serif';
  ctx.globalAlpha = 0.75;
  ctx.fillText('time left', barX, barY + 32);
  ctx.globalAlpha = 1;

  // Remaining counter with pips.
  const total = scene.differences.length;
  const found = game.found.size;
  const counterX = 800;
  ctx.font = '700 18px sans-serif';
  ctx.fillStyle = PALETTE.paper;
  ctx.fillText(`${found} / ${total} found`, counterX, 30);
  for (let i = 0; i < total; i += 1) {
    ctx.beginPath();
    ctx.arc(counterX + 8 + i * 18, 56, 6, 0, Math.PI * 2);
    ctx.fillStyle = i < found ? PALETTE.gold : 'rgba(255,255,255,0.25)';
    ctx.fill();
  }

  // Header buttons.
  for (const btn of headerButtons(game)) {
    ctx.fillStyle = 'rgba(255,255,255,0.14)';
    roundRect(ctx, btn.x, btn.y, btn.w, btn.h, 8);
    ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,0.35)';
    ctx.lineWidth = 1.5;
    roundRect(ctx, btn.x, btn.y, btn.w, btn.h, 8);
    ctx.stroke();
    ctx.fillStyle = PALETTE.paper;
    ctx.font = '600 14px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(btn.label, btn.x + btn.w / 2, btn.y + btn.h / 2 + 1);
  }
  ctx.restore();
}

function drawFooter(ctx, game) {
  ctx.save();
  ctx.fillStyle = PALETTE.paper;
  ctx.globalAlpha = 0.75;
  ctx.font = '400 14px sans-serif';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillText('Click a difference  ·  H hint (−8s)  ·  P pause  ·  M mute  ·  R restart scene  ·  N next', 48, FOOTER_Y + 26);
  // Scene progress: dots and stars earned so far.
  ctx.globalAlpha = 1;
  ctx.textAlign = 'right';
  ctx.fillText(`Scene ${game.sceneIndex + 1} of ${SCENES.length}`, CANVAS_W - 48, FOOTER_Y + 26);
  ctx.restore();
}

function drawCard(ctx, title, lines, screen, game) {
  ctx.save();
  ctx.fillStyle = 'rgba(10, 12, 24, 0.62)';
  ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
  ctx.fillStyle = '#232c44';
  roundRect(ctx, CARD.x, CARD.y, CARD.w, CARD.h, 16);
  ctx.fill();
  ctx.strokeStyle = PALETTE.gold;
  ctx.lineWidth = 2;
  roundRect(ctx, CARD.x, CARD.y, CARD.w, CARD.h, 16);
  ctx.stroke();
  ctx.fillStyle = PALETTE.paper;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = '700 34px Georgia, serif';
  ctx.fillText(title, CARD.x + CARD.w / 2, CARD.y + 58);
  ctx.font = '400 16px sans-serif';
  let y = CARD.y + 112;
  for (const line of lines) {
    ctx.fillText(line, CARD.x + CARD.w / 2, y);
    y += 26;
  }
  for (const btn of cardButtons(screen)) {
    ctx.fillStyle = PALETTE.gold;
    roundRect(ctx, btn.x, btn.y, btn.w, btn.h, 10);
    ctx.fill();
    ctx.fillStyle = '#1c2438';
    ctx.font = '700 16px sans-serif';
    ctx.fillText(btn.label, btn.x + btn.w / 2, btn.y + btn.h / 2 + 1);
  }
  ctx.restore();
}

function drawTitleCard(ctx, game) {
  const lines = [
    'Three painted scenes, two panels each — find every change',
    'before the tide runs out.',
    '',
  ];
  SCENES.forEach((scene, i) => {
    lines.push(`${i + 1}. ${scene.name} — ${scene.differences.length} differences, ${formatTime(scene.seconds)}`);
  });
  drawCard(ctx, 'Twice-Told Tides', lines, SCREEN_TITLE, game);
  // Star slots under the scene list.
  ctx.save();
  ctx.textAlign = 'center';
  ctx.font = '400 14px sans-serif';
  ctx.fillStyle = PALETTE.paper;
  ctx.fillText('Press Enter or click Begin to play', CARD.x + CARD.w / 2, CARD.y + CARD.h - 110);
  ctx.restore();
}

export function draw(ctx, game, nowMs) {
  // Backdrop.
  const g = ctx.createLinearGradient(0, 0, 0, CANVAS_H);
  g.addColorStop(0, '#1c2438');
  g.addColorStop(1, '#12172a');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);

  drawPanels(ctx, game, nowMs);
  drawHud(ctx, game);
  drawFooter(ctx, game);

  if (game.screen === SCREEN_TITLE) {
    drawTitleCard(ctx, game);
  } else if (game.screen === SCREEN_PAUSED) {
    drawCard(ctx, 'Paused', ['Take a breath — the tide is waiting.', 'P or Resume to carry on.'], SCREEN_PAUSED, game);
  } else if (game.screen === SCREEN_SCENE_DONE) {
    const scene = currentScene(game);
    const stars = game.stars[game.sceneIndex];
    drawCard(
      ctx, 'Scene complete!',
      [`You found all ${scene.differences.length} differences in ${scene.name}.`, `${formatTime(game.timeLeft)} to spare.`],
      SCREEN_SCENE_DONE, game,
    );
    drawStars(ctx, CARD.x + CARD.w / 2 - 45, CARD.y + 200, stars, 30);
  } else if (game.screen === SCREEN_GAME_DONE) {
    const total = game.stars.reduce((a, b) => a + b, 0);
    drawCard(
      ctx, 'The tides are told!',
      ['Every difference found, every scene complete.', `Total: ${total} of 9 stars.`],
      SCREEN_GAME_DONE, game,
    );
    SCENES.forEach((scene, i) => {
      drawStars(ctx, CARD.x + 90 + i * 170, CARD.y + 200, game.stars[i], 24);
    });
  } else if (game.screen === SCREEN_TIME_UP) {
    const scene = currentScene(game);
    drawCard(
      ctx, 'Out of time!',
      [`The tide came in with ${remainingCount(game)} of ${scene.differences.length} differences still hidden.`, 'Try the scene again — the panels never change.'],
      SCREEN_TIME_UP, game,
    );
  }
}
