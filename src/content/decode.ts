import { syllablesOf, type Tone } from '../lib/vietnamese';
import type { Lesson } from './types';

/** Letters and tones known after lesson `index` of `lessons` (cumulative, in book order). */
export function learnedAfter(lessons: Lesson[], index: number): { letters: Set<string>; tones: Set<Tone> } {
  const letters = new Set<string>();
  const tones = new Set<Tone>(['ngang']);
  for (let i = 0; i <= index; i++) {
    lessons[i].teaches.letters?.forEach((l) => letters.add(l));
    lessons[i].teaches.tones?.forEach((t) => tones.add(t));
  }
  return { letters, tones };
}

/**
 * A word is readable when all its letters and its tones have been taught.
 * A syllable with a final consonant (am, iêp ...) needs its whole vần taught (a vần is a unit in the book);
 * an open syllable needs its vowel (or ia, ua, ưa) taught.
 */
export function isDecodable(word: string, letters: Set<string>, tones: Set<Tone>): boolean {
  return syllablesOf(word).every((s) => {
    if (!tones.has(s.tone)) return false;
    if (s.onset && !letters.has(s.onset)) return false;
    return letters.has(s.coda ? s.nucleus + s.coda : s.nucleus) || (!s.nucleus && !s.coda);
  });
}
