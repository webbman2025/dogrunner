import Phaser from 'phaser';
import { resetPauseOverlay } from '../pauseMenuDom.js';
import { createFigmaButton, createImageButton, imageDisplaySize } from '../ui/figmaButton.js';

const WIDTH = 480;
const HEIGHT = 800;
const FIGMA_W = 375;
const FIGMA_H = 812;

const LOGO_TOP = 20;
const BG_Y_OFFSET = 35;

const BORDER_COLOR = 0x6d5a55;
const sx = (value) => (value * WIDTH) / FIGMA_W;
const sy = (value) => (value * HEIGHT) / FIGMA_H;

export default class TitleScene extends Phaser.Scene {
  constructor() {
    super('TitleScene');
  }

  preload() {
    this.load.image('title-background', 'assets/ui/title-background.png');
    this.load.image('title-logo', 'assets/ui/title-logo.png');
    this.load.image('title-cta-start', 'assets/ui/title-cta-start.png');
    this.load.image('title-cta-beat', 'assets/ui/title-cta-beat.png');
    this.load.image('title-cta-howto', 'assets/ui/title-cta-howto.png');
  }

  create() {
    resetPauseOverlay();
    this.anims.resumeAll();
    this.tweens.resumeAll();

    this.createBackground();
    this.createLogo();
    this.createCtaButtons();
    this.createHowToPlayOverlay();
  }

  createBackground() {
    const bg = this.add.image(WIDTH / 2, HEIGHT / 2 + sy(BG_Y_OFFSET), 'title-background');
    const scale = Math.max(WIDTH / bg.width, HEIGHT / bg.height);
    bg.setScale(scale);
    bg.setDepth(0);
  }

  createLogo() {
    const logo = this.add.image(WIDTH / 2, 0, 'title-logo');
    const logoY = sy(LOGO_TOP) + logo.height / 1.8;

    logo
      .setY(logoY)
      .setDepth(10);
  }

  createCtaButtons() {
    // Figma Frame 3 (36:839): top y=596, w=231, 16px gap — height from image aspect ratio (not sy)
    const buttonW = sx(231) * 0.85;
    const gap = sy(16);
    const specs = [
      {
        key: 'title-cta-start',
        onSelect: () => this.startGame({ ghost: false }),
      },
      {
        key: 'title-cta-beat',
        onSelect: () => this.startGame({ ghost: true }),
      },
      {
        key: 'title-cta-howto',
        onSelect: () => this.showHowToPlay(),
      },
    ];

    const layouts = specs.map((spec) => ({
      ...spec,
      ...imageDisplaySize(this, spec.key, buttonW),
    }));

    const totalH = layouts.reduce((sum, layout) => sum + layout.height, 0) + gap * (layouts.length - 1);
    let topY = sy(580);
    const maxBottom = HEIGHT - sy(12);

    if (topY + totalH > maxBottom) {
      topY = maxBottom - totalH;
    }

    this.ctaButtons = layouts.map((spec) => {
      const centerY = topY + spec.height / 2;
      topY += spec.height + gap;

      return createImageButton(
        this,
        WIDTH / 2,
        centerY,
        spec.width,
        spec.height,
        spec.key,
        spec.onSelect,
      );
    });
  }

  createHowToPlayOverlay() {
    const panelW = sx(300);
    const panelH = sy(360);

    this.howToPlayOverlay = this.add.container(WIDTH / 2, HEIGHT / 2).setDepth(100).setVisible(false);

    const dimmer = this.add.rectangle(0, 0, WIDTH, HEIGHT, 0x000000, 0.45).setOrigin(0.5);
    dimmer.setInteractive();

    const panelBg = this.add.graphics();
    panelBg.fillStyle(0xffffff, 1);
    panelBg.lineStyle(Math.max(2, sy(2)), BORDER_COLOR, 1);
    panelBg.fillRoundedRect(-panelW / 2, -panelH / 2, panelW, panelH, sy(16));
    panelBg.strokeRoundedRect(-panelW / 2, -panelH / 2, panelW, panelH, sy(16));

    const title = this.add
      .text(0, -panelH / 2 + sy(28), 'How to Play', {
        fontFamily: '"Noto Sans", Arial, sans-serif',
        fontSize: `${Math.round(sy(22))}px`,
        fontStyle: 'bold',
        color: '#000000',
      })
      .setOrigin(0.5, 0);

    const body = this.add
      .text(0, -panelH / 2 + sy(68), 'Tap to jump over obstacles.\nCollect hearts to restore lives.\nSurvive as long as you can.\nBeat Distance races your ghost PB.', {
        fontFamily: '"Noto Sans", Arial, sans-serif',
        fontSize: `${Math.round(sy(16))}px`,
        color: '#000000',
        align: 'center',
        lineSpacing: sy(6),
      })
      .setOrigin(0.5, 0);

    const closeBtn = createFigmaButton(this, 0, panelH / 2 - sy(42), sx(180), sy(50), {
      label: 'Close',
      fill: 0x000000,
      textColor: '#ffffff',
      fontSize: `${Math.round(sy(18))}px`,
      onSelect: () => this.hideHowToPlay(),
    }, { sy });

    this.howToPlayOverlay.add([dimmer, panelBg, title, body, closeBtn]);
  }

  showHowToPlay() {
    this.howToPlayOverlay.setVisible(true);
    this.ctaButtons.forEach((btn) => btn.setVisible(false));
  }

  hideHowToPlay() {
    this.howToPlayOverlay.setVisible(false);
    this.ctaButtons.forEach((btn) => btn.setVisible(true));
  }

  saveGhostRaceEnabled(enabled) {
    try {
      localStorage.setItem('dogrunner-ghost-race-enabled', enabled ? 'on' : 'off');
    } catch {
      // Ignore storage errors.
    }
  }

  startGame({ ghost }) {
    this.saveGhostRaceEnabled(ghost);
    this.scene.start('SelectPetScene', { ghostRace: ghost });
  }
}
