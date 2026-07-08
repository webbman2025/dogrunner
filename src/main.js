import Phaser from 'phaser';
import GameScene from './scenes/GameScene.js';
import LoadingScene from './scenes/LoadingScene.js';
import TitleScene from './scenes/TitleScene.js';

function showLoadError(message) {
  const el = document.getElementById('load-error');
  if (!el) {
    return;
  }

  el.style.display = 'flex';
  el.textContent = message;
}

function refreshGameLayout() {
  if (game?.scale) {
    game.scale.refresh();
  }
}

document.addEventListener(
  'touchmove',
  (event) => {
    event.preventDefault();
  },
  { passive: false },
);

const config = {
  type: Phaser.AUTO,
  width: 480,
  height: 800,
  backgroundColor: '#000000',
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 1000 },
    },
  },
  input: {
    activePointers: 1,
    touch: {
      capture: true,
    },
  },
  render: {
    antialias: false,
    roundPixels: true,
  },
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    parent: 'game',
    width: 480,
    height: 800,
    expandParent: true,
  },
  audio: {
    noAudio: true,
  },
  scene: [TitleScene, LoadingScene, GameScene],
};

let game;

try {
  game = new Phaser.Game(config);

  refreshGameLayout();

  window.addEventListener('resize', refreshGameLayout);
  window.addEventListener('orientationchange', () => {
    setTimeout(refreshGameLayout, 150);
  });

  if (window.visualViewport) {
    window.visualViewport.addEventListener('resize', refreshGameLayout);
    window.visualViewport.addEventListener('scroll', refreshGameLayout);
  }
} catch (error) {
  showLoadError(`Game failed to start: ${error.message}`);
}

window.addEventListener('error', (event) => {
  showLoadError(event.error?.message || event.message);
});

window.addEventListener('unhandledrejection', (event) => {
  showLoadError(event.reason?.message || String(event.reason));
});
