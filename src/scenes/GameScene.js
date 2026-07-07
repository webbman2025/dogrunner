import Phaser from 'phaser';

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
const ROCK_SPAWN_X = WIDTH + 40;
const ROCK_SPAWN_INITIAL_MIN_MS = 1400;
const ROCK_SPAWN_INITIAL_MAX_MS = 2600;
const ROCK_SPAWN_MIN_MS = 2200;
const ROCK_SPAWN_MAX_MS = 4200;
const ROCK_SPAWN_MIN_FLOOR_MS = 1400;
const ROCK_SPAWN_MAX_FLOOR_MS = 2600;
const MUD_SPAWN_X = WIDTH + 60;
const HAZARD_MIN_GAP_PX = 100;
const HAZARD_RETRY_MS = 450;
const HEART_PICKUP_SPAWN_MIN_SCORE = 200;
const HEART_PICKUP_SPAWN_MAX_SCORE = 300;
const HEART_PICKUP_SPAWN_X = WIDTH + 120;
const HEART_PICKUP_PAIR_GAP_X = 64;
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
const SKY_BODY_DEPTH = -2;
const SKY_BODY_X = WIDTH - 58;
const SKY_BODY_Y = 68;
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
const TAP_TO_START_Y = HEIGHT / 2;
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
const GHOST_LIBRARY_KEY = 'dogrunner-ghost-library-v4';
const GHOST_LIBRARY_VERSION = 4;
const GHOST_LEGACY_KEYS = [
  'dogrunner-ghost-best-v3',
  'dogrunner-ghost-best-v2',
  'dogrunner-ghost-best',
];
const GHOST_MAX_SAVED = 10;
const GHOST_HIT_RUN_SCALE = 0.45;
const GHOST_FADE_MS = 900;
const GHOST_SAMPLE_INTERVAL_MS = 150;
const GHOST_ALPHA = 0.5;
const GHOST_TINT = 0x88ccff;
const GHOST_X_SHIFT_PER_SCORE = 0.35;
const GHOST_X_MIN = 40;
const GHOST_X_MAX = 160;
const GHOST_DEPTH = -0.5;
const MODAL_DIMMER_DEPTH = 50;
const MODAL_CONTENT_DEPTH = 51;
const MODAL_FONT =
  'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif';
const GHOST_LIB_PANEL_W = 400;
const GHOST_LIB_PANEL_H = 648;
const POST_RACE_PANEL_W = 400;
const POST_RACE_PANEL_H = 430;
const SAVE_MODAL_PANEL_W = 400;
const SAVE_MODAL_PANEL_H = 430;

export default class GameScene extends Phaser.Scene {
  static devWeather = WEATHER_MODES.DRY;
  static devDay = DAY_MODES.DAY;
  static devDayNightCycle = 'on';
  static devSpeed = 'fast';
  static devGhostRace = 'off';

  constructor() {
    super('GameScene');
  }

  preload() {
    this.load.image('sky', 'assets/front.png');
    this.load.image('ground', 'assets/ground.png');
    this.load.image('obstacle', 'assets/rock.png');
    this.load.image('mud', 'assets/mud.png');

    for (let i = 0; i < DOG_FRAME_COUNTS.run; i++) {
      this.load.image(`run_${i}`, `assets/dog/run_${i}.png`);
    }

    for (let i = 0; i < DOG_FRAME_COUNTS.jump; i++) {
      this.load.image(`jump_${i}`, `assets/dog/jump_${i}.png`);
    }

    for (const i of DOG_FRAME_COUNTS.sleep) {
      this.load.image(`sleep_${i}`, `assets/dog/sleep_${i}.png`);
    }

    this.load.image('heart-full', 'assets/ui/heart-full.png');
    this.load.image('heart-empty', 'assets/ui/heart-empty.png');
    this.load.image('heart-pickup', 'assets/heart-pickup.png');
  }

  createHeartsHud() {
    const hudWidth = HEARTS_PAD_X * 2 + HEART_W * MAX_HEARTS + HEART_GAP * (MAX_HEARTS - 1);
    const hudHeight = HEARTS_PAD_Y * 2 + HEART_H;
    const radius = hudHeight / 2;

    this.heartsHud = this.add.container(WIDTH / 2, HEARTS_HUD_Y).setScrollFactor(0).setDepth(HEARTS_DEPTH);

    const bg = this.add.graphics();
    bg.fillStyle(HEARTS_BG, 1);
    bg.lineStyle(HEARTS_BORDER_W, HEARTS_BORDER, 1);
    bg.fillRoundedRect(-hudWidth / 2, -hudHeight / 2, hudWidth, hudHeight, radius);
    bg.strokeRoundedRect(-hudWidth / 2, -hudHeight / 2, hudWidth, hudHeight, radius);
    this.heartsHud.add(bg);

    this.heartIcons = [];
    const startX = -hudWidth / 2 + HEARTS_PAD_X + HEART_W / 2;

    for (let i = 0; i < MAX_HEARTS; i++) {
      const heart = this.add
        .image(startX + i * (HEART_W + HEART_GAP), 0, 'heart-full')
        .setDisplaySize(HEART_W, HEART_H);
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
      this.hearts += 1;
      this.updateHeartsHud();
      this.playHeartCollectFeedback();
    }
  }

  createTapToStartOverlay() {
    this.tapToStartText = this.add
      .text(WIDTH / 2, TAP_TO_START_Y, 'Tap to Start', {
        fontFamily: 'Arial, sans-serif',
        fontSize: '36px',
        color: '#ffffff',
        stroke: '#000000',
        strokeThickness: 6,
      })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setDepth(HEARTS_DEPTH + 2);

    this.tweens.add({
      targets: this.tapToStartText,
      alpha: 0.4,
      duration: 700,
      yoyo: true,
      repeat: -1,
    });

    this.createPreRaceGhostButton();
  }

