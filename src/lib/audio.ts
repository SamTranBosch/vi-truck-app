/**
 * Audio layer.
 *
 * Every spoken thing is a Vietnamese text. For each text we look for a pre-made clip
 * (public/audio/<voice set>/<key>.mp3, listed in public/audio/<voice set>/manifest.json). The voice sets
 * are listed in public/audio/voices.json and the parent picks one in the settings. If the clip is
 * missing (or the parent chose the device voice) we fall back to the browser's own Vietnamese voice
 * (speechSynthesis), so the app is usable from day one and gets better as real clips are added.
 */

/** Deterministic file name for a text: hex code points joined by "_" ("cá" -> "63_e1"). */
export function audioKey(text: string): string {
  return [...text.trim().normalize('NFC')].map((c) => c.codePointAt(0)!.toString(16)).join('_');
}

import { getAudioContext } from './ctx';

export interface VoiceSet {
  id: string;
  label: string;
  note?: string;
}
/** The choice that means "the phone's own voice". */
export const DEVICE_VOICE = 'device';

export interface AudioBackend {
  play(text: string): Promise<void>;
  stop(): void;
}

const CLIP_TIMEOUT_MS = 8000;

export class BrowserAudio implements AudioBackend {
  private clips = new Set<string>();
  private sets: VoiceSet[] = [];
  private defaultSet: string | null = null;
  /** what the parent chose: a set id, DEVICE_VOICE, or null = the default set */
  private choice: string | null = null;
  /** the set whose clips are loaded now (null = none, use the device voice) */
  private active: string | null = null;
  private loaded = false;
  private current: HTMLAudioElement | null = null;
  private voice: SpeechSynthesisVoice | null = null;
  private baseUrl: string;

