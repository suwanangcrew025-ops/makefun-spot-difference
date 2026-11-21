// Input: the mouse and the keyboard, translated into engine calls. A
// pointer press is mapped from the window into stage coordinates, then
// into a panel's own coordinates when it lands in one; keys drive the
// same actions the footer names. Nothing here knows how anything looks.
import { PANEL, VIEW } from './config.js';
import { advance, clickPanel, retryScene, SCREEN, startGame, togglePause, useHint } from './engine.js';
import { toggleMuted } from './audio.js';

/** The hint counter in the header doubles as a button; its stage rectangle. */
const HINT_BUTTON = { x: 850, y: 62, width: 220, height: 30 };

/** Which panel a stage point falls in, and the point in panel coordinates. */
export function panelAt(stageX, stageY) {
  if (stageY < PANEL.top || stageY >= PANEL.top + PANEL.height) return null;
  if (stageX >= PANEL.leftX && stageX < PANEL.leftX + PANEL.width) {
    return { side: 'left', x: stageX - PANEL.leftX, y: stageY - PANEL.top };
  }
  if (stageX >= PANEL.rightX && stageX < PANEL.rightX + PANEL.width) {
    return { side: 'right', x: stageX - PANEL.rightX, y: stageY - PANEL.top };
  }
  return null;
}

/** Window coordinates to stage coordinates, through the canvas's own box. */
function toStage(canvas, clientX, clientY) {
  const rect = canvas.getBoundingClientRect();
  return {
    x: ((clientX - rect.left) / rect.width) * VIEW.width,
    y: ((clientY - rect.top) / rect.height) * VIEW.height,
  };
}

/** Wire pointer and keyboard to the game; `onAction` runs after each input. */
export function attachInput(canvas, game, onAction) {
  canvas.addEventListener('pointerdown', (event) => {
    const { x, y } = toStage(canvas, event.clientX, event.clientY);
    switch (game.screen) {
      case SCREEN.TITLE:
        startGame(game);
        break;
      case SCREEN.PLAY: {
        if (x >= HINT_BUTTON.x && x < HINT_BUTTON.x + HINT_BUTTON.width && y >= HINT_BUTTON.y && y < HINT_BUTTON.y + HINT_BUTTON.height) {
          useHint(game);
          break;
        }
        const hit = panelAt(x, y);
        if (hit !== null) clickPanel(game, hit.side, hit.x, hit.y);
        break;
      }
      case SCREEN.PAUSED:
        togglePause(game);
        break;
      case SCREEN.SCENE_DONE:
        advance(game);
        break;
      case SCREEN.GAME_DONE:
        advance(game);
        break;
      default:
        break;
    }
    onAction();
  });

  window.addEventListener('keydown', (event) => {
    switch (event.code) {
      case 'Enter':
      case 'Space':
        if (game.screen === SCREEN.TITLE) startGame(game);
        else if (game.screen === SCREEN.SCENE_DONE || game.screen === SCREEN.GAME_DONE) advance(game);
        event.preventDefault();
        break;
      case 'KeyH':
        useHint(game);
        break;
      case 'KeyP':
      case 'Escape':
        togglePause(game);
        break;
      case 'KeyM':
        toggleMuted();
        break;
      case 'KeyR':
        if (game.screen === SCREEN.PLAY || game.screen === SCREEN.SCENE_DONE) retryScene(game);
        break;
      case 'KeyN':
        if (game.screen === SCREEN.SCENE_DONE) advance(game);
        break;
      default:
        break;
    }
    onAction();
  });
}
