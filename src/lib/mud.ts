import { mulberry32 } from './rng';

export const SCENE_W = 360;
export const SCENE_H = 480;
export const COLS = 4;
export const ROWS = 4;
export const CELL_W = SCENE_W / COLS;
export const CELL_H = SCENE_H / ROWS;

/**
 * Order in which the 16 cells are uncovered (lesson index -> cell index, row-major).
 * A fixed shuffle so the truck appears in scattered patches, never in reading order.
 * It must be a permutation of 0..15 (checked in tests).
 */
export const UNLOCK_CELLS = [5, 10, 0, 15, 6, 9, 3, 12, 1, 14, 7, 8, 2, 13, 4, 11];

export function cellRect(cell: number): { x: number; y: number; w: number; h: number; cx: number; cy: number } {
  const col = cell % COLS;
  const row = Math.floor(cell / COLS);
  const x = col * CELL_W;
  const y = row * CELL_H;
  return { x, y, w: CELL_W, h: CELL_H, cx: x + CELL_W / 2, cy: y + CELL_H / 2 };
}

/** A soft, wobbly mud patch that slightly overlaps its neighbours so no gaps show. Same seed → same blob. */
export function mudPath(seed: number, cell: number, bleed = 7, points = 12): string {
  const { cx, cy, w, h } = cellRect(cell);
  const rnd = mulberry32(seed * 977 + cell * 131 + 7);
  const rx = w / 2 + bleed;
  const ry = h / 2 + bleed;
  const pts: [number, number][] = [];
  for (let i = 0; i < points; i++) {
    const a = (i / points) * Math.PI * 2;
    // a superellipse-ish square so corners stay covered, with random wobble in/out
    const c = Math.cos(a);
    const s = Math.sin(a);
    const k = 1 / Math.max(Math.abs(c), Math.abs(s));
    const wob = 0.9 + rnd() * 0.18;
    pts.push([cx + c * k * rx * 0.96 * wob, cy + s * k * ry * 0.96 * wob]);
  }
  // closed smooth path through midpoints, using the points as control points
  const mid = (a: [number, number], b: [number, number]): [number, number] => [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
  const start = mid(pts[points - 1], pts[0]);
  let d = `M${start[0].toFixed(1)} ${start[1].toFixed(1)}`;
  for (let i = 0; i < points; i++) {
    const p = pts[i];
    const m = mid(p, pts[(i + 1) % points]);
    d += ` Q${p[0].toFixed(1)} ${p[1].toFixed(1)} ${m[0].toFixed(1)} ${m[1].toFixed(1)}`;
  }
  return d + 'Z';
}
