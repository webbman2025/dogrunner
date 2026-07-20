import Phaser from 'phaser';
import { getPetConfig, loadSelectedPet, normalizePet } from '../petConfig.js';
import { hidePauseMenu } from '../pauseMenuDom.js';
import { hideGameOverMenu } from '../gameOverMenuDom.js';
import {
  areSharedGameAssetsReady,
  queuePetAssets,
  queueSharedGameAssets,
} from './queueGameAssets.js';

const WIDTH = 480;
const HEIGHT = 800;
const FIGMA_W = 375;
const FIGMA_H = 812;
const LOADING_BG = 0x53a4fd;
const BAR_FILL = 0xff0000;
const READY_HOLD_MS = 120;

const sx = (value) => (value * WIDTH) / FIGMA_W;
const sy = (value) => (value * HEIGHT) / FIGMA_H;

const PET_X = 89 + 196 / 2;
const PET_Y = 295 + 196 / 2;
const PET_SIZE = 160;
const BAR_X = 66;
const BAR_Y = 482;
const BAR_W = 243;
const BAR_H = 35;
const BAR_PAD = 5;
const BAR_INNER_H = 25;
const BAR_RADIUS = 20;

export default class LoadingScene extends Phaser.Scene {
  constructor() {
    super('LoadingScene');
  }

  init(data) {
    const pet = normalizePet(data?.pet ?? loadSelectedPet());
    this.pet = pet;
    this.petConfig = getPetConfig(pet);
    this.pendingGameData = {
      ghostRace: Boolean(data?.ghostRace),
      pet,
    };
  }

  preload() {
    this.cameras.main.setBackgroundColor(LOADING_BG);
    this.createProgressBar();
    this.createProgressLabel();

    this.onLoadProgress = (value) => {
      this.setProgress(value, 'Loading');
    };
    this.load.on('progress', this.onLoadProgress);

    if (!areSharedGameAssetsReady(this.textures)) {
      queueSharedGameAssets(this.load, this.textures);
    }

    queuePetAssets(this.load, this.textures, this.pet, { includeRunFrames: true });
  }

  create() {
    hidePauseMenu();
    hideGameOverMenu();
    this.anims.resumeAll();
    this.tweens.resumeAll();

    if (this.anims.exists('loading-run')) {
      this.anims.remove('loading-run');
    }

    this.anims.create({
      key: 'loading-run',
      frames: Array.from({ length: this.petConfig.runFrameCount }, (_, i) => ({
        key: this.petConfig.textureKeys.run(i),
      })),
      frameRate: 12,
      repeat: -1,
    });

    this.createPetPreview();
    this.setProgress(1, 'Ready');
    this.startTimer = this.time.delayedCall(READY_HOLD_MS, () => this.startGame());
  }

  shutdown() {
    if (this.onLoadProgress) {
      this.load.off('progress', this.onLoadProgress);
      this.onLoadProgress = null;
    }

    this.startTimer?.remove(false);
    this.startTimer = null;
    this.loadingPet?.anims?.stop();

    if (this.anims.exists('loading-run')) {
      this.anims.remove('loading-run');
    }
  }

  createPetPreview() {
    const petSize = sx(PET_SIZE);
    const shadow = this.petConfig.shadow.loading;

    this.add
      .ellipse(sx(shadow.x), sy(shadow.y), sx(shadow.width), sy(shadow.height), 0x000000, shadow.alpha)
      .setDepth(1);

    this.loadingPet = this.add
      .sprite(sx(PET_X), sy(PET_Y), this.petConfig.textureKeys.run(0))
      .setDisplaySize(petSize, petSize)
      .setDepth(2);

    this.loadingPet.play('loading-run');
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

    this.barFill = this.add.graphics().setDepth(4);

    this.barMetrics = {
      innerX,
      innerY,
      innerW,
      innerH,
      innerRadius,
    };

    this.setProgress(0, 'Loading');
  }

  createProgressLabel() {
    this.progressLabel = this.add
      .text(WIDTH / 2, sy(BAR_Y) + sx(BAR_H) + sy(12), 'Loading 0%', {
        fontFamily: 'Arial, sans-serif',
        fontSize: `${Math.round(sy(16))}px`,
        color: '#ffffff',
        stroke: '#000000',
        strokeThickness: 3,
      })
      .setOrigin(0.5, 0)
      .setDepth(5);
  }

  setProgress(value, labelPrefix = 'Loading') {
    const progress = Phaser.Math.Clamp(value, 0, 1);
    const { innerX, innerY, innerW, innerH, innerRadius } = this.barMetrics;
    const fillW = innerW * progress;

    this.barFill.clear();
    if (fillW > 0) {
      this.barFill.fillStyle(BAR_FILL, 1);
      this.barFill.fillRoundedRect(innerX, innerY, fillW, innerH, innerRadius);
    }

    this.progressLabel?.setText(`${labelPrefix} ${Math.round(progress * 100)}%`);
  }

  startGame() {
    this.loadingPet?.anims.stop();
    this.scene.start('GameScene', this.pendingGameData);
  }
}
