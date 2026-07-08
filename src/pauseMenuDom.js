const PANEL_NATURAL_W = 784;
const PANEL_NATURAL_H = 918;

const HIT_REGIONS = [
  { action: 'resume', rect: [130, 335, 655, 376] },
  { action: 'retry', rect: [130, 445, 655, 570] },
  { action: 'home', rect: [130, 700, 655, 748] },
];

let handlers = null;
let lastDispatchAt = 0;

function getElements() {
  return {
    backdrop: document.getElementById('pause-backdrop'),
    menu: document.getElementById('pause-menu'),
    image: document.getElementById('pause-panel-img'),
  };
}

function dispatchAction(action) {
  if (!handlers || !isPauseMenuVisible()) {
    return;
  }

  const now = Date.now();
  if (now - lastDispatchAt < 250) {
    return;
  }
  lastDispatchAt = now;

  if (action === 'resume') {
    handlers.onResume?.();
  } else if (action === 'retry') {
    handlers.onRetry?.();
  } else if (action === 'home') {
    handlers.onHome?.();
  }
}

function getImageFitRect(img) {
  const rect = img.getBoundingClientRect();
  const naturalW = img.naturalWidth || PANEL_NATURAL_W;
  const naturalH = img.naturalHeight || PANEL_NATURAL_H;
  const scale = Math.min(rect.width / naturalW, rect.height / naturalH);
  const drawW = naturalW * scale;
  const drawH = naturalH * scale;
  const offsetX = rect.left + (rect.width - drawW) / 2;
  const offsetY = rect.top + (rect.height - drawH) / 2;

  return { offsetX, offsetY, scale, naturalW, naturalH };
}

function mapPointerToNatural(img, clientX, clientY) {
  const { offsetX, offsetY, scale, naturalW, naturalH } = getImageFitRect(img);
  const x = (clientX - offsetX) / scale;
  const y = (clientY - offsetY) / scale;

  if (x < 0 || y < 0 || x > naturalW || y > naturalH) {
    return null;
  }

  return { x, y };
}

function hitTest(x, y) {
  for (const region of HIT_REGIONS) {
    const [x1, y1, x2, y2] = region.rect;
    if (x >= x1 && x <= x2 && y >= y1 && y <= y2) {
      return region.action;
    }
  }

  return null;
}

function bindImageMap() {
  const menu = document.getElementById('pause-menu');
  const image = document.getElementById('pause-panel-img');
  if (!menu || menu.dataset.bound === 'true') {
    return;
  }

  menu.dataset.bound = 'true';

  menu.querySelectorAll('[data-pause-action]').forEach((area) => {
    area.addEventListener('click', (event) => {
      event.preventDefault();
      event.stopPropagation();
      dispatchAction(area.getAttribute('data-pause-action'));
    });
  });

  if (!image) {
    return;
  }

  image.addEventListener('pointerup', (event) => {
    if (!isPauseMenuVisible()) {
      return;
    }

    const point = mapPointerToNatural(image, event.clientX, event.clientY);
    if (!point) {
      return;
    }

    const action = hitTest(point.x, point.y);
    if (!action) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();
    dispatchAction(action);
  });
}

export function initPauseMenu(callbacks) {
  handlers = callbacks;
  bindImageMap();
}

export function clearPauseMenuHandlers() {
  handlers = null;
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
}
