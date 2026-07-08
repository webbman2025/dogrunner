import Phaser from 'phaser';
import {
  fetchHKWeatherSnapshot,
  getLocalClockDayOverlayAlpha,
  HK_WEATHER_EFFECTS,
  resolveHKWeatherEffect,
} from '../services/hkWeather.js';
import { queueGameAssets } from './queueGameAssets.js';

const WIDTH = 480;
const HEIGHT = 800;
const GROUND_SURFACE = 740;
const DOG_Y_OFFSET = 0;
const DOG_X = 100;
const BASE_SCROLL_SPEED = 220;
const GRAVITY_RISE = 1000;
const GRAVITY_FALL = 1600;
const GRAVITY_HOLD_RISE = 750;
const OBSTACLE_DISPLAY_H = 40;
const OBSTACLE_DISPLAY_W = Math.round((126 / 120) * OBSTACLE_DISPLAY_H);
const MUD_TEXTURE_W = 400;
const MUD_TEXTURE_H = 111;
const MUD_DISPLAY_H = 40;
const MUD_DISPLAY_W = Math.round((MUD_TEXTURE_W / MUD_TEXTURE_H) * MUD_DISPLAY_H);
const MUD_SLOW_FACTOR = 0.5;
const MUD_SPAWN_MIN_MS = 4000;
const MUD_SPAWN_MAX_MS = 6500;
const ROCK_SPAWN_INITIAL_MIN_MS = 1400;
const ROCK_SPAWN_INITIAL_MAX_MS = 2600;
const ROCK_SPAWN_MIN_MS = 2200;
const ROCK_SPAWN_MAX_MS = 4200;
const ROCK_SPAWN_MIN_FLOOR_MS = 1400;
const ROCK_SPAWN_MAX_FLOOR_MS = 2600;
const HAZARD_SPAWN_X = WIDTH + 40;
const HAZARD_MIN_GAP_PX = 100;
const HAZARD_RETRY_MS = 450;
const HEART_PICKUP_SPAWN_MIN_SCORE = 200;
const HEART_PICKUP_SPAWN_MAX_SCORE = 300;
const MAX_ACTIVE_HEART_PICKUPS = 2;
const HEART_PICKUP_SPAWN_X = WIDTH + 120;
const HEART_PICKUP_SIZE = 50;
const HEART_PICKUP_Y_MIN = 340;
const HEART_PICKUP_Y_MAX = 460;
const HEART_PICKUP_HITBOX = {
  x: 22,
  y: 18,
  w: 52,
  h: 46,
};
const HEART_PICKUP_COLLECT_PAD = 10;
const DOG_HEART_COLLECT_PAD = 8;
const COYOTE_MS = 130;
const GROUND_SNAP_TOLERANCE = 8;
const MIN_JUMP_VELOCITY = -720;
const MAX_JUMP_VELOCITY = -500;
const JUMP_HOLD_ACCEL = 1200;
const JUMP_CUT_FACTOR = 0.5;
const JUMP_CUT_VELOCITY_THRESHOLD = -80;
const JUMP_HOLD_DELAY_MS = 0;
const JUMP_CUT_MIN_HOLD_MS = 150;
const JUMP_AIR_BOOST_IMPULSE = 0.35;
const JUMP_AIR_BOOST_VELOCITY_CAP = -580;
const FALL_JUMP_VELOCITY = -630;
const FALL_JUMP_MIN_DESCENT_VELOCITY = 40;
const BG_TEXTURE_HEIGHT = 1024;
const PARALLAX_SKY = 0.3;
const PARALLAX_GROUND = 1;
const DOG_SCALE = 0.62;
const DOG_HITBOX = {
  x: 74,
  y: 200,
  w: 110,
  h: 52,
};
const DOG_HITBOX_INSET = {
  left: 6,
  right: 14,
  top: 0,
  bottom: 0,
};
const DOG_FRAME_H = 263;
const SLEEP_Y_OFFSET = 10;
const DOG_HITBOX_BOTTOM = DOG_HITBOX.y + DOG_HITBOX.h;
const DOG_RUN_GROUND_Y =
  GROUND_SURFACE + DOG_Y_OFFSET + (DOG_FRAME_H - DOG_HITBOX_BOTTOM) * DOG_SCALE;
const DOG_SLEEP_Y = DOG_RUN_GROUND_Y + SLEEP_Y_OFFSET;
// Bottom-anchored texture hitbox covering the poop pile, not flies or side padding.
const ROCK_FRAME_HITBOX_W = 76;
const ROCK_FRAME_HITBOX_H = 76;
const MUD_HITBOX = {
  x: 24,
  y: 72,
  w: 352,
  h: 32,
};
const DOG_SHADOW_DEPTH = -1;
const DOG_SHADOW_WIDTH = 120;
const DOG_SHADOW_HEIGHT = 14;
const DOG_SHADOW_Y_OFFSET = -30;
const ROCK_Y_OFFSET = DOG_SHADOW_Y_OFFSET;
const MUD_Y_OFFSET = -15;
const DOG_SHADOW_MAX_HEIGHT = 420;
const DOG_SHADOW_MIN_SCALE = 0.22;
const RAIN_BACK_DEPTH = 3;
const RAIN_FRONT_DEPTH = 9;
const STORM_OVERLAY_DEPTH = -4;
const DAY_OVERLAY_DEPTH = -3;
const THUNDER_FLASH_DEPTH = 15;
const DEV_MENU_DEPTH = 100;
const HEARTS_DEPTH = 20;
const MAX_HEARTS = 3;
const HEART_W = 32;
const HEART_H = 27;
const HEART_GAP = 10;
const HEARTS_PAD_X = 20;
const HEARTS_PAD_Y = 10;
const HEARTS_BG = 0xf3ddcd;
const HEARTS_BORDER = 0x6d5a55;
const HEARTS_BORDER_W = 2;
const HEARTS_HUD_Y = 45;
const SCORE_TEXT_Y = 73;
const HIT_COOLDOWN_MS = 1400;
const BUMP_SHAKE_DURATION = 160;
const BUMP_SHAKE_INTENSITY = 0.012;
const BUMP_SQUASH_X = 1.14;
const BUMP_SQUASH_Y = 0.84;
const DOG_FRAME_COUNTS = {
  run: 8,
  jump: 5,
  sleep: [0, 1, 3],
};

const WEATHER_MODES = {
  DRY: 'dry',
  RAIN: 'rain',
  STORM: 'storm',
};

const DAY_MODES = {
  DAY: 'day',
  NIGHT: 'night',
};

const SPEED_MULTIPLIERS = {
  normal: 1,
  fast: 2,
  faster: 4,
};

const DAY_NIGHT_CYCLE_NIGHT_AT = 500;
const DAY_NIGHT_CYCLE_PERIOD = 2000;
const DAY_NIGHT_FADE_RANGE = 350;
const DAY_OVERLAY_LERP_SPEED = 4;

const GHOST_RACE_ENABLED = true;
const GHOST_STORAGE_KEY = 'dogrunner-ghost-best-v4';
const GHOST_RACE_PREF_KEY = 'dogrunner-ghost-race-enabled';
const GHOST_FORMAT_VERSION = 4;
const GHOST_LEGACY_KEYS = [
  'dogrunner-ghost-library-v4',
  'dogrunner-ghost-best-v3',
  'dogrunner-ghost-best-v2',
  'dogrunner-ghost-best',
];
const GHOST_HIT_RUN_SCALE = 0.45;
const GHOST_FADE_MS = 900;
const GHOST_SAMPLE_INTERVAL_MS = 150;
const GHOST_ALPHA = 0.5;
const GHOST_TINT = 0x88ccff;
const GHOST_X_SHIFT_PER_SCORE = 0.35;
const GHOST_X_MIN = 40;
const GHOST_X_MAX = 160;
const GHOST_DEPTH = -0.5;

const COURSE_SEED = 0xd064755;
const COURSE_SCHEDULE_VERSION = 2;
const COURSE_MAX_MS = 10 * 60 * 1000;

function createSeededRng(seed) {
  let state = seed >>> 0;

  return {
    between(min, max) {
      state = (state + 0x6d2b79f5) >>> 0;
      let t = state;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      const unit = ((t ^ (t >>> 14)) >>> 0) / 4294967296;
      return min + Math.floor(unit * (max - min + 1));
    },
  };
}

function scrollSpeedAtScore(score, speedMultiplier) {
  const maxSpeed = 420 * speedMultiplier;
  const baseSpeed = BASE_SCROLL_SPEED * speedMultiplier;
  return Math.min(baseSpeed + score * 0.05 * speedMultiplier, maxSpeed);
}

function simHazardX(hazard, atT, speedMultiplier) {
  if (atT <= hazard.spawnT) {
    return hazard.spawnX;
  }

  let score = hazard.scoreAtSpawn;
  let t = hazard.spawnT;
  let x = hazard.spawnX;
  const step = 32;

  while (t < atT) {
    const dtMs = Math.min(step, atT - t);
    const dt = dtMs / 1000;
    const spd = scrollSpeedAtScore(score, speedMultiplier);
    x -= spd * dt;
    score += spd * dt * 0.1;
    t += dtMs;
  }

  return x;
}

function isSimHazardTooClose(spawnX, halfWidth, others, atT, speedMultiplier) {
  return others.some((other) => {
    const otherX = simHazardX(other, atT, speedMultiplier);
    return (
      Math.abs(spawnX - otherX) - halfWidth - other.halfWidth < HAZARD_MIN_GAP_PX
    );
  });
}

function pruneSimHazards(hazards, atT, speedMultiplier) {
  return hazards.filter((hazard) => simHazardX(hazard, atT, speedMultiplier) > -200);
}

