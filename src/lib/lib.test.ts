import { describe, expect, it } from 'vitest';
import { audioKey } from './audio';
import { emptyProgress, doneCount, exportProgress, markComplete, parseProgress, recordMiss, resumeStep, setResume, shakyLessons, tileState } from './progress';
import { shuffle, shuffleDifferent } from './rng';
import { dilate, evaluateTrace } from './tracing';

describe('audioKey', () => {
  it('maps text to hex code points', () => {
    expect(audioKey('cá')).toBe('63_e1');
    expect(audioKey('a')).toBe('61');
  });
  it('treats composed and decomposed Vietnamese as the same text', () => {
    expect(audioKey('cá')).toBe(audioKey('cá'));
  });
  it('keeps toned variants apart', () => {
    const keys = ['ca', 'cà', 'cá', 'cả', 'cã', 'cạ'].map(audioKey);
    expect(new Set(keys).size).toBe(6);
  });
});

describe('progress', () => {
  const ids = ['a', 'b', 'c'];

  it('unlocks lessons one at a time, in order', () => {
    let p = emptyProgress();
    expect(ids.map((_, i) => tileState(ids, p, i))).toEqual(['current', 'locked', 'locked']);
    p = markComplete(p, 'a');
    expect(ids.map((_, i) => tileState(ids, p, i))).toEqual(['done', 'current', 'locked']);
    p = markComplete(p, 'b');
    p = markComplete(p, 'c');
    expect(ids.map((_, i) => tileState(ids, p, i))).toEqual(['done', 'done', 'done']);
    expect(doneCount(ids, p)).toBe(3);
  });

  it('does not change anything when a lesson is completed twice', () => {
    const p = markComplete(emptyProgress(), 'a', 1000);
    expect(markComplete(p, 'a', 2000).completed.a).toBe(1000);
  });

  it('exports and re-imports without loss', () => {
    const p = markComplete(markComplete(emptyProgress(), 'a', 5), 'b', 9);
    expect(parseProgress(exportProgress(p))).toEqual(p);
  });

  it('rejects broken or foreign data on import', () => {
    expect(parseProgress('not json')).toBeNull();
    expect(parseProgress('{"version":2,"completed":{}}')).toBeNull();
    expect(parseProgress({ version: 1 })).toBeNull();
    expect(parseProgress(null)).toBeNull();
  });

  it('old saves without the new fields still load; a finished lesson implies the welcome was seen', () => {
    const p = parseProgress({ version: 1, completed: { a: 5 } });
    expect(p).toMatchObject({ welcomed: true, misses: {}, resume: null });
    expect(parseProgress({ version: 1, completed: {} })?.welcomed).toBe(false);
  });

  it('keeps only sane misses and resume data', () => {
    const p = parseProgress({ version: 1, completed: {}, misses: { a: 3, b: -1, c: 'x', d: 2.9 }, resume: { id: 'a', step: 2 } });
    expect(p?.misses).toEqual({ a: 3, d: 2 });
    expect(p?.resume).toEqual({ id: 'a', step: 2 });
    expect(parseProgress({ version: 1, completed: {}, resume: { id: 'a', step: 0 } })?.resume).toBeNull();
    expect(parseProgress({ version: 1, completed: {}, resume: { id: 5, step: 2 } })?.resume).toBeNull();
  });

  it('counts misses and lists the shaky lessons worst first', () => {
    let p = emptyProgress();
    for (let i = 0; i < 4; i++) p = recordMiss(p, 'bai-2');
    for (let i = 0; i < 6; i++) p = recordMiss(p, 'bai-4');
    p = recordMiss(p, 'bai-1');
    expect(shakyLessons(p)).toEqual([
      { id: 'bai-4', misses: 6 },
      { id: 'bai-2', misses: 4 },
    ]);
    expect(shakyLessons(p, 1, 1)).toEqual([{ id: 'bai-4', misses: 6 }]);
  });

  it('remembers where a lesson was left and forgets it at step 0', () => {
    let p = setResume(emptyProgress(), 'bai-4', 3);
    expect(resumeStep(p, 'bai-4')).toBe(3);
    expect(resumeStep(p, 'bai-5')).toBe(0);
    expect(setResume(p, 'bai-4', 3)).toBe(p);
    p = setResume(p, 'bai-4', 0);
    expect(p.resume).toBeNull();
    // leaving another lesson alone
    const q = setResume(emptyProgress(), 'bai-4', 2);
    expect(setResume(q, 'bai-9', 0)).toBe(q);
  });

  it('drops entries that are not timestamps', () => {
    const p = parseProgress({ version: 1, completed: { a: 5, b: 'x', c: null }, soundOn: false });
    expect(p).toEqual({ version: 1, completed: { a: 5 }, soundOn: false, musicOn: true, welcomed: true, misses: {}, resume: null });
  });
});

describe('rng', () => {
  it('shuffles the same way for the same seed', () => {
    expect(shuffle([1, 2, 3, 4, 5, 6], 7)).toEqual(shuffle([1, 2, 3, 4, 5, 6], 7));
  });
  it('keeps every item', () => {
    expect(shuffle([1, 2, 3, 4, 5, 6], 3).sort()).toEqual([1, 2, 3, 4, 5, 6]);
  });
  it('shuffleDifferent never returns the original order', () => {
    for (let s = 0; s < 50; s++) expect(shuffleDifferent([1, 2, 3, 4], s)).not.toEqual([1, 2, 3, 4]);
  });
});

describe('tracing', () => {
  const W = 40;
  const H = 40;
  const line = (x0: number, x1: number, y: number, thick = 3) => {
    const m = new Uint8Array(W * H);
    for (let x = x0; x <= x1; x++) for (let t = 0; t < thick; t++) m[(y + t) * W + x] = 1;
    return m;
  };

  it('dilate grows a mask by the radius', () => {
    const m = new Uint8Array(W * H);
    m[20 * W + 20] = 1;
    const d = dilate(m, W, H, 2);
    expect(d[20 * W + 22]).toBe(1);
    expect(d[22 * W + 22]).toBe(1);
    expect(d[20 * W + 23]).toBe(0);
  });

  it('passes when the child covers the letter', () => {
    const target = line(5, 35, 20);
    const strokes = line(5, 35, 20);
    expect(evaluateTrace(target, strokes, W, H).passed).toBe(true);
  });

  it('passes a slightly wobbly trace', () => {
    const target = line(5, 35, 20);
    const strokes = line(6, 34, 21);
    expect(evaluateTrace(target, strokes, W, H).passed).toBe(true);
  });

  it('does not pass an empty trace', () => {
    const target = line(5, 35, 20);
    expect(evaluateTrace(target, new Uint8Array(W * H), W, H).passed).toBe(false);
  });

  it('does not pass when only a small part is traced', () => {
    const target = line(5, 35, 20);
    const strokes = line(5, 12, 20);
    const r = evaluateTrace(target, strokes, W, H);
    expect(r.coverage).toBeLessThan(0.6);
    expect(r.passed).toBe(false);
  });

  it('does not pass scribbling far away from the letter', () => {
    const target = line(5, 35, 20);
    const strokes = new Uint8Array(W * H);
    for (let y = 0; y < 10; y++) for (let x = 0; x < W; x++) strokes[y * W + x] = 1;
    for (let x = 5; x <= 35; x++) strokes[20 * W + x] = 1;
    const r = evaluateTrace(target, strokes, W, H);
    expect(r.spill).toBeGreaterThan(0.45);
    expect(r.passed).toBe(false);
  });
});
