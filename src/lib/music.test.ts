import { LOOP_BEATS, composeLoop, midiToHz } from './music';
import { setAudioBackend, setSoundEnabled, setSpeakingListener, speak, speakSeq } from './audio';

const C_MAJOR = new Set([0, 2, 4, 5, 7, 9, 11]);

describe('background music composition', () => {
  it('is deterministic per seed and differs between seeds', () => {
    expect(composeLoop(1)).toEqual(composeLoop(1));
    expect(composeLoop(1)).not.toEqual(composeLoop(2));
  });
  it('stays in C major, inside the loop, and in a singable range', () => {
    for (let seed = 0; seed < 8; seed++) {
      for (const n of composeLoop(seed)) {
        expect(C_MAJOR.has(((n.midi % 12) + 12) % 12)).toBe(true);
        expect(n.t).toBeGreaterThanOrEqual(0);
        expect(n.t).toBeLessThan(LOOP_BEATS);
        if (n.kind === 'lead') {
          expect(n.midi).toBeGreaterThanOrEqual(65);
          expect(n.midi).toBeLessThanOrEqual(81);
        }
      }
    }
  });
  it('has bass, melody and bells; melody does not leap more than an octave', () => {
    const loop = composeLoop(3);
    expect(loop.filter((n) => n.kind === 'bass')).toHaveLength(8);
    expect(loop.filter((n) => n.kind === 'bell')).toHaveLength(4);
    const lead = loop.filter((n) => n.kind === 'lead').sort((a, b) => a.t - b.t);
    expect(lead.length).toBeGreaterThan(14);
    for (let i = 1; i < lead.length; i++) expect(Math.abs(lead[i].midi - lead[i - 1].midi)).toBeLessThanOrEqual(12);
  });
  it('converts MIDI to Hz', () => {
    expect(midiToHz(69)).toBeCloseTo(440);
    expect(midiToHz(60)).toBeCloseTo(261.63, 1);
  });
});

describe('music ducking hook', () => {
  it('tells listeners when the teacher starts and stops talking, even for overlapping speech', async () => {
    const events: boolean[] = [];
    setSpeakingListener((s) => events.push(s));
    let release: () => void = () => {};
    setAudioBackend({ play: () => new Promise<void>((r) => { release = r; }), stop: () => {} });
    setSoundEnabled(true);
    const p = speak('cá');
    expect(events).toEqual([true]);
    release();
    await p;
    expect(events).toEqual([true, false]);
    events.length = 0;
    setAudioBackend({ play: async () => {}, stop: () => {} });
    await speakSeq(['a', 'b']);
    expect(events).toEqual([true, false]);
    setSpeakingListener(null);
  });
});
