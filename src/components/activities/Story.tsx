import { useEffect, useMemo, useState } from 'react';
import { Pic } from '../Pic';
import { PHRASES } from '../../content/phrases';
import { sfx, speak } from '../../lib/audio';
import { wrong as miss } from '../../lib/misses';
import { shuffleDifferent } from '../../lib/rng';
import { Dots, NextButton, PrevButton, SpeakButton, cheer, useLater } from '../shared';
import type { ActivityProps } from './types';

/** Kể chuyện: listen to the story, then tap the pictures in story order. */
export function Story({ activity, onDone }: ActivityProps<'story'>) {
  const { scenes, id } = activity.story;
  const [phase, setPhase] = useState<'listen' | 'order'>('listen');
  const [i, setI] = useState(0);
  const [picked, setPicked] = useState<number[]>([]);
  const [wrong, setWrong] = useState<number | null>(null);
  const later = useLater();
  const order = useMemo(
    () => shuffleDifferent(scenes.map((_, k) => k), id.length * 17),
    [scenes, id],
  );

  useEffect(() => {
    if (phase === 'listen') void speak(scenes[i].text);
    else void speak(PHRASES.storyOrder);
  }, [phase, i, scenes]);

  if (phase === 'listen') {
    const scene = scenes[i];
    const last = i === scenes.length - 1;
    return (
      <div className="act act-story">
        <button type="button" className="card card-xl" aria-label={`Nghe: ${scene.text}`} onClick={() => void speak(scene.text)}>
          <Pic emoji={scene.emoji} className="pic-xl" />
          <span className="story-text" lang="vi">{scene.text}</span>
        </button>
        <Dots count={scenes.length} index={i} />
        <div className="act-actions">
          {i > 0 && <PrevButton onClick={() => setI(i - 1)} />}
          <SpeakButton text={scene.text} />
          <NextButton onClick={() => (last ? setPhase('order') : setI(i + 1))} />
        </div>
      </div>
    );
  }

  const tap = (sceneIndex: number) => {
    if (picked.includes(sceneIndex)) {
      void speak(scenes[sceneIndex].text);
      return;
    }
    if (sceneIndex !== picked.length) {
      miss();
      setWrong(sceneIndex);
      later(() => setWrong(null), 450);
      return;
    }
    sfx('good');
    void speak(scenes[sceneIndex].text);
    const np = [...picked, sceneIndex];
    setPicked(np);
    if (np.length === scenes.length) {
      later(() => {
        cheer();
        later(onDone, 800);
      }, 1200);
    }
  };

  return (
    <div className="act act-story-order">
      <div className="prompt">
        <span className="num-chips" aria-hidden="true">{scenes.map((_, n) => <i key={n}>{n + 1}</i>)}</span>
        <SpeakButton text={PHRASES.storyOrder} label="Nghe câu hỏi" />
      </div>
      <div className="grid-2" role="group" aria-label="Sắp xếp câu chuyện">
        {order.map((k) => {
          const place = picked.indexOf(k);
          return (
            <button
              key={k}
              type="button"
              className={`card card-pick${place >= 0 ? ' found' : ''}${wrong === k ? ' shake' : ''}`}
              aria-label={`hình ${k + 1}`}
              onClick={() => tap(k)}
            >
              <Pic emoji={scenes[k].emoji} className="pic-lg" />
              {place >= 0 && <span className="order-num" aria-label={`thứ ${place + 1}`}>{place + 1}</span>}
            </button>
          );
        })}
      </div>
    </div>
  );
}
