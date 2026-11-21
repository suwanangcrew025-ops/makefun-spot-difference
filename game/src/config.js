// config.js — the parlour's fixed measurements: canvas, panels, timing, palette.
// Everything layout-shaped lives here so the engine and the renderer never
// disagree about where a panel sits or how long a scene lasts.

// The canvas is a fixed stage; the page scales it to fit the window.
export const VIEW = { width: 1280, height: 800 };

// Two panels side by side, each a 600 by 600 picture in its own local space.
// Scene painters draw in panel-local coordinates (0..600 on both axes) and the
// renderer translates the context to a panel's origin before calling them.
export const PANEL = {
  width: 600,
  height: 600,
  top: 118,
  leftX: 24,
  rightX: 656,
  frame: 10, // wooden frame thickness drawn around each picture
};

// Header furniture: title at the left, the remaining counter in the middle,
// the clock at the right; the time bar runs the full width beneath it.
export const HEADER = { height: 76 };
export const TIME_BAR = { x: 24, y: 88, width: 1232, height: 12, radius: 6 };

// The strip under the panels carries the spoken status line and the key legend.
export const STATUS = { y: 748 };
export const LEGEND = { y: 778 };

// The economy of a hunt: what a miss costs, what a hint costs, how many hints.
export const RULES = {
  missPenaltySeconds: 4,
  hintPenaltySeconds: 8,
  hintsPerScene: 3,
  hintSeconds: 7, // how long a hint ring stays on the pictures
  lowTimeWarning: 10, // seconds left when the clock starts to tick aloud
};

// Star thresholds on a finished scene: one star for finishing at all, one for
// keeping at least this share of the clock, one for never taking a hint.
export const STAR_TIME_SHARE = 0.35;

// Colours of the parlour: deep teal walls, lamplight gold, parchment text.
export const INK = {
  wallTop: '#17323a',
  wallBottom: '#0b1a20',
  parchment: '#f3e6c8',
  parchmentDim: '#c9b995',
  gold: '#e8b34a',
  goldBright: '#ffd97a',
  found: '#ffc94d',
  miss: '#e06c5a',
  frameDark: '#4a3220',
  frameLight: '#7a5636',
  veil: 'rgba(6, 14, 18, 0.72)',
};

// The fonts are generic families only, so the game needs no font files.
export const FONT_DISPLAY = 'Georgia, "Times New Roman", serif';
export const FONT_BODY = 'Verdana, Geneva, sans-serif';
