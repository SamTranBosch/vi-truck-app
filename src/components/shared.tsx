import { useEffect, useRef, useState, type ReactNode } from 'react';
import { PHRASES } from '../content/phrases';
import { sfx, speak } from '../lib/audio';
import { parseSyllable } from '../lib/vietnamese';
import { Pic } from './Pic';

let praiseCounter = 0;

/** Sound + a spoken praise line (cycles through the list so it never feels random-broken). */
export function cheer(): void {
  sfx('good');
  const line = PHRASES.praise[praiseCounter++ % PHRASES.praise.length];
  void speak(line);
}

/** setTimeout that is cancelled automatically when the component goes away. */
export function useLater(): (fn: () => void, ms: number) => void {
  const ids = useRef<number[]>([]);
  useEffect(
    () => () => {
      ids.current.forEach((id) => window.clearTimeout(id));
      ids.current = [];
    },
    [],
  );
  return (fn, ms) => {
    ids.current.push(window.setTimeout(fn, ms));
  };
}

/**
 * After a quiet moment the app nudges a right answer (it wiggles). Any tap, and any change of `resetKey`, restarts the wait.
 * `candidates` are the answers still to find; nothing happens when the list is empty.
 */
export function useIdleHint(resetKey: unknown, candidates: string[], delayMs = 9000): string | null {
  const [hint, setHint] = useState<string | null>(null);
  const list = candidates.join('|');
  useEffect(() => {
    setHint(null);
    if (!list) return;
    const options = list.split('|');
    const id = window.setTimeout(() => setHint(options[Math.floor(Math.random() * options.length)]), delayMs);
    return () => window.clearTimeout(id);
  }, [resetKey, list, delayMs]);
  return hint;
}

export function SpeakButton({ text, label = 'Nghe lại' }: { text: string; label?: string }) {
  return (
    <button type="button" className="btn btn-round btn-sky" aria-label={label} onClick={() => void speak(text)}>
      <Pic emoji="🔊" className="pic-ui" />
    </button>
  );
}

export function PrevButton({ onClick }: { onClick: () => void }) {
  return (
    <button type="button" className="btn btn-round btn-light" aria-label="Quay lại" onClick={onClick}>
      ◀
    </button>
  );
}

export function NextButton({ onClick, glow = true }: { onClick: () => void; glow?: boolean }) {
  return (
    <button type="button" className={`btn btn-round btn-go${glow ? ' glow' : ''}`} aria-label="Tiếp" onClick={onClick}>
      ▶
    </button>
  );
}

/** A written word where the letters being learned are coloured (the onset and/or the vowel). */
export function WordText({ word, marks = [], className = '' }: { word: string; marks?: string[]; className?: string }) {
  const parts: ReactNode[] = [];
  word.split(' ').forEach((syl, si) => {
    const s = parseSyllable(syl);
    const nfc = syl.normalize('NFC');
    const onset = nfc.slice(0, s.onset.length);
    const rest = nfc.slice(s.onset.length);
    if (si > 0) parts.push(' ');
    if (onset) parts.push(<span key={`o${si}`} className={marks.includes(s.onset) ? 'mark' : undefined}>{onset}</span>);
    parts.push(<span key={`r${si}`} className={marks.includes(s.nucleus) ? 'mark' : undefined}>{rest}</span>);
  });
  return (
    <span className={`word ${className}`} lang="vi">
      {parts}
    </span>
  );
}

export function Dots({ count, index }: { count: number; index: number }) {
  return (
    <div className="dots" aria-hidden="true">
      {Array.from({ length: count }, (_, i) => (
        <span key={i} className={i < index ? 'dot done' : i === index ? 'dot now' : 'dot'} />
      ))}
    </div>
  );
}

/** The dotted circle with a tone mark on it, as in Vietnamese primers. */
export function ToneBadge({ mark }: { mark: string }) {
  return (
    <span className="tone-badge" aria-hidden="true">
      {'◌'}
      {mark}
    </span>
  );
}
