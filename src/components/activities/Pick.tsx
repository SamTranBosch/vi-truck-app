import { useEffect, useMemo, useState } from 'react';
import { Pic } from '../Pic';
import { PICS, pic } from '../../content/pictures';
import { PHRASES } from '../../content/phrases';
import { sfx, speak } from '../../lib/audio';
import { shuffle } from '../../lib/rng';
import { Dots, SpeakButton, WordText, cheer, useIdleHint, useLater } from '../shared';
import type { ActivityProps } from './types';

/**
 * mode "read": the word is written, the child reads it and picks the picture (real reading).
 * mode "hear": the word is spoken, the child picks the picture (listening).
 */
export function Pick({ activity, onDone }: ActivityProps<'pick'>) {
  const [round, setRound] = useState(0);
  const [wrong, setWrong] = useState<string | null>(null);
  const [right, setRight] = useState<string | null>(null);
  const later = useLater();
  const target = activity.words[round];

  const choices = useMemo(() => {
    const others = shuffle(activity.words.filter((w) => w !== target), round + 3);
    const extra = shuffle(Object.keys(PICS).filter((w) => w !== target && !others.includes(w)), round + 11);
    return shuffle([target, ...[...others, ...extra].slice(0, 2)], round * 7 + target.length);
  }, [activity.words, target, round]);

  const hint = useIdleHint(`${round}:${wrong}:${right}`, right ? [] : [target]);

  useEffect(() => {
    if (activity.mode === 'hear') void speak(target);
    else void speak(PHRASES.readWord);
  }, [activity.mode, target]);

  const tap = (word: string) => {
    if (right) return;
    if (word !== target) {
      sfx('bad');
      setWrong(word);
      later(() => setWrong(null), 450);
      return;
    }
    sfx('good');
    setRight(word);
    void speak(target);
    later(() => {
      setRight(null);
      if (round === activity.words.length - 1) {
        cheer();
        later(onDone, 700);
      } else setRound(round + 1);
    }, 1100);
  };

  return (
    <div className="act act-pick">
      <div className="prompt">
        {activity.mode === 'read' ? <WordText word={target} className="word-xl" /> : <Pic emoji="👂" className="pic-lg" />}
        <SpeakButton text={target} />
      </div>
      <div className="row-3" role="group" aria-label={activity.mode === 'read' ? `Đọc chữ ${target}` : 'Chọn hình đúng'}>
        {choices.map((w) => (
          <button
            key={w}
            type="button"
            className={`card card-pick${right === w ? ' found' : ''}${wrong === w ? ' shake' : ''}${hint === w ? ' hint' : ''}`}
            aria-label={`hình ${w}`}
            onClick={() => tap(w)}
          >
            <Pic emoji={pic(w) ?? '🔤'} className="pic-lg" />
          </button>
        ))}
      </div>
      <Dots count={activity.words.length} index={round} />
    </div>
  );
}
