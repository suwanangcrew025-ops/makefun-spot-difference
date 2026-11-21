// Twice-Told Tides — the fixed numbers every other file shares: the stage
// size, where the two panels sit, the clock each scene allows, and the
// palette the scenes are painted from. Nothing here decides or draws; it
// only names things, so a change of layout or colour happens in one place.

/** The canvas is one fixed stage; CSS stretches it to the window. */
export const VIEW = { width: 1280, height: 800 };

/** The band across the top that carries the title, counter and clock. */
export const HEADER = { height: 92 };

/** The strip across the bottom that carries the controls reminder. */
export const FOOTER = { top: 748, height: 52 };

/**
 * The two picture panels. Each scene is painted in a panel's own coordinate
 * space, 600 wide by 640 tall, and the renderer translates the context to
 * the panel's corner before handing it to the painter.
 */
export const PANEL = { width: 600, height: 640, top: 100, leftX: 24, rightX: 656, gap: 32 };

/** Seconds on the clock when a scene opens, by scene order. */
export const SCENE_SECONDS = [150, 180, 210];

/** What a wrong click costs, and what a hint costs, in seconds. */
export const MISS_PENALTY_SECONDS = 4;
export const HINT_COST_SECONDS = 8;

/** Hints a player may spend in one scene. */
export const HINTS_PER_SCENE = 3;

/** The radius, in panel units, inside which a click counts as a find. */
export const FIND_RADIUS = 34;

/** Colours shared by the frame, the HUD and every scene. */
export const INK = {
  page: '#0d1322',
  pageGlow: '#1b2745',
  frame: '#2a1f16',
  frameEdge: '#c9a35f',
  parchment: '#f3e5c8',
  parchmentDim: '#cbb98f',
  brass: '#e8b64c',
  good: '#7ee2a0',
  bad: '#ff7a6b',
  hint: '#8fd0ff',
  marker: '#ffd94a',
  markerSoft: 'rgba(255, 217, 74, 0.25)',
};

/** Typefaces: household names only, so the game needs no font files. */
export const TYPE = {
  display: 'Georgia, "Times New Roman", serif',
  body: '"Trebuchet MS", Verdana, Geneva, sans-serif',
};
