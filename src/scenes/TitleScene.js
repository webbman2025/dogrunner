import Phaser from 'phaser';

const WIDTH = 480;
const HEIGHT = 800;
const FIGMA_W = 375;
const FIGMA_H = 812;

const LOGO_W = 184;
const LOGO_H = 122;
const LOGO_TOP = 40;

const BORDER_COLOR = 0x6d5a55;
const BTN_YELLOW = 0xffe500;

const sx = (value) => (value * WIDTH) / FIGMA_W;
const sy = (value) => (value * HEIGHT) / FIGMA_H;

export default class TitleScene extends Phaser.Scene {
  constructor() {
    super('TitleScene');
  }

  preload() {
    this.load.image('title-background', 'assets/ui/title-background.png');
    this.load.image('title-logo', 'assets/ui/title-logo.png');
  }

  create() {
    this.createBackground();
    this.createLogo();
    this.createCtaButtons();
    this.createHowToPlayOverlay();
  }

  createBackground() {
    const bg = this.add.image(WIDTH / 2, HEIGHT / 2, 'title-background');
    const scale = Math.max(WIDTH / bg.width, HEIGHT / bg.height);
    bg.setScale(scale);
    bg.setDepth(0);
  }

  createLogo() {
    const logoW = sx(LOGO_W);
    const logoH = sx(LOGO_H);
    const logoY = sy(LOGO_TOP) + logoH / 2;

    this.add
      .image(WIDTH / 2, logoY, 'title-logo')
      .setDisplaySize(logoW, logoH)
      .setDepth(10);
  }

  createCtaButtons() {
    const buttonW = sx(210);
    const specs = [
      {
        label: 'Start Game',
        y: sy(580 + 20),
        height: sy(55),
        fill: 0x000000,
        textColor: '#ffffff',
        fontSize: `${Math.round(sy(26))}px`,
        onSelect: () => this.startGame({ ghost: false }),
      },
      {
        label: 'Beat Distance',
        y: sy(580 + 90),
        height: sy(45),
        fill: BTN_YELLOW,
        textColor: '#000000',
        fontSize: `${Math.round(sy(18))}px`,
        onSelect: () => this.startGame({ ghost: true }),
      },
      {
        label: 'How to Play',
        y: sy(580 + 150),
        height: sy(45),
        fill: 0xffffff,
        textColor: '#000000',
        fontSize: `${Math.round(sy(18))}px`,
        onSelect: () => this.showHowToPlay(),
      },
    ];

    this.ctaButtons = specs.map((spec) =>
      this.createFigmaButton(WIDTH / 2, spec.y + spec.height / 2, buttonW, spec.height, spec),
    );
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

    const closeBtn = this.createFigmaButton(0, panelH / 2 - sy(42), sx(180), sy(45), {
      label: 'Close',
      fill: 0x000000,
      textColor: '#ffffff',
      fontSize: `${Math.round(sy(18))}px`,
      onSelect: () => this.hideHowToPlay(),
    });

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
    this.scene.start('LoadingScene', { ghostRace: ghost });
  }
}
