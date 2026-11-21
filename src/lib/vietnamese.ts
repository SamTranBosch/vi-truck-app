/**
 * Small Vietnamese syllable toolkit.
 * It splits a syllable into onset / nucleus / coda / tone so that the app (and its tests)
 * can decide by rule whether a word "has the sound c" or "has the tone huyền",
 * instead of trusting hand-entered answers.
 */

export type Tone = 'ngang' | 'huyen' | 'sac' | 'hoi' | 'nga' | 'nang';

export const TONE_NAME: Record<Tone, string> = {
  ngang: 'ngang',
  huyen: 'huyền',
  sac: 'sắc',
  hoi: 'hỏi',
  nga: 'ngã',
  nang: 'nặng',
};

/** Marks drawn over a dotted circle in the UI. */
export const TONE_MARK: Record<Tone, string> = {
  ngang: '',
  huyen: '̀',
  sac: '́',
  hoi: '̉',
  nga: '̃',
  nang: '̣',
};

const MARK_TO_TONE: Record<string, Tone> = {
  '̀': 'huyen',
  '́': 'sac',
  '̉': 'hoi',
  '̃': 'nga',
  '̣': 'nang',
};

// Longest first, so "ngh" wins over "ng" over "n", and "ch" over "c".
const ONSETS = [
  'ngh', 'ng', 'nh', 'ph', 'th', 'tr', 'ch', 'gh', 'gi', 'kh', 'qu',
  'b', 'c', 'd', 'đ', 'g', 'h', 'k', 'l', 'm', 'n', 'p', 'r', 's', 't', 'v', 'x',
];

const CODAS = ['ng', 'nh', 'ch', 'c', 'm', 'n', 'p', 't'];

const VOWEL_CHARS = 'aăâeêioôơuưy';

export interface Syllable {
  /** Initial consonant(s), '' when the syllable starts with a vowel. */
  onset: string;
  /** Vowel part without the tone mark, e.g. "a", "ô", "ia". */
  nucleus: string;
  /** Final consonant(s), '' for open syllables. */
  coda: string;
  tone: Tone;
  /** The syllable written without its tone mark, e.g. "cà" -> "ca". */
  toneless: string;
}

/** Removes the tone mark but keeps hat, horn and breve (â ê ô ơ ư ă). */
export function stripTone(text: string): { text: string; tone: Tone } {
  let tone: Tone = 'ngang';
  const kept: string[] = [];
  for (const ch of text.normalize('NFD')) {
    const t = MARK_TO_TONE[ch];
    if (t) {
      tone = t;
    } else {
      kept.push(ch);
    }
  }
  return { text: kept.join('').normalize('NFC'), tone };
}

export function parseSyllable(raw: string): Syllable {
  const { text, tone } = stripTone(raw.trim().toLowerCase().normalize('NFC'));
  let onset = '';
  for (const o of ONSETS) {
    if (text.startsWith(o)) {
      onset = o;
      break;
    }
  }
  // "gi" is an onset only before a vowel (gia, giờ); in "gì" / "gin" the onset is just "g".
  if (onset === 'gi') {
    const after = text.slice(2);
    if (after === '' || !VOWEL_CHARS.includes(after[0])) onset = 'g';
  }
  const rhyme = text.slice(onset.length);
  let coda = '';
  for (const c of CODAS) {
    if (rhyme.length > c.length && rhyme.endsWith(c) && VOWEL_CHARS.includes(rhyme[rhyme.length - c.length - 1])) {
      coda = c;
      break;
    }
  }
  const nucleus = rhyme.slice(0, rhyme.length - coda.length);
  return { onset, nucleus, coda, tone, toneless: text };
}

/** "cá cờ" -> ["cá", "cờ"] */
export function syllablesOf(word: string): Syllable[] {
  return word.trim().split(/\s+/).filter(Boolean).map(parseSyllable);
}

/** A sound to look for: the first consonant, the vowel, or a whole vần such as "am" (vowel + final consonant). */
export type SoundTarget = { onset: string } | { vowel: string } | { rhyme: string };

export function targetLabel(t: SoundTarget): string {
  if ('onset' in t) return t.onset;
  return 'vowel' in t ? t.vowel : t.rhyme;
}

/** True when any syllable of the word starts with the onset, or has exactly that vowel as nucleus. */
export function hasSound(word: string, target: SoundTarget): boolean {
  return syllablesOf(word).some((s) => {
    if ('onset' in target) return s.onset === target.onset;
    if ('vowel' in target) return s.nucleus === target.vowel;
    return s.nucleus + s.coda === target.rhyme;
  });
}

export function hasTone(word: string, tone: Tone): boolean {
  return syllablesOf(word).some((s) => s.tone === tone);
}

/**
 * How the book (and a Vietnamese teacher) says a consonant when spelling: "cờ – a – ca".
 * Names for letters not yet taught are included so later worlds can reuse this table.
 * ASSUMPTION: confirm these with the school's teacher guide, then adjust here.
 */
export const ONSET_SAY: Record<string, string> = {
  b: 'bờ', c: 'cờ', d: 'dờ', đ: 'đờ', g: 'gờ', h: 'hờ', k: 'ca', l: 'lờ', m: 'mờ', n: 'nờ',
  p: 'pờ', q: 'cu', r: 'rờ', s: 'sờ', t: 'tờ', v: 'vờ', x: 'xờ',
  ch: 'chờ', gh: 'gờ', gi: 'giờ', kh: 'khờ', ng: 'ngờ', ngh: 'ngờ', nh: 'nhờ', ph: 'phờ', qu: 'quờ', th: 'thờ', tr: 'trờ',
};

/** How a final consonant is said when spelling a vần: a - mờ - am. */
export const CODA_SAY: Record<string, string> = { m: 'mờ', p: 'pờ', n: 'nờ', t: 'tờ', c: 'cờ', ch: 'chờ', ng: 'ngờ', nh: 'nhờ' };

export interface SpellToken {
  kind: 'onset' | 'rhyme' | 'syllable' | 'tone' | 'word';
  /** What is shown on the tile. */
  show: string;
  /** What is spoken when the tile is tapped. */
  say: string;
}

/**
 * Đánh vần: "cà" -> cờ · a · ca · huyền · cà.
 * Only for single syllables.
 */
export function spellTokens(word: string): SpellToken[] {
  const s = parseSyllable(word);
  const tokens: SpellToken[] = [];
  // a vần on its own (am, iêp ...): a - mờ - am
  if (!s.onset && s.coda && s.tone === 'ngang') {
    return [
      { kind: 'rhyme', show: s.nucleus, say: s.nucleus },
      { kind: 'onset', show: s.coda, say: CODA_SAY[s.coda] ?? s.coda },
      { kind: 'word', show: word, say: word },
    ];
  }
  if (s.onset) tokens.push({ kind: 'onset', show: s.onset, say: ONSET_SAY[s.onset] ?? s.onset });
  const rhyme = s.nucleus + s.coda;
  tokens.push({ kind: 'rhyme', show: rhyme, say: rhyme });
  if (s.tone === 'ngang') {
    // No tone mark: the toneless syllable already is the word.
    if (s.onset) tokens.push({ kind: 'word', show: word, say: word });
    else tokens[tokens.length - 1] = { kind: 'word', show: word, say: word };
    return tokens;
  }
  if (s.onset) tokens.push({ kind: 'syllable', show: s.toneless, say: s.toneless });
  tokens.push({ kind: 'tone', show: TONE_NAME[s.tone], say: TONE_NAME[s.tone] });
  tokens.push({ kind: 'word', show: word, say: word });
  return tokens;
}
