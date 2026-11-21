import { describe, expect, it } from 'vitest';
import { audioKey } from '../lib/audio';
import { hasSound, spellTokens, syllablesOf, targetLabel } from '../lib/vietnamese';
import { isDecodable, learnedAfter } from './decode';
import { PICS } from './pictures';
import { collectSpeech, readWords } from './speech';
import type { Activity } from './types';
import { WORLD1 } from './world1';
import { WORLD2 } from './world2';

const ALL = [...WORLD1, ...WORLD2];
const OFFSET = WORLD1.length;
const acts = <T extends Activity['type']>(type: T) =>
  WORLD2.flatMap((l, i) => l.activities.filter((a) => a.type === type).map((a) => ({ lesson: l, index: OFFSET + i, a: a as Extract<Activity, { type: T }> })));

describe('World 2 structure (lessons 16–31 of the book)', () => {
  it('has 16 lessons with the book’s ids, stories at 20 and 26, reviews at 21 and 27', () => {
    expect(WORLD2.map((l) => l.id)).toEqual(Array.from({ length: 16 }, (_, i) => `bai-${i + 16}`));
    const kind = (n: number) => WORLD2[n - 16].kind;
    expect(kind(20)).toBe('story');
    expect(kind(26)).toBe('story');
    expect(kind(21)).toBe('review');
    expect(kind(27)).toBe('review');
  });

  it('teaches the book’s letters in the book’s order', () => {
    expect(WORLD2.flatMap((l) => l.teaches.letters ?? [])).toEqual([
      'gh', 'gi', 'k', 'kh', 'm', 'n', 'nh', 'ng', 'ngh', 'p', 'ph', 'qu', 'r', 's', 'x', 't', 'th', 'tr', 'ch', 'u', 'ư', 'ua', 'ưa',
    ]);
  });

  it('every tile label fits', () => WORLD2.forEach((l) => expect(l.label.length).toBeLessThanOrEqual(6)));
});

describe('hunts: answers computed from the words', () => {
  const hunts = acts('hunt');
  it.each(hunts.map((h) => [h.lesson.id, JSON.stringify(h.a.kind === 'sound' ? h.a.target : h.a.tone), h] as const))(
    '%s hunt %s has 6 distinct pictures, 3–5 right and at least 1 wrong',
    (_id, _t, h) => {
      const { a } = h;
      if (a.kind !== 'sound') throw new Error('World 2 hunts are sound hunts');
      expect(a.words).toHaveLength(6);
      expect(new Set(a.words).size).toBe(6);
      const right = a.words.filter((w) => hasSound(w, a.target));
      expect(right.length).toBeGreaterThanOrEqual(3);
      expect(right.length).toBeLessThanOrEqual(5);
      a.words.forEach((w) => expect(PICS[w], `${w} needs a picture`).toBeTruthy());
    },
  );

  it('each letter lesson hunts for both of its letters', () => {
    WORLD2.filter((l) => l.kind === 'letters').forEach((l) => {
      const targets = l.activities.filter((a) => a.type === 'hunt').map((a) => (a.type === 'hunt' && a.kind === 'sound' ? targetLabel(a.target) : ''));
      expect(targets, l.id).toHaveLength(2);
      expect(new Set(targets).size).toBe(2);
    });
  });
});

describe('pictures', () => {
  it('every meet and pick word has a picture', () => {
    [...acts('meet'), ...acts('pick')].forEach(({ a }) => a.words.forEach((w) => expect(PICS[w], w).toBeTruthy()));
  });
});

