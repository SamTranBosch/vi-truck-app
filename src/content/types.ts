import type { SoundTarget, Tone } from '../lib/vietnamese';

export interface StoryScene {
  /** Picture shown for the scene (emoji, so no image files are needed). */
  emoji: string;
  /** What the teacher voice says. */
  text: string;
}

export interface Story {
  id: string;
  title: string;
  scenes: StoryScene[];
}

export type Activity =
  /** Làm quen: see a picture, hear the word. `marks` are the letters highlighted in the word. */
  | { type: 'meet'; words: string[]; marks?: string[] }
  /** Đánh vần: tap the tiles in order (cờ – a – ca – huyền – cà). */
  | { type: 'spell'; words: string[] }
  /** "Tiếng nào có âm …?": tap every picture whose word has the sound. */
  | { type: 'hunt'; kind: 'sound'; target: SoundTarget; words: string[] }
  /** "Tiếng nào có thanh …?": same, for tones. */
  | { type: 'hunt'; kind: 'tone'; tone: Tone; words: string[] }
  /** Tìm chữ: tap the target letters among other letters. */
  | { type: 'findLetter'; targets: string[]; others: string[] }
  /** Tập viết: trace letters, words and numbers with a finger. */
  | { type: 'trace'; items: string[] }
  /** mode 'hear': hear a word, pick the picture. mode 'read': read the written word, pick the picture. */
  | { type: 'pick'; mode: 'hear' | 'read'; words: string[] }
  /** Kể chuyện: listen to the story, then put the pictures in order. */
  | { type: 'story'; story: Story }
  /** Tập đọc: read words or short lines. Tap a word to hear it; the speaker reads the whole line. */
  | { type: 'read'; lines: string[] }
  /** Chữ hoa: see a small letter, pick its capital among three. */
  | { type: 'capital'; letters: string[] }
  /** Ôn tập: build syllables from a consonant row and a vowel column. */
  | { type: 'combine'; onsets: string[]; vowels: string[]; blocked: string[]; need: number };

export type LessonKind = 'intro' | 'letters' | 'tones' | 'story' | 'review';

export interface Lesson {
  id: string;
  kind: LessonKind;
  /** Short name used in tests and the parent screen. */
  title: string;
  /** What is printed on the mud tile (letters, or an emoji for stories and reviews). */
  label: string;
  /** Letters and tones this lesson introduces (used to check that reading words are decodable). */
  teaches: { letters?: string[]; tones?: Tone[] };
  activities: Activity[];
}

/** Kinds of truck hidden under the mud, one per world. */
export type TruckKind = 'fire' | 'cement' | 'container' | 'tank' | 'dump' | 'crane';

/** A world is one truck covered in 16 mud tiles, one tile per lesson. */
export interface World {
  id: string;
  /** Vietnamese name of the truck, e.g. "Xe cứu hỏa" */
  name: string;
  truck: TruckKind;
  /** emoji shown on the world picker */
  icon: string;
  lessons: Lesson[];
}
