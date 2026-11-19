/** Small seeded random helpers so layouts are stable between visits and testable. */

export function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function shuffle<T>(items: readonly T[], seed: number): T[] {
  const rnd = mulberry32(seed);
  const a = items.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rnd() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** Shuffles until the order differs from the input (needed for "put in order" games). */
export function shuffleDifferent<T>(items: readonly T[], seed: number): T[] {
  let s = seed;
  let out = shuffle(items, s);
  let guard = 0;
  while (items.length > 1 && out.every((x, i) => x === items[i]) && guard++ < 20) {
    s += 1;
    out = shuffle(items, s);
  }
  return out;
}
