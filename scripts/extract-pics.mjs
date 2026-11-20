// Extracts the Noto emoji pictures the app uses from the @svgmoji/noto sprite into src/assets/noto/<hex>.svg.
// Usage: node scripts/extract-pics.mjs <path to node_modules/@svgmoji/noto/sprites/all.svg> <emoji list file>
// (the sprite package is large, so it is not a dependency; install it in a scratch folder.)
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';

const [, , spritePath, listPath] = process.argv;
const sprite = readFileSync(spritePath, 'utf8');
const wanted = readFileSync(listPath, 'utf8').split('\n').map((l) => l.trim().split(/\s+/)).filter((p) => p.length >= 2).map((p) => p[1]);
mkdirSync('src/assets/noto', { recursive: true });

function find(hex) {
  const tries = [hex, hex.split('-').filter((c) => c !== 'FE0F').join('-'), `${hex}-FE0F`];
  for (const id of tries) {
    const at = sprite.indexOf(` id="${id}"`);
    if (at < 0) continue;
    const open = sprite.lastIndexOf('<svg', at);
    const end = sprite.indexOf('</svg>', at);
    let svg = sprite.slice(open, end + 6);
    if (!svg.includes('xmlns=')) svg = svg.replace('<svg', '<svg xmlns="http://www.w3.org/2000/svg"');
    if (svg.includes('xlink:') && !svg.includes('xmlns:xlink')) svg = svg.replace('<svg', '<svg xmlns:xlink="http://www.w3.org/1999/xlink"');
    return svg;
  }
  return null;
}
const missing = [];
for (const hex of wanted) {
  const svg = find(hex);
  if (!svg) { missing.push(hex); continue; }
  const key = hex.split('-').filter((c) => c !== 'FE0F').join('-').toLowerCase();
  writeFileSync(`src/assets/noto/${key}.svg`, svg.replace(/ id="[^"]*"/, ''));
}
console.log('extracted', wanted.length - missing.length, 'missing', missing.join(' ') || '-');
