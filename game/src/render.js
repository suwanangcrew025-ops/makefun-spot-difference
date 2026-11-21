// The renderer: everything the player sees, painted on one canvas. It
// reads the engine's state and never changes it. The two panels are the
// heart of it — the same scene painted twice, the right one altered —
// with brass rings on the differences found, a pulsing ring where a hint
// points, and the header's counter always saying how many remain.
import { FOOTER, HEADER, INK, PANEL, TYPE, VIEW } from './config.js';
import { activeHint, currentScene, remaining, SCREEN, stars } from './engine.js';
import { allDifferenceIds, SCENES, totalDifferences } from './scenes.js';
import { glow, roundedRect } from './paintkit.js';
import { isMuted } from './audio.js';

export const SCREEN_NAMES = SCREEN;

/** Seconds as a clock face: 150 becomes "2:30". */
export function formatClock(seconds) {
  const whole = Math.max(0, Math.ceil(seconds));
  return `${Math.floor(whole / 60)}:${String(whole % 60).padStart(2, '0')}`;
}

/** The line a screen reader announces; main.js keeps it in the page. */
export function statusText(game) {
  const scene = currentScene(game);
  switch (game.screen) {
    case SCREEN.TITLE:
      return 'Twice-Told Tides. Three scenes, eighteen differences. Activate to begin.';
    case SCREEN.PLAY:
      return `${scene.title}: ${remaining(game)} of ${scene.differences.length} differences still hidden, ${formatClock(game.secondsLeft)} left.`;
    case SCREEN.SCENE_DONE:
      return game.timedOut ? 'Out of light. The scene has ended.' : 'Scene complete.';
    case SCREEN.GAME_DONE:
      return `The hunt is done: ${game.totalFound} of ${totalDifferences()} differences found.`;
    default:
      return 'Paused.';
  }
}

function paintPanel(ctx, game, side) {
  const scene = currentScene(game);
  const x = side === 'left' ? PANEL.leftX : PANEL.rightX;
  const altered = side === 'left' ? new Set() : allDifferenceIds(scene);
  ctx.save();
  ctx.translate(x, PANEL.top);
  roundedRect(ctx, 0, 0, PANEL.width, PANEL.height, 10);
  ctx.clip();
  scene.paint(ctx, altered);
  paintMarkers(ctx, game, side);
  paintEffects(ctx, game, side);
  ctx.restore();
  // The frame: dark wood with a brass keyline.
  roundedRect(ctx, x - 3, PANEL.top - 3, PANEL.width + 6, PANEL.height + 6, 12);
  ctx.strokeStyle = INK.frame;
  ctx.lineWidth = 6;
  ctx.stroke();
  roundedRect(ctx, x, PANEL.top, PANEL.width, PANEL.height, 10);
  ctx.strokeStyle = INK.frameEdge;
  ctx.lineWidth = 1.6;
  ctx.stroke();
}

/** Brass rings on every found difference, and the hint's pulsing ring. */
function paintMarkers(ctx, game, side) {
  void side;
  const scene = currentScene(game);
  for (const difference of scene.differences) {
    if (!game.found.has(difference.id)) continue;
    const pulse = 1 + Math.sin(game.clock * 3) * 0.04;
    glow(ctx, difference.x, difference.y, difference.r * 1.5, INK.markerSoft);
    ctx.strokeStyle = INK.marker;
    ctx.lineWidth = 3.4;
    ctx.beginPath();
    ctx.arc(difference.x, difference.y, difference.r * pulse, 0, Math.PI * 2);
    ctx.stroke();
    ctx.strokeStyle = 'rgba(20, 14, 4, 0.65)';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.arc(difference.x, difference.y, difference.r * pulse - 3.4, 0, Math.PI * 2);
    ctx.stroke();
    // A small tick at the ring's top, like a wax seal.
    ctx.strokeStyle = INK.marker;
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    const tx = difference.x;
    const ty = difference.y - difference.r * pulse;
    ctx.beginPath();
    ctx.moveTo(tx - 5, ty + 2);
    ctx.lineTo(tx - 1, ty + 7);
    ctx.lineTo(tx + 6, ty - 3);
    ctx.stroke();
  }
  const hint = activeHint(game);
  if (hint !== null && game.screen === SCREEN.PLAY) {
    const wave = (game.clock * 1.6) % 1;
    ctx.strokeStyle = INK.hint;
    ctx.globalAlpha = 0.9 - wave * 0.5;
    ctx.lineWidth = 2.6;
    ctx.setLineDash([7, 6]);
    ctx.beginPath();
    ctx.arc(hint.x, hint.y, hint.r + 6 + wave * 12, 0, Math.PI * 2);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.globalAlpha = 1;
  }
}

