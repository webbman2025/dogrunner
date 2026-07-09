import { resetGameOverOverlay } from './gameOverMenuDom.js';

let handlers = null;
let lastAction = '';
let lastDispatchAt = 0;

function getElements() {
  return {
    backdrop: document.getElementById('pause-backdrop'),
    menu: document.getElementById('pause-menu'),
    panel: document.querySelector('.pause-panel'),
  };
}

function dispatchAction(action) {
  if (!handlers || !isPauseMenuVisible() || !action) {
    return;
  }

  const now = Date.now();
  if (action === lastAction && now - lastDispatchAt < 120) {
    return;
  }

  lastAction = action;
  lastDispatchAt = now;

  if (action === 'resume') {
    handlers.onResume?.();
  } else if (action === 'retry') {
    handlers.onRetry?.();
  } else if (action === 'home') {
    handlers.onHome?.();
  }
}

function bindPauseHits() {
  const panel = document.querySelector('.pause-panel');
  if (!panel || panel.dataset.bound === 'true') {
    return;
  }

  panel.dataset.bound = 'true';

  const onHit = (event) => {
    if (!isPauseMenuVisible()) {
      return;
    }

    const target = event.target.closest('[data-pause-action]');
    if (!target) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();
    dispatchAction(target.getAttribute('data-pause-action'));
  };

  panel.addEventListener('pointerdown', onHit, { passive: false });
}

export function initPauseMenu(callbacks) {
  handlers = callbacks;
  bindPauseHits();
}

export function clearPauseMenuHandlers() {
  handlers = null;
  lastAction = '';
  lastDispatchAt = 0;
}

export function showPauseMenu() {
  const { backdrop, menu } = getElements();
  if (backdrop) {
    backdrop.hidden = false;
  }
  if (menu) {
    menu.hidden = false;
  }
}

export function hidePauseMenu() {
  const { backdrop, menu } = getElements();
  if (backdrop) {
    backdrop.hidden = true;
  }
  if (menu) {
    menu.hidden = true;
  }
}

export function isPauseMenuVisible() {
  const { menu } = getElements();
  return Boolean(menu && !menu.hidden);
}

export function resetPauseOverlay() {
  hidePauseMenu();
  clearPauseMenuHandlers();
  resetGameOverOverlay();
}
