import { afterEach, describe, expect, it, vi } from 'vitest';
import { BrowserAudio, DEVICE_VOICE, audioKey } from './audio';

/** A tiny fake of the files under public/audio/. */
function fakeSite(files: Record<string, unknown>) {
  const seen: string[] = [];
  vi.stubGlobal(
    'fetch',
    vi.fn(async (url: string) => {
      seen.push(url);
      const hit = files[url];
      return hit === undefined ? { ok: false, json: async () => ({}) } : { ok: true, json: async () => hit };
    }),
  );
  return seen;
}

const VOICES = { default: 'a', sets: [{ id: 'a', label: 'Giọng A' }, { id: 'b', label: 'Giọng B', note: 'thử' }] };

describe('voice sets', () => {
  afterEach(() => vi.unstubAllGlobals());

  it('loads the default set when nothing was chosen', async () => {
    fakeSite({ '/audio/voices.json': VOICES, '/audio/a/manifest.json': { clips: [audioKey('cá')] } });
    const b = new BrowserAudio('/');
    expect(await b.loadManifest()).toBe(1);
    expect(b.activeVoice()).toBe('a');
    expect(b.voiceSets().map((s) => s.id)).toEqual(['a', 'b']);
    expect(b.hasClip('cá')).toBe(true);
  });

  it('loads the chosen set, and falls back to the default when the choice no longer exists', async () => {
    fakeSite({
      '/audio/voices.json': VOICES,
      '/audio/a/manifest.json': { clips: [audioKey('cá')] },
      '/audio/b/manifest.json': { clips: [audioKey('cá'), audioKey('cà')] },
    });
    const b = new BrowserAudio('/');
    b.setChoice('b');
    expect(await b.loadManifest()).toBe(2);
    expect(b.activeVoice()).toBe('b');
    b.setChoice('gone');
    expect(await b.loadManifest()).toBe(1);
    expect(b.activeVoice()).toBe('a');
  });

  it('the device voice loads no clips at all', async () => {
    const seen = fakeSite({ '/audio/voices.json': VOICES, '/audio/a/manifest.json': { clips: ['63_e1'] } });
    const b = new BrowserAudio('/');
    b.setChoice(DEVICE_VOICE);
    expect(await b.loadManifest()).toBe(0);
    expect(b.activeVoice()).toBe(DEVICE_VOICE);
    expect(seen.some((u) => u.endsWith('/manifest.json'))).toBe(false);
  });

  it('works when no voices exist yet (everything is spoken by the device)', async () => {
    fakeSite({});
    const b = new BrowserAudio('/');
    expect(await b.loadManifest()).toBe(0);
    expect(b.voiceSets()).toEqual([]);
    expect(b.activeVoice()).toBe(DEVICE_VOICE);
  });

  it('setChoice reports whether the choice changed', () => {
    const b = new BrowserAudio('/');
    expect(b.setChoice('b')).toBe(true);
    expect(b.setChoice('b')).toBe(false);
  });

  it('prefetch downloads each clip of the active set once', async () => {
    const seen = fakeSite({
      '/audio/voices.json': VOICES,
      '/audio/a/manifest.json': { clips: ['63_e1', '63_e0', '63_1ea3'] },
    });
    const b = new BrowserAudio('/');
    await b.loadManifest();
    seen.length = 0;
    const progress: number[] = [];
    expect(await b.prefetch((d) => progress.push(d))).toBe(3);
    expect(seen.sort()).toEqual(['/audio/a/63_1ea3.mp3', '/audio/a/63_e0.mp3', '/audio/a/63_e1.mp3']);
    expect(progress).toHaveLength(3);
  });
});
