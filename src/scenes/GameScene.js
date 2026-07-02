import Phaser from 'phaser';

const WIDTH = 480;
const HEIGHT = 800;
const GROUND_SURFACE = 740;
const DOG_Y_OFFSET = 0;
const DOG_X = 100;
const BASE_SCROLL_SPEED = 220;
const GRAVITY_RISE = 1000;
const GRAVITY_FALL = 1600;
const GRAVITY_HOLD_RISE = 550;
const ROCK_HEIGHT = 32;
const MIN_JUMP_VELOCITY = -800;
const MAX_JUMP_VELOCITY = -560;
const JUMP_HOLD_ACCEL = 1400;
const JUMP_CUT_FACTOR = 0.5;
const TAP_THRESHOLD_MS = 150;
const COYOTE_MS = 100;
const BG_TEXTURE_HEIGHT = 1024;
const PARALLAX_SKY = 0.3;
const PARALLAX_GROUND = 1;
const DOG_SCALE = 0.62;
const DOG_HITBOX = {
  x: 59,
  y: 194,
  w: 145,
  h: 58,
};
const DOG_FRAME_H = 263;
const SLEEP_Y_OFFSET = 10;
const DOG_HITBOX_BOTTOM = DOG_HITBOX.y + DOG_HITBOX.h;
const DOG_RUN_GROUND_Y =
  GROUND_SURFACE + DOG_Y_OFFSET + (DOG_FRAME_H - DOG_HITBOX_BOTTOM) * DOG_SCALE;
const DOG_SLEEP_Y = DOG_RUN_GROUND_Y + SLEEP_Y_OFFSET;
const ROCK_HITBOX = {
  x: 6,
  y: 6,
  w: 36,
  h: 22,
};
const DOG_SHADOW_DEPTH = -1;
const DOG_SHADOW_WIDTH = 120;
const DOG_SHADOW_HEIGHT = 14;
const DOG_SHADOW_Y_OFFSET = -30;
const ROCK_Y_OFFSET = DOG_SHADOW_Y_OFFSET;
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

export default class GameScene extends Phaser.Scene {
  static devWeather = WEATHER_MODES.DRY;
  static devDay = DAY_MODES.DAY;
  static devDayNightCycle = 'on';
  static devSpeed = 'fast';

  constructor() {
    super('GameScene');
  }

