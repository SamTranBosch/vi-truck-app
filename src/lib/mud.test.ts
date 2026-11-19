import { COLS, ROWS, UNLOCK_CELLS, cellRect, mudPath } from './mud';

describe('mud tiles', () => {
  it('UNLOCK_CELLS is a permutation of every cell', () => {
    expect([...UNLOCK_CELLS].sort((a, b) => a - b)).toEqual(Array.from({ length: COLS * ROWS }, (_, i) => i));
  });
  it('cells tile the scene without gaps', () => {
    expect(cellRect(0)).toMatchObject({ x: 0, y: 0 });
    const last = cellRect(COLS * ROWS - 1);
    expect(last.x + last.w).toBe(360);
    expect(last.y + last.h).toBe(480);
  });
  it('mudPath is deterministic, closed and different per seed', () => {
    expect(mudPath(1, 3)).toBe(mudPath(1, 3));
    expect(mudPath(1, 3)).not.toBe(mudPath(2, 3));
    expect(mudPath(1, 3).endsWith('Z')).toBe(true);
    expect(mudPath(1, 3)).not.toMatch(/NaN/);
  });
  it('mud covers its whole cell (all points reach near the cell edge)', () => {
    const nums = (mudPath(5, 6).match(/-?\d+\.\d/g) ?? []).map(Number);
    const r = cellRect(6);
    const xs = nums.filter((_, i) => i % 2 === 0);
    const ys = nums.filter((_, i) => i % 2 === 1);
    expect(Math.min(...xs)).toBeLessThan(r.x + 12);
    expect(Math.max(...xs)).toBeGreaterThan(r.x + r.w - 12);
    expect(Math.min(...ys)).toBeLessThan(r.y + 16);
    expect(Math.max(...ys)).toBeGreaterThan(r.y + r.h - 16);
  });
});
