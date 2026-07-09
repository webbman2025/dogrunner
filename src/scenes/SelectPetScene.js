import Phaser from 'phaser';
import { getPetConfig, PET_TYPES, saveSelectedPet } from '../petConfig.js';
import { resetPauseOverlay } from '../pauseMenuDom.js';

const WIDTH = 480;
const HEIGHT = 800;
const FIGMA_W = 375;
const FIGMA_H = 812;
const BORDER_COLOR = 0x6d5a55;
const BTN_YELLOW = 0xffe500;
const sx = (value) => (value * WIDTH) / FIGMA_W;
const sy = (value) => (value * HEIGHT) / FIGMA_H;

export default class SelectPetScene extends Phaser.Scene {
  constructor() {
    super('SelectPetScene');
  }

  init(data) {
    this.pendingGhostRace = Boolean(data?.ghostRace);
  }

  preload() {
    this.load.image('title-background', 'assets/ui/title-background.png');
    this.load.image(PET_TYPES.dog, getPetConfig(PET_TYPES.dog).previewPath);
    this.load.image(PET_TYPES.cat, getPetConfig(PET_TYPES.cat).previewPath);
  }

  create() {
    resetPauseOverlay();
    this.anims.resumeAll();
    this.tweens.resumeAll();

    this.createBackground();
    this.createTitle();
    this.createPetOptions();
    this.createBackButton();
  }

  createBackground() {
    const bg = this.add.image(WIDTH / 2, HEIGHT / 2, 'title-background');
    const scale = Math.max(WIDTH / bg.width, HEIGHT / bg.height);
    bg.setScale(scale);
    bg.setDepth(0);
  }

  createTitle() {
    this.add
      .text(WIDTH / 2, sy(120), 'Select Pet', {
        fontFamily: '"Noto Sans", Arial, sans-serif',
        fontSize: `${Math.round(sy(34))}px`,
        fontStyle: 'bold',
        color: '#ffffff',
        stroke: '#000000',
        strokeThickness: 6,
      })
      .setOrigin(0.5)
      .setDepth(10);
  }

  createPetOptions() {
    const cardW = sx(150);
    const cardH = sy(210);
    const y = sy(360);
    const gap = sx(24);
    const leftX = WIDTH / 2 - cardW / 2 - gap / 2;
    const rightX = WIDTH / 2 + cardW / 2 + gap / 2;

    this.createPetCard(leftX, y, cardW, cardH, PET_TYPES.dog);
    this.createPetCard(rightX, y, cardW, cardH, PET_TYPES.cat);
  }

  createPetCard(x, y, width, height, pet) {
    const config = getPetConfig(pet);
    const container = this.add.container(x, y).setDepth(20);
    const radius = sy(16);
    const bg = this.add.graphics();

    const draw = (selected = false) => {
      bg.clear();
      bg.fillStyle(selected ? BTN_YELLOW : 0xffffff, 1);
      bg.lineStyle(Math.max(2, sy(2)), BORDER_COLOR, 1);
      bg.fillRoundedRect(-width / 2, -height / 2, width, height, radius);
      bg.strokeRoundedRect(-width / 2, -height / 2, width, height, radius);
    };

    draw(false);

    const previewSize = sx(110);
    const preview = this.add
      .image(0, -sy(18), pet)
      .setDisplaySize(previewSize, previewSize);

    const label = this.add
      .text(0, height / 2 - sy(34), config.label, {
        fontFamily: '"Noto Sans", Arial, sans-serif',
        fontSize: `${Math.round(sy(24))}px`,
        fontStyle: 'bold',
        color: '#000000',
      })
      .setOrigin(0.5);

    container.add([bg, preview, label]);
    container.setSize(width, height);
    container.setInteractive(
      new Phaser.Geom.Rectangle(-width / 2, -height / 2, width, height),
      Phaser.Geom.Rectangle.Contains,
    );

    container.on('pointerdown', () => {
      this.tweens.add({
        targets: container,
        scaleX: 0.97,
        scaleY: 0.97,
        duration: 70,
        yoyo: true,
        onComplete: () => this.selectPet(pet),
      });
    });

    container.on('pointerover', () => draw(true));
    container.on('pointerout', () => draw(false));
  }

  createBackButton() {
    this.createFigmaButton(WIDTH / 2, sy(680), sx(180), sy(45), {
      label: 'Back',
      fill: 0xffffff,
      textColor: '#000000',
      fontSize: `${Math.round(sy(18))}px`,
      onSelect: () => this.scene.start('TitleScene'),
    });
  }

  createFigmaButton(x, y, width, height, spec) {
    const radius = height / 2;
    const container = this.add.container(x, y).setDepth(20);
    const bg = this.add.graphics();

    const draw = (alpha = 1) => {
      bg.clear();
      bg.fillStyle(spec.fill, alpha);
      bg.lineStyle(Math.max(2, sy(2)), BORDER_COLOR, 1);
      bg.fillRoundedRect(-width / 2, -height / 2, width, height, radius);
      bg.strokeRoundedRect(-width / 2, -height / 2, width, height, radius);
    };

    draw();

    const text = this.add
      .text(0, 0, spec.label, {
        fontFamily: '"Noto Sans", Arial, sans-serif',
        fontSize: spec.fontSize,
        fontStyle: 'bold',
        color: spec.textColor,
        align: 'center',
      })
      .setOrigin(0.5);

    container.add([bg, text]);
    container.setSize(width, height);
    container.setInteractive(
      new Phaser.Geom.Rectangle(-width / 2, -height / 2, width, height),
      Phaser.Geom.Rectangle.Contains,
    );

    container.on('pointerdown', () => {
      this.tweens.add({
        targets: container,
        scaleX: 0.97,
        scaleY: 0.97,
        duration: 70,
        yoyo: true,
        onComplete: spec.onSelect,
      });
    });

    container.on('pointerover', () => draw(0.94));
    container.on('pointerout', () => draw(1));

    return container;
  }

  selectPet(pet) {
    saveSelectedPet(pet);
    this.scene.start('LoadingScene', {
      ghostRace: this.pendingGhostRace,
      pet,
    });
  }
}
