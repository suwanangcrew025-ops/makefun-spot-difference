// engine.js — the state of the hunt: which screen we are on, which scene is
// being told, what has been found, what the clock says, and what every click,
// key and hint does about it. The renderer only reads this state; the input
// layer only calls these methods. Every event also speaks its line into
// `status`, which the page mirrors into a screen-reader live region.

import { RULES, STAR_TIME_SHARE } from './config.js';
import { SCENES, sceneAt, differenceAt } from './scenes.js';

export class Game {
  constructor(sound) {
    this.sound = sound;
    this.screen = 'title'; // title | playing | paused | sceneDone | gameDone | timeUp
    this.sceneIndex = 0;
    this.found = new Set();
    this.timeLeft = 0;
    this.hintsLeft = RULES.hintsPerScene;
    this.hintsUsed = 0;
    this.misses = 0;
    this.effects = []; // sparks and ripples, in panel-local coordinates
    this.hintId = null; // the difference the hint ring is circling, if any
    this.hintTimeLeft = 0;
    this.gameTime = 0; // seconds of play, for pulses and other gentle motion
    this.results = []; // one record per finished scene
    this.status = 'Twice-Told Tides. Press Enter or click to begin.';
    this.frozen = false; // screenshot staging freezes the clock and the pulses
    this.stagePhase = 0.4; // the fixed pulse phase used while frozen
    this.lastTickSecond = -1;
  }

  get scene() {
    return sceneAt(this.sceneIndex);
  }

  remaining() {
    return this.scene.differences.length - this.found.size;
  }

  totalStars() {
    return this.results.reduce((sum, r) => sum + r.stars, 0);
  }

  announce(line) {
    this.status = line;
  }

  // From the title card into the first scene, with a clean set of results.
  startGame() {
    this.results = [];
    this.sound.wake();
    this.beginScene(0);
  }

  // Set a scene up fresh: full clock, full hints, nothing found.
  beginScene(index) {
    this.sceneIndex = index;
    const scene = this.scene;
    this.found = new Set();
    this.timeLeft = scene.timeLimit;
    this.hintsLeft = RULES.hintsPerScene;
    this.hintsUsed = 0;
    this.misses = 0;
    this.effects = [];
    this.hintId = null;
    this.hintTimeLeft = 0;
    this.lastTickSecond = -1;
    this.screen = 'playing';
    this.announce(
      `${scene.title}. ${scene.differences.length} differences hide between the two tellings. ${scene.timeLimit} seconds on the clock.`,
    );
  }

  // A click on one of the panels, in panel-local coordinates. `panel` is 0
  // for the left picture and 1 for the right; a difference found on either
  // telling counts on both.
  clickPanel(panel, x, y) {
    if (this.screen !== 'playing' || this.frozen) return;
    this.sound.wake();
    const scene = this.scene;
    const hit = differenceAt(scene, x, y);
    if (hit && !this.found.has(hit.id)) {
      this.found.add(hit.id);
      if (this.hintId === hit.id) {
        this.hintId = null;
        this.hintTimeLeft = 0;
      }
      this.effects.push({ kind: 'spark', x: hit.x, y: hit.y, panel: 'both', age: 0, life: 0.65 });
      this.sound.find();
      if (this.remaining() === 0) {
        this.completeScene();
      } else {
        this.announce(`Found: ${hit.label}. ${this.remaining()} to go.`);
      }
      return;
    }
    if (hit && this.found.has(hit.id)) {
      this.announce(`Already found: ${hit.label}. ${this.remaining()} to go.`);
      return;
    }
    // A miss: a ripple where the click fell, and seconds off the clock.
    this.misses += 1;
    this.effects.push({ kind: 'ripple', x, y, panel, age: 0, life: 0.55 });
    this.sound.miss();
    this.loseTime(RULES.missPenaltySeconds, `Not there — ${RULES.missPenaltySeconds} seconds slip away. ${this.remaining()} to go.`);
  }

