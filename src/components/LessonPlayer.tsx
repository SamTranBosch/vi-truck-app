import { Glyph } from './Pic';
import { useState } from 'react';
import type { Lesson } from '../content/types';
import { stopSpeaking } from '../lib/audio';
import { Combine } from './activities/Combine';
import { FindLetter } from './activities/FindLetter';
import { Hunt } from './activities/Hunt';
import { Meet } from './activities/Meet';
import { Pick } from './activities/Pick';
import { Spell } from './activities/Spell';
import { Story } from './activities/Story';
import { Trace } from './activities/Trace';
import { Mascot } from './Mascot';

interface Props {
  lesson: Lesson;
  /** position of the lesson in the world; gives each lesson its own colour */
  index?: number;
  onFinish: () => void;
  onExit: () => void;
}

/** Plays a lesson's activities one after another. */
export function LessonPlayer({ lesson, index = 0, onFinish, onExit }: Props) {
  const [step, setStep] = useState(0);
  const activity = lesson.activities[step];

  const done = () => {
    if (step === lesson.activities.length - 1) onFinish();
    else setStep(step + 1);
  };

  const back = () => {
    stopSpeaking();
    setStep((s) => Math.max(0, s - 1));
  };

  const exit = () => {
    stopSpeaking();
    onExit();
  };

  // `key` makes every activity start fresh, even when two of the same type follow each other.
  const key = `${lesson.id}:${step}`;
  let body;
  switch (activity.type) {
    case 'meet':
      body = <Meet key={key} activity={activity} onDone={done} />;
      break;
    case 'spell':
      body = <Spell key={key} activity={activity} onDone={done} />;
      break;
    case 'hunt':
      body = <Hunt key={key} activity={activity} onDone={done} />;
      break;
    case 'findLetter':
      body = <FindLetter key={key} activity={activity} onDone={done} />;
      break;
    case 'trace':
      body = <Trace key={key} activity={activity} onDone={done} />;
      break;
    case 'pick':
      body = <Pick key={key} activity={activity} onDone={done} />;
      break;
    case 'story':
      body = <Story key={key} activity={activity} onDone={done} />;
      break;
    case 'combine':
      body = <Combine key={key} activity={activity} onDone={done} />;
      break;
  }

  return (
    <section className="lesson" aria-label={lesson.title} style={{ ['--lesson-hue' as string]: `${(index * 47) % 360}` }}>
      <header className="lesson-bar">
        <button type="button" className="btn btn-round btn-light" aria-label="Thoát bài học" onClick={exit}>
          ✕
        </button>
        <button type="button" className="btn btn-round btn-light" aria-label="Quay lại bước trước" disabled={step === 0} onClick={back}>
          ◀
        </button>
        <ol className="steps" aria-label={`Bước ${step + 1} trên ${lesson.activities.length}`}>
          {lesson.activities.map((_, i) => (
            <li key={i} className={i < step ? 'step done' : i === step ? 'step now' : 'step'} />
          ))}
        </ol>
        <span className="lesson-tag" lang="vi"><Glyph text={lesson.label} className="pic-tag" /></span>
      </header>
      <div className="lesson-body">{body}</div>
      <div className="lesson-mascot"><Mascot /></div>
    </section>
  );
}