function buildCourseSchedule(speedMultiplier) {
  const rng = createSeededRng(COURSE_SEED);
  const events = [];
  const rocks = [];
  const muds = [];
  const state = { t: 0, score: 0 };

  let rockTimer = rng.between(ROCK_SPAWN_INITIAL_MIN_MS, ROCK_SPAWN_INITIAL_MAX_MS);
  let mudTimer = rng.between(2000, 3500);
  let heartScoreTarget = rng.between(
    HEART_PICKUP_SPAWN_MIN_SCORE,
    HEART_PICKUP_SPAWN_MAX_SCORE,
  );

  while (state.t < COURSE_MAX_MS) {
    const step = Math.max(1, Math.min(rockTimer, mudTimer, 50));
    const dt = step / 1000;
    const spd = scrollSpeedAtScore(state.score, speedMultiplier);
    state.score += spd * dt * 0.1;
    state.t += step;
    rockTimer -= step;
    mudTimer -= step;

    while (state.score >= heartScoreTarget) {
      events.push({
        type: 'heart',
        t: state.t,
        baseY: rng.between(HEART_PICKUP_Y_MIN, HEART_PICKUP_Y_MAX),
      });
      heartScoreTarget += rng.between(
        HEART_PICKUP_SPAWN_MIN_SCORE,
        HEART_PICKUP_SPAWN_MAX_SCORE,
      );
    }

    if (rockTimer <= 0) {
      const activeMud = pruneSimHazards(muds, state.t, speedMultiplier);
      if (
        isSimHazardTooClose(
          HAZARD_SPAWN_X,
          OBSTACLE_DISPLAY_W / 2,
          activeMud,
          state.t,
          speedMultiplier,
        )
      ) {
        rockTimer = HAZARD_RETRY_MS;
      } else {
        events.push({ type: 'rock', t: state.t });
        rocks.push({
          spawnT: state.t,
          spawnX: HAZARD_SPAWN_X,
          halfWidth: OBSTACLE_DISPLAY_W / 2,
          scoreAtSpawn: state.score,
        });
        const minGap = Phaser.Math.Clamp(
          ROCK_SPAWN_MIN_MS - state.score,
          ROCK_SPAWN_MIN_FLOOR_MS,
          ROCK_SPAWN_MIN_MS,
        );
        const maxGap = Phaser.Math.Clamp(
          ROCK_SPAWN_MAX_MS - state.score,
          ROCK_SPAWN_MAX_FLOOR_MS,
          ROCK_SPAWN_MAX_MS,
        );
        rockTimer = rng.between(minGap, maxGap);
      }
    }

    if (mudTimer <= 0) {
      const activeRocks = pruneSimHazards(rocks, state.t, speedMultiplier);
      if (
        isSimHazardTooClose(
          HAZARD_SPAWN_X,
          MUD_DISPLAY_W / 2,
          activeRocks,
          state.t,
          speedMultiplier,
        )
      ) {
        mudTimer = HAZARD_RETRY_MS;
      } else {
        events.push({ type: 'mud', t: state.t });
        muds.push({
          spawnT: state.t,
          spawnX: HAZARD_SPAWN_X,
          halfWidth: MUD_DISPLAY_W / 2,
          scoreAtSpawn: state.score,
        });
        mudTimer = rng.between(MUD_SPAWN_MIN_MS, MUD_SPAWN_MAX_MS);
      }
    }
  }

  events.sort((a, b) => a.t - b.t);
  return events;
}

const courseScheduleCache = new Map();

function getCourseSchedule(speedMultiplier) {
  const cacheKey = `${COURSE_SCHEDULE_VERSION}:${speedMultiplier}`;
  if (!courseScheduleCache.has(cacheKey)) {
    courseScheduleCache.set(cacheKey, buildCourseSchedule(speedMultiplier));
  }

  return courseScheduleCache.get(cacheKey);
}

function resetCourseScheduleRuntimeState(schedule) {
  for (const event of schedule) {
    delete event.spawned;
  }
}

export default class GameScene extends Phaser.Scene {
  static devWeather = WEATHER_MODES.DRY;
  static devDay = DAY_MODES.DAY;
  static devDayNightCycle = 'on';
  static devSpeed = 'fast';
  static devGhostRace = 'off';
  static devHKWeather = 'off';

  constructor() {
    super('GameScene');
  }

  init(data) {
    this.launchGhostRace = typeof data?.ghostRace === 'boolean' ? data.ghostRace : null;
  }

  preload() {
    queueGameAssets(this.load, this.textures);
  }

  createHeartsHud() {
    this.heartsHud?.destroy(true);

    const hudWidth = HEARTS_PAD_X * 2 + HEART_W * MAX_HEARTS + HEART_GAP * (MAX_HEARTS - 1);
    const hudHeight = HEARTS_PAD_Y * 2 + HEART_H;
    const radius = hudHeight / 2;

    this.heartsHud = this.add.container(WIDTH / 2, HEARTS_HUD_Y).setScrollFactor(0).setDepth(HEARTS_DEPTH);

    const bg = this.make.graphics({ add: false });
    bg.fillStyle(HEARTS_BG, 1);
    bg.lineStyle(HEARTS_BORDER_W, HEARTS_BORDER, 1);
    bg.fillRoundedRect(-hudWidth / 2, -hudHeight / 2, hudWidth, hudHeight, radius);
    bg.strokeRoundedRect(-hudWidth / 2, -hudHeight / 2, hudWidth, hudHeight, radius);
    this.heartsHud.add(bg);

    this.heartIcons = [];
    const startX = -hudWidth / 2 + HEARTS_PAD_X + HEART_W / 2;

    for (let i = 0; i < MAX_HEARTS; i++) {
      const heart = this.make.image({
        x: startX + i * (HEART_W + HEART_GAP),
        y: 0,
        key: 'heart-full',
        add: false,
      });
      heart.setDisplaySize(HEART_W, HEART_H);
      this.heartsHud.add(heart);
      this.heartIcons.push(heart);
    }
  }

  resetHeartIcon(icon) {
    this.tweens.killTweensOf(icon);
    icon.setDisplaySize(HEART_W, HEART_H);
  }

  updateHeartsHud() {
    for (let i = 0; i < MAX_HEARTS; i++) {
      const icon = this.heartIcons[i];
      icon.setTexture(i < this.hearts ? 'heart-full' : 'heart-empty');
      this.resetHeartIcon(icon);
    }
  }

  playHeartCollectFeedback() {
    const index = this.hearts - 1;
    if (index < 0 || index >= this.heartIcons.length) {
      return;
    }

    const icon = this.heartIcons[index];
    this.resetHeartIcon(icon);

    this.tweens.add({
      targets: icon,
      displayWidth: HEART_W * 1.15,
      displayHeight: HEART_H * 1.15,
      duration: 120,
      yoyo: true,
      onComplete: () => {
        this.resetHeartIcon(icon);
      },
    });
  }

  isHeartPickupInRange(pickup) {
    if (!pickup.active) {
      return false;
    }

    const dogBody = this.dog.body;
    const heart = pickup.getBounds();
    const dogPad = DOG_HEART_COLLECT_PAD;
    const heartPad = HEART_PICKUP_COLLECT_PAD;

    if (dogBody) {
      const bodyHit =
        dogBody.left - dogPad < heart.right + heartPad &&
        dogBody.right + dogPad > heart.left - heartPad &&
        dogBody.top - dogPad < heart.bottom + heartPad &&
        dogBody.bottom + dogPad > heart.top - heartPad;

      if (bodyHit) {
        return true;
      }
    }

    const dog = this.dog.getBounds();

    return (
      dog.left - dogPad < heart.right + heartPad &&
      dog.right + dogPad > heart.left - heartPad &&
      dog.top - dogPad < heart.bottom + heartPad &&
      dog.bottom + dogPad > heart.top - heartPad
    );
  }

  checkHeartPickups() {
    if (this.isGameOver) {
      return;
    }

    this.physics.overlap(this.dog, this.heartPickups, (_dog, pickup) => {
      this.collectHeart(pickup);
    });

    const pickups = [...this.heartPickups.getChildren()];
    pickups.forEach((pickup) => {
      if (this.isHeartPickupInRange(pickup)) {
        this.collectHeart(pickup);
      }
    });
  }

  collectHeart(pickup) {
    if (!pickup.active || pickup.getData('collected')) {
      return;
    }

    pickup.setData('collected', true);
    pickup.destroy();

    if (this.hearts < MAX_HEARTS) {
      this.hearts = Math.min(this.hearts + 1, MAX_HEARTS);
      this.updateHeartsHud();
      this.playHeartCollectFeedback();
    }
  }

  loadGhostRaceEnabled() {
    try {
      const value = localStorage.getItem(GHOST_RACE_PREF_KEY);
      if (value === 'on') {
        return true;
      }
      if (value === 'off') {
        return false;
      }
    } catch {
      // Ignore storage errors.
    }

    return false;
  }

  saveGhostRaceEnabled(enabled) {
    try {
      localStorage.setItem(GHOST_RACE_PREF_KEY, enabled ? 'on' : 'off');
    } catch {
      // Ignore storage errors.
    }
  }

  startGameplay() {
    if (this.hasStarted) {
      return;
    }

    this.hasStarted = true;

    const now = this.time.now;
    this.ghostRunStartTime = now;
    this.lastGhostSampleTime = 0;
    this.ghostRunSamples = [];
    this.resetGhostFadeState();
    this.ghostLastHearts = MAX_HEARTS;
    this.assignCourseSchedule(this.speedMultiplier);
    this.physics.resume();
  }

  playCollisionBump() {
    this.cameras.main.shake(BUMP_SHAKE_DURATION, BUMP_SHAKE_INTENSITY);

    this.tweens.killTweensOf(this.dog);
    this.dog.setAlpha(1);
    this.dog.setScale(DOG_SCALE);

    this.tweens.add({
      targets: this.dog,
      scaleX: DOG_SCALE * BUMP_SQUASH_X,
      scaleY: DOG_SCALE * BUMP_SQUASH_Y,
      duration: 80,
      yoyo: true,
      ease: 'Quad.easeOut',
    });

    this.tweens.add({
      targets: this.dog,
      alpha: 0.35,
      duration: 90,
      yoyo: true,
      repeat: 2,
    });
  }

  createDogAnimations() {
    const runFrames = Array.from({ length: DOG_FRAME_COUNTS.run }, (_, i) => ({ key: `run_${i}` }));
    const sleepFrames = DOG_FRAME_COUNTS.sleep.map((i) => ({ key: `sleep_${i}` }));

    this.anims.create({
      key: 'run',
      frames: runFrames,
      frameRate: 12,
      repeat: -1,
    });

    this.anims.create({
      key: 'jump_launch',
      frames: [{ key: 'jump_0' }],
      frameRate: 14,
      repeat: 0,
    });

    this.anims.create({
      key: 'dead',
      frames: sleepFrames,
      frameRate: 8,
      repeat: -1,
    });
  }

  setupDogPhysics() {
    this.dog.body.setSize(
      DOG_HITBOX.w - DOG_HITBOX_INSET.left - DOG_HITBOX_INSET.right,
      DOG_HITBOX.h - DOG_HITBOX_INSET.top - DOG_HITBOX_INSET.bottom,
    );
    this.dog.body.setOffset(
      DOG_HITBOX.x + DOG_HITBOX_INSET.left,
      DOG_HITBOX.y + DOG_HITBOX_INSET.top,
    );
    this.dog.refreshBody();
  }

