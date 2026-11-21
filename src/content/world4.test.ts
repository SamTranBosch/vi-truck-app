import { describe, expect, it } from 'vitest';
import { audioKey } from '../lib/audio';
import { hasSound, spellTokens, syllablesOf, targetLabel } from '../lib/vietnamese';
import { isDecodable, learnedAfter } from './decode';
import { PICS } from './pictures';
import { collectSpeech, readWords } from './speech';
import type { Activity } from './types';
import { WORLD1 } from './world1';
import { WORLD2 } from './world2';
import { WORLD3 } from './world3';
import { WORLD4 } from './world4';

const ALL = [...WORLD1, ...WORLD2, ...WORLD3, ...WORLD4];
const OFFSET = WORLD1.length + WORLD2.length + WORLD3.length;
const acts = <T extends Activity['type']>(type: T) =>
  WORLD4.flatMap((l, i) => l.activities.filter((a) => a.type === type).map((a) => ({ lesson: l, index: OFFSET + i, a: a as Extract<Activity, { type: T }> })));

describe('World 4 structure (lessons 48–62 of the book + the mid-term review)', () => {
  it('has 16 lessons: 48–51, the mid-term review, then 52–62', () => {
    expect(WORLD4.map((l) => l.id)).toEqual([
      'bai-48', 'bai-49', 'bai-50', 'bai-51', 'on-giua-ki', ...Array.from({ length: 11 }, (_, i) => `bai-${i + 52}`),
    ]);
    const kind = (id: string) => WORLD4.find((l) => l.id === id)?.kind;
    ['bai-50', 'bai-56', 'bai-62'].forEach((id) => expect(kind(id)).toBe('story'));
    ['bai-51', 'on-giua-ki', 'bai-57'].forEach((id) => expect(kind(id)).toBe('review'));
  });

  it('teaches the book’s vần in the book’s order', () => {
    expect(WORLD4.flatMap((l) => l.teaches.letters ?? [])).toEqual([
      'ôm', 'ôp', 'ơm', 'ơp', 'um', 'up', 'uôm', 'ươm', 'ươp', 'an', 'at', 'ăn', 'ăt', 'ân', 'ât', 'en', 'et', 'ên', 'êt',
    ]);
  });

  it('every tile label fits', () => WORLD4.forEach((l) => expect(l.label.length).toBeLessThanOrEqual(6)));
});

describe('hunts: answers computed from the words', () => {
  const hunts = acts('hunt');
  it.each(hunts.map((h) => [h.lesson.id, JSON.stringify(h.a.kind === 'sound' ? h.a.target : h.a.tone), h] as const))(
    '%s hunt %s has 6 distinct pictures, 3–5 right and at least 1 wrong',
    (_id, _t, h) => {
      const { a } = h;
      if (a.kind !== 'sound') throw new Error('World 3 hunts are sound hunts');
      expect(a.words).toHaveLength(6);
      expect(new Set(a.words).size).toBe(6);
      const right = a.words.filter((w) => hasSound(w, a.target));
      expect(right.length).toBeGreaterThanOrEqual(3);
      expect(right.length).toBeLessThanOrEqual(5);
      a.words.forEach((w) => expect(PICS[w], `${w} needs a picture`).toBeTruthy());
    },
  );

  it('each vần lesson hunts for both of its vần', () => {
    WORLD4.filter((l) => l.kind === 'letters' && l.activities.some((a) => a.type === 'hunt')).forEach((l) => {
      const targets = l.activities.flatMap((a) => (a.type === 'hunt' && a.kind === 'sound' ? [targetLabel(a.target)] : []));
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
      a.items.forEach((it) => {
        const t = it.toLowerCase();
        expect(letters.has(t) || isDecodable(t, letters, tones), `${lesson.id}: trace "${it}"`).toBe(true);
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
        readWords(line).forEach((w) => expect(isDecodable(w.toLowerCase(), letters, tones), `${lesson.id}: "${w}" in "${line}"`).toBe(true));
      });
    });
  });

  it('each lesson’s own new letters and vần are read at least once (reading line or picked word)', () => {
    WORLD4.filter((l) => l.kind === 'letters' && (l.teaches.letters ?? []).length > 0).forEach((l) => {
      const words = l.activities.flatMap((a) => (a.type === 'read' ? a.lines.flatMap(readWords) : a.type === 'pick' ? a.words : []));
      const used = new Set(words.flatMap((w) => syllablesOf(w.toLowerCase()).flatMap((s) => [s.onset, s.nucleus, s.nucleus + s.coda])));
      const need = l.teaches.letters ?? [];
      need.forEach((letter) => expect(used.has(letter), `${l.id}: ${letter} never read`).toBe(true));
    });
  });

  it('a vần is never read before its lesson (no early use in a reading line)', () => {
    acts('read').forEach(({ index, a, lesson }) => {
      const { letters } = learnedAfter(ALL, index);
      a.lines.flatMap(readWords).forEach((w) =>
        syllablesOf(w.toLowerCase()).forEach((s) => {
          if (s.coda && !['ng', 'nh', 'ch', 'c'].includes(s.coda)) expect(letters.has(s.nucleus + s.coda), `${lesson.id}: ${w}`).toBe(true);
        }),
      );
    });
  });
});

describe('findLetter', () => {
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
});

describe('stories', () => {
  it('have 4–6 scenes with pictures', () => {
    acts('story').forEach(({ a }) => {
      expect(a.story.scenes.length).toBeGreaterThanOrEqual(4);
      expect(a.story.scenes.length).toBeLessThanOrEqual(6);
      a.story.scenes.forEach((s) => expect(s.emoji.length).toBeGreaterThan(0));
    });
  });
});

describe('spoken text', () => {
  const texts = collectSpeech(WORLD4);
  it('has no duplicates and no audio-name collisions with the other worlds', () => {
    expect(new Set(texts).size).toBe(texts.length);
    const keys = collectSpeech(ALL).map(audioKey);
    expect(new Set(keys).size).toBe(keys.length);
  });
  it('contains every spell token', () => {
    acts('spell').forEach(({ a }) => a.words.forEach((w) => spellTokens(w).forEach((t) => expect(texts).toContain(t.say))));
  });
  it('spells final n and t as a – nờ – an, a – tờ – at', () => {
    expect(spellTokens('an').map((t) => t.say)).toEqual(['a', 'nờ', 'an']);
    expect(spellTokens('ât').map((t) => t.say)).toEqual(['â', 'tờ', 'ât']);
  });
});
