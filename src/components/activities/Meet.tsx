import { useEffect, useState } from 'react';
import { pic } from '../../content/pictures';
import { speak } from '../../lib/audio';
import { Dots, NextButton, SpeakButton, WordText } from '../shared';
import type { ActivityProps } from './types';

/** Làm quen: look at the picture, tap to hear the word. */
export function Meet({ activity, onDone }: ActivityProps<'meet'>) {
  const [i, setI] = useState(0);
  const word = activity.words[i];
  const last = i === activity.words.length - 1;

  useEffect(() => {
    void speak(word);
  }, [word]);

  return (
    <div className="act act-meet">
      <button type="button" className="card card-xl" aria-label={`Nghe: ${word}`} onClick={() => void speak(word)}>
        <span className="emoji-xl" aria-hidden="true">{pic(word)}</span>
        <WordText word={word} marks={activity.marks} className="word-xl" />
      </button>
      <Dots count={activity.words.length} index={i} />
      <div className="act-actions">
        <SpeakButton text={word} />
        <NextButton onClick={() => (last ? onDone() : setI(i + 1))} />
      </div>
    </div>
  );
}
