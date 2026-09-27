import { writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";
import sharp from "sharp";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const ink = "#171717";
const field = "#f7f7f5";

// An open, hand-drawn S with deliberate horizontal terminals. Its simple
// silhouette remains recognizable in a 16 px browser tab.
const mark = `<path d="M94 35H45C32 35 25 41 25 50c0 9 8 13 21 17l31 9c11 3 17 8 17 16 0 10-8 16-21 16H34" fill="none" stroke="${ink}" stroke-width="18" stroke-linecap="round" stroke-linejoin="round"/>`;

function svg({ background = false, maskable = false } = {}) {
  const fieldRect = background ? `<rect width="128" height="128" fill="${field}"/>` : "";
  // The central 80% circle is the guaranteed safe zone for maskable icons.
  const artwork = maskable
    ? `<g transform="translate(64 64) scale(.72) translate(-64 -64)">${mark}</g>`
    : mark;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128" role="img" aria-label="Spenles S mark">${fieldRect}${artwork}</svg>`;
}

const transparent = svg();
const full = svg({ background: true });
const maskable = svg({ background: true, maskable: true });

await writeFile(path.join(root, "public/brand-mark.svg"), transparent);
await writeFile(path.join(root, "src/app/icon.svg"), transparent);

async function savePng(file, source, size) {
  await sharp(Buffer.from(source))
    .resize(size, size)
    .png({ compressionLevel: 9 })
    .toFile(path.join(root, file));
}

await Promise.all([
  savePng("public/favicon-16.png", transparent, 16),
  savePng("public/favicon-32.png", transparent, 32),
  savePng("public/favicon-48.png", transparent, 48),
  savePng("public/icon-192.png", full, 192),
  savePng("public/icon-512.png", full, 512),
  savePng("public/icon-maskable-192.png", maskable, 192),
  savePng("public/icon-maskable-512.png", maskable, 512),
  savePng("public/apple-touch-icon.png", full, 180),
  savePng("src/app/apple-icon.png", full, 180),
]);
