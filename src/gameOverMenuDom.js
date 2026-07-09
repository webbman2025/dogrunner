let handlers = null;
let lastAction = '';
let lastDispatchAt = 0;
let petFrameTimer = null;
let petFrameIndex = 0;
let petFramePaths = [];

const PET_FRAME_MS = 125;

function getElements() {
  return {
    backdrop: document.getElementById('game-over-backdrop'),
    menu: document.getElementById('game-over-menu'),
    panel: document.querySelector('.game-over-panel'),
    pet: document.getElementById('game-over-pet'),
    petImg: document.getElementById('game-over-pet-img'),
  };
}

function dispatchAction(action) {
  if (!handlers || !isGameOverMenuVisible() || !action) {
    return;
  }

  const now = Date.now();
  if (action === lastAction && now - lastDispatchAt < 120) {
    return;
  }

  lastAction = action;
  lastDispatchAt = now;

  if (action === 'retry') {
    handlers.onRetry?.();
  } else if (action === 'home') {
    handlers.onHome?.();
  }
}

function bindGameOverHits() {
  const panel = document.querySelector('.game-over-panel');
  if (!panel || panel.dataset.bound === 'true') {
    return;
  }

  panel.dataset.bound = 'true';

  const onHit = (event) => {
    if (!isGameOverMenuVisible()) {
      return;
    }

    const target = event.target.closest('[data-game-over-action]');
    if (!target) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();
    dispatchAction(target.getAttribute('data-game-over-action'));
  };

  panel.addEventListener('pointerdown', onHit, { passive: false });
}

function toAssetUrl(path) {
  return path.startsWith('/') ? path : `/${path}`;
}

function stopGameOverPetAnimation() {
  if (petFrameTimer != null) {
    window.clearInterval(petFrameTimer);
    petFrameTimer = null;
  }

  petFrameIndex = 0;
  petFramePaths = [];
}

function startGameOverPetAnimation(framePaths) {
  stopGameOverPetAnimation();

  if (!framePaths.length) {
    return;
  }

  petFramePaths = framePaths;
  const { petImg } = getElements();
  if (!petImg) {
    return;
  }

  const showFrame = () => {
    petImg.src = petFramePaths[petFrameIndex];
    petFrameIndex = (petFrameIndex + 1) % petFramePaths.length;
  };

  showFrame();
  petFrameTimer = window.setInterval(showFrame, PET_FRAME_MS);
}

function showGameOverPet(petConfig) {
  const { pet, petImg } = getElements();
  if (!pet || !petImg || !petConfig) {
    return;
  }

  const framePaths = petConfig.sleepFrames.map((index) =>
    toAssetUrl(petConfig.assetPaths.sleep(index)),
  );

  pet.hidden = false;
  startGameOverPetAnimation(framePaths);
}

function hideGameOverPet() {
  stopGameOverPetAnimation();

  const { pet, petImg } = getElements();
  if (petImg) {
    petImg.removeAttribute('src');
  }
  if (pet) {
    pet.hidden = true;
  }
}

export function initGameOverMenu(callbacks) {
  handlers = callbacks;
  bindGameOverHits();
}

export function clearGameOverMenuHandlers() {
  handlers = null;
  lastAction = '';
  lastDispatchAt = 0;
}

export function showGameOverMenu(petConfig) {
  const { backdrop, menu } = getElements();
  if (backdrop) {
    backdrop.hidden = false;
  }
  showGameOverPet(petConfig);
  if (menu) {
    menu.hidden = false;
  }
}

export function hideGameOverMenu() {
  const { backdrop, menu } = getElements();
  hideGameOverPet();
  if (backdrop) {
    backdrop.hidden = true;
  }
  if (menu) {
    menu.hidden = true;
  }
}

export function isGameOverMenuVisible() {
  const { menu } = getElements();
  return Boolean(menu && !menu.hidden);
}

export function resetGameOverOverlay() {
  hideGameOverMenu();
  clearGameOverMenuHandlers();
}
