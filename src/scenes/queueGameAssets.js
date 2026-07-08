const DOG_RUN_FRAME_COUNT = 8;
const DOG_JUMP_FRAME_COUNT = 5;
const DOG_SLEEP_FRAMES = [0, 1, 3];

export function queueGameAssets(loader, textureManager, { includeRunFrames = true } = {}) {
  const has = (key) => textureManager.exists(key);
  const image = (key, url) => {
    if (!has(key)) {
      loader.image(key, url);
    }
  };

  image('sky', 'assets/front.png');
  image('ground', 'assets/ground.png');
  image('obstacle', 'assets/rock.png');
  image('mud', 'assets/mud.png');

  if (includeRunFrames) {
    for (let i = 0; i < DOG_RUN_FRAME_COUNT; i++) {
      image(`run_${i}`, `assets/dog/run_${i}.png`);
    }
  }

  for (let i = 0; i < DOG_JUMP_FRAME_COUNT; i++) {
    image(`jump_${i}`, `assets/dog/jump_${i}.png`);
  }

  for (const i of DOG_SLEEP_FRAMES) {
    image(`sleep_${i}`, `assets/dog/sleep_${i}.png`);
  }

  image('heart-full', 'assets/ui/heart-full.png');
  image('heart-empty', 'assets/ui/heart-empty.png');
  image('heart-pickup', 'assets/heart-pickup.png');
}

export function areGameAssetsReady(textureManager) {
  if (!textureManager.exists('sky') || !textureManager.exists('ground')) {
    return false;
  }

  for (let i = 0; i < DOG_RUN_FRAME_COUNT; i++) {
    if (!textureManager.exists(`run_${i}`)) {
      return false;
    }
  }

  return true;
}
