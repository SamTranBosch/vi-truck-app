import { get, set } from 'idb-keyval';

export interface Progress {
  version: 1;
  /** lesson id -> time it was finished (ms since epoch) */
  completed: Record<string, number>;
  soundOn: boolean;
  /** background music; default on */
  musicOn: boolean;
  /** the first-open welcome screen has been shown */
  welcomed: boolean;
  /** lesson id -> number of wrong taps so far (the parent view lists the shaky ones) */
  misses: Record<string, number>;
  /** where the child left a lesson without finishing it */
  resume: { id: string; step: number } | null;
}

export const STORAGE_KEY = 'xe-hoc-chu:progress';

export function emptyProgress(): Progress {
  return { version: 1, completed: {}, soundOn: true, musicOn: true, welcomed: false, misses: {}, resume: null };
}

/** Accepts anything and returns a valid Progress, or null when the shape is wrong. */
export function parseProgress(raw: unknown): Progress | null {
  let data: unknown = raw;
  if (typeof raw === 'string') {
    try {
      data = JSON.parse(raw);
    } catch {
      return null;
    }
  }
  if (!data || typeof data !== 'object') return null;
  const d = data as Partial<Progress>;
  if (d.version !== 1 || !d.completed || typeof d.completed !== 'object') return null;
  const completed: Record<string, number> = {};
  for (const [k, v] of Object.entries(d.completed)) {
    if (typeof v === 'number' && Number.isFinite(v)) completed[k] = v;
  }
  const misses: Record<string, number> = {};
  if (d.misses && typeof d.misses === 'object') {
    for (const [k, v] of Object.entries(d.misses)) if (typeof v === 'number' && Number.isFinite(v) && v > 0) misses[k] = Math.floor(v);
  }
  const r = d.resume as Partial<{ id: string; step: number }> | null | undefined;
  const resume = r && typeof r.id === 'string' && Number.isInteger(r.step) && (r.step as number) > 0 ? { id: r.id, step: r.step as number } : null;
  // anyone who already finished a lesson has seen the welcome screen
  const welcomed = d.welcomed === true || Object.keys(completed).length > 0;
  return { version: 1, completed, soundOn: d.soundOn !== false, musicOn: d.musicOn !== false, welcomed, misses, resume };
}

export function exportProgress(p: Progress): string {
  return JSON.stringify(p, null, 2);
}

// IndexedDB first (survives better on iOS), localStorage next, memory last.
const memory = new Map<string, unknown>();

async function read(): Promise<unknown> {
  try {
    const v = await get(STORAGE_KEY);
    if (v !== undefined) return v;
  } catch {
    /* IndexedDB unavailable */
  }
  try {
    const s = window.localStorage.getItem(STORAGE_KEY);
    if (s) return s;
  } catch {
    /* localStorage unavailable */
  }
  return memory.get(STORAGE_KEY);
}

export async function loadProgress(): Promise<Progress> {
  return parseProgress(await read()) ?? emptyProgress();
}

export async function saveProgress(p: Progress): Promise<void> {
  memory.set(STORAGE_KEY, p);
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(p));
  } catch {
    /* ignore */
  }
  try {
    await set(STORAGE_KEY, p);
  } catch {
    /* ignore */
  }
}

/** Asks the browser not to evict our data. Best effort; iOS may ignore it. */
export async function requestPersistence(): Promise<boolean> {
  try {
    return (await navigator.storage?.persist?.()) ?? false;
  } catch {
    return false;
  }
}

export function markComplete(p: Progress, lessonId: string, now = Date.now()): Progress {
  if (p.completed[lessonId]) return p;
  return { ...p, welcomed: true, completed: { ...p.completed, [lessonId]: now } };
}

export type TileState = 'done' | 'current' | 'locked';

/** Lessons unlock in book order: a tile is playable only when everything before it is done. */
export function tileState(lessonIds: string[], p: Progress, index: number, openAll = false): TileState {
  if (p.completed[lessonIds[index]]) return 'done';
  if (openAll) return 'current';
  const firstOpen = lessonIds.findIndex((id) => !p.completed[id]);
  return firstOpen === index ? 'current' : 'locked';
}

export function doneCount(lessonIds: string[], p: Progress): number {
  return lessonIds.filter((id) => p.completed[id]).length;
}

export function recordMiss(p: Progress, lessonId: string): Progress {
  return { ...p, misses: { ...p.misses, [lessonId]: (p.misses[lessonId] ?? 0) + 1 } };
}

/** Lessons the child often got wrong, worst first. Needs at least `min` wrong taps to count. */
export function shakyLessons(p: Progress, min = 3, limit = 5): { id: string; misses: number }[] {
  return Object.entries(p.misses)
    .filter(([, n]) => n >= min)
    .map(([id, misses]) => ({ id, misses }))
    .sort((a, b) => b.misses - a.misses || a.id.localeCompare(b.id))
    .slice(0, limit);
}

export function setResume(p: Progress, lessonId: string, step: number): Progress {
  const cur = p.resume;
  if (step <= 0) return cur?.id === lessonId ? { ...p, resume: null } : p;
  if (cur && cur.id === lessonId && cur.step === step) return p;
  return { ...p, resume: { id: lessonId, step } };
}

export function resumeStep(p: Progress, lessonId: string): number {
  return p.resume?.id === lessonId ? p.resume.step : 0;
}
