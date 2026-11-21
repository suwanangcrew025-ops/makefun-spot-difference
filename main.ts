// Twice-Told Tides — the hand-in. The game itself is the static site in
// game/ (open game/index.html in a desktop browser and play; it needs no
// network and no build). This program is what enters it: it copies game/
// and screenshots/ from beside this file into the output directory and
// writes the dossier — the summary of the game and its pictures that the
// judge reads — with the vendored make.fun library, whose bytes the gate
// rebuilds and compares against these.
//
// Run it the way the grader does, or locally with an output directory:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts

import { cpSync, existsSync, mkdirSync, readdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-game.ts';

// How many files a folder holds, counting everything beneath it — used only
// for the hand-in's own report at the end, never for the dossier itself.
function countFiles(dir: string): number {
  let total = 0;
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    total += entry.isDirectory() ? countFiles(join(dir, entry.name)) : 1;
  }
  return total;
}

const repoDir = fileURLToPath(new URL('.', import.meta.url));
const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

// The game, whole: every file under game/ travels unchanged.
mkdirSync(outDir, { recursive: true });
cpSync(join(repoDir, 'game'), join(outDir, 'game'), { recursive: true });

// The screenshots, whole: four real renders of the game in play.
mkdirSync(join(outDir, 'screenshots'), { recursive: true });
if (existsSync(join(repoDir, 'screenshots'))) {
  cpSync(join(repoDir, 'screenshots'), join(outDir, 'screenshots'), { recursive: true });
}

// The dossier, written with the same caps the scorer grades by: the source
// text the judge outlines is capped at 160 KiB, screenshots at 4 files of
// 256 KiB, and game/ at 993 entries, 48 MiB and 1,000-byte paths.
const dossier = buildDossier(outDir, {
  text_max_bytes: 163840,
  screenshots: { max: 4, max_bytes: 262144 },
  game_max_files: 993,
  game_max_bytes: 50331648,
  game_path_max_bytes: 1000,
});
writeFileSync(join(outDir, 'dossier.json'), dossier);

console.log(
  `Twice-Told Tides handed in: ${countFiles(join(outDir, 'game'))} game files, ` +
    `${countFiles(join(outDir, 'screenshots'))} screenshots, dossier of ${dossier.byteLength} bytes.`,
);
