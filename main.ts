// Twice-Told Tides — the hand-in program (Node 22, standard library only).
//
// The game itself is the static bundle under game/: an index.html and its ES
// modules, drawn scenes, no network, nothing to install or build. This
// program is the courier. It carries game/ and screenshots/ from beside
// this file into the output directory and writes the dossier the judge
// reads, using the vendored make.fun library so the bytes match what the
// gate rebuilds for itself.
//
// Play it locally with `node serve.ts`, then open http://localhost:8080.
// Outside the grader's container, MAKEFUN_OUTPUT_DIR stands in for /output:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts

import { cpSync, existsSync, mkdirSync, readdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-game.ts';

const here = fileURLToPath(new URL('.', import.meta.url));
const out = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

// Refuse to hand in a hollow entry: the game must have its page and the
// screenshots folder its pictures before anything is copied. A refusal
// here is loud and local; a hollow hand-in would only fail at the gate.
if (!existsSync(join(here, 'game', 'index.html'))) {
  throw new Error('game/index.html is missing: there is no game to hand in');
}
const shots = existsSync(join(here, 'screenshots'))
  ? readdirSync(join(here, 'screenshots')).filter((name) => /\.(png|jpe?g)$/i.test(name))
  : [];
if (shots.length < 3 || shots.length > 4) {
  throw new Error(`screenshots/ holds ${shots.length} pictures; the gate wants 3 or 4`);
}

// The dossier caps are the scorer's own (see the kit's gate): they shape the
// dossier's bytes, so they are passed exactly, never tuned.
const DOSSIER_CAPS = {
  text_max_bytes: 163840,
  screenshots: { max: 4, max_bytes: 262144 },
  game_max_files: 993,
  game_max_bytes: 50331648,
  game_path_max_bytes: 1000,
};

mkdirSync(out, { recursive: true });
cpSync(join(here, 'game'), join(out, 'game'), { recursive: true });
mkdirSync(join(out, 'screenshots'), { recursive: true });
if (existsSync(join(here, 'screenshots'))) {
  cpSync(join(here, 'screenshots'), join(out, 'screenshots'), { recursive: true });
}

writeFileSync(join(out, 'dossier.json'), buildDossier(out, DOSSIER_CAPS));
