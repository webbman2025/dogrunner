import { getPetConfig, loadSelectedPet, normalizePet, PET_TYPES } from '../petConfig.js';

function queueImage(loader, textureManager, key, url) {
  if (!textureManager.exists(key)) {
    loader.image(key, url);
  }
}

export function queueSharedGameAssets(loader, textureManager) {
  queueImage(loader, textureManager, 'sky', 'assets/front.png');
  queueImage(loader, textureManager, 'ground', 'assets/ground.png');
  queueImage(loader, textureManager, 'obstacle', 'assets/rock.png');
  queueImage(loader, textureManager, 'obstacle-cone', 'assets/ui/cone.png');
  queueImage(loader, textureManager, 'obstacle-bush', 'assets/ui/bush.png');
  queueImage(loader, textureManager, 'mud', 'assets/mud.png');
  queueImage(loader, textureManager, 'heart-full', 'assets/ui/heart-full.png');
  queueImage(loader, textureManager, 'heart-empty', 'assets/ui/heart-empty.png');
  queueImage(loader, textureManager, 'heart-pickup', 'assets/heart-pickup.png');
}

export function queuePetAssets(
  loader,
  textureManager,
  pet = PET_TYPES.dog,
  { includeRunFrames = true } = {},
) {
  const config = getPetConfig(pet);
  const { textureKeys, assetPaths } = config;

  if (includeRunFrames) {
    for (let i = 0; i < config.runFrameCount; i++) {
      queueImage(loader, textureManager, textureKeys.run(i), assetPaths.run(i));
    }
  }

  for (let i = 0; i < config.jumpFrameCount; i++) {
    queueImage(loader, textureManager, textureKeys.jump(i), assetPaths.jump(i));
  }

  for (const i of config.sleepFrames) {
    queueImage(loader, textureManager, textureKeys.sleep(i), assetPaths.sleep(i));
  }

  queueImage(loader, textureManager, textureKeys.snack, config.snackPath);
}

export function queueGameAssets(
  loader,
  textureManager,
  { includeRunFrames = true, pet = PET_TYPES.dog } = {},
) {
  queueSharedGameAssets(loader, textureManager);
  queuePetAssets(loader, textureManager, pet, { includeRunFrames });
}

export function areSharedGameAssetsReady(textureManager) {
  return (
    textureManager.exists('sky')
    && textureManager.exists('ground')
    && textureManager.exists('obstacle')
    && textureManager.exists('mud')
    && textureManager.exists('heart-full')
    && textureManager.exists('heart-pickup')
  );
}

export function areGameAssetsReady(textureManager, pet = PET_TYPES.dog) {
  const config = getPetConfig(pet);

  if (!areSharedGameAssetsReady(textureManager)) {
    return false;
  }

  for (let i = 0; i < config.runFrameCount; i++) {
    if (!textureManager.exists(config.textureKeys.run(i))) {
      return false;
    }
  }

  for (let i = 0; i < config.jumpFrameCount; i++) {
    if (!textureManager.exists(config.textureKeys.jump(i))) {
      return false;
    }
  }

  for (const i of config.sleepFrames) {
    if (!textureManager.exists(config.textureKeys.sleep(i))) {
      return false;
    }
  }

  return textureManager.exists(config.textureKeys.snack);
}

export function startGameWithLoading(scene, data) {
  const pet = normalizePet(data?.pet ?? loadSelectedPet());
  const gameData = {
    ghostRace: Boolean(data?.ghostRace),
    pet,
  };

  if (areGameAssetsReady(scene.textures, pet)) {
    scene.scene.start('GameScene', gameData);
    return;
  }

  scene.scene.start('LoadingScene', gameData);
}

export { normalizePet };