  // Spend one hint: the clock pays, and a dashed ring circles the first
  // difference not yet found, on both tellings, for a few seconds.
  useHint() {
    if (this.screen !== 'playing' || this.frozen) return;
    if (this.hintsLeft <= 0) {
      this.announce('No hints left in this scene. Your eyes will have to do.');
      return;
    }
    const next = this.scene.differences.find((d) => !this.found.has(d.id));
    if (!next) return;
    this.hintsLeft -= 1;
    this.hintsUsed += 1;
    this.hintId = next.id;
    this.hintTimeLeft = RULES.hintSeconds;
    this.sound.hint();
    this.loseTime(RULES.hintPenaltySeconds, `A hint glimmers somewhere in the picture. ${RULES.hintPenaltySeconds} seconds for the glimmer; ${this.hintsLeft} hints left.`);
  }

  togglePause() {
    if (this.screen === 'playing') {
      this.screen = 'paused';
      this.announce('Paused. Press P to go back to the hunt.');
    } else if (this.screen === 'paused') {
      this.screen = 'playing';
      this.announce(`Back to ${this.scene.title}. ${this.remaining()} to go.`);
    }
  }

  restartScene() {
    if (this.screen === 'title') return;
    // Replaying a scene from its complete card takes its result back, so
    // finishing it again records one result, not two.
    if (this.screen === 'sceneDone') this.results.pop();
    this.beginScene(this.sceneIndex);
  }

  // From a scene-complete card: onward to the next telling, or, after the
  // last scene, to the game-complete card.
  nextScene() {
    if (this.screen !== 'sceneDone') return;
    if (this.sceneIndex + 1 >= SCENES.length) {
      this.screen = 'gameDone';
      this.sound.gameDone();
      this.announce(`The parlour is complete: ${this.totalStars()} of ${SCENES.length * 3} stars. Press R to play again.`);
    } else {
      this.beginScene(this.sceneIndex + 1);
    }
  }

  // The last difference of a scene is found: score it and show its card.
  completeScene() {
    const scene = this.scene;
    const stars =
      1 +
      (this.timeLeft >= scene.timeLimit * STAR_TIME_SHARE ? 1 : 0) +
      (this.hintsUsed === 0 ? 1 : 0);
    this.results.push({
      sceneId: scene.id,
      title: scene.title,
      stars,
      timeLeft: Math.ceil(this.timeLeft),
      misses: this.misses,
      hintsUsed: this.hintsUsed,
    });
    this.screen = 'sceneDone';
    this.sound.sceneDone();
    this.announce(
      `${scene.title} complete: all ${scene.differences.length} differences found, ${stars} of 3 stars. Press N for the next scene, or R to play this one again.`,
    );
  }

  // Take seconds off the clock and speak a line; running the clock out ends
  // the scene where it stands.
  loseTime(seconds, line) {
    this.timeLeft -= seconds;
    if (this.timeLeft <= 0) {
      this.timeLeft = 0;
      this.screen = 'timeUp';
      this.hintId = null;
      this.sound.timeUp();
      this.announce(`Out of time in ${this.scene.title}, with ${this.remaining()} still hidden. Press R to try the scene again.`);
    } else {
      this.announce(line);
    }
  }

  // Advance the clock, the hint ring and the effects. Called every frame;
  // while frozen (screenshot staging) nothing moves at all.
  update(dt) {
    if (this.frozen) return;
    if (this.screen !== 'title' && this.screen !== 'gameDone') {
      for (const fx of this.effects) fx.age += dt;
      this.effects = this.effects.filter((fx) => fx.age < fx.life);
    }
    if (this.screen !== 'playing') return;
    this.gameTime += dt;
    this.timeLeft -= dt;
    if (this.hintId) {
      this.hintTimeLeft -= dt;
      if (this.hintTimeLeft <= 0) {
        this.hintId = null;
        this.hintTimeLeft = 0;
      }
    }
    const whole = Math.ceil(this.timeLeft);
    if (this.timeLeft <= RULES.lowTimeWarning && this.timeLeft > 0 && whole !== this.lastTickSecond) {
      this.lastTickSecond = whole;
      this.sound.tick();
    }
    if (this.timeLeft <= 0) {
      this.timeLeft = 0;
      this.screen = 'timeUp';
      this.hintId = null;
      this.hintTimeLeft = 0;
      this.sound.timeUp();
      this.announce(`Out of time in ${this.scene.title}, with ${this.remaining()} still hidden. Press R to try the scene again.`);
    }
  }
}