  createPreRaceGhostButton() {
    const library = this.ghostLibrary ?? this.loadGhostLibrary();
    const count = library.replays.length;
    const selected = this.getSelectedGhostReplay(library);
    const label =
      count === 0
        ? 'Ghost races'
        : selected
          ? `Ghost: ${selected.finalScore}m`
          : 'Ghost: off';

    this.preRaceGhostButton = this.add
      .container(WIDTH / 2, TAP_TO_START_Y + 58)
      .setScrollFactor(0)
      .setDepth(HEARTS_DEPTH + 2);

    const btnW = 220;
    const btnH = 42;
    const btnBg = this.add.graphics();
    this.paintRoundedRect(btnBg, -btnW / 2, -btnH / 2, btnW, btnH, btnH / 2, 0x0f172a, 0.88, 0x38bdf8, 0.45, 1.5);

    this.preRaceGhostLabel = this.add
      .text(0, 0, label, {
        fontFamily: MODAL_FONT,
        fontSize: '15px',
        fontStyle: 'bold',
        color: '#e0f2fe',
      })
      .setOrigin(0.5);

    const btnZone = this.add.zone(0, 0, btnW, btnH).setInteractive({ useHandCursor: true });
    btnZone.on('pointerover', () => {
      this.paintRoundedRect(btnBg, -btnW / 2, -btnH / 2, btnW, btnH, btnH / 2, 0x172554, 0.95, 0x7dd3fc, 0.8, 1.5);
    });
    btnZone.on('pointerout', () => {
      this.paintRoundedRect(btnBg, -btnW / 2, -btnH / 2, btnW, btnH, btnH / 2, 0x0f172a, 0.88, 0x38bdf8, 0.45, 1.5);
    });
    btnZone.on('pointerdown', (pointer, _x, _y, event) => {
      event?.stopPropagation();
      this.openGhostLibraryModal('preRace');
    });

    this.preRaceGhostButton.add([btnBg, this.preRaceGhostLabel, btnZone]);
  }

