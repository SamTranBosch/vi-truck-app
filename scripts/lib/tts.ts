/**
 * Text-to-speech providers used to bake the teacher voice into public/audio/*.mp3.
 * Both have Southern female voices. The request shapes follow the providers' public docs
 * (FPT.AI: docs.fpt.ai "Text to Speech API v5"; Zalo: zalo.ai/docs/api/text-to-audio-converter).
 * They are covered by mocked-fetch tests only: nobody has called the live APIs from this code yet.
 */

export type Provider = 'fpt' | 'zalo';

export interface VoiceInfo {
  id: string;
  label: string;
}

export const VOICES: Record<Provider, VoiceInfo[]> = {
  fpt: [
    { id: 'lannhi', label: 'Lan Nhi, Southern female' },
    { id: 'linhsan', label: 'Linh San, Southern female' },
    { id: 'banmai', label: 'Ban Mai, Northern female (for comparison only)' },
  ],
  zalo: [
    { id: '1', label: 'South female' },
    { id: '5', label: 'Southern female 2 (check Zalo docs)' },
    { id: '2', label: 'North female (for comparison only)' },
  ],
};

/** Slow, clear reading suits a 5-year-old. */
export const DEFAULT_SPEED: Record<Provider, string> = { fpt: '-1', zalo: '0.8' };
export const DEFAULT_VOICE: Record<Provider, string> = { fpt: 'lannhi', zalo: '1' };
export const KEY_ENV: Record<Provider, string> = { fpt: 'FPT_API_KEY', zalo: 'ZALO_API_KEY' };

export interface SynthOptions {
  provider: Provider;
  apiKey: string;
  voice?: string;
  speed?: string;
  fetchFn?: typeof fetch;
  sleepFn?: (ms: number) => Promise<void>;
  pollMs?: number;
  pollTries?: number;
}

const realSleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

/** Both providers return a link first; the mp3 appears there a few seconds later. */
async function fetchWhenReady(url: string, o: Required<Pick<SynthOptions, 'fetchFn' | 'sleepFn' | 'pollMs' | 'pollTries'>>): Promise<Buffer> {
  let last = 'no response';
  for (let i = 0; i < o.pollTries; i++) {
    const res = await o.fetchFn(url);
    const type = res.headers.get('content-type') ?? '';
    if (res.ok && (type.includes('audio') || type.includes('octet'))) {
      const buf = Buffer.from(await res.arrayBuffer());
      if (buf.length > 200) return buf;
      last = `file too small (${buf.length} bytes)`;
    } else last = `HTTP ${res.status} ${type}`;
    await o.sleepFn(o.pollMs);
  }
  throw new Error(`audio at ${url} never became ready (${last})`);
}

export async function synthesize(text: string, opt: SynthOptions): Promise<Buffer> {
  const fetchFn = opt.fetchFn ?? fetch;
  const poll = { fetchFn, sleepFn: opt.sleepFn ?? realSleep, pollMs: opt.pollMs ?? 800, pollTries: opt.pollTries ?? 20 };
  const voice = opt.voice ?? DEFAULT_VOICE[opt.provider];
  const speed = opt.speed ?? DEFAULT_SPEED[opt.provider];

  if (opt.provider === 'fpt') {
    const res = await fetchFn('https://api.fpt.ai/hmi/tts/v5', {
      method: 'POST',
      headers: { api_key: opt.apiKey, voice, speed, format: 'mp3', 'Cache-Control': 'no-cache' },
      body: text,
    });
    if (!res.ok) throw new Error(`FPT.AI HTTP ${res.status}`);
    const json = (await res.json()) as { async?: string; error?: number; message?: string };
    if (!json.async || (json.error !== undefined && json.error !== 0)) {
      throw new Error(`FPT.AI error ${json.error}: ${json.message}`);
    }
    return fetchWhenReady(json.async, poll);
  }

  const res = await fetchFn('https://api.zalo.ai/v1/tts/synthesize', {
    method: 'POST',
    headers: { apikey: opt.apiKey, 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ input: text, speaker_id: voice, speed, encode_type: '1' }),
  });
  if (!res.ok) throw new Error(`Zalo HTTP ${res.status}`);
  const json = (await res.json()) as { error_code?: number; error_message?: string; data?: { url?: string } };
  if (json.error_code !== 0 || !json.data?.url) throw new Error(`Zalo error ${json.error_code}: ${json.error_message}`);
  return fetchWhenReady(json.data.url, poll);
}

/** A few clips that tell voices apart: a letter name, a one-syllable word, tone minimal pair, a sentence. */
export const SAMPLE_TEXTS = ['cờ', 'a', 'cá', 'cà', 'cả', 'Giỏi quá! Bé làm đúng rồi!', 'Tiếng nào có âm cờ?'];