  preload() {
    this.load.image('sky', 'assets/front.png');
    this.load.image('ground', 'assets/ground.png');
    this.load.image('obstacle', 'assets/rock.png');

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

  updateHeartsHud() {
    for (let i = 0; i < MAX_HEARTS; i++) {
      this.heartIcons[i].setTexture(i < this.hearts ? 'heart-full' : 'heart-empty');
    }
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
      repeat: 0,
    });
  }

  setupDogPhysics() {
    this.dog.body.setSize(DOG_HITBOX.w, DOG_HITBOX.h);
    this.dog.body.setOffset(DOG_HITBOX.x, DOG_HITBOX.y);
    this.dog.refreshBody();
  }

  setupRockPhysics(rock) {
    rock.body.setSize(ROCK_HITBOX.w, ROCK_HITBOX.h);
    rock.body.setOffset(ROCK_HITBOX.x, ROCK_HITBOX.y);
    rock.refreshBody();
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

  updateDogAnimation(onGround) {
    if (this.isGameOver) {
      return;
    }

    if (onGround) {
      this.wasAirborne = false;
      this.jumpPhase = null;

      if (this.dog.anims.currentAnim?.key !== 'run') {
        this.dog.play('run', true);
      }
      return;
    }

    const rising = this.dog.body.velocity.y < 0;
    const holdingJump = rising && this.isJumpInputHeld();

    if (!this.wasAirborne) {
      this.wasAirborne = true;
      this.jumpPhase = 'launch';
      this.dog.play('jump_launch');
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
      .rectangle(10, 42, 250, 202, 0x111827, 0.92)
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

    this.devMenuItems = [
      this.devPanelBg,
      ...Object.values(this.weatherButtons),
      ...Object.values(this.dayButtons),
      ...Object.values(this.speedButtons),
      ...Object.values(this.cycleButtons),
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
      if (this.isPointerOverDevMenu(pointer)) {
        return;
      }

      if (this.isGameOver) {
        this.scene.restart();
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
    this.nextRockTime = 0;
    this.jumpHeld = false;
    this.jumpPressTime = 0;
    this.coyoteMs = 0;
    this.wasAirborne = false;
    this.jumpPhase = null;

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

    this.obstacles = this.physics.add.staticGroup();

    this.physics.add.overlap(this.dog, this.obstacles, this.handleCollision, null, this);

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
  }

  update(time, delta) {
    this.updateRain(delta);
    this.updateDogShadow();

    if (this.isGameOver) {
      this.dog.x = DOG_X;
      this.dog.y = DOG_SLEEP_Y;
      return;
    }

    if (this.hitCooldownMs > 0) {
      this.hitCooldownMs = Math.max(0, this.hitCooldownMs - delta);
    }

    const dt = delta / 1000;

    const scrollDelta = this.scrollSpeed * dt;
    this.skyLayer.tilePositionX += (scrollDelta * PARALLAX_SKY) / this.skyScale;
    this.groundLayer.tilePositionX += (scrollDelta * PARALLAX_GROUND) / this.groundScale;

    this.score += this.scrollSpeed * dt * 0.1;
    this.scoreText.setText(Math.floor(this.score).toString());
    this.updateDayNightCycle(delta);

    const maxSpeed = 420 * this.speedMultiplier;
    const baseSpeed = BASE_SCROLL_SPEED * this.speedMultiplier;
    this.scrollSpeed = Math.min(baseSpeed + this.score * 0.05 * this.speedMultiplier, maxSpeed);

    if (time >= this.nextRockTime) {
      this.spawnRock();
      const minGap = Phaser.Math.Clamp(1800 - this.score * 2, 900, 1800);
      const maxGap = Phaser.Math.Clamp(3200 - this.score * 2, 1400, 3200);
      this.nextRockTime = time + Phaser.Math.Between(minGap, maxGap);
    }

    this.obstacles.getChildren().forEach((rock) => {
      rock.x -= this.scrollSpeed * dt;
      rock.refreshBody();

      if (rock.x < -rock.displayWidth) {
        rock.destroy();
      }
    });

    this.dog.x = DOG_X;
    this.dog.setVelocityX(0);

    const onGround = this.dog.body.blocked.down || this.dog.body.touching.down;
    if (onGround) {
      this.coyoteMs = COYOTE_MS;
    } else {
      this.coyoteMs = Math.max(0, this.coyoteMs - delta);
    }

    this.applyJumpPhysics(dt);
    this.updateDogAnimation(onGround);
  }

  isJumpInputHeld() {
    return this.jumpHeld || this.input.activePointer.isDown || this.spaceKey.isDown || this.cursors.up.isDown;
  }

  applyJumpPhysics(dt) {
    const rising = this.dog.body.velocity.y < 0;
    const holdingJump = rising && this.isJumpInputHeld();

    if (holdingJump) {
      this.dog.setGravityY(GRAVITY_HOLD_RISE);
      const nextVelocity = this.dog.body.velocity.y - JUMP_HOLD_ACCEL * dt;
      this.dog.setVelocityY(Math.max(MAX_JUMP_VELOCITY, nextVelocity));
      return;
    }

    this.dog.setGravityY(rising ? GRAVITY_RISE : GRAVITY_FALL);
  }

  spawnRock() {
    const rock = this.obstacles.create(WIDTH + 40, GROUND_SURFACE + ROCK_Y_OFFSET, 'obstacle');
    rock.setOrigin(0.5, 1);
    rock.y = GROUND_SURFACE + ROCK_Y_OFFSET;
    this.setupRockPhysics(rock);
  }

  canJump() {
    return (
      this.dog.body.blocked.down ||
      this.dog.body.touching.down ||
      this.coyoteMs > 0
    );
  }

  startJump() {
    if (this.isGameOver) {
      return;
    }

    this.jumpHeld = true;
    this.jumpPressTime = this.time.now;

    if (this.canJump()) {
      this.coyoteMs = 0;
      this.dog.setVelocityY(MIN_JUMP_VELOCITY);
    }
  }

  endJump() {
    this.jumpHeld = false;

    const heldFor = this.time.now - this.jumpPressTime;
    if (heldFor > TAP_THRESHOLD_MS && this.dog.body.velocity.y < 0) {
      const cutVelocity = this.dog.body.velocity.y * JUMP_CUT_FACTOR;
      this.dog.setVelocityY(Math.min(cutVelocity, MIN_JUMP_VELOCITY));
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

    this.isGameOver = true;
    this.wasAirborne = false;
    this.jumpPhase = null;
    this.physics.pause();
    this.tweens.killTweensOf(this.dog);
    this.dog.setAlpha(1);
    this.dog.setScale(DOG_SCALE);
    this.dog.play('dead');
    this.placeDogForDeath();

    this.add
      .text(WIDTH / 2, HEIGHT / 2, 'Game Over\nTap to Restart', {
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

    this.input.keyboard.once('keydown-SPACE', () => this.scene.restart());
    this.input.keyboard.once('keydown-UP', () => this.scene.restart());
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
