/**
 * Finger-tracing check, kept free of the canvas so it can be unit-tested.
 * Masks are flat w*h arrays with 1 = inked pixel.
 */

/** Box dilation by radius r (separable, O(w*h)). */
export function dilate(mask: Uint8Array, w: number, h: number, r: number): Uint8Array {
  if (r <= 0) return mask.slice();
  const tmp = new Uint8Array(w * h);
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      let hit = 0;
      for (let dx = -r; dx <= r && !hit; dx++) {
        const xx = x + dx;
        if (xx >= 0 && xx < w && mask[y * w + xx]) hit = 1;
      }
      tmp[y * w + x] = hit;
    }
  }
  const out = new Uint8Array(w * h);
  for (let x = 0; x < w; x++) {
    for (let y = 0; y < h; y++) {
      let hit = 0;
      for (let dy = -r; dy <= r && !hit; dy++) {
        const yy = y + dy;
        if (yy >= 0 && yy < h && tmp[yy * w + x]) hit = 1;
      }
      out[y * w + x] = hit;
    }
  }
  return out;
}

export interface TraceResult {
  /** Share of the letter's pixels that the child's strokes reached. */
  coverage: number;
  /** Share of the child's strokes that landed far from the letter. */
  spill: number;
  passed: boolean;
}

export interface TraceOptions {
  /** Strokes may be this many cells off the letter and still count. */
  tolerance?: number;
  minCoverage?: number;
  maxSpill?: number;
}

export function evaluateTrace(
  target: Uint8Array,
  strokes: Uint8Array,
  w: number,
  h: number,
  { tolerance = 2, minCoverage = 0.6, maxSpill = 0.45 }: TraceOptions = {},
): TraceResult {
  let targetCount = 0;
  let strokeCount = 0;
  for (let i = 0; i < target.length; i++) {
    if (target[i]) targetCount++;
    if (strokes[i]) strokeCount++;
  }
  if (targetCount === 0 || strokeCount === 0) return { coverage: 0, spill: 0, passed: false };

  const nearStrokes = dilate(strokes, w, h, tolerance);
  const nearTarget = dilate(target, w, h, tolerance);
  let covered = 0;
  let spilled = 0;
  for (let i = 0; i < target.length; i++) {
    if (target[i] && nearStrokes[i]) covered++;
    if (strokes[i] && !nearTarget[i]) spilled++;
  }
  const coverage = covered / targetCount;
  const spill = spilled / strokeCount;
  return { coverage, spill, passed: coverage >= minCoverage && spill <= maxSpill };
}