  setupRockPhysics(rock) {
    rock.body.setSize(ROCK_FRAME_HITBOX_W, ROCK_FRAME_HITBOX_H);
    rock.body.setOffset(
      (rock.frame.width - ROCK_FRAME_HITBOX_W) / 2,
      rock.frame.height - ROCK_FRAME_HITBOX_H,
    );
    rock.refreshBody();
  }

  isDogOnGround() {
    if (!this.dog?.body) {
      return false;
    }

    return (
      this.dog.body.blocked.down ||
      this.dog.body.touching.down ||
      Math.abs(this.dog.y - DOG_RUN_GROUND_Y) <= GROUND_SNAP_TOLERANCE
    );
  }

  isRockHittingDog(rock) {
    if (!rock.active || !this.dog.body || !rock.body) {
      return false;
    }

    const dog = this.dog.body;
    const rockBody = rock.body;

    return (
      dog.left < rockBody.right &&
      dog.right > rockBody.left &&
      dog.top < rockBody.bottom &&
      dog.bottom > rockBody.top
    );
  }

  checkRockCollisions() {
    if (this.isGameOver || this.hitCooldownMs > 0) {
      return;
    }

    for (const rock of this.obstacles.getChildren()) {
      if (this.isRockHittingDog(rock)) {
        this.handleCollision(this.dog, rock);
        return;
      }
    }
  }

  setupMudPhysics(mud) {
    mud.body.setSize(MUD_HITBOX.w, MUD_HITBOX.h);
    mud.body.setOffset(MUD_HITBOX.x, MUD_HITBOX.y);
    mud.refreshBody();
  }

  getHazardClearance(spawnX, spawnHalfWidth, other) {
    const otherHalfWidth = other.displayWidth / 2;
    return Math.abs(spawnX - other.x) - spawnHalfWidth - otherHalfWidth;
  }

  isHazardTooClose(spawnX, displayWidth, others) {
    const halfWidth = displayWidth / 2;
    return others.getChildren().some(
      (other) => this.getHazardClearance(spawnX, halfWidth, other) < HAZARD_MIN_GAP_PX,
    );
  }

  setupHeartPickupPhysics(pickup) {
    pickup.body.setSize(HEART_PICKUP_HITBOX.w, HEART_PICKUP_HITBOX.h);
    pickup.body.setOffset(HEART_PICKUP_HITBOX.x, HEART_PICKUP_HITBOX.y);
    pickup.refreshBody();
  }

  spawnHeartPickupsFromEvent(event) {
    const pickup = this.heartPickups.create(
      HEART_PICKUP_SPAWN_X,
      event.baseY,
      'heart-pickup',
    );
    pickup.setOrigin(0.5, 0.5);
    pickup.setDisplaySize(HEART_PICKUP_SIZE, HEART_PICKUP_SIZE);
    pickup.setDepth(4);
    this.setupHeartPickupPhysics(pickup);
  }

  getActiveHeartPickupCount() {
    return this.heartPickups?.countActive(true) ?? 0;
  }

  trySpawnCourseEvent(event) {
    if (event.type === 'rock') {
      return this.spawnRock();
    }

    if (event.type === 'mud') {
      return this.spawnMud();
    }

    if (event.type === 'heart') {
      this.spawnHeartPickupsFromEvent(event);
      return true;
    }

    return true;
  }

  processCourseSpawns(elapsed) {
    let i = this.courseSpawnIndex;

    while (i < this.courseSchedule.length && this.courseSchedule[i].t <= elapsed) {
      if (this.courseSpawnedIndices.has(i)) {
        i++;
        continue;
      }

      const event = this.courseSchedule[i];

      if (
        event.type === 'heart' &&
        this.getActiveHeartPickupCount() >= MAX_ACTIVE_HEART_PICKUPS
      ) {
        this.courseSpawnedIndices.add(i);
        i++;
        continue;
      }

      if (!this.trySpawnCourseEvent(event)) {
        break;
      }

      this.courseSpawnedIndices.add(i);
      i++;
    }

    this.courseSpawnIndex = i;
  }

  assignCourseSchedule(speedMultiplier) {
    this.courseSchedule = getCourseSchedule(speedMultiplier);
    resetCourseScheduleRuntimeState(this.courseSchedule);
    this.courseSpawnIndex = 0;
    this.courseSpawnedIndices = new Set();
  }

  createDogShadow() {
    this.dogShadow = this.add.ellipse(
      DOG_X,
      GROUND_SURFACE + DOG_SHADOW_Y_OFFSET,
      DOG_SHADOW_WIDTH,
      DOG_SHADOW_HEIGHT,
      0x000000,
      0.36,
    );
    this.dogShadow.setDepth(DOG_SHADOW_DEPTH);
    this.dogShadow.setOrigin(0.5, 0.5);
  }

  updateDogShadow() {
    if (!this.dogShadow || !this.dog) {
      return;
    }

    const heightAboveGround = Phaser.Math.Clamp(GROUND_SURFACE - this.dog.y, 0, DOG_SHADOW_MAX_HEIGHT);
    const lift = heightAboveGround / DOG_SHADOW_MAX_HEIGHT;
    const scale = Phaser.Math.Linear(1, DOG_SHADOW_MIN_SCALE, lift);

    this.dogShadow.setPosition(this.dog.x, GROUND_SURFACE + DOG_SHADOW_Y_OFFSET);
    this.dogShadow.setScale(scale, scale * 0.85);
    this.dogShadow.setAlpha(Phaser.Math.Linear(0.86, 0.14, lift));
  }

  isGhostRaceActive() {
    return GHOST_RACE_ENABLED && this.ghostRaceEnabled;
  }

  shouldShowGhost() {
    return (
      this.isGhostRaceActive() &&
      this.ghostBestAtRunStart?.samples?.length >= 2
    );
  }

  isValidGhostRecording(data) {
    return (
      data &&
      typeof data.finalScore === 'number' &&
      Array.isArray(data.samples) &&
      data.samples.length >= 2 &&
      typeof data.samples[0].runScale === 'number' &&
      typeof data.samples[0].hearts === 'number'
    );
  }

  normalizeGhostRecording(data) {
    if (!this.isValidGhostRecording(data)) {
      return null;
    }

    return {
      v: GHOST_FORMAT_VERSION,
      finalScore: data.finalScore,
      durationMs: data.durationMs ?? 0,
      deathT: data.deathT ?? this.findGhostDeathTime(data.samples),
      samples: data.samples,
    };
  }

  migrateLegacyGhostBest() {
    for (const key of GHOST_LEGACY_KEYS) {
      try {
        const raw = localStorage.getItem(key);
        if (!raw) {
          continue;
        }

        const data = JSON.parse(raw);
        if (Array.isArray(data?.replays) && data.replays.length > 0) {
          const best = [...data.replays].sort((a, b) => b.finalScore - a.finalScore)[0];
          const recording = this.normalizeGhostRecording({
            finalScore: best.finalScore,
            durationMs: best.durationMs,
            deathT: best.deathT,
            samples: best.samples,
          });
          if (recording) {
            this.saveGhostBest(recording);
            localStorage.removeItem(key);
            return recording;
          }
        }

        const recording = this.normalizeGhostRecording(data);
        if (recording) {
          this.saveGhostBest(recording);
          localStorage.removeItem(key);
          return recording;
        }
      } catch {
        // Try next legacy key.
      }
    }

    return null;
  }

  loadGhostBest() {
    if (!GHOST_RACE_ENABLED) {
      return null;
    }

    try {
      const raw = localStorage.getItem(GHOST_STORAGE_KEY);
      if (raw) {
        const data = JSON.parse(raw);
        if (data?.v === GHOST_FORMAT_VERSION) {
          const recording = this.normalizeGhostRecording(data);
          if (recording) {
            return recording;
          }
        }
      }

      return this.migrateLegacyGhostBest();
    } catch {
      return null;
    }
  }

  saveGhostBest(data) {
    if (!GHOST_RACE_ENABLED || !data?.samples?.length) {
      return;
    }

    try {
      localStorage.setItem(GHOST_STORAGE_KEY, JSON.stringify(data));
    } catch {
      // Ignore quota / private-mode storage errors.
    }
  }

  clearGhostBest() {
    try {
      localStorage.removeItem(GHOST_STORAGE_KEY);
      for (const key of GHOST_LEGACY_KEYS) {
        localStorage.removeItem(key);
      }
    } catch {
      // Ignore storage errors.
    }

    this.ghostBest = null;
    this.ghostBestAtRunStart = null;
    this.ghostDog?.setVisible(false);
  }

  snapshotGhostForRunStart(recording) {
    if (!recording) {
      return null;
    }

    return {
      finalScore: recording.finalScore,
      deathT: recording.deathT ?? this.findGhostDeathTime(recording.samples),
      samples: [...recording.samples],
    };
  }

  applyGhostForNewRun() {
    this.ghostBest = this.loadGhostBest();
    this.ghostBestAtRunStart =
      this.isGhostRaceActive() && this.ghostBest
        ? this.snapshotGhostForRunStart(this.ghostBest)
        : null;
  }

  setGhostRace(enabled) {
    this.ghostRaceEnabled = enabled;
    this.saveGhostRaceEnabled(enabled);
    GameScene.devGhostRace = enabled ? 'on' : 'off';
    this.refreshDevMenu();
    this.applyGhostForNewRun();

    if (!enabled) {
      this.ghostDog?.setVisible(false);
    }

    if (this.hasStarted && !this.isGameOver) {
      this.updateGhostRace(this.time.now);
    }
  }

  createGhostDog() {
    this.ghostDog = this.add.sprite(DOG_X, DOG_RUN_GROUND_Y, 'run_0');
    this.ghostDog.setOrigin(0.5, 1);
    this.ghostDog.setScale(DOG_SCALE);
    this.ghostDog.setDepth(GHOST_DEPTH);
    this.ghostDog.setAlpha(GHOST_ALPHA);
    this.ghostDog.setTint(GHOST_TINT);
    this.ghostDog.play('run');
    this.ghostDog.setVisible(false);
  }

  recordGhostSample(time, force = false) {
    if (!this.hasStarted || this.isGameOver) {
      return;
    }

    if (!force && time - this.lastGhostSampleTime < GHOST_SAMPLE_INTERVAL_MS) {
      return;
    }

    this.lastGhostSampleTime = time;
    const inMud = this.isDogOnGround() && this.physics.overlap(this.dog, this.mudPatches);
    const inHit = this.hitCooldownMs > 0;
    let runScale = inMud ? MUD_SLOW_FACTOR : 1;
    if (inHit) {
      runScale *= GHOST_HIT_RUN_SCALE;
    }

    this.ghostRunSamples.push({
      t: time - this.ghostRunStartTime,
      score: Math.floor(this.score),
      y: this.dog.y,
      tex: this.dog.texture.key,
      mud: inMud,
      runScale,
      hit: inHit,
      hearts: this.hearts,
    });
  }