  constructor(baseUrl = '/') {
    this.baseUrl = baseUrl.endsWith('/') ? baseUrl : baseUrl + '/';
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      const pick = () => {
        const vi = window.speechSynthesis.getVoices().filter((v) => v.lang.toLowerCase().startsWith('vi'));
        this.voice = vi[0] ?? null;
      };
      pick();
      window.speechSynthesis.addEventListener?.('voiceschanged', pick);
    }
  }

  /** Reads voices.json and the manifest of the chosen set. Safe to call again after the choice changes. */
  async loadManifest(): Promise<number> {
    this.clips = new Set();
    this.active = null;
    this.loaded = true;
    try {
      const res = await fetch(`${this.baseUrl}audio/voices.json`, { cache: 'no-cache' });
      if (res.ok) {
        const data = (await res.json()) as { default?: string; sets?: VoiceSet[] };
        this.sets = Array.isArray(data.sets) ? data.sets.filter((s) => s && typeof s.id === 'string') : [];
        this.defaultSet = data.default ?? this.sets[0]?.id ?? null;
      }
    } catch {
      this.sets = [];
      this.defaultSet = null;
    }
    if (this.choice === DEVICE_VOICE) return 0;
    const wanted = this.sets.some((s) => s.id === this.choice) ? this.choice : this.defaultSet;
    if (!wanted) return 0;
    try {
      const res = await fetch(`${this.baseUrl}audio/${wanted}/manifest.json`, { cache: 'no-cache' });
      if (!res.ok) return 0;
      const data = (await res.json()) as { clips?: string[] };
      this.clips = new Set(data.clips ?? []);
      this.active = this.clips.size > 0 ? wanted : null;
    } catch {
      this.clips = new Set();
    }
    return this.clips.size;
  }

  isLoaded(): boolean {
    return this.loaded;
  }

  voiceSets(): VoiceSet[] {
    return this.sets;
  }

  /** the id that is really in use: the chosen set, the default set, or DEVICE_VOICE */
  activeVoice(): string {
    return this.active ?? DEVICE_VOICE;
  }

  setChoice(choice: string | null): boolean {
    const changed = choice !== this.choice;
    this.choice = choice;
    return changed;
  }

  /** Plays a clip of another voice set without changing the choice (the "listen" button). */
  preview(setId: string, text: string): Promise<void> {
    this.stop();
    if (setId === DEVICE_VOICE) return this.playSpeech(text);
    return this.playUrl(`${this.baseUrl}audio/${setId}/${audioKey(text)}.mp3`, () => this.playSpeech(text));
  }

  /** Downloads every clip of the active set so the browser cache holds them and the app works offline. */
  async prefetch(onProgress?: (done: number, total: number) => void): Promise<number> {
    const set = this.active;
    if (!set || typeof fetch === 'undefined') return 0;
    const keys = [...this.clips];
    let next = 0;
    let done = 0;
    const worker = async () => {
      while (next < keys.length) {
        const key = keys[next++];
        try {
          await fetch(`${this.baseUrl}audio/${set}/${key}.mp3`);
        } catch {
          /* offline or interrupted: the clip is fetched when it is played */
        }
        onProgress?.(++done, keys.length);
      }
    };
    await Promise.all([worker(), worker(), worker()]);
    return done;
  }

  clipCount(): number {
    return this.clips.size;
  }

  hasClip(text: string): boolean {
    return this.clips.has(audioKey(text));
  }

  stop(): void {
    if (this.current) {
      this.current.pause();
      this.current = null;
    }
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) window.speechSynthesis.cancel();
  }

  play(text: string): Promise<void> {
    this.stop();
    if (this.hasClip(text)) return this.playClip(text);
    return this.playSpeech(text);
  }

  private playClip(text: string): Promise<void> {
    return this.playUrl(`${this.baseUrl}audio/${this.active}/${audioKey(text)}.mp3`, () => this.playSpeech(text));
  }

  /** Plays one mp3; if it cannot be loaded or played, `fallback` (the device voice) speaks instead. */
  private playUrl(url: string, fallback: () => Promise<void>): Promise<void> {
    return new Promise((resolve) => {
      const el = new Audio(url);
      this.current = el;
      let finished = false;
      const done = () => {
        if (finished) return;
        finished = true;
        resolve();
      };
      const failed = () => {
        if (finished) return;
        finished = true;
        void fallback().then(resolve);
      };
      el.addEventListener('ended', done, { once: true });
      el.addEventListener('error', failed, { once: true });
      window.setTimeout(done, CLIP_TIMEOUT_MS);
      el.play().catch(failed);
    });
  }

  private playSpeech(text: string): Promise<void> {
    return new Promise((resolve) => {
      if (typeof window === 'undefined' || !('speechSynthesis' in window)) return resolve();
      const u = new SpeechSynthesisUtterance(text);
      u.lang = 'vi-VN';
      if (this.voice) u.voice = this.voice;
      u.rate = 0.8;
      u.pitch = 1.1;
      u.onend = () => resolve();
      u.onerror = () => resolve();
      window.setTimeout(() => resolve(), 2500 + text.length * 250);
      window.speechSynthesis.speak(u);
    });
  }
}

let backend: AudioBackend = new BrowserAudio(typeof import.meta !== 'undefined' ? import.meta.env?.BASE_URL ?? '/' : '/');
let soundOn = true;

export function setAudioBackend(b: AudioBackend): void {
  backend = b;
}
export function getAudioBackend(): AudioBackend {
  return backend;
}
export function setSoundEnabled(on: boolean): void {
  soundOn = on;
  if (!on) backend.stop();
}
export function isSoundEnabled(): boolean {
  return soundOn;
}

export async function loadAudioManifest(): Promise<number> {
  return backend instanceof BrowserAudio ? backend.loadManifest() : 0;
}
export function audioClipCount(): number {
  return backend instanceof BrowserAudio ? backend.clipCount() : 0;
}

/** Applies the parent's choice (a set id, DEVICE_VOICE or null = default), loads its clips and caches them for offline use. */
export async function chooseVoice(choice: string | null): Promise<void> {
  if (!(backend instanceof BrowserAudio)) return;
  const b = backend;
  if (!b.setChoice(choice) && b.isLoaded()) return;
  await b.loadManifest();
  void cacheVoiceForOffline(b);
}
export function voiceSets(): VoiceSet[] {
  return backend instanceof BrowserAudio ? backend.voiceSets() : [];
}
export function activeVoice(): string {
  return backend instanceof BrowserAudio ? backend.activeVoice() : DEVICE_VOICE;
}
/** The clips the parent hears when comparing voices: two letter sounds, a word and a praise. */
export const VOICE_PREVIEW_TEXTS = ['cờ', 'a', 'cá', 'Giỏi quá! Bé làm đúng rồi!'];
export async function previewVoice(setId: string): Promise<void> {
  if (!(backend instanceof BrowserAudio)) return;
  for (const text of VOICE_PREVIEW_TEXTS) await backend.preview(setId, text);
}

