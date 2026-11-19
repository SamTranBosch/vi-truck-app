import { useCallback, useEffect, useRef, useState } from 'react';
import { PHRASES } from './content/phrases';
import { WORLD1, WORLD1_IDS } from './content/world1';
import { LessonPlayer } from './components/LessonPlayer';
import { Settings } from './components/Settings';
import { TruckScene } from './components/TruckScene';
import { loadAudioManifest, setSoundEnabled, sfx, speak, unlockAudio } from './lib/audio';
import {
  doneCount,
  emptyProgress,
  loadProgress,
  markComplete,
  requestPersistence,
  saveProgress,
  type Progress,
} from './lib/progress';

const HOLD_MS = 1500;

export function App() {
  const [progress, setProgress] = useState<Progress | null>(null);
  const [playing, setPlaying] = useState<string | null>(null);
  const [justWiped, setJustWiped] = useState<string | null>(null);
  const [parentOpen, setParentOpen] = useState(false);
  const [hint, setHint] = useState('');
  const holdTimer = useRef<number | null>(null);
  const unlocked = useRef(false);

  useEffect(() => {
    let alive = true;
    void loadProgress().then((p) => {
      if (!alive) return;
      setSoundEnabled(p.soundOn);
      setProgress(p);
    });
    void loadAudioManifest();
    return () => {
      alive = false;
    };
  }, []);

  const update = useCallback((p: Progress) => {
    setSoundEnabled(p.soundOn);
    setProgress(p);
    void saveProgress(p);
  }, []);

  const firstTap = () => {
    if (unlocked.current) return;
    unlocked.current = true;
    unlockAudio();
  };

  const finish = (lessonId: string) => {
    if (!progress) return;
    const already = lessonId in progress.completed;
    const next = already ? progress : markComplete(progress, lessonId);
    update(next);
    void requestPersistence();
    setPlaying(null);
    if (!already) {
      setJustWiped(lessonId);
      sfx('win');
      const all = doneCount(WORLD1_IDS, next) === WORLD1_IDS.length;
      void speak(all ? PHRASES.worldDone : PHRASES.lessonDone);
    }
  };

  const showHint = (text: string) => {
    setHint(text);
    sfx('bad');
    void speak(text);
    window.setTimeout(() => setHint(''), 2200);
  };

  const startHold = () => {
    holdTimer.current = window.setTimeout(() => setParentOpen(true), HOLD_MS);
  };
  const endHold = () => {
    if (holdTimer.current) window.clearTimeout(holdTimer.current);
    holdTimer.current = null;
  };

  if (!progress) return <div className="boot" role="status">Đang tải…</div>;

  const lesson = playing ? WORLD1.find((l) => l.id === playing) : undefined;
  const done = doneCount(WORLD1_IDS, progress);
  const allDone = done === WORLD1_IDS.length;

  return (
    <div className="app" onPointerDownCapture={firstTap}>
      {lesson ? (
        <LessonPlayer lesson={lesson} onFinish={() => finish(lesson.id)} onExit={() => setPlaying(null)} />
      ) : (
        <main className="map">
          <header className="map-bar">
            <h1 className="title">Xe Học Chữ</h1>
            <span className="count" aria-label={`Đã lau ${done} trên ${WORLD1_IDS.length} mảnh bùn`}>
              🧽 {done}/{WORLD1_IDS.length}
            </span>
            <button
              type="button"
              className="btn btn-round btn-light gear"
              aria-label="Dành cho phụ huynh: giữ 2 giây để mở"
              onPointerDown={startHold}
              onPointerUp={endHold}
              onPointerLeave={endHold}
              onPointerCancel={endHold}
              onContextMenu={(e) => e.preventDefault()}
            >
              ⚙️
            </button>
          </header>
          <TruckScene
            lessons={WORLD1}
            progress={progress}
            justWiped={justWiped}
            onOpen={(id) => {
              setJustWiped(null);
              setPlaying(id);
            }}
            onLocked={() => showHint(PHRASES.notYet)}
          />
          <p className="banner" role="status" aria-live="polite">
            {hint || (allDone ? PHRASES.worldDone : 'Chạm vào ngôi sao để lau bùn!')}
          </p>
        </main>
      )}
      {parentOpen && (
        <Settings
          progress={progress}
          onChange={update}
          onReset={() => {
            update({ ...emptyProgress(), soundOn: progress.soundOn });
            setJustWiped(null);
          }}
          onClose={() => setParentOpen(false)}
        />
      )}
    </div>
  );
}