  findGhostDeathTime(samples) {
    if (!samples?.length) {
      return null;
    }

    for (const sample of samples) {
      if (sample.hearts <= 0) {
        return sample.t;
      }
    }

    return null;
  }

  getGhostHeartsAt(samples, elapsed) {
    const hearts = this.getGhostHeldValueAt(samples, elapsed, 'hearts');
    return typeof hearts === 'number' ? hearts : MAX_HEARTS;
  }

  getGhostHeldValueAt(samples, elapsed, key) {
    if (!samples?.length) {
      return key === 'score' ? 0 : null;
    }

    let value = samples[0][key];
    for (let i = 0; i < samples.length; i++) {
      if (samples[i].t <= elapsed) {
        value = samples[i][key];
      } else {
        break;
      }
    }

    return value;
  }

  resetGhostFadeState() {
    this.ghostFadeStarted = false;
    this.ghostFadedOut = false;
    this.ghostLastHearts = MAX_HEARTS;
    this.tweens.killTweensOf(this.ghostDog);
    if (this.ghostDog) {
      this.ghostDog.setAlpha(GHOST_ALPHA);
      this.ghostDog.setVisible(false);
    }
  }

  startGhostFadeOut() {
    if (!this.ghostDog || this.ghostFadeStarted) {
      return;
    }

    this.ghostFadeStarted = true;
    this.tweens.killTweensOf(this.ghostDog);

    this.tweens.add({
      targets: this.ghostDog,
      alpha: 0,
      duration: GHOST_FADE_MS,
      ease: 'Quad.easeIn',
      onComplete: () => {
        this.ghostFadedOut = true;
        this.ghostDog?.setVisible(false);
      },
    });
  }

  getGhostValueAt(samples, elapsed, key) {
    if (!samples?.length) {
      return key === 'score' ? 0 : null;
    }

    if (elapsed <= samples[0].t) {
      return samples[0][key];
    }

    const last = samples[samples.length - 1];
    if (elapsed >= last.t) {
      return last[key];
    }

    for (let i = 0; i < samples.length - 1; i++) {
      const a = samples[i];
      const b = samples[i + 1];
      if (elapsed >= a.t && elapsed <= b.t) {
        if (key === 'y' || key === 'runScale') {
          const t = (elapsed - a.t) / (b.t - a.t);
          const aVal = a[key] ?? (key === 'runScale' ? 1 : 0);
          const bVal = b[key] ?? (key === 'runScale' ? 1 : 0);
          return Phaser.Math.Linear(aVal, bVal, t);
        }

        if (key === 'hit' || key === 'mud') {
          return a[key] || b[key];
        }

        if (key === 'hearts') {
          return elapsed - a.t < b.t - elapsed ? a[key] : b[key];
        }

        return elapsed - a.t < b.t - elapsed ? a[key] : b[key];
      }
    }

    return last[key];
  }

  playGhostCollisionBump() {
    if (!this.ghostDog?.visible) {
      return;
    }

    this.tweens.killTweensOf(this.ghostDog);
    this.ghostDog.setAlpha(GHOST_ALPHA);
    this.ghostDog.setScale(DOG_SCALE);

    this.tweens.add({
      targets: this.ghostDog,
      scaleX: DOG_SCALE * BUMP_SQUASH_X,
      scaleY: DOG_SCALE * BUMP_SQUASH_Y,
      duration: 80,
      yoyo: true,
      ease: 'Quad.easeOut',
    });

    this.tweens.add({
      targets: this.ghostDog,
      alpha: GHOST_ALPHA * 0.45,
      duration: 90,
      yoyo: true,
      repeat: 2,
    });
  }

  updateGhostVisual(tex, runScale = 1) {
    if (!this.ghostDog) {
      return;
    }

    const isJump = tex?.startsWith('jump_');

    if (isJump) {
      if (this.ghostDog.texture.key !== tex) {
        this.ghostDog.setTexture(tex);
      }
      this.ghostDog.anims.stop();
      return;
    }

    if (
      this.ghostDog.texture.key.startsWith('jump_') ||
      !this.ghostDog.anims.isPlaying ||
      this.ghostDog.anims.currentAnim?.key !== 'run'
    ) {
      this.ghostDog.play('run', true);
    }

    this.ghostDog.anims.timeScale = runScale;
  }

  getGhostPlaybackRunScale(samples, elapsed) {
    const ghostMud = Boolean(this.getGhostValueAt(samples, elapsed, 'mud'));
    const ghostHit = Boolean(this.getGhostValueAt(samples, elapsed, 'hit'));
    let runScale = this.getGhostValueAt(samples, elapsed, 'runScale');

    if (typeof runScale !== 'number') {
      runScale = ghostMud ? MUD_SLOW_FACTOR : 1;
    }

    if (ghostMud && runScale > MUD_SLOW_FACTOR) {
      runScale = MUD_SLOW_FACTOR;
    }

    if (ghostHit) {
      runScale = Math.min(runScale, GHOST_HIT_RUN_SCALE);
    }

    return runScale;
  }

  updateGhostRace(time) {
    if (!this.ghostDog) {
      return;
    }

    if (!this.shouldShowGhost() || !this.hasStarted || this.isGameOver) {
      this.ghostDog.setVisible(false);
      return;
    }

    const elapsed = time - this.ghostRunStartTime;
    const samples = this.ghostBestAtRunStart.samples;
    const deathT = this.ghostBestAtRunStart.deathT;
    const ghostHearts = this.getGhostHeartsAt(samples, elapsed);

    if (deathT != null && elapsed >= deathT && ghostHearts <= 0) {
      this.startGhostFadeOut();
    }

    if (this.ghostFadedOut) {
      return;
    }

    if (this.ghostFadeStarted) {
      return;
    }

    const ghostScore = this.getGhostHeldValueAt(samples, elapsed, 'score') ?? 0;
    const ghostY = this.getGhostValueAt(samples, elapsed, 'y') ?? DOG_RUN_GROUND_Y;
    const ghostTex = this.getGhostHeldValueAt(samples, elapsed, 'tex') ?? 'run_0';
    const ghostRunScale = this.getGhostPlaybackRunScale(samples, elapsed);
    const delta = Math.floor(this.score) - ghostScore;

    if (ghostHearts < this.ghostLastHearts) {
      this.playGhostCollisionBump();
    }
    this.ghostLastHearts = ghostHearts;

    this.ghostDog.setVisible(true);
    this.ghostDog.x = Phaser.Math.Clamp(
      DOG_X - delta * GHOST_X_SHIFT_PER_SCORE,
      GHOST_X_MIN,
      GHOST_X_MAX,
    );
    this.ghostDog.y = ghostY;
    this.updateGhostVisual(ghostTex, ghostRunScale);
  }

  finalizeGhostRecording(time) {
    if (!GHOST_RACE_ENABLED || !this.hasStarted) {
      return;
    }

    this.recordGhostSample(time);

    const recording = {
      v: GHOST_FORMAT_VERSION,
      finalScore: Math.floor(this.score),
      durationMs: Math.max(0, time - this.ghostRunStartTime),
      deathT: this.findGhostDeathTime(this.ghostRunSamples),
      samples: [...this.ghostRunSamples],
    };

    if (recording.samples.length < 2) {
      return;
    }

    if (!this.ghostBest || recording.finalScore >= this.ghostBest.finalScore) {
      this.saveGhostBest(recording);
      this.ghostBest = recording;
    }
  }

  updateDogAnimation(onGround) {
    if (this.isGameOver) {
      return;
    }

    const rising = this.dog.body.velocity.y < -30;
    const grounded = onGround && !rising;

    if (grounded) {
      this.wasAirborne = false;
      this.jumpPhase = null;

      if (
        this.dog.texture.key.startsWith('jump_') ||
        !this.dog.anims.isPlaying ||
        this.dog.anims.currentAnim?.key !== 'run'
      ) {
        this.dog.play('run', true);
      }
      return;
    }
    const holdingJump = rising && this.isJumpInputHeld();

    if (!this.wasAirborne) {
      this.wasAirborne = true;
      this.jumpPhase = rising ? 'hold' : 'fall';
      this.dog.setTexture(rising ? 'jump_1' : 'jump_2');
      this.dog.anims.stop();
      return;
    }

    if (this.jumpPhase === 'launch') {
      if (this.dog.anims.isPlaying) {
        return;
      }

      if (holdingJump) {
        this.jumpPhase = 'hold';
        this.dog.setTexture('jump_1');
        this.dog.anims.stop();
      } else {
        this.jumpPhase = 'fall';
        this.dog.setTexture('jump_2');
        this.dog.anims.stop();
      }
      return;
    }

    if (this.jumpPhase === 'hold') {
      if (holdingJump) {
        if (this.dog.texture.key !== 'jump_1') {
          this.dog.setTexture('jump_1');
          this.dog.anims.stop();
        }
        return;
      }

      this.jumpPhase = 'fall';
      this.dog.setTexture('jump_2');
      this.dog.anims.stop();
      return;
    }

    if (this.jumpPhase === 'fall' && this.dog.texture.key !== 'jump_2') {
      this.dog.setTexture('jump_2');
      this.dog.anims.stop();
    }
  }

  getSpeedMultiplier() {
    return SPEED_MULTIPLIERS[GameScene.devSpeed] ?? 1;
  }

  applyWeatherMode() {
    const mode = GameScene.devWeather;
    const showRain = mode !== WEATHER_MODES.DRY;
    const enableThunder = mode === WEATHER_MODES.STORM;

    this.cameras.main.setBackgroundColor(this.liveSkyColor ?? '#87ceeb');

    this.rainBackGfx?.setVisible(showRain);
    this.rainFrontGfx?.setVisible(showRain);
    this.stormOverlay?.setVisible(showRain);

    const thunderTargets = [this.thunderFlash, this.thunderGlow, this.stormOverlay].filter(Boolean);
    if (thunderTargets.length) {
      this.tweens.killTweensOf(thunderTargets);
    }

    this.thunderFlash?.setAlpha(0);
    this.thunderGlow?.setAlpha(0);
    this.thunderBoost = 0;

    if (!showRain) {
      this.rainBackGfx?.clear();
      this.rainFrontGfx?.clear();
      this.stormOverlay?.setAlpha(0);
      this.nextThunderTime = Number.POSITIVE_INFINITY;
      this.refreshDevMenu();
      return;
    }

    if (enableThunder) {
      this.scheduleNextThunder(1200);
    } else {
      this.nextThunderTime = Number.POSITIVE_INFINITY;
      this.stormOverlay?.setAlpha(0.55);
    }

    this.refreshDevMenu();
  }

