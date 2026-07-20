import Phaser from 'phaser';
import { PET_TYPES, saveSelectedPet } from '../petConfig.js';
import { resetPauseOverlay } from '../pauseMenuDom.js';
import { createImageButton, imageDisplaySize } from '../ui/figmaButton.js';
import { queuePetAssets, queueSharedGameAssets, startGameWithLoading } from './queueGameAssets.js';

const WIDTH = 480;
const HEIGHT = 800;
const FIGMA_W = 375;
const FIGMA_H = 812;

const sx = (value) => (value * WIDTH) / FIGMA_W;
const sy = (value) => (value * HEIGHT) / FIGMA_H;

// Figma node 43:841 — Select screen layout (375×812)
const BG = { x: 187.5, y: 460, w: 375 };
const DOG_IMG = { x: 93.5, y: 380.5, w: 117 };
const DOG_BTN = { x: 95, y: 574.5, w: 150 };
const CAT_IMG = { x: 284.5, y: 385.47, w: 157 };
const CAT_BTN = { x: 284.5, y: 572.22, w: 157 };
const HOME_BTN = { x: 191.5, y: 680, w: 172 };

export default class SelectPetScene extends Phaser.Scene {
  constructor() {
    super('SelectPetScene');
  }

  init(data) {
    this.pendingGhostRace = Boolean(data?.ghostRace);
  }

  preload() {
    this.load.image('select-pet-background', 'assets/ui/select-pet-background.png');
    this.load.image('select-pet-dog', 'assets/ui/select-pet-dog.png');
    this.load.image('select-pet-dog-btn', 'assets/ui/select-pet-dog-btn.png');
    this.load.image('select-pet-cat', 'assets/ui/select-pet-cat.png');
    this.load.image('select-pet-cat-btn', 'assets/ui/select-pet-cat-btn.png');
    this.load.image('select-pet-home-btn', 'assets/ui/select-pet-home-btn.png');
    queueSharedGameAssets(this.load, this.textures);
    queuePetAssets(this.load, this.textures, PET_TYPES.dog, { includeRunFrames: true });
    queuePetAssets(this.load, this.textures, PET_TYPES.cat, { includeRunFrames: true });
  }

  create() {
    resetPauseOverlay();
    this.anims.resumeAll();
    this.tweens.resumeAll();

    this.cameras.main.setBackgroundColor(0x000000);
    this.createLayout();
  }

  createLayout() {
    const bgSize = imageDisplaySize(this, 'select-pet-background', sx(BG.w));
    this.add
      .image(sx(BG.x), sy(BG.y), 'select-pet-background')
      .setDisplaySize(bgSize.width, bgSize.height)
      .setDepth(0);

    this.placeImage('select-pet-dog', DOG_IMG, 5);
    this.placeImage('select-pet-cat', CAT_IMG, 5);

    createImageButton(
      this,
      sx(DOG_BTN.x),
      sy(DOG_BTN.y),
      ...this.sizeFor('select-pet-dog-btn', DOG_BTN.w),
      'select-pet-dog-btn',
      () => this.selectPet(PET_TYPES.dog),
    );

    createImageButton(
      this,
      sx(CAT_BTN.x),
      sy(CAT_BTN.y),
      ...this.sizeFor('select-pet-cat-btn', CAT_BTN.w),
      'select-pet-cat-btn',
      () => this.selectPet(PET_TYPES.cat),
    );

    createImageButton(
      this,
      sx(HOME_BTN.x),
      sy(HOME_BTN.y),
      ...this.sizeFor('select-pet-home-btn', HOME_BTN.w),
      'select-pet-home-btn',
      () => this.scene.start('TitleScene'),
    );
  }

  sizeFor(key, figmaW) {
    const size = imageDisplaySize(this, key, sx(figmaW));
    return [size.width, size.height];
  }

  placeImage(key, spec, depth) {
    const size = imageDisplaySize(this, key, sx(spec.w));
    this.add
      .image(sx(spec.x), sy(spec.y), key)
      .setDisplaySize(size.width, size.height)
      .setDepth(depth);
  }

  selectPet(pet) {
    saveSelectedPet(pet);
    startGameWithLoading(this, {
      ghostRace: this.pendingGhostRace,
      pet,
    });
  }
}
