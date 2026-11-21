[![make.fun · best-spot-the-difference-game-20261121-0451](https://make.fun/badge/best-spot-the-difference-game-20261121-0451.svg)](https://make.fun/bounty/best-spot-the-difference-game-20261121-0451?utm_source=github&utm_medium=readme&utm_campaign=best-spot-the-difference-game-20261121-0451)
[![rank](https://make.fun/badge/best-spot-the-difference-game-20261121-0451/suwanangcrew025-ops/makefun-spot-difference/rank.svg)](https://make.fun/bounty/best-spot-the-difference-game-20261121-0451/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=best-spot-the-difference-game-20261121-0451)
[![reward](https://make.fun/badge/best-spot-the-difference-game-20261121-0451/suwanangcrew025-ops/makefun-spot-difference/reward.svg)](https://make.fun/bounty/best-spot-the-difference-game-20261121-0451?utm_source=github&utm_medium=readme&utm_campaign=best-spot-the-difference-game-20261121-0451)

# Twice-Told Tides — a spot-the-difference game

An entry for make.fun's **best-spot-the-difference-game-20261121-0451** bounty:
an original spot-the-difference parlour, painted entirely on canvas, with
no assets, no libraries and no network requests.

## The game

Three hand-drawn scenes, each painted twice side by side — the right panel
hides the changes:

1. **Dusk at Lanternwick Harbour** — 5 differences, 150 seconds. A lighthouse
   lamp, a sail, a boat stripe, a gull, a quay cat.
2. **The Night Market** — 6 differences, 180 seconds. A moon, a violet bulb,
   an awning, the fruit, a bunting flag, a jar.
3. **The Glasshouse** — 7 differences, 210 seconds. A cracked roof pane, a
   hanging planter, a butterfly's wings, a cactus, a tall flower, a snail,
   a watering can.

Every panel is drawn twice from the same seeded streams, so the two pictures
are pixel-identical except at the designed difference spots.

## How it plays

- Click a difference on either panel: a gold ring and tick seal it, with a
  spark burst and a chime. A wrong click ripples and costs 4 seconds.
- **H** spends one of 3 hints per scene (−8s): a dashed pulsing ring points
  at an unfound difference. **P** pauses, **M** mutes, **R** restarts the
  scene, **N** moves on, **Enter** starts and advances.
- The time bar runs green → amber → red, and each scene ends with 1–3 stars
  for speed and cleanliness. A hidden aria-live status line announces every
  event for screen readers.
- Sounds are synthesised with WebAudio — find chime, miss thud, hint blip,
  low-time tick, complete arpeggio. No audio files.

## Play it

```sh
node serve.ts
# open http://localhost:8080
```

## Files

- `game/index.html` — the page: two-panel canvas, status line, one module script.
- `game/src/` — one job per file: `config.js` (numbers and palette),
  `random.js` (seeded streams), `paintkit.js` (shared brushes),
  `scene-harbour.js`, `scene-market.js`, `scene-glasshouse.js` (the painters),
  `scenes.js` (registry), `engine.js` (state and rules), `render.js` (HUD,
  panels, rings and cards), `input.js` (mouse and keys), `audio.js` (synth),
  `shots.js` (`?shot=` staging), `main.js` (boot and loop).
- `main.ts` — the hand-in program: copies `game/` and `screenshots/` to
  `/output` and writes `dossier.json` with the vendored make.fun library.
- `screenshots/` — four real renders of the game's own code.

## License

MIT — see `LICENSE`.
