export const PET_TYPES = {
  dog: 'dog',
  cat: 'cat',
};

export const PET_STORAGE_KEY = 'dogrunner-selected-pet';

export const PET_CONFIGS = {
  [PET_TYPES.dog]: {
    id: PET_TYPES.dog,
    label: 'Dog',
    runFrameCount: 8,
    jumpFrameCount: 5,
    sleepFrames: [0, 1, 3],
    assetPaths: {
      run: (i) => `assets/dog/run_${i}.png`,
      jump: (i) => `assets/dog/jump_${i}.png`,
      sleep: (i) => `assets/dog/sleep_${i}.png`,
    },
    previewPath: 'assets/dog/run_0.png',
    previewKey: 'pet-preview-dog',
    shadow: {
      game: {
        xOffset: 0,
        yOffset: -30,
        width: 120,
        height: 14,
        alpha: 0.36,
        scaleYFactor: 0.85,
      },
      loading: {
        x: 120 + 133 / 2,
        y: 438 + 11 / 2,
        width: 120,
        height: 11,
        alpha: 0.6,
      },
    },
  },
  [PET_TYPES.cat]: {
    id: PET_TYPES.cat,
    label: 'Cat',
    runFrameCount: 8,
    jumpFrameCount: 6,
    sleepFrames: [0, 1, 3],
    assetPaths: {
      run: (i) => `assets/cat/cat_run/cat_run_${i}.png`,
      jump: (i) => `assets/cat/cat_jump/cat_jump_${i}.png`,
      sleep: (i) => `assets/cat/cat_sleep/cat_sleep_${i}.png`,
    },
    previewPath: 'assets/cat/cat_run/cat_run_0.png',
    previewKey: 'pet-preview-cat',
    shadow: {
      game: {
        xOffset: 0,
        yOffset: -40,
        width: 120,
        height: 14,
        alpha: 0.36,
        scaleYFactor: 0.85,
      },
      loading: {
        x: 120 + 133 / 2,
        y: 438 + 11 / 2,
        width: 120,
        height: 11,
        alpha: 0.6,
      },
    },
  },
};

export function normalizePet(pet) {
  return pet === PET_TYPES.cat ? PET_TYPES.cat : PET_TYPES.dog;
}

export function getPetConfig(pet) {
  return PET_CONFIGS[normalizePet(pet)];
}

export function saveSelectedPet(pet) {
  try {
    localStorage.setItem(PET_STORAGE_KEY, normalizePet(pet));
  } catch {
    // Ignore storage errors.
  }
}

export function loadSelectedPet() {
  try {
    const value = localStorage.getItem(PET_STORAGE_KEY);
    if (value === PET_TYPES.cat) {
      return PET_TYPES.cat;
    }
  } catch {
    // Ignore storage errors.
  }

  return PET_TYPES.dog;
}