/** Short-lived effects: a find's ring and sparks, a miss's ripple. */
function paintEffects(ctx, game, side) {
  for (const effect of game.effects) {
    const age = (game.clock - effect.at) / effect.span;
    if (age < 0 || age > 1) continue;
    if (effect.kind === 'ripple' && effect.panel !== side) continue;
    if (effect.kind === 'ring') {
      ctx.strokeStyle = `rgba(255, 236, 160, ${0.85 * (1 - age)})`;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(effect.x, effect.y, 8 + age * (effect.r + 18), 0, Math.PI * 2);
      ctx.stroke();
    } else if (effect.kind === 'spark') {
      ctx.fillStyle = `rgba(255, 217, 74, ${0.9 * (1 - age)})`;
      for (let i = 0; i < 8; i += 1) {
        const angle = (i / 8) * Math.PI * 2 + 0.4;
        const reach = (effect.r + 16) * age;
        ctx.beginPath();
        ctx.arc(effect.x + Math.cos(angle) * reach, effect.y + Math.sin(angle) * reach, 2.6 * (1 - age) + 0.8, 0, Math.PI * 2);
        ctx.fill();
      }
    } else if (effect.kind === 'ripple') {
      ctx.strokeStyle = `rgba(255, 122, 107, ${0.8 * (1 - age)})`;
      ctx.lineWidth = 2.4;
      ctx.beginPath();
      ctx.arc(effect.x, effect.y, 5 + age * 24, 0, Math.PI * 2);
      ctx.stroke();
    }
  }
}

function paintHeader(ctx, game) {
  const scene = currentScene(game);
  ctx.textAlign = 'left';
  ctx.fillStyle = INK.parchment;
  ctx.font = `28px ${TYPE.display}`;
  ctx.fillText('Twice-Told Tides', 24, 38);
  ctx.fillStyle = INK.parchmentDim;
  ctx.font = `15px ${TYPE.body}`;
  const sceneLine = game.screen === SCREEN.TITLE
    ? 'a spot-the-difference parlour'
    : `Scene ${game.sceneIndex + 1} of ${SCENES.length} · ${scene.title}`;
  ctx.fillText(sceneLine, 24, 64);
  // The counter: a brass-ringed disc with the number still hidden.
  const cx = 596;
  ctx.beginPath();
  ctx.arc(cx, 46, 31, 0, Math.PI * 2);
  ctx.fillStyle = '#1d1508';
  ctx.fill();
  ctx.strokeStyle = INK.brass;
  ctx.lineWidth = 3;
  ctx.stroke();
  ctx.fillStyle = INK.brass;
  ctx.font = `bold 32px ${TYPE.body}`;
  ctx.textAlign = 'center';
  ctx.fillText(String(remaining(game)), cx, 58);
  ctx.font = `13px ${TYPE.body}`;
  ctx.fillStyle = INK.parchmentDim;
  ctx.textAlign = 'left';
  ctx.fillText('still', cx + 42, 40);
  ctx.fillText('hidden', cx + 42, 58);
  // Pips: one per difference in the scene, gold once found.
  scene.differences.forEach((difference, i) => {
    const px = 470 + i * 26;
    ctx.beginPath();
    ctx.arc(px, 78, 6, 0, Math.PI * 2);
    if (game.found.has(difference.id)) {
      ctx.fillStyle = INK.brass;
      ctx.fill();
    } else {
      ctx.strokeStyle = INK.parchmentDim;
      ctx.lineWidth = 1.6;
      ctx.stroke();
    }
  });
  // The clock and its bar, right-aligned; the bar reddens as it empties.
  const fraction = Math.max(0, game.secondsLeft / game.sceneSeconds);
  ctx.textAlign = 'right';
  ctx.fillStyle = fraction < 0.2 ? INK.bad : INK.parchment;
  ctx.font = `bold 30px ${TYPE.body}`;
  ctx.fillText(formatClock(game.secondsLeft), 1256, 42);
  ctx.fillStyle = 'rgba(243, 229, 200, 0.18)';
  ctx.fillRect(1006, 54, 250, 9);
  ctx.fillStyle = fraction < 0.2 ? INK.bad : fraction < 0.5 ? '#e8a34c' : INK.good;
  ctx.fillRect(1006, 54, 250 * fraction, 9);
  ctx.fillStyle = INK.parchmentDim;
  ctx.font = `14px ${TYPE.body}`;
  ctx.textAlign = 'left';
  const hintDots = '●'.repeat(game.hintsLeft) + '○'.repeat(Math.max(0, 3 - game.hintsLeft));
  ctx.fillText(`Hints ${hintDots}  ·  press H (−8s)`, 856, 84);
  ctx.textAlign = 'right';
  ctx.fillText(isMuted() ? 'sound off [M]' : 'sound on [M]', 1256, 84);
}