  setWeatherMode(mode, { manual = true } = {}) {
    GameScene.devWeather = mode;
    if (manual) {
      this.weatherManualOverride = true;
      GameScene.devHKWeather = 'off';
    }
    this.applyWeatherMode();
  }

  setHKWeatherLive(enabled) {
    GameScene.devHKWeather = enabled ? 'on' : 'off';

    if (enabled) {
      this.dayNightStateBeforeHK = GameScene.devDayNightCycle;
      GameScene.devDayNightCycle = 'off';
      this.weatherManualOverride = false;
      this.applyClockDayMode();
      this.fetchAndApplyHKWeather();
    } else {
      this.weatherManualOverride = true;
      this.windIntensity = 0;
      this.liveSkyColor = '#87ceeb';
      GameScene.devDayNightCycle = this.dayNightStateBeforeHK ?? GameScene.devDayNightCycle;
      this.setWeatherMode(WEATHER_MODES.DRY);
      this.applyDayMode();
    }

    this.refreshDevMenu();
  }

  exitHKLiveModeForManualControls() {
    if (GameScene.devHKWeather !== 'on') {
      return false;
    }

    GameScene.devHKWeather = 'off';
    this.weatherManualOverride = true;
    this.windIntensity = 0;
    this.liveSkyColor = '#87ceeb';
    GameScene.devDayNightCycle = this.dayNightStateBeforeHK ?? GameScene.devDayNightCycle;
    this.setWeatherMode(WEATHER_MODES.DRY);
    return true;
  }

  async fetchAndApplyHKWeather() {
    if (GameScene.devHKWeather !== 'on') {
      return;
    }

    try {
      const snapshot = await fetchHKWeatherSnapshot();
      this.applyHKWeatherEffect(resolveHKWeatherEffect(snapshot));
    } catch (error) {
      console.warn('Hong Kong weather unavailable, using default weather.', error);
    }
  }

  applyHKWeatherEffect(effect) {
    if (GameScene.devHKWeather !== 'on') {
      return;
    }

    this.liveWeatherLabel = effect.label;
    this.liveSkyColor = effect.skyColor;
    this.windIntensity = effect.windIntensity;

    switch (effect.effect) {
      case HK_WEATHER_EFFECTS.STORM:
        this.setWeatherMode(WEATHER_MODES.STORM, { manual: false });
        break;
      case HK_WEATHER_EFFECTS.RAIN:
        this.setWeatherMode(WEATHER_MODES.RAIN, { manual: false });
        break;
      case HK_WEATHER_EFFECTS.WINDY:
        this.setWeatherMode(WEATHER_MODES.DRY, { manual: false });
        break;
      case HK_WEATHER_EFFECTS.SUNNY:
      case HK_WEATHER_EFFECTS.NORMAL:
      default:
        this.setWeatherMode(WEATHER_MODES.DRY, { manual: false });
        break;
    }

    this.applyWeatherMode();
  }

  setSpeedMode(speedKey) {
    GameScene.devSpeed = speedKey;
    this.speedMultiplier = this.getSpeedMultiplier();
    this.assignCourseSchedule(this.speedMultiplier);
    const minSpeed = BASE_SCROLL_SPEED * this.speedMultiplier;
    this.scrollSpeed = Math.max(this.scrollSpeed, minSpeed);
    this.refreshDevMenu();
  }

  setDayOverlayAlpha(alpha) {
    if (!this.dayOverlay) {
      return;
    }

    const clamped = Phaser.Math.Clamp(alpha, 0, 1);
    this.dayOverlay.setVisible(true);
    this.dayOverlay.setAlpha(clamped);
    this.dayOverlayBlend = clamped;
  }

  easeFade(t) {
    return Phaser.Math.SmootherStep(t, 0, 1);
  }

  getDayOverlayAlphaFromScore(score) {
    let phase = score % DAY_NIGHT_CYCLE_PERIOD;
    if (phase < 0) {
      phase += DAY_NIGHT_CYCLE_PERIOD;
    }

    const fade = DAY_NIGHT_FADE_RANGE;
    const duskStart = DAY_NIGHT_CYCLE_NIGHT_AT - fade;
    const duskEnd = DAY_NIGHT_CYCLE_NIGHT_AT + fade;
    const dawnStart = DAY_NIGHT_CYCLE_PERIOD - fade;

    if (phase < duskStart) {
      return 0;
    }

    if (phase < duskEnd) {
      const t = (phase - duskStart) / (duskEnd - duskStart);
      return this.easeFade(t);
    }

    if (phase < dawnStart) {
      return 1;
    }

    const t = (phase - dawnStart) / (DAY_NIGHT_CYCLE_PERIOD - dawnStart);
    return 1 - this.easeFade(t);
  }

  applyDayMode() {
    if (GameScene.devHKWeather === 'on') {
      this.applyClockDayMode();
      return;
    }

    if (GameScene.devDayNightCycle === 'on') {
      const target = this.getDayOverlayAlphaFromScore(this.score ?? 0);
      this.dayOverlayBlend = target;
      this.setDayOverlayAlpha(target);
    } else {
      this.dayOverlayBlend = GameScene.devDay === DAY_MODES.NIGHT ? 1 : 0;
      this.setDayOverlayAlpha(this.dayOverlayBlend);
    }
    this.refreshDevMenu();
  }

  applyClockDayMode() {
    const target = getLocalClockDayOverlayAlpha();
    this.dayOverlayBlend = target;
    this.setDayOverlayAlpha(target);
    GameScene.devDay = target >= 0.5 ? DAY_MODES.NIGHT : DAY_MODES.DAY;
    this.refreshDevMenu();
  }

  updateClockDayNightCycle(delta) {
    const target = getLocalClockDayOverlayAlpha();
    const blend = Phaser.Math.Linear(
      this.dayOverlayBlend ?? target,
      target,
      Phaser.Math.Clamp((delta / 1000) * DAY_OVERLAY_LERP_SPEED, 0, 1),
    );
    this.dayOverlayBlend = blend;
    this.setDayOverlayAlpha(blend);

    const mode = blend >= 0.5 ? DAY_MODES.NIGHT : DAY_MODES.DAY;
    if (mode !== GameScene.devDay) {
      GameScene.devDay = mode;
      this.refreshDevMenu();
    }
  }

  getDayModeFromScore(score) {
    return this.getDayOverlayAlphaFromScore(score) >= 0.5 ? DAY_MODES.NIGHT : DAY_MODES.DAY;
  }

  updateDayNightCycle(delta) {
    if (GameScene.devHKWeather === 'on') {
      this.updateClockDayNightCycle(delta);
      return;
    }

    if (GameScene.devDayNightCycle !== 'on') {
      return;
    }

    const target = this.getDayOverlayAlphaFromScore(this.score);
    const blend = Phaser.Math.Linear(
      this.dayOverlayBlend ?? target,
      target,
      Phaser.Math.Clamp((delta / 1000) * DAY_OVERLAY_LERP_SPEED, 0, 1),
    );
    this.dayOverlayBlend = blend;
    this.setDayOverlayAlpha(blend);

    const mode = blend >= 0.5 ? DAY_MODES.NIGHT : DAY_MODES.DAY;
    if (mode !== GameScene.devDay) {
      GameScene.devDay = mode;
      this.refreshDevMenu();
    }
  }

  setDayMode(mode) {
    this.exitHKLiveModeForManualControls();

    GameScene.devDayNightCycle = 'off';
    GameScene.devDay = mode;
    this.applyDayMode();
  }

  setDayNightCycle(enabled) {
    this.exitHKLiveModeForManualControls();

    GameScene.devDayNightCycle = enabled ? 'on' : 'off';
    if (enabled) {
      GameScene.devDay = this.getDayModeFromScore(this.score);
    }
    this.applyDayMode();
  }

