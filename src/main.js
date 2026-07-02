import Phaser from 'phaser';
import GameScene from './scenes/GameScene.js';

function showLoadError(message) {
  const el = document.getElementById('load-error');
  if (!el) {
    return;
  }

  el.style.display = 'flex';
  el.textContent = message;
}

function lockViewportHeight() {
  const height = window.innerHeight;
  document.documentElement.style.setProperty('--app-height', `${height}px`);
  document.body.style.height = `${height}px`;

  const game = document.getElementById('game');
  if (game) {
    game.style.height = `${height}px`;
  }
}

lockViewportHeight();
window.addEventListener('resize', lockViewportHeight);
window.addEventListener('orientationchange', () => {
  setTimeout(lockViewportHeight, 150);
});

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
  backgroundColor: '#87ceeb',
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
    expandParent: false,
  },
  scene: [GameScene],
};

let game;

try {
  game = new Phaser.Game(config);

  window.addEventListener('resize', () => {
    game.scale.refresh();
  });

  window.addEventListener('orientationchange', () => {
    setTimeout(() => {
      lockViewportHeight();
      game.scale.refresh();
    }, 150);
  });
} catch (error) {
  showLoadError(`Game failed to start: ${error.message}`);
}

window.addEventListener('error', (event) => {
  showLoadError(event.error?.message || event.message);
});

window.addEventListener('unhandledrejection', (event) => {
  showLoadError(event.reason?.message || String(event.reason));
});