  startGameplay() {
    if (this.hasStarted) {
      return;
    }

    this.hasStarted = true;

    if (this.tapToStartText) {
      this.tweens.killTweensOf(this.tapToStartText);
      this.tapToStartText.destroy();
      this.tapToStartText = null;
    }

    if (this.preRaceGhostButton) {
      this.preRaceGhostButton.destroy();
      this.preRaceGhostButton = null;
    }

    this.hideAllRaceModals();

    const now = this.time.now;
    this.ghostRunStartTime = now;
    this.lastGhostSampleTime = 0;
    this.ghostRunSamples = [];
    this.resetGhostFadeState();
    this.ghostLastHearts = MAX_HEARTS;
    this.nextRockTime = now + Phaser.Math.Between(ROCK_SPAWN_INITIAL_MIN_MS, ROCK_SPAWN_INITIAL_MAX_MS);
    this.nextMudTime = now + Phaser.Math.Between(2000, 3500);
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

  spawnHeartPickups() {
    const count = Phaser.Math.Between(1, 2);
    const baseY = Phaser.Math.Between(HEART_PICKUP_Y_MIN, HEART_PICKUP_Y_MAX);
    const pairStartX =
      count === 1 ? HEART_PICKUP_SPAWN_X : HEART_PICKUP_SPAWN_X - HEART_PICKUP_PAIR_GAP_X / 2;

    for (let i = 0; i < count; i++) {
      const x = pairStartX + i * HEART_PICKUP_PAIR_GAP_X;
      const y = baseY + (count === 2 ? Phaser.Math.Between(-24, 24) : 0);
      const pickup = this.heartPickups.create(x, y, 'heart-pickup');
      pickup.setOrigin(0.5, 0.5);
      pickup.setDisplaySize(HEART_PICKUP_SIZE, HEART_PICKUP_SIZE);
      pickup.setDepth(4);
      this.setupHeartPickupPhysics(pickup);
    }
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
    return GHOST_RACE_ENABLED && GameScene.devGhostRace === 'on';
  }

  shouldShowGhost() {
    return (
      this.isGhostRaceActive() &&
      this.ghostBestAtRunStart?.samples?.length >= 2
    );
  }

  generateGhostId() {
    return `ghost-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  }

  formatGhostDate(savedAt) {
    if (!savedAt) {
      return 'Unknown date';
    }

    return new Date(savedAt).toLocaleString(undefined, {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  }

  formatGhostDuration(durationMs) {
    const totalSeconds = Math.max(0, Math.floor(durationMs / 1000));
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }

  isValidGhostReplay(replay) {
    return (
      replay &&
      typeof replay.finalScore === 'number' &&
      Array.isArray(replay.samples) &&
      replay.samples.length >= 2 &&
      typeof replay.samples[0].runScale === 'number' &&
      typeof replay.samples[0].hearts === 'number'
    );
  }

  normalizeGhostReplay(replay) {
    if (!this.isValidGhostReplay(replay)) {
      return null;
    }

    return {
      id: replay.id || this.generateGhostId(),
      finalScore: replay.finalScore,
      durationMs: replay.durationMs ?? 0,
      deathT: replay.deathT ?? this.findGhostDeathTime(replay.samples),
      savedAt: replay.savedAt ?? Date.now(),
      samples: replay.samples,
    };
  }

  createEmptyGhostLibrary() {
    return {
      v: GHOST_LIBRARY_VERSION,
      selectedId: null,
      replays: [],
    };
  }

  migrateLegacyGhostLibrary() {
    for (const key of GHOST_LEGACY_KEYS) {
      try {
        const raw = localStorage.getItem(key);
        if (!raw) {
          continue;
        }

        const data = JSON.parse(raw);
        const replay = this.normalizeGhostReplay({
          id: this.generateGhostId(),
          finalScore: data.finalScore,
          durationMs: data.durationMs,
          deathT: data.deathT,
          savedAt: Date.now(),
          samples: data.samples,
        });

        if (!replay) {
          continue;
        }

        const library = this.createEmptyGhostLibrary();
        library.replays = [replay];
        library.selectedId = replay.id;
        this.saveGhostLibrary(library);
        localStorage.removeItem(key);
        return library;
      } catch {
        // Try next legacy key.
      }
    }

    return null;
  }

  loadGhostLibrary() {
    if (!GHOST_RACE_ENABLED) {
      return this.createEmptyGhostLibrary();
    }

    try {
      const raw = localStorage.getItem(GHOST_LIBRARY_KEY);
      if (!raw) {
        return this.migrateLegacyGhostLibrary() ?? this.createEmptyGhostLibrary();
      }

      const data = JSON.parse(raw);
      if (!data || data.v !== GHOST_LIBRARY_VERSION || !Array.isArray(data.replays)) {
        return this.migrateLegacyGhostLibrary() ?? this.createEmptyGhostLibrary();
      }

      const replays = data.replays
        .map((replay) => this.normalizeGhostReplay(replay))
        .filter(Boolean)
        .sort((a, b) => b.savedAt - a.savedAt)
        .slice(0, GHOST_MAX_SAVED);

      const selectedId = replays.some((replay) => replay.id === data.selectedId)
        ? data.selectedId
        : replays[0]?.id ?? null;

      return {
        v: GHOST_LIBRARY_VERSION,
        selectedId,
        replays,
      };
    } catch {
      return this.createEmptyGhostLibrary();
    }
  }

  saveGhostLibrary(library) {
    if (!GHOST_RACE_ENABLED || !library) {
      return;
    }

    try {
      localStorage.setItem(GHOST_LIBRARY_KEY, JSON.stringify(library));
    } catch {
      // Ignore quota / private-mode storage errors.
    }
  }

  getSelectedGhostReplay(library = this.ghostLibrary) {
    if (!library?.selectedId) {
      return null;
    }

    return library.replays.find((replay) => replay.id === library.selectedId) ?? null;
  }

  setSelectedGhostReplay(replayId) {
    if (!this.ghostLibrary) {
      return;
    }

    this.ghostLibrary.selectedId = replayId;
    this.saveGhostLibrary(this.ghostLibrary);
    this.refreshPreRaceGhostButton();
  }

  addGhostReplayToLibrary(replay) {
    const normalized = this.normalizeGhostReplay(replay);
    if (!normalized) {
      return false;
    }

    if (!this.ghostLibrary) {
      this.ghostLibrary = this.createEmptyGhostLibrary();
    }

    this.ghostLibrary.replays = [
      normalized,
      ...this.ghostLibrary.replays.filter((entry) => entry.id !== normalized.id),
    ]
      .sort((a, b) => b.savedAt - a.savedAt)
      .slice(0, GHOST_MAX_SAVED);

    this.ghostLibrary.selectedId = normalized.id;
    this.saveGhostLibrary(this.ghostLibrary);
    this.refreshPreRaceGhostButton();
    return true;
  }

  clearGhostLibrary() {
    try {
      localStorage.removeItem(GHOST_LIBRARY_KEY);
      for (const key of GHOST_LEGACY_KEYS) {
        localStorage.removeItem(key);
      }
    } catch {
      // Ignore storage errors.
    }

    this.ghostLibrary = this.createEmptyGhostLibrary();
    this.ghostBestAtRunStart = null;
    this.ghostDog?.setVisible(false);
    this.refreshPreRaceGhostButton();
  }

  clearGhostBest() {
    this.clearGhostLibrary();
  }

  refreshPreRaceGhostButton() {
    if (!this.preRaceGhostButton || this.hasStarted) {
      return;
    }

    const library = this.ghostLibrary ?? this.loadGhostLibrary();
    const selected = this.getSelectedGhostReplay(library);
    const label =
      library.replays.length === 0
        ? 'Ghost races'
        : selected
          ? `Ghost: ${selected.finalScore}m`
          : 'Ghost: off';
    this.preRaceGhostLabel.setText(label);
  }

  snapshotGhostForRunStart(replay) {
    if (!replay) {
      return null;
    }

    return {
      id: replay.id,
      finalScore: replay.finalScore,
      deathT: replay.deathT ?? this.findGhostDeathTime(replay.samples),
      samples: [...replay.samples],
    };
  }

  applyGhostLibraryForNewRun() {
    this.ghostLibrary = this.loadGhostLibrary();
    const selected = this.getSelectedGhostReplay(this.ghostLibrary);
    this.ghostBestAtRunStart = this.snapshotGhostForRunStart(selected);
  }

  setGhostRace(enabled) {
    GameScene.devGhostRace = enabled ? 'on' : 'off';
    this.refreshDevMenu();
    this.updateGhostRace(this.time.now);
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

  buildPendingRunRecording(time) {
    if (!this.isGhostRaceActive() || !this.hasStarted) {
      return null;
    }

    this.recordGhostSample(time);

    const recording = {
      finalScore: Math.floor(this.score),
      durationMs: Math.max(0, time - this.ghostRunStartTime),
      deathT: this.findGhostDeathTime(this.ghostRunSamples),
      samples: [...this.ghostRunSamples],
    };

    if (recording.samples.length < 2) {
      return null;
    }

    return recording;
  }

  savePendingRunRecording() {
    if (!this.pendingRunRecording) {
      return false;
    }

    const replay = {
      id: this.generateGhostId(),
      savedAt: Date.now(),
      ...this.pendingRunRecording,
    };

    return this.addGhostReplayToLibrary(replay);
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

  setWeatherMode(mode) {
    GameScene.devWeather = mode;
    this.applyWeatherMode();
  }

  setSpeedMode(speedKey) {
    GameScene.devSpeed = speedKey;
    this.speedMultiplier = this.getSpeedMultiplier();
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
    this.updateSkyBodies(clamped);
  }

  createSkyBodies() {
    this.skySun = this.add.container(SKY_BODY_X, SKY_BODY_Y);
    this.skySun.setScrollFactor(0);
    this.skySun.setDepth(SKY_BODY_DEPTH);

    const sunGlow = this.add.circle(0, 0, 36, 0xffe680, 0.45);
    const sunCore = this.add.circle(0, 0, 22, 0xffdd55, 1);
    const sunRays = this.add.graphics();
    sunRays.lineStyle(3, 0xffee88, 0.55);
    for (let i = 0; i < 8; i++) {
      const angle = (Math.PI * 2 * i) / 8;
      sunRays.lineBetween(
        Math.cos(angle) * 26,
        Math.sin(angle) * 26,
        Math.cos(angle) * 38,
        Math.sin(angle) * 38,
      );
    }
    this.skySun.add([sunGlow, sunRays, sunCore]);

    this.skyMoon = this.add.container(SKY_BODY_X, SKY_BODY_Y);
    this.skyMoon.setScrollFactor(0);
    this.skyMoon.setDepth(SKY_BODY_DEPTH);

    const moonGlow = this.add.circle(0, 0, 32, 0xc8dcff, 0.35);
    moonGlow.setBlendMode(Phaser.BlendModes.ADD);
    const moonCore = this.add.circle(0, 0, 18, 0xf0f6ff, 1);
    const moonShine = this.add.circle(-5, -4, 14, 0xffffff, 0.35);
    moonShine.setBlendMode(Phaser.BlendModes.ADD);
    const moonCrater = this.add.circle(7, 5, 4, 0xd0dae8, 0.45);
    this.skyMoon.add([moonGlow, moonCore, moonCrater, moonShine]);

    this.skyMoon.setAlpha(0);
    this.skySun.setAlpha(1);
  }

  updateSkyBodies(nightBlend) {
    const night = Phaser.Math.Clamp(
      nightBlend ?? this.dayOverlayBlend ?? 0,
      0,
      1,
    );
    const day = 1 - night;

    if (this.skySun) {
      this.skySun.setAlpha(day);
      this.skySun.setScale(0.92 + day * 0.08);
    }

    if (this.skyMoon) {
      this.skyMoon.setAlpha(night);
      this.skyMoon.setScale(0.9 + night * 0.12);
      this.skyMoon.rotation = night * 0.08;
    }
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

  getDayModeFromScore(score) {
    return this.getDayOverlayAlphaFromScore(score) >= 0.5 ? DAY_MODES.NIGHT : DAY_MODES.DAY;
  }

  updateDayNightCycle(delta) {
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
    GameScene.devDayNightCycle = 'off';
    GameScene.devDay = mode;
    this.applyDayMode();
  }

  setDayNightCycle(enabled) {
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
      .rectangle(10, 42, 250, 254, 0x111827, 0.92)
      .setOrigin(0, 0)
      .setScrollFactor(0)
      .setDepth(DEV_MENU_DEPTH)
      .setVisible(false);

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

    this.dayButtons = {
      [DAY_MODES.DAY]: this.createDevOption(18, 94, 'Daytime', optionStyle, () => {
        this.setDayMode(DAY_MODES.DAY);
      }),
      [DAY_MODES.NIGHT]: this.createDevOption(108, 94, 'Night', optionStyle, () => {
        this.setDayMode(DAY_MODES.NIGHT);
      }),
    };

    this.speedButtons = {
      normal: this.createDevOption(18, 134, 'Normal', optionStyle, () => {
        this.setSpeedMode('normal');
      }),
      fast: this.createDevOption(88, 134, 'Fast x2', optionStyle, () => {
        this.setSpeedMode('fast');
      }),
      faster: this.createDevOption(158, 134, 'Faster x4', optionStyle, () => {
        this.setSpeedMode('faster');
      }),
    };

    this.cycleButtons = {
      on: this.createDevOption(18, 174, 'On', optionStyle, () => {
        this.setDayNightCycle(true);
      }),
      off: this.createDevOption(88, 174, 'Off', optionStyle, () => {
        this.setDayNightCycle(false);
      }),
    };

    this.ghostButtons = {
      on: this.createDevOption(18, 214, 'Ghost', optionStyle, () => {
        this.setGhostRace(true);
      }),
      off: this.createDevOption(88, 214, 'No ghost', optionStyle, () => {
        this.setGhostRace(false);
      }),
      clear: this.createDevOption(158, 214, 'Clr', optionStyle, () => {
        this.clearGhostBest();
        this.refreshDevMenu();
      }),
    };

    this.devMenuItems = [
      this.devPanelBg,
      ...Object.values(this.weatherButtons),
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
    const ghostOn = GameScene.devGhostRace === 'on';

    Object.entries(this.weatherButtons).forEach(([mode, button]) => {
      if (button?.active) {
        button.setBackgroundColor(mode === GameScene.devWeather ? '#2563eb' : '#374151');
      }
    });

    Object.entries(this.dayButtons).forEach(([mode, button]) => {
      if (button?.active) {
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

    return this.devPanelBg.getBounds().contains(pointer.x, pointer.y);
  }

  bindInputHandlers() {
    this.onPointerDown = (pointer) => {
      if (this.isPointerOverDevMenu(pointer) || this.isPointerOverRaceUi(pointer)) {
        return;
      }

      if (!this.hasStarted) {
        if (this.ghostLibraryModal?.visible || this.saveGhostModal?.visible) {
          return;
        }

        this.startGameplay();
        return;
      }

      if (this.isGameOver) {
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

    this.createSkyBodies();
    this.updateSkyBodies(0);
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
      drop.x += drop.drift * intensity * dt;

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
    this.nextRockTime = Phaser.Math.Between(ROCK_SPAWN_INITIAL_MIN_MS, ROCK_SPAWN_INITIAL_MAX_MS);
    this.nextMudTime = Phaser.Math.Between(2000, 3500);
    this.nextHeartSpawnScore = Phaser.Math.Between(
      HEART_PICKUP_SPAWN_MIN_SCORE,
      HEART_PICKUP_SPAWN_MAX_SCORE,
    );
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

    this.ghostLibrary = this.loadGhostLibrary();
    this.applyGhostLibraryForNewRun();
    this.pendingRunRecording = null;
    this.modalReturnTarget = null;
    this.postRaceMenu = null;
    this.saveGhostModal = null;
    this.ghostLibraryModal = null;
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
    this.physics.pause();
    this.createTapToStartOverlay();
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

    if (!this.hasStarted) {
      this.dog.x = DOG_X;
      this.dog.y = DOG_RUN_GROUND_Y;
      if (!this.dog.anims.isPlaying || this.dog.anims.currentAnim?.key !== 'run') {
        this.dog.play('run', true);
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

    if (time >= this.nextRockTime) {
      if (this.isHazardTooClose(ROCK_SPAWN_X, OBSTACLE_DISPLAY_W, this.mudPatches)) {
        this.nextRockTime = time + HAZARD_RETRY_MS;
      } else {
        this.spawnRock();
        const minGap = Phaser.Math.Clamp(ROCK_SPAWN_MIN_MS - this.score, ROCK_SPAWN_MIN_FLOOR_MS, ROCK_SPAWN_MIN_MS);
        const maxGap = Phaser.Math.Clamp(ROCK_SPAWN_MAX_MS - this.score, ROCK_SPAWN_MAX_FLOOR_MS, ROCK_SPAWN_MAX_MS);
        this.nextRockTime = time + Phaser.Math.Between(minGap, maxGap);
      }
    }

    if (time >= this.nextMudTime) {
      if (this.isHazardTooClose(MUD_SPAWN_X, MUD_DISPLAY_W, this.obstacles)) {
        this.nextMudTime = time + HAZARD_RETRY_MS;
      } else {
        this.spawnMud();
        this.nextMudTime = time + Phaser.Math.Between(MUD_SPAWN_MIN_MS, MUD_SPAWN_MAX_MS);
      }
    }

    const scrollDelta = effectiveScrollSpeed * dt;
    this.skyLayer.tilePositionX += (scrollDelta * PARALLAX_SKY) / this.skyScale;
    this.groundLayer.tilePositionX += (scrollDelta * PARALLAX_GROUND) / this.groundScale;

    this.score += effectiveScrollSpeed * dt * 0.1;
    const displayScore = Math.floor(this.score);
    if (displayScore !== this.displayedScore) {
      this.displayedScore = displayScore;
      this.scoreText.setText(displayScore.toString());
    }

    if (this.score >= this.nextHeartSpawnScore) {
      this.spawnHeartPickups();
      this.nextHeartSpawnScore += Phaser.Math.Between(
        HEART_PICKUP_SPAWN_MIN_SCORE,
        HEART_PICKUP_SPAWN_MAX_SCORE,
      );
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
    const rock = this.obstacles.create(ROCK_SPAWN_X, GROUND_SURFACE + ROCK_Y_OFFSET, 'obstacle');
    rock.setOrigin(0.5, 1);
    rock.setDisplaySize(OBSTACLE_DISPLAY_W, OBSTACLE_DISPLAY_H);
    rock.y = GROUND_SURFACE + ROCK_Y_OFFSET;
    this.setupRockPhysics(rock);
  }

  spawnMud() {
    const mud = this.mudPatches.create(MUD_SPAWN_X, GROUND_SURFACE + MUD_Y_OFFSET, 'mud');
    mud.setOrigin(0.5, 1);
    mud.setDisplaySize(MUD_DISPLAY_W, MUD_DISPLAY_H);
    mud.setDepth(-1);
    mud.y = GROUND_SURFACE + MUD_Y_OFFSET;
    this.setupMudPhysics(mud);
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

  formatGhostDateParts(savedAt) {
    if (!savedAt) {
      return { date: '—', time: '—' };
    }

    const value = new Date(savedAt);
    return {
      date: value.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }),
      time: value.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' }),
    };
  }

  paintRoundedRect(
    graphics,
    x,
    y,
    width,
    height,
    radius,
    fill,
    fillAlpha = 1,
    stroke,
    strokeAlpha = 1,
    lineWidth = 2,
  ) {
    graphics.clear();
    graphics.fillStyle(fill, fillAlpha);
    graphics.fillRoundedRect(x, y, width, height, radius);
    if (stroke !== undefined && stroke !== null) {
      graphics.lineStyle(lineWidth, stroke, strokeAlpha);
      graphics.strokeRoundedRect(x, y, width, height, radius);
    }
  }

  createModernButton(parent, x, y, width, label, variant, onSelect) {
    const styles = {
      primary: { bg: 0x2563eb, hover: 0x3b82f6, text: '#ffffff', border: null },
      secondary: { bg: 0x1e293b, hover: 0x334155, text: '#e2e8f0', border: 0x475569 },
      ghost: { bg: 0x0f172a, hover: 0x1e293b, text: '#cbd5e1', border: 0x334155 },
      success: { bg: 0x059669, hover: 0x10b981, text: '#ffffff', border: null },
    };
    const style = styles[variant] ?? styles.secondary;
    const height = 46;
    const container = this.add.container(x, y);
    container.setScrollFactor(0);
    const bg = this.add.graphics();
    const draw = (color) => {
      this.paintRoundedRect(
        bg,
        -width / 2,
        -height / 2,
        width,
        height,
        height / 2,
        color,
        1,
        style.border,
        1,
        style.border ? 1.5 : 0,
      );
    };

    draw(style.bg);
    const text = this.add
      .text(0, 0, label, {
        fontFamily: MODAL_FONT,
        fontSize: '15px',
        fontStyle: 'bold',
        color: style.text,
      })
      .setOrigin(0.5);

    const zone = this.add
      .zone(0, 0, width, height)
      .setInteractive({ useHandCursor: true })
      .setScrollFactor(0);
    zone.on('pointerover', () => draw(style.hover));
    zone.on('pointerout', () => draw(style.bg));
    zone.on('pointerdown', (_pointer, _x, _y, event) => {
      event?.stopPropagation();
      onSelect();
    });

    container.add([bg, text, zone]);
    parent.add(container);
    return container;
  }

  createModalButton(x, y, label, color, onSelect) {
    const variant =
      color === '#15803d' || color === '#059669' ? 'success' : color === '#374151' ? 'ghost' : 'primary';
    const container = this.add.container(x, y).setScrollFactor(0).setDepth(MODAL_CONTENT_DEPTH);
    return this.createModernButton(container, 0, 0, 320, label, variant, onSelect);
  }

  hideAllRaceModals() {
    this.postRaceMenu?.setVisible(false);
    this.saveGhostModal?.setVisible(false);
    this.ghostLibraryModal?.setVisible(false);
    this.modalDimmer?.setVisible(false);
  }

  ensureModalDimmer() {
    if (!this.modalDimmer) {
      this.modalDimmer = this.add
        .rectangle(WIDTH / 2, HEIGHT / 2, WIDTH, HEIGHT, 0x020617, 0.72)
        .setScrollFactor(0)
        .setDepth(MODAL_DIMMER_DEPTH)
        .setVisible(false);
    }

    return this.modalDimmer;
  }

  createGhostReplayCard(replay, y, rowWidth, rowHeight, selected, onSelect) {
    const card = this.add.container(0, y + rowHeight / 2);
    const cardW = rowWidth;
    const cardH = rowHeight - 8;
    const parts = this.formatGhostDateParts(replay.savedAt);
    const bg = this.add.graphics();
    const accent = this.add.graphics();

    const paintCard = (hover = false) => {
      const fill = selected ? 0x172554 : hover ? 0x1e293b : 0x111827;
      const stroke = selected ? 0x38bdf8 : 0x273449;
      this.paintRoundedRect(bg, -cardW / 2, -cardH / 2, cardW, cardH, 14, fill, 0.98, stroke, selected ? 1 : 0.9, selected ? 2 : 1);
      accent.clear();
      if (selected) {
        accent.fillStyle(0x38bdf8, 1);
        accent.fillRoundedRect(-cardW / 2, -cardH / 2 + 8, 4, cardH - 16, 2);
      }
    };

    paintCard();

    const distanceText = this.add
      .text(-cardW / 2 + 22, -6, `${replay.finalScore} m`, {
        fontFamily: MODAL_FONT,
        fontSize: '22px',
        fontStyle: 'bold',
        color: selected ? '#7dd3fc' : '#f8fafc',
      })
      .setOrigin(0, 0.5);

    const dateText = this.add
      .text(-cardW / 2 + 22, 14, parts.date, {
        fontFamily: MODAL_FONT,
        fontSize: '12px',
        color: '#94a3b8',
      })
      .setOrigin(0, 0.5);

    const timeText = this.add
      .text(-cardW / 2 + 22 + dateText.width + 10, 14, parts.time, {
        fontFamily: MODAL_FONT,
        fontSize: '12px',
        color: '#64748b',
      })
      .setOrigin(0, 0.5);

    const durationBg = this.add.graphics();
    const durationLabel = this.formatGhostDuration(replay.durationMs);
    const pillW = Math.max(52, durationLabel.length * 8 + 20);
    this.paintRoundedRect(durationBg, cardW / 2 - pillW - 14, -12, pillW, 24, 12, 0x0f172a, 1, 0x334155, 1, 1);
    const durationText = this.add
      .text(cardW / 2 - pillW / 2 - 14, 0, durationLabel, {
        fontFamily: MODAL_FONT,
        fontSize: '12px',
        fontStyle: 'bold',
        color: '#cbd5e1',
      })
      .setOrigin(0.5);

    const zone = this.add.zone(0, 0, cardW, cardH).setInteractive({ useHandCursor: true });
    zone.on('pointerover', () => paintCard(true));
    zone.on('pointerout', () => paintCard(false));
    zone.on('pointerdown', (_pointer, _x, _y, event) => {
      event?.stopPropagation();
      onSelect();
    });

    card.add([bg, accent, distanceText, dateText, timeText, durationBg, durationText, zone]);
    return card;
  }

  showPostRaceMenu() {
    this.hideAllRaceModals();
    const dimmer = this.ensureModalDimmer();
    dimmer.setVisible(true);
    dimmer.setDepth(MODAL_DIMMER_DEPTH);

    if (!this.postRaceMenu) {
      const pw = POST_RACE_PANEL_W;
      const ph = POST_RACE_PANEL_H;

      this.postRaceMenu = this.add
        .container(WIDTH / 2, HEIGHT / 2)
        .setScrollFactor(0)
        .setDepth(MODAL_CONTENT_DEPTH);

      this.postRacePanelBg = this.add.graphics();
      this.paintRoundedRect(
        this.postRacePanelBg,
        -pw / 2,
        -ph / 2,
        pw,
        ph,
        28,
        0x0b1220,
        0.98,
        0x334155,
        0.85,
        1.5,
      );

      this.postRaceTitleText = this.add
        .text(0, -ph / 2 + 40, 'Game Over', {
          fontFamily: MODAL_FONT,
          fontSize: '28px',
          fontStyle: 'bold',
          color: '#f8fafc',
        })
        .setOrigin(0.5);

      this.postRaceScoreText = this.add
        .text(0, -ph / 2 + 88, '', {
          fontFamily: MODAL_FONT,
          fontSize: '48px',
          fontStyle: 'bold',
          color: '#7dd3fc',
        })
        .setOrigin(0.5);

      this.postRaceSubText = this.add
        .text(0, -ph / 2 + 132, '', {
          fontFamily: MODAL_FONT,
          fontSize: '15px',
          color: '#94a3b8',
          align: 'center',
          wordWrap: { width: pw - 48 },
        })
        .setOrigin(0.5, 0);

      this.postRaceContinueButton = this.createModernButton(
        this.postRaceMenu,
        0,
        ph / 2 - 148,
        320,
        'Continue',
        'primary',
        () => this.scene.restart(),
      );
      this.postRaceSaveButton = this.createModernButton(
        this.postRaceMenu,
        0,
        ph / 2 - 92,
        320,
        'Save ghost race',
        'success',
        () => this.openSaveGhostModal(),
      );
      this.postRaceLibraryButton = this.createModernButton(
        this.postRaceMenu,
        0,
        ph / 2 - 36,
        320,
        'Ghost library',
        'secondary',
        () => this.openGhostLibraryModal('postRace'),
      );

      this.postRaceMenu.add([
        this.postRacePanelBg,
        this.postRaceTitleText,
        this.postRaceScoreText,
        this.postRaceSubText,
      ]);
    }

    const beatGhost =
      this.ghostBestAtRunStart &&
      Math.floor(this.score) > this.ghostBestAtRunStart.finalScore;
    const canSave = Boolean(this.pendingRunRecording);

    this.postRaceScoreText.setText(`${Math.floor(this.score)}m`);
    this.postRaceSubText.setText(
      beatGhost
        ? `You beat your ghost (${this.ghostBestAtRunStart.finalScore}m)!`
        : this.ghostBestAtRunStart
          ? `Ghost raced: ${this.ghostBestAtRunStart.finalScore}m`
          : canSave
            ? 'Save this run as a ghost snapshot.'
            : 'Run too short to save as ghost.',
    );

    this.postRaceSaveButton.setVisible(canSave);

    this.postRaceMenu.setDepth(MODAL_CONTENT_DEPTH);
    this.postRaceMenu.setVisible(true);
    this.children.bringToTop(dimmer);
    this.children.bringToTop(this.postRaceMenu);
  }

  openSaveGhostModal() {
    if (!this.pendingRunRecording) {
      return;
    }

    this.hideAllRaceModals();
    const dimmer = this.ensureModalDimmer();
    dimmer.setVisible(true);

    if (!this.saveGhostModal) {
      this.saveGhostModal = this.add
        .container(WIDTH / 2, HEIGHT / 2)
        .setScrollFactor(0)
        .setDepth(MODAL_CONTENT_DEPTH);

      const pw = SAVE_MODAL_PANEL_W;
      const ph = SAVE_MODAL_PANEL_H;

      this.saveGhostPanelBg = this.add.graphics();
      this.paintRoundedRect(
        this.saveGhostPanelBg,
        -pw / 2,
        -ph / 2,
        pw,
        ph,
        28,
        0x0b1220,
        0.96,
        0x334155,
        0.85,
        1.5,
      );

      this.saveGhostTitle = this.add
        .text(0, -ph / 2 + 36, 'Save ghost race?', {
          fontFamily: MODAL_FONT,
          fontSize: '24px',
          fontStyle: 'bold',
          color: '#f8fafc',
        })
        .setOrigin(0.5);

      this.saveGhostSubtitle = this.add
        .text(0, -ph / 2 + 64, 'Compare with your current ghost', {
          fontFamily: MODAL_FONT,
          fontSize: '13px',
          color: '#94a3b8',
        })
        .setOrigin(0.5);

      const cardW = 168;
      const cardH = 132;
      this.saveRunCard = this.add.container(-90, -12);
      this.saveRunCardBg = this.add.graphics();
      this.paintRoundedRect(
        this.saveRunCardBg,
        -cardW / 2,
        -cardH / 2,
        cardW,
        cardH,
        16,
        0x052e16,
        0.55,
        0x34d399,
        0.7,
        1.5,
      );
      this.saveRunCardTag = this.add
        .text(0, -cardH / 2 + 18, 'THIS RUN', {
          fontFamily: MODAL_FONT,
          fontSize: '11px',
          fontStyle: 'bold',
          color: '#6ee7b7',
          letterSpacing: 1.2,
        })
        .setOrigin(0.5);
      this.saveRunDistance = this.add
        .text(0, -8, '', {
          fontFamily: MODAL_FONT,
          fontSize: '30px',
          fontStyle: 'bold',
          color: '#ecfdf5',
        })
        .setOrigin(0.5);
      this.saveRunMeta = this.add
        .text(0, 28, '', {
          fontFamily: MODAL_FONT,
          fontSize: '12px',
          color: '#a7f3d0',
          align: 'center',
          wordWrap: { width: cardW - 20 },
        })
        .setOrigin(0.5);
      this.saveRunCard.add([
        this.saveRunCardBg,
        this.saveRunCardTag,
        this.saveRunDistance,
        this.saveRunMeta,
      ]);

      this.saveVsCard = this.add.container(90, -12);
      this.saveVsCardBg = this.add.graphics();
      this.paintRoundedRect(
        this.saveVsCardBg,
        -cardW / 2,
        -cardH / 2,
        cardW,
        cardH,
        16,
        0x111827,
        0.95,
        0x334155,
        1,
        1.5,
      );
      this.saveVsCardTag = this.add
        .text(0, -cardH / 2 + 18, 'CURRENT GHOST', {
          fontFamily: MODAL_FONT,
          fontSize: '11px',
          fontStyle: 'bold',
          color: '#94a3b8',
          letterSpacing: 1.2,
        })
        .setOrigin(0.5);
      this.saveVsDistance = this.add
        .text(0, -8, '', {
          fontFamily: MODAL_FONT,
          fontSize: '30px',
          fontStyle: 'bold',
          color: '#f8fafc',
        })
        .setOrigin(0.5);
      this.saveVsMeta = this.add
        .text(0, 28, '', {
          fontFamily: MODAL_FONT,
          fontSize: '12px',
          color: '#94a3b8',
          align: 'center',
          wordWrap: { width: cardW - 20 },
        })
        .setOrigin(0.5);
      this.saveVsCard.add([this.saveVsCardBg, this.saveVsCardTag, this.saveVsDistance, this.saveVsMeta]);

      this.saveGhostSlotsBg = this.add.graphics();
      this.saveGhostSlotsFill = this.add.graphics();
      this.saveGhostSlotsText = this.add
        .text(0, 108, '', {
          fontFamily: MODAL_FONT,
          fontSize: '12px',
          color: '#94a3b8',
        })
        .setOrigin(0.5);

      this.saveGhostConfirmButton = this.createModernButton(
        this.saveGhostModal,
        -92,
        ph / 2 - 42,
        156,
        'Save',
        'success',
        () => {
          this.savePendingRunRecording();
          this.openGhostLibraryModal('postRace');
        },
      );
      this.saveGhostCancelButton = this.createModernButton(
        this.saveGhostModal,
        92,
        ph / 2 - 42,
        156,
        'Back',
        'secondary',
        () => this.showPostRaceMenu(),
      );

      this.saveGhostModal.add([
        this.saveGhostPanelBg,
        this.saveGhostTitle,
        this.saveGhostSubtitle,
        this.saveRunCard,
        this.saveVsCard,
        this.saveGhostSlotsBg,
        this.saveGhostSlotsFill,
        this.saveGhostSlotsText,
      ]);
    }

    const run = this.pendingRunRecording;
    const selected = this.getSelectedGhostReplay();
    const runParts = this.formatGhostDateParts(Date.now());
    const barW = 320;
    const filled = this.ghostLibrary.replays.length / GHOST_MAX_SAVED;

    this.saveRunDistance.setText(`${run.finalScore}m`);
    this.saveRunMeta.setText(`${runParts.date}\n${runParts.time} · ${this.formatGhostDuration(run.durationMs)}`);

    if (selected) {
      const ghostParts = this.formatGhostDateParts(selected.savedAt);
      this.saveVsDistance.setText(`${selected.finalScore}m`);
      this.saveVsMeta.setText(`${ghostParts.date}\n${ghostParts.time} · ${this.formatGhostDuration(selected.durationMs)}`);
    } else {
      this.saveVsDistance.setText('—');
      this.saveVsMeta.setText('No ghost selected\nWill become active ghost');
    }

    this.paintRoundedRect(this.saveGhostSlotsBg, -barW / 2, 88, barW, 8, 4, 0x1e293b, 1, null);
    this.paintRoundedRect(
      this.saveGhostSlotsFill,
      -barW / 2,
      88,
      Math.max(12, barW * filled),
      8,
      4,
      0x38bdf8,
      1,
      null,
    );
    this.saveGhostSlotsText.setText(`${this.ghostLibrary.replays.length} of ${GHOST_MAX_SAVED} snapshots used`);
    this.saveGhostModal.setDepth(MODAL_CONTENT_DEPTH);
    this.saveGhostModal.setVisible(true);
    this.children.bringToTop(dimmer);
    this.children.bringToTop(this.saveGhostModal);
  }

  destroyGhostLibraryRows() {
    if (this.ghostLibraryList) {
      this.ghostLibraryList.removeAll(true);
    }

    this.ghostLibraryRows = [];
  }

  openGhostLibraryModal(returnTarget = 'postRace') {
    this.modalReturnTarget = returnTarget;
    this.hideAllRaceModals();
    const dimmer = this.ensureModalDimmer();
    dimmer.setVisible(true);

    if (!this.ghostLibraryModal) {
      const pw = GHOST_LIB_PANEL_W;
      const ph = GHOST_LIB_PANEL_H;

      this.ghostLibraryModal = this.add
        .container(WIDTH / 2, HEIGHT / 2)
        .setScrollFactor(0)
        .setDepth(MODAL_CONTENT_DEPTH);

      this.ghostLibraryPanelBg = this.add.graphics();
      this.paintRoundedRect(
        this.ghostLibraryPanelBg,
        -pw / 2,
        -ph / 2,
        pw,
        ph,
        28,
        0x0b1220,
        0.96,
        0x334155,
        0.85,
        1.5,
      );

      this.ghostLibraryTitle = this.add
        .text(-pw / 2 + 28, -ph / 2 + 30, 'Ghost Races', {
          fontFamily: MODAL_FONT,
          fontSize: '24px',
          fontStyle: 'bold',
          color: '#f8fafc',
        })
        .setOrigin(0, 0.5);

      this.ghostLibraryBadgeBg = this.add.graphics();
      this.ghostLibraryBadge = this.add
        .text(pw / 2 - 28, -ph / 2 + 30, '', {
          fontFamily: MODAL_FONT,
          fontSize: '12px',
          fontStyle: 'bold',
          color: '#bae6fd',
        })
        .setOrigin(1, 0.5);

      this.ghostLibraryHint = this.add
        .text(-pw / 2 + 28, -ph / 2 + 58, 'Select a snapshot to race against', {
          fontFamily: MODAL_FONT,
          fontSize: '13px',
          color: '#94a3b8',
        })
        .setOrigin(0, 0.5);

      this.ghostLibraryList = this.add.container(0, -ph / 2 + 112);
      this.ghostLibraryRows = [];

      this.ghostLibraryNoGhostButton = this.createModernButton(
        this.ghostLibraryModal,
        -92,
        ph / 2 - 42,
        156,
        'No ghost',
        'ghost',
        () => {
          this.setSelectedGhostReplay(null);
          this.refreshGhostLibraryModal();
        },
      );
      this.ghostLibraryBackButton = this.createModernButton(
        this.ghostLibraryModal,
        92,
        ph / 2 - 42,
        156,
        'Done',
        'primary',
        () => {
          if (this.modalReturnTarget === 'postRace' && this.isGameOver) {
            this.showPostRaceMenu();
          } else {
            this.hideAllRaceModals();
          }
        },
      );

      this.ghostLibraryModal.add([
        this.ghostLibraryPanelBg,
        this.ghostLibraryTitle,
        this.ghostLibraryBadgeBg,
        this.ghostLibraryBadge,
        this.ghostLibraryHint,
        this.ghostLibraryList,
      ]);
    }

    this.refreshGhostLibraryModal();
    this.ghostLibraryModal.setDepth(MODAL_CONTENT_DEPTH);
    this.ghostLibraryModal.setVisible(true);
    this.children.bringToTop(dimmer);
    this.children.bringToTop(this.ghostLibraryModal);
  }

  refreshGhostLibraryModal() {
    if (!this.ghostLibraryList) {
      return;
    }

    this.destroyGhostLibraryRows();
    this.ghostLibrary = this.loadGhostLibrary();
    const replays = this.ghostLibrary.replays;
    const rowHeight = 52;
    const rowWidth = 352;
    const visibleHeight = rowHeight * GHOST_MAX_SAVED;
    const count = replays.length;
    const badgeLabel = `${count}/${GHOST_MAX_SAVED}`;
    const badgeW = badgeLabel.length * 8 + 24;

    this.paintRoundedRect(
      this.ghostLibraryBadgeBg,
      GHOST_LIB_PANEL_W / 2 - 28 - badgeW,
      -GHOST_LIB_PANEL_H / 2 + 30 - 12,
      badgeW,
      24,
      12,
      0x172554,
      1,
      0x38bdf8,
      0.45,
      1,
    );
    this.ghostLibraryBadge.setText(badgeLabel);

    if (count === 0) {
      const emptyCard = this.add.graphics();
      this.paintRoundedRect(emptyCard, -rowWidth / 2, 36, rowWidth, 120, 16, 0x111827, 1, 0x273449, 1, 1);
      const emptyTitle = this.add
        .text(0, 72, 'No saved ghosts yet', {
          fontFamily: MODAL_FONT,
          fontSize: '16px',
          fontStyle: 'bold',
          color: '#e2e8f0',
        })
        .setOrigin(0.5);
      const emptyHint = this.add
        .text(0, 98, 'Finish a run, then tap Save ghost race', {
          fontFamily: MODAL_FONT,
          fontSize: '13px',
          color: '#64748b',
        })
        .setOrigin(0.5);
      this.ghostLibraryList.add([emptyCard, emptyTitle, emptyHint]);
      this.ghostLibraryRows.push(emptyCard, emptyTitle, emptyHint);
      return;
    }

    const listMask = this.make.graphics();
    listMask.fillStyle(0xffffff);
    listMask.fillRect(-rowWidth / 2, 0, rowWidth, visibleHeight);
    this.ghostLibraryList.clearMask(true);
    this.ghostLibraryList.setMask(listMask.createGeometryMask());

    replays.slice(0, GHOST_MAX_SAVED).forEach((replay, index) => {
      const selected = this.ghostLibrary.selectedId === replay.id;
      const card = this.createGhostReplayCard(replay, index * rowHeight, rowWidth, rowHeight, selected, () => {
        this.setSelectedGhostReplay(replay.id);
        this.refreshGhostLibraryModal();
      });
      this.ghostLibraryList.add(card);
      this.ghostLibraryRows.push(card);
    });
  }

  isPointerOverRaceUi(pointer) {
    if (this.postRaceMenu?.visible) {
      return true;
    }

    if (this.saveGhostModal?.visible) {
      return true;
    }

    if (this.ghostLibraryModal?.visible) {
      return true;
    }

    if (
      this.preRaceGhostButton?.visible &&
      this.preRaceGhostButton.getBounds().contains(pointer.x, pointer.y)
    ) {
      return true;
    }

    return false;
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

    this.pendingRunRecording = this.buildPendingRunRecording(this.time.now);
    this.ghostDog?.setVisible(false);

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
    this.showPostRaceMenu();
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
