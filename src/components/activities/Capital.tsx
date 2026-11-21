import { useEffect, useMemo, useState } from 'react';
import { PHRASES } from '../../content/phrases';
import { letterSay } from '../../content/speech';
import { sfx, speak } from '../../lib/audio';
import { wrong as miss } from '../../lib/misses';
import { shuffle } from '../../lib/rng';
import { SpeakButton, cheer, useLater } from '../shared';
import type { ActivityProps } from './types';

/** Chữ hoa: a small letter is shown; the child taps its capital among three. One round per letter. */
export function Capital({ activity, onDone }: ActivityProps<'capital'>) {
  const [round, setRound] = useState(0);
  const [wrong, setWrong] = useState<string | null>(null);
  const [right, setRight] = useState(false);
  const later = useLater();
  const letter = activity.letters[round];
  const prompt = PHRASES.findCapital(letterSay(letter));
  const options = useMemo(() => {
    const others = activity.letters.filter((l) => l !== letter).map((l) => l.toUpperCase());
    return shuffle([letter.toUpperCase(), ...others.slice(0, 2)], round * 17 + letter.charCodeAt(0));
  }, [activity, letter, round]);

  useEffect(() => {
    void speak(prompt);
  }, [prompt]);

  const tap = (c: string) => {
    void speak(letterSay(c));
    if (right) return;
    if (c !== letter.toUpperCase()) {
      miss();
      setWrong(c);
      later(() => setWrong(null), 450);
      return;
    }
    sfx('good');
    setRight(true);
    later(() => {
      if (round + 1 === activity.letters.length) {
        cheer();
        later(onDone, 800);
      } else {
        setRound(round + 1);
        setRight(false);
      }
    }, 800);
  };

  return (
    <div className="act act-find act-capital">
      <div className="prompt">
        <span className="target-badge">{letter}</span>
        <SpeakButton text={prompt} label="Nghe câu hỏi" />
      </div>
      <div className="letter-field" role="group" aria-label={prompt}>
        {options.map((c) => (
          <button
            key={c}
            type="button"
            className={`letter-btn${right && c === letter.toUpperCase() ? ' found' : ''}${wrong === c ? ' shake' : ''}`}
            aria-label={`chữ hoa ${c}`}
            onClick={() => tap(c)}
          >
            {c}
          </button>
        ))}
      </div>
    </div>
  );
}
