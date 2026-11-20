import { useMemo, useState } from 'react';
import { Pic } from '../Pic';
import { pic } from '../../content/pictures';
import { sfx, speak, speakSeq } from '../../lib/audio';
import { TONE_MARK, parseSyllable, spellTokens } from '../../lib/vietnamese';
import { Dots, SpeakButton, ToneBadge, cheer, useLater } from '../shared';
import type { ActivityProps } from './types';

/** Đánh vần: tap the tiles in order, "cờ – a – ca – huyền – cà". */
export function Spell({ activity, onDone }: ActivityProps<'spell'>) {
  const [w, setW] = useState(0);
  const [next, setNext] = useState(0);
  const [shake, setShake] = useState<number | null>(null);
  const later = useLater();
  const word = activity.words[w];
  const tokens = useMemo(() => spellTokens(word), [word]);
  const tone = parseSyllable(word).tone;

  const tap = (i: number) => {
    if (i < next) {
      void speak(tokens[i].say);
      return;
    }
    if (i !== next) {
      sfx('bad');
      setShake(i);
      later(() => setShake(null), 400);
      return;
    }
    void speak(tokens[i].say);
    const n = next + 1;
    setNext(n);
    if (n === tokens.length) {
      later(() => {
        cheer();
        if (w === activity.words.length - 1) later(onDone, 700);
        else {
          setW(w + 1);
          setNext(0);
        }
      }, 900);
    }
  };

  return (
    <div className="act act-spell">
      <div className="card card-md" aria-hidden="true">
        <Pic emoji={pic(word) ?? '🔤'} className="pic-lg" />
      </div>
      <div className="tiles" role="group" aria-label={`Đánh vần ${word}`}>
        {tokens.map((t, i) => (
          <button
            key={`${word}-${i}`}
            type="button"
            className={`tile-btn kind-${t.kind}${i < next ? ' done' : ''}${i === next ? ' next' : ''}${shake === i ? ' shake' : ''}`}
            aria-label={t.say}
            onClick={() => tap(i)}
          >
            {t.kind === 'tone' ? <ToneBadge mark={TONE_MARK[tone]} /> : t.show}
          </button>
        ))}
      </div>
      <Dots count={activity.words.length} index={w} />
      <div className="act-actions">
        <SpeakButton text={word} />
        <button
          type="button"
          className="btn btn-round btn-sky"
          aria-label="Nghe cả vần"
          onClick={() => void speakSeq(tokens.map((t) => t.say))}
        >
          ▶︎▶︎
        </button>
      </div>
    </div>
  );
}
