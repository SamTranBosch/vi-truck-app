import { useEffect, useState } from 'react';
import { pic } from '../../content/pictures';
import { PHRASES } from '../../content/phrases';
import { readSay, readWords } from '../../content/speech';
import { sfx, speak } from '../../lib/audio';
import { Pic } from '../Pic';
import { Dots, NextButton, PrevButton, SpeakButton, WordText } from '../shared';
import type { ActivityProps } from './types';

/** Tập đọc: the child reads each line; tapping a word says it, the speaker reads the whole line. */
export function Read({ activity, onDone }: ActivityProps<'read'>) {
  const [i, setI] = useState(0);
  const [said, setSaid] = useState<Set<number>>(new Set());
  const line = activity.lines[i];
  const words = readWords(line);
  const last = i === activity.lines.length - 1;
  const picture = pic(readSay(line).toLowerCase());
  const ready = said.size >= words.length;

  useEffect(() => {
    if (i === 0) void speak(PHRASES.readAloud);
  }, [i]);

  const go = (to: number) => {
    setSaid(new Set());
    setI(to);
  };

  const tapWord = (w: string, k: number) => {
    sfx('tap');
    void speak(w);
    setSaid((s) => new Set(s).add(k));
  };

  return (
    <div className="act act-read">
      <div className="card card-read" lang="vi">
        {picture && <Pic emoji={picture} className="pic-lg" />}
        <div className="read-words">
          {words.map((w, k) => (
            <button
              key={`${i}-${k}`}
              type="button"
              className={`read-word${said.has(k) ? ' said' : ''}`}
              aria-label={w}
              onClick={() => tapWord(w, k)}
            >
              <WordText word={w} className="word-read" />
            </button>
          ))}
        </div>
      </div>
      <Dots count={activity.lines.length} index={i} />
      <div className="act-actions">
        {i > 0 && <PrevButton onClick={() => go(i - 1)} />}
        <SpeakButton text={readSay(line)} label="Nghe cả câu" />
        <NextButton glow={ready} onClick={() => (last ? onDone() : go(i + 1))} />
      </div>
    </div>
  );
}
