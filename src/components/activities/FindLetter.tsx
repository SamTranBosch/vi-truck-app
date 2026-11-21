import { useEffect, useMemo, useState } from 'react';
import { PHRASES } from '../../content/phrases';
import { letterSay } from '../../content/speech';
import { sfx, speak } from '../../lib/audio';
import { wrong as miss } from '../../lib/misses';
import { shuffle } from '../../lib/rng';
import { SpeakButton, cheer, useIdleHint, useLater } from '../shared';
import type { ActivityProps } from './types';

/** Tìm chữ: tap the target letters hidden among other letters. */
export function FindLetter({ activity, onDone }: ActivityProps<'findLetter'>) {
  const prompt = PHRASES.findLetter(activity.targets.map(letterSay));
  const tiles = useMemo(() => {
    const all = [...activity.targets.flatMap((t) => [t, t]), ...activity.others].slice(0, 14);
    return shuffle(all, activity.targets.join('').length * 31 + activity.others.length);
  }, [activity]);
  const need = tiles.filter((t) => activity.targets.includes(t)).length;
  const [found, setFound] = useState<Set<number>>(new Set());
  const [wrong, setWrong] = useState<number | null>(null);
  const later = useLater();
  // after a quiet moment one of the letters still to find wiggles
  const hint = useIdleHint(
    `${found.size}:${wrong}`,
    tiles.map((t, i) => (activity.targets.includes(t) && !found.has(i) ? String(i) : '')).filter(Boolean),
  );

  useEffect(() => {
    void speak(prompt);
  }, [prompt]);

  const tap = (i: number) => {
    const letter = tiles[i];
    void speak(letterSay(letter));
    if (found.has(i)) return;
    if (!activity.targets.includes(letter)) {
      miss();
      setWrong(i);
      later(() => setWrong(null), 450);
      return;
    }
    sfx('good');
    const nf = new Set(found).add(i);
    setFound(nf);
    if (nf.size === need) {
      later(() => {
        cheer();
        later(onDone, 800);
      }, 900);
    }
  };

  return (
    <div className="act act-find">
      <div className="prompt">
        <span className="target-badge">{activity.targets.join(' ')}</span>
        <SpeakButton text={prompt} label="Nghe câu hỏi" />
      </div>
      <div className="letter-field" role="group" aria-label={prompt}>
        {tiles.map((t, i) => (
          <button
            key={i}
            type="button"
            className={`letter-btn${found.has(i) ? ' found' : ''}${wrong === i ? ' shake' : ''}${hint === String(i) ? ' hint' : ''}`}
            aria-label={`chữ ${t}`}
            aria-pressed={found.has(i)}
            onClick={() => tap(i)}
          >
            {t}
          </button>
        ))}
      </div>
    </div>
  );
}
