import { get, set } from 'idb-keyval';

export interface Progress {
  version: 1;
  /** lesson id -> time it was finished (ms since epoch) */
  completed: Record<string, number>;
  soundOn: boolean;
  /** background music; default on */
  musicOn: boolean;
}

export const STORAGE_KEY = 'xe-hoc-chu:progress';

export function emptyProgress(): Progress {
  return { version: 1, completed: {}, soundOn: true, musicOn: true };
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
  return { version: 1, completed, soundOn: d.soundOn !== false, musicOn: d.musicOn !== false };
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
  return { ...p, completed: { ...p.completed, [lessonId]: now } };
}

export type TileState = 'done' | 'current' | 'locked';

/** Lessons unlock in book order: a tile is playable only when everything before it is done. */
export function tileState(lessonIds: string[], p: Progress, index: number): TileState {
  if (p.completed[lessonIds[index]]) return 'done';
  const firstOpen = lessonIds.findIndex((id) => !p.completed[id]);
  return firstOpen === index ? 'current' : 'locked';
}

export function doneCount(lessonIds: string[], p: Progress): number {
  return lessonIds.filter((id) => p.completed[id]).length;
}
