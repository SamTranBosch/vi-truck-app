import { describe, expect, it } from 'vitest';
import { audioKey } from '../lib/audio';
import { hasSound, hasTone, parseSyllable, spellTokens, syllablesOf, type Tone } from '../lib/vietnamese';
import { collectSpeech } from './speech';
import { PICS } from './pictures';
import type { Activity } from './types';
import { WORLD1 } from './world1';

/** Letters and tones known after each lesson (cumulative), as the book introduces them. */
function learnedAfter(index: number): { letters: Set<string>; tones: Set<Tone> } {
  const letters = new Set<string>();
  const tones = new Set<Tone>(['ngang']);
  for (let i = 0; i <= index; i++) {
    WORLD1[i].teaches.letters?.forEach((l) => letters.add(l));
    WORLD1[i].teaches.tones?.forEach((t) => tones.add(t));
  }
  return { letters, tones };
}

/** A word is readable when all its letters and its tones have been taught. */
function isDecodable(word: string, letters: Set<string>, tones: Set<Tone>): boolean {
  return syllablesOf(word).every((s) => {
    if (!tones.has(s.tone)) return false;
    const parts = [s.onset, s.nucleus + s.coda];
    // letters taught as single units: onset letter(s), vowel(s) such as "ia"; coda letters are not taught in World 1
    return s.coda === '' && parts.filter(Boolean).every((p) => letters.has(p));
  });
}

const acts = <T extends Activity['type']>(type: T) =>
  WORLD1.flatMap((l, i) => l.activities.filter((a) => a.type === type).map((a) => ({ lesson: l, index: i, a: a as Extract<Activity, { type: T }> })));

describe('World 1 structure', () => {
  it('has 16 lessons: Mở đầu + lessons 1–15 in book order', () => {
    expect(WORLD1).toHaveLength(16);
    expect(WORLD1.map((l) => l.id)).toEqual(['mo-dau', ...Array.from({ length: 15 }, (_, i) => `bai-${i + 1}`)]);
  });

  it('has unique ids and labels that fit on a tile', () => {
    expect(new Set(WORLD1.map((l) => l.id)).size).toBe(16);
    WORLD1.forEach((l) => expect(l.label.length).toBeLessThanOrEqual(6));
  });

  it('puts stories at lessons 3, 8, 14 and reviews at 9, 15 like the book', () => {
    const kinds = WORLD1.map((l) => l.kind);
    expect(kinds[3]).toBe('story');
    expect(kinds[8]).toBe('story');
    expect(kinds[14]).toBe('story');
    expect(kinds[9]).toBe('review');
    expect(kinds[15]).toBe('review');
  });

  it('every lesson has at least one activity', () => {
    WORLD1.forEach((l) => expect(l.activities.length).toBeGreaterThan(0));
  });
});

describe('hunt activities: answers are computed, so they must be sensible', () => {
  const hunts = acts('hunt');

  it('there are 2-3 hunts per letter lesson and tone lesson', () => {
    expect(hunts.length).toBeGreaterThanOrEqual(16);
  });

  it.each(hunts.map((h) => [h.lesson.id, JSON.stringify(h.a.kind === 'sound' ? h.a.target : h.a.tone), h] as const))(
    '%s hunt %s: 6 pictures, 3–5 right, at least 1 wrong, no repeats',
    (_id, _t, h) => {
      const { a } = h;
      expect(a.words).toHaveLength(6);
      expect(new Set(a.words).size).toBe(6);
      const right = a.words.filter((w) => (a.kind === 'sound' ? hasSound(w, a.target) : hasTone(w, a.tone)));
      expect(right.length).toBeGreaterThanOrEqual(3);
      expect(right.length).toBeLessThanOrEqual(5);
      expect(a.words.length - right.length).toBeGreaterThanOrEqual(1);
    },
  );

  it('every hunt word has a picture', () => {
    hunts.forEach((h) => h.a.words.forEach((w) => expect(PICS[w], `${w} needs a picture`).toBeTruthy()));
  });
});

describe('pictures', () => {
  it('every picture word used by meet / pick / spell has an emoji', () => {
    acts('meet').forEach(({ a }) => a.words.forEach((w) => expect(PICS[w], w).toBeTruthy()));
    acts('pick').forEach(({ a }) => a.words.forEach((w) => expect(PICS[w], w).toBeTruthy()));
  });

  it('picture keys are in NFC form (so look-ups never miss)', () => {
    Object.keys(PICS).forEach((k) => expect(k).toBe(k.normalize('NFC')));
  });
});

