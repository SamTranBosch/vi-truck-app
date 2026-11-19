/**
 * Audio layer.
 *
 * Every spoken thing is a Vietnamese text. For each text we look for a pre-made clip
 * (public/audio/<key>.mp3, listed in public/audio/manifest.json). If the clip is missing
 * we fall back to the browser's own Vietnamese voice (speechSynthesis), so the app is
 * usable from day one and gets better as real clips are added.
 */

/** Deterministic file name for a text: hex code points joined by "_" ("cá" -> "63_e1"). */
export function audioKey(text: string): string {
  return [...text.trim().normalize('NFC')].map((c) => c.codePointAt(0)!.toString(16)).join('_');
}

export interface AudioBackend {
  play(text: string): Promise<void>;
  stop(): void;
}

const CLIP_TIMEOUT_MS = 8000;

export class BrowserAudio implements AudioBackend {
  private clips = new Set<string>();
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

  async loadManifest(): Promise<number> {
    try {
      const res = await fetch(`${this.baseUrl}audio/manifest.json`, { cache: 'no-cache' });
      if (!res.ok) return 0;
      const data = (await res.json()) as { clips?: string[] };
      this.clips = new Set(data.clips ?? []);
    } catch {
      this.clips = new Set();
    }
    return this.clips.size;
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
    return new Promise((resolve) => {
      const el = new Audio(`${this.baseUrl}audio/${audioKey(text)}.mp3`);
      this.current = el;
      const done = () => resolve();
      el.addEventListener('ended', done, { once: true });
      el.addEventListener('error', done, { once: true });
      window.setTimeout(done, CLIP_TIMEOUT_MS);
      el.play().catch(done);
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

export function speak(text: string): Promise<void> {
  if (!soundOn || !text) return Promise.resolve();
  return backend.play(text);
}

/** Speaks several texts one after another (used for "cờ – a – ca"). */
export async function speakSeq(texts: string[]): Promise<void> {
  for (const t of texts) {
    if (!soundOn) return;
    await backend.play(t);
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

let ctx: AudioContext | null = null;
function tone(freq: number, start: number, dur: number, type: OscillatorType = 'sine', vol = 0.12): void {
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

export function sfx(kind: Sfx): void {
  if (!soundOn) return;
  try {
    const AC = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AC) return;
    ctx ??= new AC();
    if (ctx.state === 'suspended') void ctx.resume();
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
