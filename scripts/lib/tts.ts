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
    // Ids as in the open-source ZaloTTS wrapper (github.com/iconclub/zalo-tts): 1 and 2 women, 3 and 4 men.
    { id: '1', label: 'South female' },
    { id: '3', label: 'South male (for comparison only)' },
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
  // every request gets 30 s: a request that never answers must not freeze the whole run
  const fetchFn: typeof fetch = opt.fetchFn ?? ((input, init) => fetch(input, { ...init, signal: AbortSignal.timeout(30000) }));
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

  // The wrapper treats error 155 as a soft failure; we assume a request-rate limit and retry a few times with a pause.
  let json: { error_code?: number; error_message?: string; data?: { url?: string } } = {};
  for (let attempt = 0; attempt < 4; attempt++) {
    const res = await fetchFn('https://api.zalo.ai/v1/tts/synthesize', {
      method: 'POST',
      headers: { apikey: opt.apiKey, 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ input: text, speaker_id: voice, speed, encode_type: '1' }),
    });
    if (res.status === 429) {
      // too many requests: wait longer each time (5 s, 10 s, ...) before giving up on this clip
      if (attempt === 3) throw new Error('Zalo HTTP 429');
      await poll.sleepFn(5000 * (attempt + 1));
      continue;
    }
    if (!res.ok) throw new Error(`Zalo HTTP ${res.status}`);
    json = (await res.json()) as typeof json;
    if (json.error_code !== 155) break;
    await poll.sleepFn(1500 * (attempt + 1));
  }
  if (json.error_code !== 0 || !json.data?.url) throw new Error(`Zalo error ${json.error_code}: ${json.error_message}`);
  return fetchWhenReady(json.data.url, poll);
}

/** A few clips that tell voices apart: a letter name, a one-syllable word, tone minimal pair, a sentence. */
export const SAMPLE_TEXTS = ['cờ', 'a', 'cá', 'cà', 'cả', 'Giỏi quá! Bé làm đúng rồi!', 'Tiếng nào có âm cờ?'];
