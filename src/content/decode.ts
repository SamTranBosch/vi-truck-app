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
 * Final consonants (am, an, ang ...) are taught from lesson 36 on, so until then a readable word has none.
 */
export function isDecodable(word: string, letters: Set<string>, tones: Set<Tone>, allowCodas = false): boolean {
  return syllablesOf(word).every((s) => {
    if (!tones.has(s.tone)) return false;
    if (s.coda !== '' && !allowCodas) return false;
    return [s.onset, s.nucleus].filter(Boolean).every((p) => letters.has(p));
  });
}
