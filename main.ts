// Twice-Told Tides — the hand-in program (Node 22, standard library
// only). It gathers the entry — the game/ folder and the screenshots/ —
// into the output directory and writes the dossier.json the judge reads,
// built by the vendored make.fun helper under the gate's own caps.
//
// Outside the grader, MAKEFUN_OUTPUT_DIR stands in for /output:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
// and `node serve.ts` plays the game locally first.

import { cpSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-game.ts';

const repoRoot = fileURLToPath(new URL('.', import.meta.url));
const outputDir = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

// The scorer's own caps (from the kit's gate): the text cap shapes the
// dossier's bytes; the others refuse an entry the scorer would refuse —
// more than 4 screenshots or one over 256 KiB, more than 993 files in
// game/ or 48 MiB of game files in all, or a game/ path over 1000 bytes.
const DOSSIER_CAPS = {
  text_max_bytes: 163840,
  screenshots: { max: 4, max_bytes: 262144 },
  game_max_files: 993,
  game_max_bytes: 50331648,
  game_path_max_bytes: 1000,
};

function copyEntry() {
  mkdirSync(outputDir, { recursive: true });
  cpSync(join(repoRoot, 'game'), join(outputDir, 'game'), { recursive: true });
  mkdirSync(join(outputDir, 'screenshots'), { recursive: true });
  if (existsSync(join(repoRoot, 'screenshots'))) {
    cpSync(join(repoRoot, 'screenshots'), join(outputDir, 'screenshots'), { recursive: true });
  }
}

function writeDossier() {
  const dossier = buildDossier(outputDir, DOSSIER_CAPS);
  writeFileSync(join(outputDir, 'dossier.json'), dossier);
}

copyEntry();
writeDossier();
console.log(`Twice-Told Tides handed in to ${outputDir}`);
