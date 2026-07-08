import Phaser from 'phaser';
import { hidePauseMenu } from '../pauseMenuDom.js';
import { queueGameAssets } from './queueGameAssets.js';

const WIDTH = 480;
const HEIGHT = 800;
const FIGMA_W = 375;
const FIGMA_H = 812;
const LOADING_BG = 0x53a4fd;
const BAR_FILL = 0xff0000;

const sx = (value) => (value * WIDTH) / FIGMA_W;
const sy = (value) => (value * HEIGHT) / FIGMA_H;

const DOG_X = 89 + 196 / 2;
const DOG_Y = 295 + 196 / 2;
const DOG_SIZE = 160;
const SHADOW_X = 120 + 133 / 2;
const SHADOW_Y = 438 + 11 / 2;
const SHADOW_W = 120;
const SHADOW_H = 11;
const BAR_X = 66;
const BAR_Y = 482;
const BAR_W = 243;
const BAR_H = 35;
const BAR_PAD = 5;
const BAR_INNER_H = 25;
const BAR_RADIUS = 20;
const MOCK_LOAD_MS = 1000;

export default class LoadingScene extends Phaser.Scene {
  constructor() {
    super('LoadingScene');
  }

  init(data) {
    this.pendingGameData = {
      ghostRace: Boolean(data?.ghostRace),
    };
  }

  preload() {
    queueGameAssets(this.load, this.textures, { includeRunFrames: true });
  }

  create() {
    hidePauseMenu();
    this.anims.resumeAll();
    this.tweens.resumeAll();

    this.cameras.main.setBackgroundColor(LOADING_BG);

    if (!this.anims.exists('loading-run')) {
      this.anims.create({
        key: 'loading-run',
        frames: Array.from({ length: 8 }, (_, i) => ({ key: `run_${i}` })),
        frameRate: 12,
        repeat: -1,
      });
    }

    this.createDog();
    this.createProgressBar();
    this.beginMockLoad();
  }

  createDog() {
    const dogSize = sx(DOG_SIZE);
    const shadowW = sx(SHADOW_W);
    const shadowH = sx(SHADOW_H);

    this.add
      .ellipse(sx(SHADOW_X), sy(SHADOW_Y), shadowW, shadowH, 0x000000, 0.6)
      .setDepth(1);

    this.loadingDog = this.add
      .sprite(sx(DOG_X), sy(DOG_Y), 'run_0')
      .setDisplaySize(dogSize, dogSize)
      .setDepth(2);

    this.loadingDog.play('loading-run');
  }

  createProgressBar() {
    const trackX = sx(BAR_X);
    const trackY = sy(BAR_Y);
    const trackW = sx(BAR_W);
    const trackH = sx(BAR_H);
    const radius = sx(BAR_RADIUS);
    const pad = sx(BAR_PAD);
    const innerW = trackW - pad * 2;
    const innerH = sx(BAR_INNER_H);
    const innerX = trackX + pad;
    const innerY = trackY + (trackH - innerH) / 2;
    const innerRadius = Math.min(radius - pad, innerH / 2);

    this.barTrack = this.add.graphics().setDepth(3);
    this.barTrack.fillStyle(0xffffff, 1);
    this.barTrack.fillRoundedRect(trackX, trackY, trackW, trackH, radius);

    this.barMask = this.make.graphics({ add: false });
    this.barMask.fillStyle(0xffffff, 1);
    this.barMask.fillRoundedRect(innerX, innerY, innerW, innerH, innerRadius);

    this.barFill = this.add.graphics().setDepth(4);
    this.barFill.setMask(this.barMask.createGeometryMask());

    this.barMetrics = {
      innerX,
      innerY,
      innerW,
      innerH,
    };

    this.setProgress(0);
  }

  setProgress(value) {
    const progress = Phaser.Math.Clamp(value, 0, 1);
    const { innerX, innerY, innerW, innerH } = this.barMetrics;
    const fillW = innerW * progress;

    this.barFill.clear();
    if (fillW <= 0) {
      return;
    }

    this.barFill.fillStyle(BAR_FILL, 1);
    this.barFill.fillRect(innerX, innerY, fillW, innerH);
  }

  beginMockLoad() {
    this.mockLoadComplete = false;
    this.loadProgress = { value: 0 };

    this.tweens.add({
      targets: this.loadProgress,
      value: 1,
      duration: MOCK_LOAD_MS,
      ease: 'Linear',
      onUpdate: () => {
        this.setProgress(this.loadProgress.value);
      },
      onComplete: () => {
        this.setProgress(1);
        this.mockLoadComplete = true;
        this.tryStartGame();
      },
    });
  }

  tryStartGame() {
    if (!this.mockLoadComplete) {
      return;
    }

    this.loadingDog?.anims.stop();
    this.scene.start('GameScene', this.pendingGameData);
  }
}