function paintFooter(ctx) {
  ctx.fillStyle = 'rgba(243, 229, 200, 0.55)';
  ctx.font = `14px ${TYPE.body}`;
  ctx.textAlign = 'center';
  ctx.fillText('Click a difference in either picture · a wrong click costs 4 seconds · H hint · P pause · M sound', VIEW.width / 2, FOOTER.top + 30);
}

function card(ctx, width, height) {
  const x = (VIEW.width - width) / 2;
  const y = (VIEW.height - height) / 2;
  ctx.fillStyle = 'rgba(10, 14, 26, 0.72)';
  ctx.fillRect(0, 0, VIEW.width, VIEW.height);
  roundedRect(ctx, x, y, width, height, 16);
  ctx.fillStyle = '#171f36';
  ctx.fill();
  ctx.strokeStyle = INK.brass;
  ctx.lineWidth = 2;
  ctx.stroke();
  return { x, y };
}

function paintTitle(ctx, game) {
  paintPanel(ctx, game, 'left');
  paintPanel(ctx, game, 'right');
  const { x, y } = card(ctx, 640, 400);
  ctx.textAlign = 'center';
  ctx.fillStyle = INK.parchment;
  ctx.font = `54px ${TYPE.display}`;
  ctx.fillText('Twice-Told Tides', VIEW.width / 2, y + 84);
  ctx.fillStyle = INK.brass;
  ctx.font = `17px ${TYPE.body}`;
  ctx.fillText('a spot-the-difference parlour', VIEW.width / 2, y + 116);
  ctx.fillStyle = INK.parchmentDim;
  ctx.font = `16px ${TYPE.body}`;
  ctx.fillText('Every scene is told twice, and the second telling lies a little.', VIEW.width / 2, y + 158);
  ctx.fillText('Find where the two pictures part company before the light runs out.', VIEW.width / 2, y + 182);
  ctx.font = `16px ${TYPE.body}`;
  ctx.fillStyle = INK.parchment;
  SCENES.forEach((scene, i) => {
    ctx.fillText(`${i + 1}.  ${scene.title} — ${scene.differences.length} differences`, VIEW.width / 2, y + 228 + i * 28);
  });
  ctx.fillStyle = INK.brass;
  ctx.font = `bold 19px ${TYPE.body}`;
  ctx.fillText('Click anywhere, or press Enter, to begin', VIEW.width / 2, y + 348);
  void x;
}

