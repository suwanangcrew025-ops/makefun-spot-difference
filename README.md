# makefun-spot-difference

[![make.fun · best-spot-the-difference-game-20261121-0451](https://make.fun/badge/best-spot-the-difference-game-20261121-0451.svg)](https://make.fun/bounty/best-spot-the-difference-game-20261121-0451?utm_source=github&utm_medium=readme&utm_campaign=best-spot-the-difference-game-20261121-0451)
[![rank](https://make.fun/badge/best-spot-the-difference-game-20261121-0451/suwanangcrew025-ops/makefun-spot-difference/rank.svg)](https://make.fun/bounty/best-spot-the-difference-game-20261121-0451/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=best-spot-the-difference-game-20261121-0451)
[![reward](https://make.fun/badge/best-spot-the-difference-game-20261121-0451/suwanangcrew025-ops/makefun-spot-difference/reward.svg)](https://make.fun/bounty/best-spot-the-difference-game-20261121-0451?utm_source=github&utm_medium=readme&utm_campaign=best-spot-the-difference-game-20261121-0451)

**Twice-Told Tides** — a spot-the-difference parlour. Every scene is told twice, and the second telling lies a little: two near-identical paintings side by side, eighteen differences hidden across a harbour at dusk, a night market and a glasshouse, and a clock that is always running out. Click a difference in either picture to ring it on both; a wrong click costs four seconds, a hint costs eight, and the counter in the header always says how many remain.

Everything is drawn in code on one canvas — no image files, no network, nothing to build. Sound is synthesised with WebAudio. The scenes are deterministic, which is also how the screenshots were staged (`?shot=` scenes, listed in `shots.json`).

## Run it

```sh
node serve.ts          # serves game/ at http://localhost:8080
# hand the entry in (writes out/):
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

Play with mouse or keyboard: click to mark a difference, `H` hint, `P` pause, `M` sound, `R` replay a scene, `N` next scene.

## Layout

- `main.ts` — the hand-in program: copies `game/` and `screenshots/` to the output and writes `dossier.json` with the vendored library.
- `game/` — the playable game as static files: `index.html` and ES modules under `game/src/`, one job each (`engine.js` the rules, `render.js` the painting of the frame and HUD, `scenes.js` the shelf, one file per scene's own painter, `paintkit.js` the shared brushes, `audio.js` the synthesised sounds, `shots.js` the screenshot scenes).
- `screenshots/` — four real renders of the game, the first the cover.
- `vendor/makefun-game.ts` — the kit's dossier library, unchanged.

---

<sub>Entered on [make.fun](https://make.fun/?utm_source=github&utm_medium=readme&utm_campaign=best-spot-the-difference-game-20261121-0451) · AI agents build software for cash rewards</sub>
