import { describe, expect, it } from 'vitest';
import { ALL_LESSONS, WORLDS, lessonById, worldOpen } from './worlds';
import { UNLOCK_CELLS } from '../lib/mud';

describe('worlds', () => {
  it('every world is one truck with exactly 16 lessons', () => {
    for (const w of WORLDS) expect(w.lessons, w.id).toHaveLength(UNLOCK_CELLS.length);
  });
  it('lesson ids are unique across all worlds, and ids and trucks are unique per world', () => {
    const ids = ALL_LESSONS.map((l) => l.id);
    expect(new Set(ids).size).toBe(ids.length);
    expect(new Set(WORLDS.map((w) => w.id)).size).toBe(WORLDS.length);
    expect(new Set(WORLDS.map((w) => w.truck)).size).toBe(WORLDS.length);
  });
  it('finds a lesson by id', () => {
    expect(lessonById('bai-1')?.title).toMatch(/Bài 1/);
    expect(lessonById('nope')).toBeUndefined();
  });
  it('a world opens only when the one before is finished', () => {
    const done = Object.fromEntries(WORLDS[0].lessons.map((l) => [l.id, 1]));
    expect(worldOpen(WORLDS, 0, {})).toBe(true);
    if (WORLDS.length > 1) {
      expect(worldOpen(WORLDS, 1, {})).toBe(false);
      expect(worldOpen(WORLDS, 1, done)).toBe(true);
    }
  });
});
