// Renders the home-screen icons from the brand mark. Run with `npm run icons`
// after changing the glyph; the PNGs are committed so a build needs no tooling.
import sharp from 'sharp';
import { mkdir } from 'node:fs/promises';

const TERRACOTTA = '#C8553D';
const CREAM = '#FFF8F2';

/** The steaming bowl, scaled to a `size` box with `pad` breathing room. */
const glyph = (size, pad) => `
  <g transform="translate(${pad}, ${pad}) scale(${(size - pad * 2) / 24})"
     fill="none" stroke="${CREAM}" stroke-width="2"
     stroke-linecap="round" stroke-linejoin="round">
    <path d="M3 12h18a8 8 0 0 1-8 8h-2a8 8 0 0 1-8-8Z"/>
    <path d="M9 6c0-1 1-1.4 1-2.4"/>
    <path d="M13 6c0-1 1-1.4 1-2.4"/>
  </g>`;

// A rounded square for the iOS home screen (iOS masks it anyway), a square
// full-bleed one for maskable, where the platform crops to its own shape.
const rounded = (size) => `
  <svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}">
    <rect width="${size}" height="${size}" rx="${size * 0.22}" fill="${TERRACOTTA}"/>
    ${glyph(size, size * 0.24)}
  </svg>`;

const maskable = (size) => `
  <svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}">
    <rect width="${size}" height="${size}" fill="${TERRACOTTA}"/>
    ${glyph(size, size * 0.3)}
  </svg>`;

await mkdir('public', { recursive: true });

const targets = [
  ['public/icon-180.png', rounded(180)],
  ['public/icon-512.png', rounded(512)],
  ['public/icon-maskable-512.png', maskable(512)],
];

for (const [path, svg] of targets) {
  await sharp(Buffer.from(svg)).png().toFile(path);
  console.log('wrote', path);
}
