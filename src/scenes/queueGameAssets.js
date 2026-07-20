import { getPetConfig, normalizePet, PET_TYPES } from '../petConfig.js';

export function queueGameAssets(
  loader,
  textureManager,
  { includeRunFrames = true, pet = PET_TYPES.dog } = {},
) {
  const config = getPetConfig(pet);
  const has = (key) => textureManager.exists(key);
  const image = (key, url) => {
    if (!has(key)) {
      loader.image(key, url);
    }
  };
  const petImage = (key, url) => {
    if (has(key)) {
      textureManager.remove(key);
    }
    loader.image(key, url);
  };

  image('sky', 'assets/front.png');
  image('ground', 'assets/ground.png');
  image('obstacle', 'assets/rock.png');
  image('obstacle-cone', 'assets/ui/cone.png');
  image('obstacle-bush', 'assets/ui/bush.png');
  image('mud', 'assets/mud.png');

  if (includeRunFrames) {
    for (let i = 0; i < config.runFrameCount; i++) {
      petImage(`run_${i}`, config.assetPaths.run(i));
    }
  }

  for (let i = 0; i < config.jumpFrameCount; i++) {
    petImage(`jump_${i}`, config.assetPaths.jump(i));
  }

  for (const i of config.sleepFrames) {
    petImage(`sleep_${i}`, config.assetPaths.sleep(i));
  }

  petImage('pet-snack', config.snackPath);

  image('heart-full', 'assets/ui/heart-full.png');
  image('heart-empty', 'assets/ui/heart-empty.png');
  image('heart-pickup', 'assets/heart-pickup.png');
}

export function areGameAssetsReady(textureManager, pet = PET_TYPES.dog) {
  const config = getPetConfig(pet);

  if (!textureManager.exists('sky') || !textureManager.exists('ground')) {
    return false;
  }

  for (let i = 0; i < config.runFrameCount; i++) {
    if (!textureManager.exists(`run_${i}`)) {
      return false;
    }
  }

  return true;
}

export { normalizePet };