  createDevMenu() {
    this.speedMultiplier = this.getSpeedMultiplier();
    this.devMenuOpen = false;
    this.devMenuItems = [];

    const buttonStyle = {
      fontFamily: 'Arial, sans-serif',
      fontSize: '13px',
      color: '#ffffff',
      backgroundColor: '#1f2937',
      padding: { x: 10, y: 6 },
    };

    const optionStyle = {
      fontFamily: 'Arial, sans-serif',
      fontSize: '12px',
      color: '#ffffff',
      backgroundColor: '#374151',
      padding: { x: 8, y: 5 },
    };

    this.devButton = this.add
      .text(10, 10, 'DEV', buttonStyle)
      .setScrollFactor(0)
      .setDepth(DEV_MENU_DEPTH)
      .setInteractive({ useHandCursor: true });

    this.devPanelBg = this.add
      .rectangle(10, 42, 250, 302, 0x111827, 0.92)
      .setOrigin(0, 0)
      .setScrollFactor(0)
      .setDepth(DEV_MENU_DEPTH)
      .setVisible(false);

    const devLabelStyle = {
      fontFamily: 'Arial, sans-serif',
      fontSize: '11px',
      color: '#9ca3af',
    };

    this.devPanel = this.add.container(0, 0).setScrollFactor(0).setDepth(DEV_MENU_DEPTH).setVisible(false);

    this.weatherButtons = {
      [WEATHER_MODES.DRY]: this.createDevOption(18, 54, 'Dry', optionStyle, () => {
        this.setWeatherMode(WEATHER_MODES.DRY);
      }),
      [WEATHER_MODES.RAIN]: this.createDevOption(78, 54, 'Rain', optionStyle, () => {
        this.setWeatherMode(WEATHER_MODES.RAIN);
      }),
      [WEATHER_MODES.STORM]: this.createDevOption(138, 54, 'Rain+⚡', optionStyle, () => {
        this.setWeatherMode(WEATHER_MODES.STORM);
      }),
    };

    this.hkWeatherLabel = this.add
      .text(18, 76, 'HK live weather', devLabelStyle)
      .setScrollFactor(0)
      .setDepth(DEV_MENU_DEPTH + 1)
      .setVisible(false);

    this.hkWeatherButtons = {
      off: this.createDevOption(18, 92, 'Off', optionStyle, () => {
        this.setHKWeatherLive(false);
      }),
      on: this.createDevOption(88, 92, 'On', optionStyle, () => {
        this.setHKWeatherLive(true);
      }),
    };

    this.dayButtons = {
      [DAY_MODES.DAY]: this.createDevOption(18, 118, 'Daytime', optionStyle, () => {
        this.setDayMode(DAY_MODES.DAY);
      }),
      [DAY_MODES.NIGHT]: this.createDevOption(108, 118, 'Night', optionStyle, () => {
        this.setDayMode(DAY_MODES.NIGHT);
      }),
    };

    this.speedButtons = {
      normal: this.createDevOption(18, 158, 'Normal', optionStyle, () => {
        this.setSpeedMode('normal');
      }),
      fast: this.createDevOption(88, 158, 'Fast x2', optionStyle, () => {
        this.setSpeedMode('fast');
      }),
      faster: this.createDevOption(158, 158, 'Faster x4', optionStyle, () => {
        this.setSpeedMode('faster');
      }),
    };

    this.cycleLabel = this.add
      .text(18, 182, 'Day/night cycle', devLabelStyle)
      .setScrollFactor(0)
      .setDepth(DEV_MENU_DEPTH + 1)
      .setVisible(false);

    this.cycleButtons = {
      on: this.createDevOption(18, 198, 'On', optionStyle, () => {
        this.setDayNightCycle(true);
      }),
      off: this.createDevOption(88, 198, 'Off', optionStyle, () => {
        this.setDayNightCycle(false);
      }),
    };

    this.ghostLabel = this.add
      .text(18, 222, 'Ghost race', devLabelStyle)
      .setScrollFactor(0)
      .setDepth(DEV_MENU_DEPTH + 1)
      .setVisible(false);

    this.ghostButtons = {
      on: this.createDevOption(18, 238, 'On', optionStyle, () => {
        this.setGhostRace(true);
      }),
      off: this.createDevOption(88, 238, 'Off', optionStyle, () => {
        this.setGhostRace(false);
      }),
      clear: this.createDevOption(158, 238, 'Clr', optionStyle, () => {
        this.clearGhostBest();
        this.refreshDevMenu();
      }),
    };

    this.devMenuItems = [
      this.devPanelBg,
      this.hkWeatherLabel,
      this.cycleLabel,
      this.ghostLabel,
      ...Object.values(this.weatherButtons),
      ...Object.values(this.hkWeatherButtons),
      ...Object.values(this.dayButtons),
      ...Object.values(this.speedButtons),
      ...Object.values(this.cycleButtons),
      ...Object.values(this.ghostButtons),
    ];

    this.bindDevMenuInput(this.devButton, () => {
      this.devMenuOpen = !this.devMenuOpen;
      this.devPanelBg.setVisible(this.devMenuOpen);
      this.devPanel.setVisible(this.devMenuOpen);
      this.devMenuItems.forEach((item) => item.setVisible(this.devMenuOpen));
      this.devButton.setBackgroundColor(this.devMenuOpen ? '#2563eb' : '#1f2937');
    });

    this.refreshDevMenu();
  }

  createDevOption(x, y, label, style, onSelect) {
    const option = this.add
      .text(x, y, label, { ...style })
      .setScrollFactor(0)
      .setDepth(DEV_MENU_DEPTH + 1)
      .setVisible(false)
      .setInteractive({ useHandCursor: true });

    this.bindDevMenuInput(option, onSelect);
    return option;
  }

  bindDevMenuInput(target, onSelect) {
    target.on('pointerdown', (_pointer, _localX, _localY, event) => {
      event?.stopPropagation();
      onSelect();
    });
  }

  refreshDevMenu() {
    if (!this.weatherButtons || !this.speedButtons || !this.dayButtons || !this.cycleButtons) {
      return;
    }

    const cycleOn = GameScene.devDayNightCycle === 'on';
    const ghostOn = this.ghostRaceEnabled;
    const hkWeatherOn = GameScene.devHKWeather === 'on';

    Object.entries(this.weatherButtons).forEach(([mode, button]) => {
      if (button?.active) {
        if (hkWeatherOn) {
          button.setBackgroundColor('#374151');
          button.setAlpha(0.55);
          return;
        }

        button.setAlpha(1);
        button.setBackgroundColor(mode === GameScene.devWeather ? '#2563eb' : '#374151');
      }
    });

    Object.entries(this.hkWeatherButtons ?? {}).forEach(([key, button]) => {
      if (button?.active) {
        const selected = (key === 'on' && hkWeatherOn) || (key === 'off' && !hkWeatherOn);
        button.setBackgroundColor(selected ? '#2563eb' : '#374151');
      }
    });

    Object.entries(this.dayButtons).forEach(([mode, button]) => {
      if (button?.active) {
        if (hkWeatherOn) {
          button.setBackgroundColor('#374151');
          button.setAlpha(0.55);
          return;
        }

        const selected = mode === GameScene.devDay;
        button.setBackgroundColor(selected ? '#2563eb' : '#374151');
        button.setAlpha(cycleOn ? 0.65 : 1);
      }
    });

    Object.entries(this.speedButtons).forEach(([speedKey, button]) => {
      if (button?.active) {
        button.setBackgroundColor(speedKey === GameScene.devSpeed ? '#2563eb' : '#374151');
      }
    });

    Object.entries(this.cycleButtons).forEach(([key, button]) => {
      if (button?.active) {
        if (hkWeatherOn) {
          button.setBackgroundColor('#374151');
          button.setAlpha(0.55);
          return;
        }

        const selected = (key === 'on' && cycleOn) || (key === 'off' && !cycleOn);
        button.setBackgroundColor(selected ? '#2563eb' : '#374151');
      }
    });

    Object.entries(this.ghostButtons ?? {}).forEach(([key, button]) => {
      if (button?.active) {
        if (key === 'clear') {
          button.setBackgroundColor('#374151');
          return;
        }

        const selected = (key === 'on' && ghostOn) || (key === 'off' && !ghostOn);
        button.setBackgroundColor(selected ? '#2563eb' : '#374151');
      }
    });
  }

  isPointerOverDevMenu(pointer) {
    if (!this.devButton?.active || !pointer) {
      return false;
    }

    const buttonBounds = this.devButton.getBounds();
    if (buttonBounds?.contains(pointer.x, pointer.y)) {
      return true;
    }

    if (!this.devMenuOpen || !this.devPanelBg?.active) {
      return false;
    }

    if (this.devPanelBg.getBounds().contains(pointer.x, pointer.y)) {
      return true;
    }

    return this.devMenuItems.some(
      (item) => item?.active && item !== this.devPanelBg && item.getBounds?.()?.contains(pointer.x, pointer.y),
    );
  }

  bindInputHandlers() {
    this.onPointerDown = (pointer) => {
      if (this.isPointerOverDevMenu(pointer)) {
        return;
      }

      if (this.isGameOver) {
        this.scene.start('TitleScene');
        return;
      }

      this.startJump();
    };

    this.onPointerUp = () => {
      this.endJump();
    };

    this.input.off('pointerdown', this.onPointerDown);
    this.input.off('pointerup', this.onPointerUp);
    this.input.on('pointerdown', this.onPointerDown);
    this.input.on('pointerup', this.onPointerUp);
  }

  shutdown() {
    if (this.onPointerDown) {
      this.input.off('pointerdown', this.onPointerDown);
    }

    if (this.onPointerUp) {
      this.input.off('pointerup', this.onPointerUp);
    }
  }

  createParallaxLayer(key, depth) {
    const scale = HEIGHT / BG_TEXTURE_HEIGHT;
    const layer = this.add.tileSprite(WIDTH / 2, HEIGHT / 2, WIDTH, HEIGHT, key);
    layer.setTileScale(scale);
    layer.setScrollFactor(0);
    layer.setDepth(depth);
    return { layer, scale };
  }

  createDayAtmosphere() {
    if (!this.textures.exists('night-gradient')) {
      const canvas = this.textures.createCanvas('night-gradient', WIDTH, HEIGHT);
      if (canvas) {
        const ctx = canvas.context;
        const gradient = ctx.createLinearGradient(0, 0, 0, HEIGHT);
        gradient.addColorStop(0, 'rgba(2, 4, 18, 100)');
        gradient.addColorStop(0.4, 'rgba(4, 8, 28, 0.80)');
        gradient.addColorStop(0.7, 'rgba(8, 12, 36, 0.70)');
        gradient.addColorStop(1, 'rgba(12, 16, 40, 0.42)');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, WIDTH, HEIGHT);
        canvas.refresh();
      }
    }

