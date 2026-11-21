[![make.fun · best-spot-the-difference-game-20261121-0451](https://make.fun/badge/best-spot-the-difference-game-20261121-0451.svg)](https://make.fun/bounty/best-spot-the-difference-game-20261121-0451?utm_source=github&utm_medium=readme&utm_campaign=best-spot-the-difference-game-20261121-0451)
[![rank](https://make.fun/badge/best-spot-the-difference-game-20261121-0451/suwanangcrew025-ops/makefun-spot-difference/rank.svg)](https://make.fun/bounty/best-spot-the-difference-game-20261121-0451/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=best-spot-the-difference-game-20261121-0451)
[![reward](https://make.fun/badge/best-spot-the-difference-game-20261121-0451/suwanangcrew025-ops/makefun-spot-difference/reward.svg)](https://make.fun/bounty/best-spot-the-difference-game-20261121-0451?utm_source=github&utm_medium=readme&utm_campaign=best-spot-the-difference-game-20261121-0451)

# Twice-Told Tides

A spot-the-difference parlour. Every picture in it is told twice — once as it
was, once with something quietly changed — and the second telling is yours to
catch out. Three hand-drawn canvas scenes, eighteen differences between them,
one clock that never stops being polite about running out.

## The scenes

1. **Dusk at Lanternwick Harbour** — a lighthouse, a fishing boat, a cat on
   the quay. Five differences, 150 seconds.
2. **The Night Market** — three stalls under strings of lights and a full
   moon. Six differences, 180 seconds.
3. **The Glasshouse** — morning through a glass roof, benches of pots, a
   butterfly. Seven differences, 210 seconds.

Each scene is painted once by its own painter, which draws the scene and
takes an *altered set* naming which differences change form on the second
telling — so the two panels can only ever differ at the spots the game says
they do.

## How to play

- **Click** a difference on either panel to mark it: a gold ring and a tick
  seal appear on both tellings, with a small burst of sparks.
- A **miss** ripples where you clicked and costs **4 seconds**.
- **Hints** (3 per scene) cost **8 seconds** and circle a hidden difference
  with a dashed, turning ring until you find it.
- Finish a scene for one star; keep two-fifths of the clock for another;
  take no hint for the third.

| Key | Does |
| --- | --- |
| Enter | Begin · next scene · play again |
| H | Hint |
| P / Esc | Pause |
| M | Sound on/off |
| R | Restart scene |
| N | Next scene |

Every event is also announced in a screen-reader status line. All sound is
synthesised live with WebAudio — chimes, thuds, ticks, a small arpeggio —
there are no audio files.

## Run it

The game is static files under `game/` with no build step and no network
request: serve that folder with anything, or use the bundled dev server —

```
node serve.ts        # then open http://localhost:8080
```

— and open `game/index.html` in a desktop browser.

## How it is put together

`game/src/`, one job per file:

- `config.js` — the stage's measurements, timing rules and palette
- `random.js` — the seeded random source the painters texture with
- `paintkit.js` — shared brushes: skies, glows, gulls, the wooden frame
- `scene-harbour.js`, `scene-market.js`, `scene-glasshouse.js` — the three
  painters and their difference lists
- `scenes.js` — the scene book, in playing order
- `engine.js` — the hunt's state: clock, finds, misses, hints, stars
- `render.js` — the wall, the counter, the panels, the markers, the cards
- `input.js` — mouse and keyboard
- `audio.js` — the WebAudio sound kit
- `shots.js` — the `?shot=` staging that poses the screenshots
- `main.js` — the bootstrap and frame loop

## Handing it in

`main.ts` (Node 22, standard library only) copies `game/` and `screenshots/`
to the output directory and writes `dossier.json` with the vendored
`vendor/makefun-game.ts`, copied from the competition kit unchanged:

```
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

The screenshots in `screenshots/` are real renders of the game in headless
Chrome, posed with the queries in `shots.json`: a harbour hunt mid-course
(the cover), the night market, the glasshouse with a hint ring showing, and
the completion card.

Licensed under MIT (see `LICENSE`).
