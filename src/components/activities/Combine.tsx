import { useEffect, useState } from 'react';
import { PHRASES } from '../../content/phrases';
import { combineSay, letterSay } from '../../content/speech';
import { sfx, speak } from '../../lib/audio';
import { Dots, cheer, useLater } from '../shared';
import type { ActivityProps } from './types';

/** Ôn tập: tap a cell to hear the syllable made by a consonant row and a vowel column. */
export function Combine({ activity, onDone }: ActivityProps<'combine'>) {
  const { onsets, vowels, blocked, need } = activity;
  const [heard, setHeard] = useState<Set<string>>(new Set());
  const [last, setLast] = useState('');
  const later = useLater();

  useEffect(() => {
    void speak(PHRASES.combine);
  }, []);

  const tap = (o: string, v: string) => {
    const key = o + v;
    if (blocked.includes(key)) {
      sfx('bad');
      return;
    }
    sfx('tap');
    void speak(combineSay(o, v));
    setLast(key);
    if (heard.has(key)) return;
    const nh = new Set(heard).add(key);
    setHeard(nh);
    if (nh.size === need) {
      later(() => {
        cheer();
        later(onDone, 800);
      }, 1000);
    }
  };

  return (
    <div className="act act-combine">
      <div className="prompt">
        <span className="target-badge" aria-live="polite">{last || '·'}</span>
      </div>
      <table className="combine-grid">
        <thead>
          <tr>
            <th />
            {vowels.map((v) => (
              <th key={v}>
                <button type="button" className="head-btn" onClick={() => void speak(letterSay(v))}>{v}</button>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {onsets.map((o) => (
            <tr key={o}>
              <th>
                <button type="button" className="head-btn" onClick={() => void speak(letterSay(o))}>{o}</button>
              </th>
              {vowels.map((v) => {
                const key = o + v;
                const isBlocked = blocked.includes(key);
                return (
                  <td key={key}>
                    <button
                      type="button"
                      className={`cell-btn${isBlocked ? ' blocked' : ''}${heard.has(key) ? ' done' : ''}`}
                      aria-label={isBlocked ? `${key} không có` : key}
                      aria-disabled={isBlocked}
                      onClick={() => tap(o, v)}
                    >
                      {isBlocked ? '✕' : key}
                    </button>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
      <Dots count={need} index={Math.min(heard.size, need)} />
    </div>
  );
}