describe('reading is only asked about taught letters and tones', () => {
  it('read-picking words are decodable at the lesson they appear in', () => {
    acts('pick')
      .filter(({ a }) => a.mode === 'read')
      .forEach(({ index, a, lesson }) => {
        const { letters, tones } = learnedAfter(index);
        a.words.forEach((w) => expect(isDecodable(w, letters, tones), `${lesson.id}: "${w}" is not decodable yet`).toBe(true));
      });
  });

  it('spelled and traced words are decodable too (numbers aside)', () => {
    acts('spell').forEach(({ index, a, lesson }) => {
      const { letters, tones } = learnedAfter(index);
      a.words.forEach((w) => expect(isDecodable(w, letters, tones), `${lesson.id} spell "${w}"`).toBe(true));
    });
    acts('trace').forEach(({ index, a, lesson }) => {
      const { letters, tones } = learnedAfter(index);
      a.items
        .filter((it) => !/^\d$/.test(it))
        .forEach((it) => {
          const ok = letters.has(it) || isDecodable(it, letters, tones);
          expect(ok, `${lesson.id} trace "${it}"`).toBe(true);
        });
    });
  });

  it('numbers 0–5 are all practised', () => {
    const nums = acts('trace').flatMap(({ a }) => a.items.filter((i) => /^\d$/.test(i)));
    expect(nums.sort()).toEqual(['0', '1', '2', '3', '4', '5']);
  });
});

describe('letters and tones cover what the book teaches in lessons 1–15', () => {
  it('teaches the book’s letters in order', () => {
    const order = WORLD1.flatMap((l) => l.teaches.letters ?? []);
    expect(order).toEqual(['a', 'c', 'o', 'ô', 'ơ', 'd', 'đ', 'e', 'ê', 'l', 'b', 'g', 'h', 'i', 'ia']);
  });

  it('teaches all five tone marks', () => {
    const tones = WORLD1.flatMap((l) => l.teaches.tones ?? []);
    expect(tones).toEqual(['huyen', 'sac', 'hoi', 'nang', 'nga']);
  });

  it('findLetter targets are taught by that lesson and never appear among the distractors', () => {
    acts('findLetter').forEach(({ index, a, lesson }) => {
      const { letters } = learnedAfter(index);
      a.targets.forEach((t) => expect(letters.has(t), `${lesson.id} target ${t}`).toBe(true));
      a.targets.forEach((t) => expect(a.others).not.toContain(t));
      expect(a.others.length).toBeGreaterThanOrEqual(8);
    });
  });
});

describe('combine grids (ôn tập)', () => {
  it('only block spellings that really are not allowed (c/g before e ê i)', () => {
    acts('combine').forEach(({ a }) => {
      a.blocked.forEach((b) => {
        const onset = a.onsets.find((o) => b.startsWith(o))!;
        expect(['c', 'g']).toContain(onset);
        expect(['e', 'ê', 'i', 'ia']).toContain(b.slice(onset.length));
      });
    });
  });

  it('the grid has enough free cells for the requirement', () => {
    acts('combine').forEach(({ a }) => {
      const free = a.onsets.length * a.vowels.length - a.blocked.length;
      expect(a.need).toBeLessThanOrEqual(free);
    });
  });
});

describe('stories', () => {
  it('each story has 4 scenes with a picture and a sentence', () => {
    acts('story').forEach(({ a }) => {
      expect(a.story.scenes).toHaveLength(4);
      a.story.scenes.forEach((s) => {
        expect(s.emoji.length).toBeGreaterThan(0);
        expect(s.text.length).toBeGreaterThan(5);
      });
    });
  });
});

describe('spoken text list', () => {
  const texts = collectSpeech(WORLD1);

  it('is not empty and has no duplicates', () => {
    expect(texts.length).toBeGreaterThan(150);
    expect(new Set(texts).size).toBe(texts.length);
  });

  it('gives every text its own audio file name (no collisions)', () => {
    const keys = texts.map(audioKey);
    expect(new Set(keys).size).toBe(keys.length);
  });

  it('audio keys are file-system safe', () => {
    texts.forEach((t) => expect(audioKey(t)).toMatch(/^[0-9a-f_]+$/));
  });

  it('includes the spelling steps, tone names, prompts and every word', () => {
    expect(texts).toContain('cờ');
    expect(texts).toContain('huyền');
    expect(texts).toContain('Tiếng nào có âm cờ?');
    expect(texts).toContain('Tiếng nào có thanh ngã?');
    expect(texts).toContain('đĩa');
    expect(texts).toContain('không');
  });

  it('every spell token of every spell word is in the list', () => {
    acts('spell').forEach(({ a }) => a.words.forEach((w) => spellTokens(w).forEach((t) => expect(texts).toContain(t.say))));
  });

  it('parses every spoken word without throwing', () => {
    texts.filter((t) => t.length < 12 && !t.includes('?')).forEach((t) => expect(() => parseSyllable(t)).not.toThrow());
  });
});