/** Once per voice set and browser: only when a service worker is in charge, so the downloads land in its cache. */
async function cacheVoiceForOffline(b: BrowserAudio): Promise<void> {
  const set = b.activeVoice();
  if (set === DEVICE_VOICE || typeof navigator === 'undefined' || !navigator.serviceWorker?.controller) return;
  const flag = `xe-hoc-chu:cached:${set}:${b.clipCount()}`;
  try {
    if (window.localStorage.getItem(flag)) return;
    const done = await b.prefetch();
    if (done >= b.clipCount()) window.localStorage.setItem(flag, '1');
  } catch {
    /* best effort */
  }
}

let speakingListener: ((speaking: boolean) => void) | null = null;
let speakingCount = 0;
/** Lets other modules (the music) know while the teacher is talking. */
export function setSpeakingListener(fn: ((speaking: boolean) => void) | null): void {
  speakingListener = fn;
}
async function withSpeaking(p: Promise<void>): Promise<void> {
  speakingCount++;
  speakingListener?.(true);
  try {
    await p;
  } finally {
    speakingCount = Math.max(0, speakingCount - 1);
    if (speakingCount === 0) speakingListener?.(false);
  }
}

export function speak(text: string): Promise<void> {
  if (!soundOn || !text) return Promise.resolve();
  return withSpeaking(backend.play(text));
}

/** Speaks several texts one after another (used for "cờ – a – ca"). */
export async function speakSeq(texts: string[]): Promise<void> {
  speakingCount++;
  speakingListener?.(true);
  try {
    for (const t of texts) {
      if (!soundOn) return;
      await backend.play(t);
    }
  } finally {
    speakingCount = Math.max(0, speakingCount - 1);
    if (speakingCount === 0) speakingListener?.(false);
  }
}

export function stopSpeaking(): void {
  backend.stop();
}

/**
 * iOS only lets audio start from a real tap. Call this from the first pointerdown:
 * it wakes the WebAudio context and primes speechSynthesis with a silent utterance.
 */
export function unlockAudio(): void {
  try {
    sfx('tap');
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      const u = new SpeechSynthesisUtterance(' ');
      u.volume = 0;
      window.speechSynthesis.speak(u);
    }
  } catch {
    /* ignore */
  }
}

// ---- tiny sound effects (no files needed) ----

function tone(freq: number, start: number, dur: number, type: OscillatorType = 'sine', vol = 0.12): void {
  const ctx = getAudioContext();
  if (!ctx) return;
  const o = ctx.createOscillator();
  const g = ctx.createGain();
  o.type = type;
  o.frequency.value = freq;
  g.gain.setValueAtTime(0, ctx.currentTime + start);
  g.gain.linearRampToValueAtTime(vol, ctx.currentTime + start + 0.02);
  g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + start + dur);
  o.connect(g).connect(ctx.destination);
  o.start(ctx.currentTime + start);
  o.stop(ctx.currentTime + start + dur + 0.05);
}

export type Sfx = 'good' | 'bad' | 'win' | 'tap';

/** The on-screen mascot reacts to the same events as the sound effects (even when muted). */
function emitMood(kind: Sfx): void {
  try {
    if (typeof window !== 'undefined') window.dispatchEvent(new CustomEvent('mascot', { detail: kind }));
  } catch {
    /* cosmetic only */
  }
}

export function sfx(kind: Sfx): void {
  emitMood(kind);
  if (!soundOn) return;
  try {
    if (kind === 'good') {
      tone(660, 0, 0.14);
      tone(880, 0.1, 0.2);
    } else if (kind === 'bad') {
      tone(220, 0, 0.18, 'triangle', 0.1);
    } else if (kind === 'tap') {
      tone(520, 0, 0.06, 'sine', 0.06);
    } else {
      [523, 659, 784, 1047].forEach((f, i) => tone(f, i * 0.12, 0.3));
    }
  } catch {
    /* sound effects are optional */
  }
}