    this.dayOverlay = this.add.image(WIDTH / 2, HEIGHT / 2, 'night-gradient');
    this.dayOverlay.setScrollFactor(0);
    this.dayOverlay.setDepth(DAY_OVERLAY_DEPTH);
    this.dayOverlay.setAlpha(0);
    this.dayOverlay.setVisible(true);
    this.dayOverlayBlend = 0;
  }

  createStormAtmosphere() {
    if (!this.textures.exists('storm-gradient')) {
      const canvas = this.textures.createCanvas('storm-gradient', WIDTH, HEIGHT);
      if (!canvas) {
        console.warn('storm-gradient texture already exists');
      } else {
        const ctx = canvas.context;
        const gradient = ctx.createLinearGradient(0, 0, 0, HEIGHT);
        gradient.addColorStop(0, 'rgba(6, 10, 24, 0.72)');
        gradient.addColorStop(0.45, 'rgba(10, 16, 34, 0.48)');
        gradient.addColorStop(0.72, 'rgba(16, 22, 40, 0.28)');
        gradient.addColorStop(1, 'rgba(24, 30, 48, 0.12)');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, WIDTH, HEIGHT);
        canvas.refresh();
      }
    }

    this.stormOverlay = this.add.image(WIDTH / 2, HEIGHT / 2, 'storm-gradient');
    this.stormOverlay.setScrollFactor(0);
    this.stormOverlay.setDepth(STORM_OVERLAY_DEPTH);
    this.stormOverlay.setAlpha(0.82);

    this.thunderFlash = this.add.rectangle(WIDTH / 2, HEIGHT / 2, WIDTH, HEIGHT, 0xe8f2ff, 1);
    this.thunderFlash.setScrollFactor(0);
    this.thunderFlash.setDepth(THUNDER_FLASH_DEPTH);
    this.thunderFlash.setAlpha(0);

    this.thunderGlow = this.add.rectangle(WIDTH / 2, HEIGHT / 2, WIDTH, HEIGHT, 0x9ab4d8, 1);
    this.thunderGlow.setScrollFactor(0);
    this.thunderGlow.setDepth(THUNDER_FLASH_DEPTH - 1);
    this.thunderGlow.setAlpha(0);

    this.thunderBoost = 0;
  }

  scheduleNextThunder(delay = null) {
    const wait = delay ?? Phaser.Math.Between(4500, 11000);
    this.nextThunderTime = this.time.now + wait;
  }

  triggerThunder() {
    const peakAlpha = Phaser.Math.FloatBetween(0.45, 0.72);
    const glowAlpha = peakAlpha * 0.45;
    const stormAlpha = this.stormOverlay.alpha;

    this.thunderFlash.setAlpha(0);
    this.thunderGlow.setAlpha(0);
    this.thunderBoost = 1;

    this.tweens.killTweensOf([this.thunderFlash, this.thunderGlow, this.stormOverlay]);

    this.tweens.add({
      targets: this.thunderFlash,
      alpha: peakAlpha,
      duration: 70,
      ease: 'Quad.easeOut',
      yoyo: true,
      hold: 90,
      onComplete: () => {
        this.thunderFlash.setAlpha(0);
      },
    });

    this.tweens.add({
      targets: this.thunderGlow,
      alpha: glowAlpha,
      duration: 120,
      ease: 'Sine.easeOut',
      yoyo: true,
      onComplete: () => {
        this.thunderGlow.setAlpha(0);
      },
    });

    this.tweens.add({
      targets: this.stormOverlay,
      alpha: stormAlpha * 0.55,
      duration: 70,
      ease: 'Quad.easeOut',
      yoyo: true,
      hold: 90,
    });

    if (Math.random() < 0.5) {
      this.time.delayedCall(Phaser.Math.Between(90, 160), () => {
        this.tweens.add({
          targets: this.thunderFlash,
          alpha: peakAlpha * 0.4,
          duration: 45,
          ease: 'Quad.easeOut',
          yoyo: true,
        });
      });
    }

    this.scheduleNextThunder();
  }

  updateStorm(delta) {
    if (GameScene.devWeather === WEATHER_MODES.DRY) {
      return;
    }

    const intensityWave = 0.65 + 0.35 * Math.sin(this.rainTime * 0.00035);
    const gustWave = 0.7 + 0.3 * Math.sin(this.rainTime * 0.0009 + 1.2);
    const baseIntensity = intensityWave * gustWave;
    const boostedIntensity = Phaser.Math.Clamp(baseIntensity + this.thunderBoost * 0.35, 0.45, 1.35);
    this.rainIntensity = boostedIntensity;

    this.thunderBoost = Math.max(0, this.thunderBoost - delta * 0.0018);

    const overlayAlpha =
      GameScene.devWeather === WEATHER_MODES.RAIN
        ? Phaser.Math.Linear(0.45, 0.62, boostedIntensity / 1.2)
        : Phaser.Math.Linear(0.68, 0.92, boostedIntensity / 1.2);

    if (this.thunderBoost < 0.15 && this.stormOverlay?.active) {
      this.stormOverlay.setAlpha(overlayAlpha);
    }

    if (GameScene.devWeather === WEATHER_MODES.STORM && this.time.now >= this.nextThunderTime) {
      this.triggerThunder();
    }
  }

  createRain() {
    this.rainTime = 0;
    this.rainIntensity = 0.75;
    this.rainDrops = [];

    this.rainBackGfx = this.add.graphics().setDepth(RAIN_BACK_DEPTH).setScrollFactor(0);
    this.rainFrontGfx = this.add.graphics().setDepth(RAIN_FRONT_DEPTH).setScrollFactor(0);

    for (let i = 0; i < 70; i++) {
      this.rainDrops.push(this.makeRainDrop(0.6, 1));
    }

    for (let i = 0; i < 120; i++) {
      this.rainDrops.push(this.makeRainDrop(1, 1.4));
    }
  }

  makeRainDrop(speedScale, sizeScale) {
    return {
      x: Phaser.Math.Between(-20, WIDTH + 20),
      y: Phaser.Math.Between(-HEIGHT, HEIGHT),
      speed: (520 + Math.random() * 380) * speedScale,
      drift: -110 - Math.random() * 70,
      length: (12 + Math.random() * 16) * sizeScale,
      alpha: (0.35 + Math.random() * 0.35) * sizeScale,
      layer: sizeScale > 1 ? 'front' : 'back',
    };
  }

  drawRainLayer(graphics, layer, intensity, dt) {
    graphics.clear();

    for (const drop of this.rainDrops) {
      if (drop.layer !== layer) {
        continue;
      }

      drop.y += drop.speed * intensity * dt;
      const windBoost = 1 + (this.windIntensity ?? 0);
      drop.x += drop.drift * intensity * dt * windBoost;

      if (drop.y - drop.length > HEIGHT + 20) {
        drop.y = Phaser.Math.Between(-80, -10);
        drop.x = Phaser.Math.Between(-20, WIDTH + 20);
      }

      if (drop.x < -30 || drop.x > WIDTH + 30) {
        drop.x = Phaser.Math.Between(-20, WIDTH + 20);
      }

      const alpha = Phaser.Math.Clamp(drop.alpha * intensity, 0.2, 0.9);
      const endX = drop.x + drop.drift * 0.04;
      const endY = drop.y + drop.length;
      graphics.lineStyle(layer === 'front' ? 2 : 1, 0xe8f4ff, alpha);
      graphics.strokeLineShape(new Phaser.Geom.Line(drop.x, drop.y, endX, endY));
    }
  }

  updateRain(delta) {
    if (GameScene.devWeather === WEATHER_MODES.DRY) {
      this.rainBackGfx?.clear();
      this.rainFrontGfx?.clear();
      return;
    }

    this.rainTime += delta;
    this.updateStorm(delta);

    const dt = delta / 1000;
    this.drawRainLayer(this.rainBackGfx, 'back', this.rainIntensity * 0.85, dt);
    this.drawRainLayer(this.rainFrontGfx, 'front', this.rainIntensity, dt);
  }

  create() {
    this.isGameOver = false;
    this.hearts = MAX_HEARTS;
    this.hitCooldownMs = 0;
    this.speedMultiplier = this.getSpeedMultiplier();
    this.scrollSpeed = BASE_SCROLL_SPEED * this.speedMultiplier;
    this.score = 0;
    this.displayedScore = -1;
    this.assignCourseSchedule(this.speedMultiplier);
    this.isInMud = false;
    this.jumpHeld = false;
    this.jumpPressTime = 0;
    this.jumpBoostUsed = false;
    this.fallJumpUsed = false;
    this.groundJumpActive = false;
    this.wasAirborneLastFrame = false;
    this.jumpBuffered = false;
    this.coyoteMs = 0;
    this.wasAirborne = false;
    this.jumpPhase = null;
    this.weatherManualOverride = true;
    GameScene.devWeather = WEATHER_MODES.DRY;
    this.windIntensity = 0;
    this.liveSkyColor = '#87ceeb';
    this.liveWeatherLabel = null;

    if (typeof this.launchGhostRace === 'boolean') {
      this.ghostRaceEnabled = this.launchGhostRace;
      this.saveGhostRaceEnabled(this.launchGhostRace);
      GameScene.devGhostRace = this.launchGhostRace ? 'on' : 'off';
    } else {
      this.ghostRaceEnabled = this.loadGhostRaceEnabled();
      GameScene.devGhostRace = this.ghostRaceEnabled ? 'on' : 'off';
    }
    this.applyGhostForNewRun();
    this.ghostRunSamples = [];
    this.ghostRunStartTime = 0;
    this.lastGhostSampleTime = 0;
    this.resetGhostFadeState();

    const sky = this.createParallaxLayer('sky', -20);
    this.skyLayer = sky.layer;
    this.skyScale = sky.scale;

    const groundBg = this.createParallaxLayer('ground', -5);
    this.groundLayer = groundBg.layer;
    this.groundScale = groundBg.scale;

    this.createDayAtmosphere();
    this.createStormAtmosphere();
    this.createRain();
    this.createDevMenu();
    this.applyDayMode();
    this.applyWeatherMode();
    if (GameScene.devHKWeather === 'on') {
      this.dayNightStateBeforeHK = GameScene.devDayNightCycle;
      GameScene.devDayNightCycle = 'off';
      this.weatherManualOverride = false;
      this.applyClockDayMode();
      this.fetchAndApplyHKWeather();
    }

    this.physics.world.setBounds(0, 0, WIDTH, HEIGHT);

    const groundCollider = this.add.rectangle(WIDTH / 2, GROUND_SURFACE + 24, WIDTH, 48, 0x000000, 0);
    this.physics.add.existing(groundCollider, true);

    this.createDogAnimations();

    this.createDogShadow();

    this.dog = this.physics.add.sprite(DOG_X, GROUND_SURFACE + DOG_Y_OFFSET, 'run_0');
    this.dog.setDepth(0);
    this.dog.setOrigin(0.5, 1);
    this.dog.setScale(DOG_SCALE);
    this.setupDogPhysics();
    this.dog.y = DOG_RUN_GROUND_Y;
    this.dog.play('run');
    this.dog.setCollideWorldBounds(true);
    this.dog.body.setCollideWorldBounds(true, true, true, false);
    this.dog.setGravityY(GRAVITY_RISE);
    this.dog.setMaxVelocity(600, 720);
    this.dog.setBounce(0);
    this.physics.add.collider(this.dog, groundCollider);

    this.createGhostDog();

    this.obstacles = this.physics.add.staticGroup();
    this.mudPatches = this.physics.add.staticGroup();
    this.heartPickups = this.physics.add.staticGroup();

    this.createHeartsHud();

    this.scoreText = this.add
      .text(WIDTH / 2, SCORE_TEXT_Y, '0', {
        fontFamily: 'Arial, sans-serif',
        fontSize: '32px',
        color: '#ffffff',
        stroke: '#000000',
        strokeThickness: 4,
      })
      .setOrigin(0.5, 0)
      .setDepth(10);

    this.bindInputHandlers();

    this.cursors = this.input.keyboard.createCursorKeys();
    this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

    this.spaceKey.on('down', () => this.startJump());
    this.spaceKey.on('up', () => this.endJump());
    this.cursors.up.on('down', () => this.startJump());
    this.cursors.up.on('up', () => this.endJump());

    this.hasStarted = false;
    this.startGameplay();
  }

  update(time, delta) {
    this.updateRain(delta);
    this.updateDogShadow();

    if (this.isGameOver) {
      this.dog.x = DOG_X;
      this.dog.y = DOG_SLEEP_Y;
      if (!this.dog.anims.isPlaying || this.dog.anims.currentAnim?.key !== 'dead') {
        this.dog.play('dead', true);
      }
      return;
    }

    if (this.hitCooldownMs > 0) {
      this.hitCooldownMs = Math.max(0, this.hitCooldownMs - delta);
    }

    const dt = delta / 1000;
    const onGround = this.isDogOnGround();

    const maxSpeed = 420 * this.speedMultiplier;
    const baseSpeed = BASE_SCROLL_SPEED * this.speedMultiplier;
    this.scrollSpeed = Math.min(baseSpeed + this.score * 0.05 * this.speedMultiplier, maxSpeed);

    this.isInMud = onGround && this.physics.overlap(this.dog, this.mudPatches);
    const mudSlowFactor = this.isInMud ? MUD_SLOW_FACTOR : 1;
    const effectiveScrollSpeed = this.scrollSpeed * mudSlowFactor;
    this.dog.anims.timeScale = mudSlowFactor;

    const elapsed = time - this.ghostRunStartTime;
    this.processCourseSpawns(elapsed);

    const scrollDelta = effectiveScrollSpeed * dt;
    this.skyLayer.tilePositionX += (scrollDelta * PARALLAX_SKY) / this.skyScale;
    this.groundLayer.tilePositionX += (scrollDelta * PARALLAX_GROUND) / this.groundScale;

    this.score += effectiveScrollSpeed * dt * 0.1;
    const displayScore = Math.floor(this.score);
    if (displayScore !== this.displayedScore) {
      this.displayedScore = displayScore;
      this.scoreText.setText(displayScore.toString());
    }

    this.updateDayNightCycle(delta);

    this.obstacles.getChildren().forEach((rock) => {
      rock.x -= effectiveScrollSpeed * dt;
      rock.refreshBody();

      if (rock.x < -rock.displayWidth) {
        rock.destroy();
      }
    });

    this.mudPatches.getChildren().forEach((mud) => {
      mud.x -= effectiveScrollSpeed * dt;
      mud.refreshBody();

      if (mud.x < -mud.displayWidth) {
        mud.destroy();
      }
    });

    this.heartPickups.getChildren().forEach((pickup) => {
      pickup.x -= effectiveScrollSpeed * dt;
      pickup.refreshBody();

      if (pickup.x < -pickup.displayWidth) {
        pickup.destroy();
      }
    });

    this.checkHeartPickups();

    this.dog.x = DOG_X;
    this.dog.setVelocityX(0);

    if (onGround) {
      this.coyoteMs = COYOTE_MS;

      if (this.wasAirborneLastFrame) {
        this.jumpBoostUsed = false;
        this.fallJumpUsed = false;
        this.groundJumpActive = false;
      }
    } else {
      this.coyoteMs = Math.max(0, this.coyoteMs - delta);
    }

    if (this.jumpBuffered && this.canJump()) {
      this.performJump();
      this.jumpBuffered = false;
    }

    this.wasAirborneLastFrame = !onGround;

    this.applyJumpPhysics(dt);
    this.checkRockCollisions();
    this.updateDogAnimation(this.isDogOnGround());
    this.recordGhostSample(time);
    this.updateGhostRace(time);
  }

  isJumpInputHeld() {
    return this.jumpHeld || this.input.activePointer.isDown || this.spaceKey.isDown || this.cursors.up.isDown;
  }

  applyJumpPhysics(dt) {
    const rising = this.dog.body.velocity.y < 0;
    const heldLongEnough = this.time.now - this.jumpPressTime >= JUMP_HOLD_DELAY_MS;
    const holdingJump =
      rising && this.isJumpInputHeld() && this.groundJumpActive && heldLongEnough;

    if (holdingJump) {
      this.dog.setGravityY(GRAVITY_HOLD_RISE);
      const nextVelocity = this.dog.body.velocity.y - JUMP_HOLD_ACCEL * dt;
      this.dog.setVelocityY(Math.max(MAX_JUMP_VELOCITY, nextVelocity));
      return;
    }

    this.dog.setGravityY(rising ? GRAVITY_RISE : GRAVITY_FALL);
  }

  spawnRock() {
    if (
      this.isHazardTooClose(HAZARD_SPAWN_X, OBSTACLE_DISPLAY_W, this.obstacles) ||
      this.isHazardTooClose(HAZARD_SPAWN_X, OBSTACLE_DISPLAY_W, this.mudPatches)
    ) {
      return false;
    }

    const rock = this.obstacles.create(HAZARD_SPAWN_X, GROUND_SURFACE + ROCK_Y_OFFSET, 'obstacle');
    rock.setOrigin(0.5, 1);
    rock.setDisplaySize(OBSTACLE_DISPLAY_W, OBSTACLE_DISPLAY_H);
    rock.y = GROUND_SURFACE + ROCK_Y_OFFSET;
    this.setupRockPhysics(rock);
    return true;
  }

  spawnMud() {
    if (
      this.isHazardTooClose(HAZARD_SPAWN_X, MUD_DISPLAY_W, this.obstacles) ||
      this.isHazardTooClose(HAZARD_SPAWN_X, MUD_DISPLAY_W, this.mudPatches)
    ) {
      return false;
    }

    const mud = this.mudPatches.create(HAZARD_SPAWN_X, GROUND_SURFACE + MUD_Y_OFFSET, 'mud');
    mud.setOrigin(0.5, 1);
    mud.setDisplaySize(MUD_DISPLAY_W, MUD_DISPLAY_H);
    mud.setDepth(-1);
    mud.y = GROUND_SURFACE + MUD_Y_OFFSET;
    this.setupMudPhysics(mud);
    return true;
  }

  canJump() {
    return this.isDogOnGround() || this.coyoteMs > 0;
  }

  performJump() {
    if (this.isGameOver || !this.canJump()) {
      return false;
    }

    this.coyoteMs = 0;
    this.groundJumpActive = true;
    this.wasAirborne = false;
    this.jumpPhase = 'hold';
    this.dog.setVelocityY(MIN_JUMP_VELOCITY);
    this.dog.setGravityY(GRAVITY_HOLD_RISE);
    this.dog.setTexture('jump_1');
    this.dog.anims.stop();
    return true;
  }

  performFallJump() {
    if (this.isGameOver || this.canJump()) {
      return false;
    }

    this.groundJumpActive = true;
    this.dog.setVelocityY(FALL_JUMP_VELOCITY);
    this.dog.setGravityY(GRAVITY_RISE);
    this.dog.refreshBody();
    return true;
  }

  boostAirJump() {
    if (this.dog.body.velocity.y >= 0) {
      return;
    }

    this.groundJumpActive = false;
    const boostImpulse = MIN_JUMP_VELOCITY * JUMP_AIR_BOOST_IMPULSE;
    const boostedVelocity = this.dog.body.velocity.y + boostImpulse;
    this.dog.setVelocityY(Math.min(boostedVelocity, JUMP_AIR_BOOST_VELOCITY_CAP));
  }

  startJump() {
    if (this.isGameOver) {
      return;
    }

    if (!this.hasStarted) {
      this.startGameplay();
      return;
    }

    this.jumpHeld = true;
    this.jumpPressTime = this.time.now;

    if (this.performJump()) {
      this.jumpBuffered = false;
      return;
    }

    if (this.coyoteMs > 0 || this.isDogOnGround()) {
      this.jumpBuffered = true;
    }

    if (!this.jumpBoostUsed && this.dog.body.velocity.y < 0) {
      this.boostAirJump();
      this.jumpBoostUsed = true;
      return;
    }

    if (!this.fallJumpUsed && this.dog.body.velocity.y > FALL_JUMP_MIN_DESCENT_VELOCITY) {
      if (this.performFallJump()) {
        this.fallJumpUsed = true;
      }
    }
  }

  endJump() {
    this.jumpHeld = false;

    const heldFor = this.time.now - this.jumpPressTime;
    const vy = this.dog.body.velocity.y;

    if (
      heldFor > JUMP_CUT_MIN_HOLD_MS &&
      vy < JUMP_CUT_VELOCITY_THRESHOLD
    ) {
      const cutVelocity = vy * JUMP_CUT_FACTOR;
      this.dog.setVelocityY(Math.max(cutVelocity, MIN_JUMP_VELOCITY));
    }
  }

  getDogRunGroundY() {
    return DOG_RUN_GROUND_Y;
  }

  getDogSleepGroundY() {
    return DOG_SLEEP_Y;
  }


  placeDogForDeath() {
    this.dog.setVelocity(0, 0);
    this.dog.x = DOG_X;
    this.dog.y = DOG_SLEEP_Y;
    this.dog.refreshBody();
  }

  triggerGameOver() {
    if (this.isGameOver) {
      return;
    }

    this.finalizeGhostRecording(this.time.now);
    this.ghostDog?.setVisible(false);

    const beatGhost =
      this.ghostBestAtRunStart &&
      Math.floor(this.score) > this.ghostBestAtRunStart.finalScore;
    const gameOverSubtext = beatGhost
      ? '\nYou beat your ghost!'
      : this.ghostBestAtRunStart
        ? `\nGhost: ${this.ghostBestAtRunStart.finalScore}`
        : '';

    this.isGameOver = true;
    this.wasAirborne = false;
    this.jumpPhase = null;
    this.dog.anims.timeScale = 1;
    this.physics.pause();
    this.tweens.killTweensOf(this.dog);
    this.dog.setAlpha(1);
    this.dog.setScale(DOG_SCALE);
    this.dog.play('dead');
    this.placeDogForDeath();

    this.add
      .text(WIDTH / 2, HEIGHT / 2, `Game Over\nTap to Restart${gameOverSubtext}`, {
        fontFamily: 'Arial, sans-serif',
        fontSize: '28px',
        color: '#ffffff',
        align: 'center',
        stroke: '#000000',
        strokeThickness: 4,
      })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(HEARTS_DEPTH + 1);

    this.input.keyboard.once('keydown-SPACE', () => this.scene.start('TitleScene'));
    this.input.keyboard.once('keydown-UP', () => this.scene.start('TitleScene'));
  }

  handleCollision(_dog, rock) {
    if (this.isGameOver || this.hitCooldownMs > 0) {
      return;
    }

    const snapY = this.dog.y;
    const snapVy = this.dog.body.velocity.y;

    rock.destroy();
    this.hearts -= 1;
    this.updateHeartsHud();
    this.hitCooldownMs = HIT_COOLDOWN_MS;
    this.dog.x = DOG_X;
    this.recordGhostSample(this.time.now, true);

    if (this.hearts <= 0) {
      this.triggerGameOver();
      return;
    }

    this.playCollisionBump();
    this.dog.y = snapY;
    this.dog.setVelocityY(snapVy);
    this.dog.refreshBody();
  }
}
