import { describe, expect, it, vi } from 'vitest';
import { SAMPLE_TEXTS, VOICES, synthesize } from './tts';

const audio = Buffer.alloc(500, 1);
const audioRes = () => new Response(audio, { status: 200, headers: { 'content-type': 'audio/mpeg' } });
const json = (o: unknown) => new Response(JSON.stringify(o), { status: 200, headers: { 'content-type': 'application/json' } });
const noWait = { sleepFn: async () => {}, pollMs: 0 };

describe('FPT.AI provider', () => {
  it('posts text with voice/speed headers, then downloads the async link (retrying until ready)', async () => {
    const calls: [string, RequestInit | undefined][] = [];
    let polls = 0;
    const fetchFn = vi.fn(async (url: string, init?: RequestInit) => {
      calls.push([url, init]);
      if (url.includes('api.fpt.ai')) return json({ async: 'https://file.fpt/x.mp3', error: 0, message: '0' });
      return ++polls < 3 ? new Response('not yet', { status: 404 }) : audioRes();
    }) as unknown as typeof fetch;
    const out = await synthesize('cà', { provider: 'fpt', apiKey: 'K', voice: 'lannhi', fetchFn, ...noWait });
    expect(out.length).toBe(500);
    const [url, init] = calls[0];
    expect(url).toBe('https://api.fpt.ai/hmi/tts/v5');
    expect(init?.method).toBe('POST');
    expect(init?.body).toBe('cà');
    expect(init?.headers).toMatchObject({ api_key: 'K', voice: 'lannhi', speed: '-1' });
    expect(polls).toBe(3);
  });
  it('reports API errors and files that never appear', async () => {
    const bad = (async () => json({ error: 1, message: 'invalid key' })) as unknown as typeof fetch;
    await expect(synthesize('a', { provider: 'fpt', apiKey: 'x', fetchFn: bad, ...noWait })).rejects.toThrow(/invalid key/);
    const never = (async (url: string) => (url.includes('api.fpt.ai') ? json({ async: 'https://f/x.mp3', error: 0 }) : new Response('', { status: 404 }))) as unknown as typeof fetch;
    await expect(synthesize('a', { provider: 'fpt', apiKey: 'x', fetchFn: never, pollTries: 3, ...noWait })).rejects.toThrow(/never became ready/);
  });
});

describe('Zalo provider', () => {
  it('posts a form with speaker_id and follows data.url', async () => {
    let body = '';
    const fetchFn = (async (url: string, init?: RequestInit) => {
      if (url.includes('api.zalo.ai')) {
        body = String(init?.body);
        expect((init?.headers as Record<string, string>).apikey).toBe('Z');
        return json({ error_code: 0, data: { url: 'https://z/x.mp3' } });
      }
      return audioRes();
    }) as unknown as typeof fetch;
    await synthesize('cá', { provider: 'zalo', apiKey: 'Z', fetchFn, ...noWait });
    const p = new URLSearchParams(body);
    expect(p.get('input')).toBe('cá');
    expect(p.get('speaker_id')).toBe('1');
    expect(p.get('speed')).toBe('0.8');
  });
  it('surfaces Zalo error codes', async () => {
    const fetchFn = (async () => json({ error_code: 111, error_message: 'quota' })) as unknown as typeof fetch;
    await expect(synthesize('a', { provider: 'zalo', apiKey: 'Z', fetchFn, ...noWait })).rejects.toThrow(/quota/);
  });
});

describe('voice lists', () => {
  it('the default voices are the Southern female ones', () => {
    expect(VOICES.fpt[0].label).toMatch(/Southern female/);
    expect(VOICES.zalo[0].label).toMatch(/South female/);
    expect(SAMPLE_TEXTS.length).toBeGreaterThan(3);
  });
});