function paintSceneDone(ctx, game) {
  paintPanel(ctx, game, 'left');
  paintPanel(ctx, game, 'right');
  const scene = currentScene(game);
  const { y } = card(ctx, 600, 320);
  ctx.textAlign = 'center';
  ctx.fillStyle = game.timedOut ? INK.bad : INK.good;
  ctx.font = `38px ${TYPE.display}`;
  ctx.fillText(game.timedOut ? 'Out of light' : 'Scene complete', VIEW.width / 2, y + 72);
  ctx.fillStyle = INK.parchment;
  ctx.font = `20px ${TYPE.body}`;
  ctx.fillText(scene.title, VIEW.width / 2, y + 110);
  ctx.fillStyle = INK.parchmentDim;
  ctx.font = `17px ${TYPE.body}`;
  const used = game.sceneSeconds - Math.max(0, Math.round(game.secondsLeft));
  ctx.fillText(`Found ${game.found.size} of ${scene.differences.length} differences · ${formatClock(used)} at the table`, VIEW.width / 2, y + 152);
  ctx.fillText(`Mistakes so far: ${game.mistakes} · Hints used: ${game.hintsUsed}`, VIEW.width / 2, y + 182);
  if (game.timedOut) {
    ctx.fillText('The differences you missed stay hidden — this time.', VIEW.width / 2, y + 224);
  }
  ctx.fillStyle = INK.brass;
  ctx.font = `bold 18px ${TYPE.body}`;
  const last = game.sceneIndex === SCENES.length - 1;
  ctx.fillText(last ? '[N] See the final reckoning · [R] Replay scene' : '[N] Next scene · [R] Replay scene', VIEW.width / 2, y + 272);
}

function paintGameDone(ctx, game) {
  paintPanel(ctx, game, 'left');
  paintPanel(ctx, game, 'right');
  const { y } = card(ctx, 620, 360);
  ctx.textAlign = 'center';
  ctx.fillStyle = INK.parchment;
  ctx.font = `40px ${TYPE.display}`;
  ctx.fillText(game.totalFound >= totalDifferences() ? 'Every difference found' : 'The hunt is done', VIEW.width / 2, y + 74);
  ctx.fillStyle = INK.brass;
  ctx.font = `44px ${TYPE.body}`;
  ctx.fillText('★'.repeat(stars(game)) + '☆'.repeat(3 - stars(game)), VIEW.width / 2, y + 128);
  ctx.fillStyle = INK.parchmentDim;
  ctx.font = `18px ${TYPE.body}`;
  ctx.fillText(`${game.totalFound} of ${totalDifferences()} differences · ${formatClock(game.totalSeconds)} at the table`, VIEW.width / 2, y + 178);
  ctx.fillText(`Mistakes: ${game.mistakes} · Hints used: ${game.hintsUsed}`, VIEW.width / 2, y + 208);
  ctx.fillStyle = INK.brass;
  ctx.font = `bold 18px ${TYPE.body}`;
  ctx.fillText('[Enter] Hunt again', VIEW.width / 2, y + 292);
}

function paintPaused(ctx, game) {
  paintPanel(ctx, game, 'left');
  paintPanel(ctx, game, 'right');
  const { y } = card(ctx, 380, 170);
  ctx.textAlign = 'center';
  ctx.fillStyle = INK.parchment;
  ctx.font = `36px ${TYPE.display}`;
  ctx.fillText('Paused', VIEW.width / 2, y + 76);
  ctx.fillStyle = INK.parchmentDim;
  ctx.font = `16px ${TYPE.body}`;
  ctx.fillText('Press P to go back to the hunt', VIEW.width / 2, y + 116);
}

/** Paint the whole stage for the game's current state. */
export function draw(ctx, game) {
  const background = ctx.createLinearGradient(0, 0, 0, VIEW.height);
  background.addColorStop(0, INK.pageGlow);
  background.addColorStop(0.5, INK.page);
  background.addColorStop(1, '#090d18');
  ctx.fillStyle = background;
  ctx.fillRect(0, 0, VIEW.width, VIEW.height);
  paintHeader(ctx, game);
  switch (game.screen) {
    case SCREEN.TITLE:
      paintTitle(ctx, game);
      break;
    case SCREEN.PAUSED:
      paintPaused(ctx, game);
      break;
    case SCREEN.SCENE_DONE:
      paintSceneDone(ctx, game);
      break;
    case SCREEN.GAME_DONE:
      paintGameDone(ctx, game);
      break;
    default:
      paintPanel(ctx, game, 'left');
      paintPanel(ctx, game, 'right');
  }
  paintFooter(ctx);
  void HEADER;
}
