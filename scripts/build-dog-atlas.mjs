import sharp from 'sharp';
import { writeFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');
const SHEET_PATH = join(root, 'public/assets/dogspritesheet.png');
const OUT_PNG = join(root, 'public/assets/dog-sheet.png');
const OUT_JSON = join(root, 'public/assets/dog-atlas.json');

const ALPHA_CUTOFF = 24;
const CHROMA_MAX = 32;

const { data, info } = await sharp(SHEET_PATH).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
const { width: W, height: H, channels } = info;

function getPixel(x, y) {
  const o = (y * W + x) * channels;
  return [data[o], data[o + 1], data[o + 2], data[o + 3]];
}

function isBackgroundPixel(r, g, b, a) {
  if (a <= ALPHA_CUTOFF) {
    return true;
  }
  if (r <= CHROMA_MAX && g <= CHROMA_MAX && b <= CHROMA_MAX) {
    return true;
  }
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  return max - min < 35 && min >= 120;
}

function cleanPixel(r, g, b, a) {
  if (isBackgroundPixel(r, g, b, a)) {
    return [0, 0, 0, 0];
  }
  return [r, g, b, a];
}

function extractCell(sx, sy, cellW, cellH) {
  const cell = Buffer.alloc(cellW * cellH * 4);
  for (let y = 0; y < cellH; y++) {
    for (let x = 0; x < cellW; x++) {
      const srcX = sx + x;
      const srcY = sy + y;
      const [r, g, b, a] =
        srcX < W && srcY < H ? cleanPixel(...getPixel(srcX, srcY)) : [0, 0, 0, 0];
      const o = (y * cellW + x) * 4;
      cell[o] = r;
      cell[o + 1] = g;
      cell[o + 2] = b;
      cell[o + 3] = a;
    }
  }
  return cell;
}

const ROW_H = Math.floor(H / 4);
const RUN_COLS = 4;
const RUN_CELL_W = Math.floor(W / RUN_COLS);
const JUMP_COLS = 6;
const JUMP_CELL_W = Math.floor(W / JUMP_COLS);
const SLEEP_COLS = 4;
const SLEEP_CELL_W = Math.floor(W / SLEEP_COLS);
const SLEEP_ROW_H = H - ROW_H * 3;

const groups = [
  {
    prefix: 'run',
    cellW: RUN_CELL_W,
    cellH: ROW_H,
    cells: Array.from({ length: 8 }, (_, i) => ({
      sx: (i % RUN_COLS) * RUN_CELL_W,
      sy: Math.floor(i / RUN_COLS) * ROW_H,
    })),
  },
  {
    prefix: 'jump',
    cellW: JUMP_CELL_W,
    cellH: ROW_H,
    cells: Array.from({ length: JUMP_COLS }, (_, i) => ({
      sx: i * JUMP_CELL_W,
      sy: ROW_H * 2,
    })),
  },
  {
    prefix: 'sleep',
    cellW: SLEEP_CELL_W,
    cellH: SLEEP_ROW_H,
    cells: Array.from({ length: SLEEP_COLS }, (_, i) => ({
      sx: i * SLEEP_CELL_W,
      sy: ROW_H * 3,
    })),
  },
];

const named = groups.flatMap(({ prefix, cellW, cellH, cells }) =>
  cells.map((cell, i) => [`${prefix}_${i}`, cell, cellW, cellH]),
);

const stripW = named.reduce((sum, [, , cellW]) => sum + cellW, 0);
const stripH = Math.max(...named.map(([, , , cellH]) => cellH));
const strip = Buffer.alloc(stripW * stripH * 4);

const atlasFrames = [];
let destX = 0;

for (const [name, { sx, sy }, cellW, cellH] of named) {
  const cell = extractCell(sx, sy, cellW, cellH);
  const offsetY = stripH - cellH;

  for (let y = 0; y < cellH; y++) {
    for (let x = 0; x < cellW; x++) {
      const si = (y * cellW + x) * 4;
      const di = ((offsetY + y) * stripW + destX + x) * 4;
      strip[di] = cell[si];
      strip[di + 1] = cell[si + 1];
      strip[di + 2] = cell[si + 2];
      strip[di + 3] = cell[si + 3];
    }
  }

  atlasFrames.push({
    filename: name,
    frame: { x: destX, y: offsetY, w: cellW, h: cellH },
    rotated: false,
    trimmed: false,
    spriteSourceSize: { x: 0, y: 0, w: cellW, h: cellH },
    sourceSize: { w: cellW, h: cellH },
  });

  destX += cellW;
}

await sharp(strip, { raw: { width: stripW, height: stripH, channels: 4 } })
  .png()
  .toFile(OUT_PNG);

writeFileSync(
  OUT_JSON,
  JSON.stringify(
    {
      frames: atlasFrames,
      meta: {
        app: 'dogrun',
        version: '1.0',
        image: 'dog-sheet.png',
        format: 'RGBA8888',
        size: { w: stripW, h: stripH },
        scale: '1',
      },
    },
    null,
    2,
  ),
);

console.log(`Source: ${W}x${H}`);
console.log(`Built ${named.length} frames -> ${OUT_PNG} (${stripW}x${stripH})`);
console.log(`Run cell: ${RUN_CELL_W}x${ROW_H}, Jump cell: ${JUMP_CELL_W}x${ROW_H}, Sleep cell: ${SLEEP_CELL_W}x${SLEEP_ROW_H}`);
