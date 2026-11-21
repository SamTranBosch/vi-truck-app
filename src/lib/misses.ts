import { sfx } from './audio';

/** Every wrong answer goes through here: it plays the "oops" sound and tells whoever is counting. */
let listener: (() => void) | null = null;

export function setMissListener(fn: (() => void) | null): void {
  listener = fn;
}

export function wrong(): void {
  sfx('bad');
  listener?.();
}
