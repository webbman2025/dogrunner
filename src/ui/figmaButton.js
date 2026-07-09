const HIT_PAD_X = 14;
const HIT_PAD_Y = 8;
const MIN_TOUCH_HEIGHT = 48;

export function createFigmaButton(scene, x, y, width, height, spec, { sy, depth = 20 } = {}) {
  const scaleY = sy ?? ((value) => value);
  const borderColor = spec.borderColor ?? 0x6d5a55;
  const radius = height / 2;
  const hitW = width + HIT_PAD_X * 2;
  const hitH = Math.max(height + HIT_PAD_Y * 2, MIN_TOUCH_HEIGHT);

  const container = scene.add.container(x, y).setDepth(depth);
  const bg = scene.add.graphics();

  const draw = (alpha = 1) => {
    bg.clear();
    bg.fillStyle(spec.fill, alpha);
    bg.lineStyle(Math.max(2, scaleY(2)), borderColor, 1);
    bg.fillRoundedRect(-width / 2, -height / 2, width, height, radius);
    bg.strokeRoundedRect(-width / 2, -height / 2, width, height, radius);
  };

  draw();

  const text = scene.add
    .text(0, 0, spec.label, {
      fontFamily: '"Noto Sans", Arial, sans-serif',
      fontSize: spec.fontSize,
      fontStyle: 'bold',
      color: spec.textColor,
      align: 'center',
    })
    .setOrigin(0.5);

  const hit = scene.add
    .zone(0, 0, hitW, hitH)
    .setInteractive({ useHandCursor: true });

  container.add([bg, text, hit]);

  wireButtonHitArea(scene, container, hit, {
    onPress: () => draw(0.94),
    onRelease: () => draw(1),
    onSelect: spec.onSelect,
  });

  return container;
}

export function createTouchableCard(
  scene,
  x,
  y,
  width,
  height,
  { sy, depth = 20, draw, onSelect },
) {
  const scaleY = sy ?? ((value) => value);
  const hitW = width + HIT_PAD_X * 2;
  const hitH = Math.max(height + HIT_PAD_Y * 2, MIN_TOUCH_HEIGHT);
  const container = scene.add.container(x, y).setDepth(depth);
  const visuals = scene.add.container(0, 0);
  const hit = scene.add
    .zone(0, 0, hitW, hitH)
    .setInteractive({ useHandCursor: true });

  container.add([visuals, hit]);

  let pressed = false;
  let hovered = false;

  const releasePress = () => {
    pressed = false;
    container.setScale(1);
    draw(hovered);
  };

  hit.on('pointerover', () => {
    hovered = true;
    draw(true);
  });

  hit.on('pointerout', () => {
    hovered = false;
    releasePress();
  });

  hit.on('pointerdown', () => {
    pressed = true;
    scene.tweens.killTweensOf(container);
    container.setScale(0.97);
  });

  hit.on('pointerup', () => {
    if (!pressed) {
      return;
    }

    releasePress();
    onSelect();
  });

  return { container, visuals, hitPadY: scaleY(HIT_PAD_Y) };
}

function wireButtonHitArea(scene, container, hit, { onPress, onRelease, onSelect }) {
  let pressed = false;

  const releasePress = () => {
    pressed = false;
    container.setScale(1);
    onRelease();
  };

  hit.on('pointerover', onPress);
  hit.on('pointerout', releasePress);

  hit.on('pointerdown', () => {
    pressed = true;
    scene.tweens.killTweensOf(container);
    container.setScale(0.97);
  });

  hit.on('pointerup', () => {
    if (!pressed) {
      return;
    }

    releasePress();
    onSelect();
  });
}

export function imageDisplaySize(scene, key, displayW) {
  const frame = scene.textures.get(key).get();
  const height = displayW * (frame.height / frame.width);

  return { width: displayW, height };
}

export function createImageButton(scene, x, y, displayW, displayH, key, onSelect, { depth = 20 } = {}) {
  const hitW = displayW + HIT_PAD_X * 2;
  const hitH = Math.max(displayH + HIT_PAD_Y * 2, MIN_TOUCH_HEIGHT);
  const container = scene.add.container(x, y).setDepth(depth);
  const img = scene.add.image(0, 0, key).setDisplaySize(displayW, displayH);
  const hit = scene.add
    .zone(0, 0, hitW, hitH)
    .setInteractive({ useHandCursor: true });

  container.add([img, hit]);

  wireButtonHitArea(scene, container, hit, {
    onPress: () => {},
    onRelease: () => {},
    onSelect,
  });

  return container;
}
