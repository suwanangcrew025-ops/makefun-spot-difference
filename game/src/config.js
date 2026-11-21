// Shared numbers for Twice-Told Tides: canvas size, panel geometry,
// scene timers, penalties and the palette. One place, so the engine,
// the renderer and the shot stager all agree.
export const CANVAS_W = 1280;
export const CANVAS_H = 800;

// Two panels, each 560 x 560, with a 64px gutter between them.
export const PANEL_W = 560;
export const PANEL_H = 560;
export const PANEL_Y = 104;
export const PANEL_LEFT_X = 48;
export const PANEL_RIGHT_X = 672;

// Header (HUD) band and footer band.
export const HUD_H = 88;
export const FOOTER_Y = 688;

// Clickable header buttons, laid out from the right edge.
export const BTN_W = 92;
export const BTN_H = 40;
export const BTN_Y = 24;
export const BTN_GAP = 12;

// Game rules.
export const HINTS_PER_SCENE = 3;
export const MISS_PENALTY_S = 4;
export const HINT_PENALTY_S = 8;
export const HINT_RING_MS = 3500;
export const SPARK_MS = 900;
export const RIPPLE_MS = 700;

// Palette: dusk golds, sea teal, night indigo, glasshouse green.
export const PALETTE = {
  ink: '#1c2438',
  paper: '#f7f1e3',
  gold: '#e8b64c',
  goldDeep: '#c98f2b',
  teal: '#2e7f7b',
  tealDeep: '#1f5b58',
  rust: '#b4502e',
  cream: '#f3e6c8',
  night: '#141a2e',
  nightDeep: '#0c1020',
  panelEdge: '#3a2f22',
  good: '#4caf6d',
  warn: '#e0a33c',
  bad: '#d9534f',
  violet: '#8a5fd0',
};
