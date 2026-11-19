import { ONSET_SAY, TONE_NAME, spellTokens, targetLabel, type SoundTarget, type Tone } from '../lib/vietnamese';
import { ALL_FIXED_PHRASES, PHRASES } from './phrases';
import type { Activity, Lesson } from './types';

export const NUMBER_SAY: Record<string, string> = {
  '0': 'không', '1': 'một', '2': 'hai', '3': 'ba', '4': 'bốn', '5': 'năm',
};

/** What the voice says when a single letter (or number) is tapped. */
export function letterSay(letter: string): string {
  return NUMBER_SAY[letter] ?? ONSET_SAY[letter] ?? letter;
}

/** What the voice says for an item in a tracing exercise: letters by name, words as words. */
export function traceSay(item: string): string {
  return letterSay(item);
}

export function soundPrompt(target: SoundTarget): string {
  const label = targetLabel(target);
  return PHRASES.whichSound('onset' in target ? (ONSET_SAY[label] ?? label) : label);
}

export function tonePrompt(tone: Tone): string {
  return PHRASES.whichTone(TONE_NAME[tone]);
}

/** The spoken syllable for a cell of the combine grid ("l" + "a" -> "la"). */
export function combineSay(onset: string, vowel: string): string {
  return onset + vowel;
}

function activitySpeech(a: Activity): string[] {
  switch (a.type) {
    case 'meet':
      return a.words;
    case 'spell':
      return a.words.flatMap((w) => spellTokens(w).map((t) => t.say));
    case 'hunt':
      return [a.kind === 'sound' ? soundPrompt(a.target) : tonePrompt(a.tone), ...a.words];
    case 'findLetter':
      return [PHRASES.findLetter(a.targets), ...[...a.targets, ...a.others].map(letterSay)];
    case 'trace':
      return a.items.map(traceSay);
    case 'pick':
      return a.words;
    case 'story':
      return a.story.scenes.map((s) => s.text);
    case 'combine': {
      const out: string[] = [...a.onsets.map(letterSay), ...a.vowels.map(letterSay)];
      for (const o of a.onsets)
        for (const v of a.vowels) if (!a.blocked.includes(o + v)) out.push(combineSay(o, v));
      return out;
    }
  }
}

/** Every distinct text the app may speak for these lessons, in first-use order. */
export function collectSpeech(lessons: Lesson[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  const add = (t: string) => {
    const k = t.normalize('NFC').trim();
    if (k && !seen.has(k)) {
      seen.add(k);
      out.push(k);
    }
  };
  lessons.forEach((l) => l.activities.forEach((a) => activitySpeech(a).forEach(add)));
  (Object.values(TONE_NAME) as string[]).forEach(add);
  ALL_FIXED_PHRASES.forEach(add);
  return out;
}
