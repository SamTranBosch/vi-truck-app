import { useEffect, useMemo, useState } from 'react';
import { pic } from '../../content/pictures';
import { soundPrompt, tonePrompt } from '../../content/speech';
import { sfx, speak } from '../../lib/audio';
import { TONE_MARK, hasSound, hasTone, targetLabel } from '../../lib/vietnamese';
import { SpeakButton, ToneBadge, WordText, cheer, useLater } from '../shared';
import type { ActivityProps } from './types';

/** "Tiếng nào có âm …?" / "…có thanh …?": tap every picture whose word has the sound or tone. */
export function Hunt({ activity, onDone }: ActivityProps<'hunt'>) {
  const right = useMemo(
    () =>
      new Set(
        activity.words.filter((w) => (activity.kind === 'sound' ? hasSound(w, activity.target) : hasTone(w, activity.tone))),
      ),
    [activity],
  );
  const [found, setFound] = useState<Set<string>>(new Set());
  const [wrong, setWrong] = useState<string | null>(null);
  const later = useLater();
  const prompt = activity.kind === 'sound' ? soundPrompt(activity.target) : tonePrompt(activity.tone);

  useEffect(() => {
    void speak(prompt);
  }, [prompt]);

  const tap = (word: string) => {
    if (found.has(word)) {
      void speak(word);
      return;
    }
    if (!right.has(word)) {
      sfx('bad');
      setWrong(word);
      later(() => setWrong(null), 450);
      return;
    }
    sfx('good');
    void speak(word);
    const nf = new Set(found).add(word);
    setFound(nf);
    if (nf.size === right.size) {
      later(() => {
        cheer();
        later(onDone, 800);
      }, 900);
    }
  };

  return (
    <div className="act act-hunt">
      <div className="prompt">
        <span className="target-badge" aria-label={prompt}>
          {activity.kind === 'sound' ? targetLabel(activity.target) : <ToneBadge mark={TONE_MARK[activity.tone]} />}
        </span>
        <SpeakButton text={prompt} label="Nghe câu hỏi" />
      </div>
      <div className="grid-2" role="group" aria-label={prompt}>
        {activity.words.map((w) => (
          <button
            key={w}
            type="button"
            className={`card card-pick${found.has(w) ? ' found' : ''}${wrong === w ? ' shake' : ''}`}
            aria-label={w}
            aria-pressed={found.has(w)}
            onClick={() => tap(w)}
          >
            <span className="emoji-lg" aria-hidden="true">{pic(w)}</span>
            <WordText word={w} className="word-md" />
            {found.has(w) && <span className="check" aria-hidden="true">✓</span>}
          </button>
        ))}
      </div>
    </div>
  );
}
