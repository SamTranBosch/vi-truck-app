/**
 * Quiet, cheerful background music, composed in code (no audio files, no licensing).
 * - 4-bar loop in C major pentatonic over C - Am - F - G, 4 variations picked by a seed.
 * - Very low volume, and it dips further while the teacher is speaking so it never competes.
 * - Pauses when the app goes to the background (iOS would otherwise keep playing).
 */
import { getAudioContext } from './ctx';
import { mulberry32 } from './rng';

export interface Note {
  /** start, in beats from the loop start */
  t: number;
  /** MIDI note number */
  midi: number;
  /** length in beats */
  dur: number;
  kind: 'lead' | 'bass' | 'bell';
}

export const LOOP_BEATS = 16;
export const BPM = 100;
/** C major pentatonic, as semitones above C */
const PENTA = [0, 2, 4, 7, 9];
/** chord roots (semitones above C) for bars 1..4: C Am F G */
const ROOTS = [0, 9, 5, 7];
/** chord tones used by the melody on strong beats */
const CHORD_TONES = [
  [0, 4, 7],
  [9, 0, 4],
  [5, 9, 0],
  [7, 11, 2],
];

const C4 = 60;

/** A playful, bouncy 16-beat phrase. Same seed gives the same music. */
export function composeLoop(seed: number): Note[] {
  const rnd = mulberry32(seed * 7919 + 13);
  const notes: Note[] = [];
  for (let bar = 0; bar < 4; bar++) {
    const b0 = bar * 4;
    const root = ROOTS[bar];
    // bass on beats 1 and 3 (octave below the middle)
    notes.push({ t: b0, midi: C4 - 24 + root, dur: 0.9, kind: 'bass' });
    notes.push({ t: b0 + 2, midi: C4 - 24 + root + (rnd() < 0.5 ? 7 : 0), dur: 0.9, kind: 'bass' });
    // melody: eighth notes, strong beats from the chord, passing notes from the pentatonic scale
    let prev = CHORD_TONES[bar][Math.floor(rnd() * 3)];
    for (let e = 0; e < 8; e++) {
      if (e % 2 === 1 && rnd() < 0.35) continue; // some rests: bouncy, not busy
      const strong = e % 4 === 0;
      const pc = strong ? CHORD_TONES[bar][Math.floor(rnd() * 3)] : PENTA[Math.floor(rnd() * PENTA.length)];
      // keep the line singable: choose the octave closest to the previous note
      let midi = C4 + 12 + pc;
      while (midi - (C4 + 12 + prev) > 6) midi -= 12;
      while ((C4 + 12 + prev) - midi > 6) midi += 12;
      midi = Math.min(Math.max(midi, C4 + 5), C4 + 21);
      prev = ((midi - C4) % 12 + 12) % 12;
      notes.push({ t: b0 + e * 0.5, midi, dur: 0.38, kind: 'lead' });
    }
    // a little bell on the "and" of beat 4
    notes.push({ t: b0 + 3.5, midi: C4 + 24 + CHORD_TONES[bar][0], dur: 0.5, kind: 'bell' });
  }
  return notes;
}

export const midiToHz = (m: number) => 440 * Math.pow(2, (m - 69) / 12);

// ---------- playback ----------

const BASE_VOLUME = 0.05; // master gain: small on purpose
const DUCKED_VOLUME = 0.015;
const LOOKAHEAD_S = 0.5;
const TICK_MS = 120;

let enabled = false;
let started = false;
let ducked = false;
let master: GainNode | null = null;
let timer: number | null = null;
let nextLoopStart = 0;
let loopIndex = 0;

function target(): number {
  return ducked ? DUCKED_VOLUME : BASE_VOLUME;
}

function voice(ctx: AudioContext, n: Note, when: number, secPerBeat: number): void {
  const o = ctx.createOscillator();
  const g = ctx.createGain();
  const peak = n.kind === 'bass' ? 0.9 : n.kind === 'bell' ? 0.35 : 0.55;
  o.type = n.kind === 'lead' ? 'triangle' : 'sine';
  o.frequency.value = midiToHz(n.midi);
  const len = n.dur * secPerBeat;
  g.gain.setValueAtTime(0.0001, when);
  g.gain.linearRampToValueAtTime(peak, when + 0.015);
  g.gain.exponentialRampToValueAtTime(0.0001, when + (n.kind === 'bell' ? len * 2.2 : len));
  o.connect(g).connect(master!);
  o.start(when);
  o.stop(when + (n.kind === 'bell' ? len * 2.2 : len) + 0.05);
}

function tick(): void {
  const ctx = getAudioContext();
  if (!ctx || !master || !enabled) return;
  const spb = 60 / BPM;
  while (nextLoopStart < ctx.currentTime + LOOKAHEAD_S) {
    // alternate between two variations so the loop does not become boring
    const loop = composeLoop(loopIndex % 4);
    for (const n of loop) {
      const when = nextLoopStart + n.t * spb;
      if (when >= ctx.currentTime - 0.05) voice(ctx, n, Math.max(when, ctx.currentTime), spb);
    }
    nextLoopStart += LOOP_BEATS * spb;
    loopIndex++;
  }
}

function begin(): void {
  const ctx = getAudioContext();
  if (!ctx) return;
  if (!master) {
    master = ctx.createGain();
    master.gain.value = 0;
    master.connect(ctx.destination);
  }
  master.gain.setTargetAtTime(target(), ctx.currentTime, 0.4);
  if (timer === null) {
    nextLoopStart = ctx.currentTime + 0.1;
    timer = window.setInterval(tick, TICK_MS);
    tick();
  }
  started = true;
}

function halt(): void {
  const ctx = getAudioContext();
  if (master && ctx) master.gain.setTargetAtTime(0, ctx.currentTime, 0.15);
  if (timer !== null) {
    window.clearInterval(timer);
    timer = null;
  }
  started = false;
}

/** Turn the music on/off (setting). Starting needs a user tap on iOS, so call startMusic() from one. */
export function setMusicEnabled(on: boolean): void {
  enabled = on;
  if (!on) halt();
  else if (started || wantStart) begin();
}

let wantStart = false;
/** Call from a user gesture (first tap): starts the music if it is enabled. */
export function startMusic(): void {
  wantStart = true;
  if (enabled && !started) begin();
}

/** The teacher is speaking: lower the music, then bring it back. */
export function duckMusic(on: boolean): void {
  ducked = on;
  const ctx = getAudioContext();
  if (master && ctx && started) master.gain.setTargetAtTime(target(), ctx.currentTime, on ? 0.08 : 0.5);
}

export function isMusicPlaying(): boolean {
  return started && enabled;
}

if (typeof document !== 'undefined') {
  document.addEventListener('visibilitychange', () => {
    const ctx = getAudioContext();
    if (!ctx) return;
    if (document.hidden) {
      void ctx.suspend();
    } else if (enabled && wantStart) {
      void ctx.resume();
    }
  });
}
