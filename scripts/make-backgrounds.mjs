// Makes the soft, blurred, blue-washed background versions of the photos used behind interface-card scenes.
// Each photo's tones are mapped onto Roadmap Blue (deep cobalt in the shadows, pale blue in the highlights),
// so the page needs no CSS filters or blend modes.
// Usage: node scripts/make-backgrounds.mjs
import sharp from 'sharp';
import fs from 'node:fs';

const src = 'src/assets/images';
const out = `${src}/backgrounds`;
fs.mkdirSync(out, { recursive: true });
const photos = ['warehouse-aisle-colleagues', 'process-diagram-whiteboard', 'factory-conveyor-line', 'warehouse-clipboard', 'talking-at-laptop', 'fabrication-workshop-team'];

// Tone stops: [luminance 0..1, [r, g, b]]
const stops = [
  [0.0, [4, 24, 120]],
  [0.45, [10, 76, 255]], // Roadmap Blue
  [1.0, [150, 182, 255]],
];
const ramp = (l) => {
  const i = l <= stops[1][0] ? 0 : 1;
  const [l0, c0] = stops[i], [l1, c1] = stops[i + 1];
  const t = (l - l0) / (l1 - l0);
  return c0.map((v, k) => Math.round(v + (c1[k] - v) * t));
};

for (const name of photos) {
  const { data, info } = await sharp(`${src}/${name}.jpg`).resize({ width: 900 }).greyscale().blur(6).normalise().raw().toBuffer({ resolveWithObject: true });
  const rgb = Buffer.alloc(info.width * info.height * 3);
  for (let i = 0; i < info.width * info.height; i++) {
    const c = ramp(data[i * info.channels] / 255);
    rgb[i * 3] = c[0]; rgb[i * 3 + 1] = c[1]; rgb[i * 3 + 2] = c[2];
  }
  await sharp(rgb, { raw: { width: info.width, height: info.height, channels: 3 } }).jpeg({ quality: 72 }).toFile(`${out}/${name}.jpg`);
  console.log(name, Math.round(fs.statSync(`${out}/${name}.jpg`).size / 1024) + ' KB');
}
