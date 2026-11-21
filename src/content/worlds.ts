import type { Lesson, World } from './types';
import { WORLD1 } from './world1';
import { WORLD2 } from './world2';
import { WORLD3 } from './world3';
import { WORLD4 } from './world4';
import { WORLD5 } from './world5';
import { WORLD6 } from './world6';

/**
 * All worlds in play order. A world opens when the one before it is finished.
 * Each world has exactly 16 lessons (the 4 x 4 mud grid).
 */
export const WORLDS: World[] = [
  { id: 'w1', name: 'Xe cứu hỏa', truck: 'fire', icon: '🚒', lessons: WORLD1 },
  { id: 'w2', name: 'Xe trộn bê tông', truck: 'cement', icon: '🏗️', lessons: WORLD2 },
  { id: 'w3', name: 'Xe container', truck: 'container', icon: '🚛', lessons: WORLD3 },
  { id: 'w4', name: 'Xe bồn', truck: 'tank', icon: '⛽', lessons: WORLD4 },
  { id: 'w5', name: 'Xe ben', truck: 'dump', icon: '🚚', lessons: WORLD5 },
  { id: 'w6', name: 'Xe cần cẩu', truck: 'crane', icon: '🚧', lessons: WORLD6 },
];

export const ALL_LESSONS: Lesson[] = WORLDS.flatMap((w) => w.lessons);

export function lessonById(id: string): Lesson | undefined {
  return ALL_LESSONS.find((l) => l.id === id);
}

/** A world is open when every lesson of the world before it is done. */
export function worldOpen(worlds: World[], index: number, completed: Record<string, number>): boolean {
  if (index <= 0) return true;
  return worlds[index - 1].lessons.every((l) => completed[l.id]);
}