describe('reading asks only what has been taught', () => {
  it('pick-to-read, spell and trace words are decodable at their lesson', () => {
    acts('pick').filter(({ a }) => a.mode === 'read').forEach(({ index, a, lesson }) => {
      const { letters, tones } = learnedAfter(ALL, index);
      a.words.forEach((w) => expect(isDecodable(w, letters, tones), `${lesson.id}: "${w}" pick`).toBe(true));
    });
    acts('spell').forEach(({ index, a, lesson }) => {
      const { letters, tones } = learnedAfter(ALL, index);
      a.words.forEach((w) => expect(isDecodable(w, letters, tones), `${lesson.id}: "${w}" spell`).toBe(true));
    });
    acts('trace').forEach(({ index, a, lesson }) => {
      const { letters, tones } = learnedAfter(ALL, index);
      a.items.filter((it) => !/^\d$/.test(it)).forEach((it) => {
        expect(letters.has(it) || isDecodable(it, letters, tones), `${lesson.id}: trace "${it}"`).toBe(true);
      });
    });
  });

  it('every reading line is decodable, short, and 3–9 lines per lesson', () => {
    acts('read').forEach(({ index, a, lesson }) => {
      const { letters, tones } = learnedAfter(ALL, index);
      expect(a.lines.length, lesson.id).toBeGreaterThanOrEqual(3);
      expect(a.lines.length, lesson.id).toBeLessThanOrEqual(9);
      a.lines.forEach((line) => {
        expect(readWords(line).length, line).toBeLessThanOrEqual(6);
        readWords(line).forEach((w) => expect(isDecodable(w, letters, tones), `${lesson.id}: "${w}" in "${line}"`).toBe(true));
      });
    });
  });

  it('each lesson’s own new letters are used by at least one reading line or picked word', () => {
    WORLD2.filter((l) => l.kind === 'letters').forEach((l) => {
      const words = l.activities.flatMap((a) => (a.type === 'read' ? a.lines.flatMap(readWords) : a.type === 'pick' ? a.words : []));
      const used = new Set(words.flatMap((w) => syllablesOf(w).flatMap((s) => [s.onset, s.nucleus])));
      (l.teaches.letters ?? []).forEach((letter) => expect(used.has(letter), `${l.id}: ${letter} never read`).toBe(true));
    });
  });

  it('numbers 6–9 are practised', () => {
    const nums = acts('trace').flatMap(({ a }) => a.items.filter((i) => /^\d$/.test(i)));
    expect(nums.sort()).toEqual(['6', '7', '8', '9']);
  });
});

describe('findLetter and combine', () => {
  it('targets are taught, and never among the distractors', () => {
    acts('findLetter').forEach(({ index, a, lesson }) => {
      const { letters } = learnedAfter(ALL, index);
      a.targets.forEach((t) => {
        expect(letters.has(t), `${lesson.id} ${t}`).toBe(true);
        expect(a.others).not.toContain(t);
      });
      expect(a.others.length).toBeGreaterThanOrEqual(8);
    });
  });

  it('review grids block exactly the spellings Vietnamese does not allow (c/k, g/gh, ng/ngh)', () => {
    const allowed = (onset: string, v: string): boolean => {
      const front = ['e', 'ê', 'i', 'ia'].includes(v);
      if (onset === 'c' || onset === 'g' || onset === 'ng') return !front;
      if (onset === 'k' || onset === 'gh' || onset === 'ngh') return front && !(onset === 'gh' && v === 'ia');
      return true;
    };
    acts('combine').forEach(({ a }) => {
      for (const o of a.onsets) for (const v of a.vowels) {
        const blocked = a.blocked.includes(o + v);
        // "kia" is a real word (the book shows it), "ghia" is not; "gia" is spelled gi + a, so g + ia is blocked
        expect(blocked, `${o}+${v}`).toBe(!allowed(o, v));
      }
      expect(a.need).toBeLessThanOrEqual(a.onsets.length * a.vowels.length - a.blocked.length);
    });
  });
});

describe('stories', () => {
  it('have 4–6 scenes with pictures', () => {
    acts('story').forEach(({ a }) => {
      expect(a.story.scenes.length).toBeGreaterThanOrEqual(4);
      expect(a.story.scenes.length).toBeLessThanOrEqual(6);
    });
  });
});

describe('spoken text', () => {
  const texts = collectSpeech(WORLD2);
  it('has no duplicates and no audio-name collisions with itself or World 1', () => {
    expect(new Set(texts).size).toBe(texts.length);
    const keys = collectSpeech(ALL).map(audioKey);
    expect(new Set(keys).size).toBe(keys.length);
  });
  it('contains every spell token', () => {
    acts('spell').forEach(({ a }) => a.words.forEach((w) => spellTokens(w).forEach((t) => expect(texts).toContain(t.say))));
  });
});
