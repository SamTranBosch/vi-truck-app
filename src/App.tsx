import { Pic } from './components/Pic';
import { useCallback, useEffect, useRef, useState } from 'react';
import { PHRASES } from './content/phrases';
import { WORLD1, WORLD1_IDS } from './content/world1';
import { Celebration } from './components/Celebration';
import { LessonPlayer } from './components/LessonPlayer';
import { Settings } from './components/Settings';
import { TruckScene } from './components/TruckScene';
import { loadAudioManifest, setSoundEnabled, setSpeakingListener, sfx, speak, unlockAudio } from './lib/audio';
import { duckMusic, setMusicEnabled, startMusic } from './lib/music';
import {
  doneCount,
  emptyProgress,
  loadProgress,
  markComplete,
  requestPersistence,
  tileState,
  saveProgress,
  type Progress,
} from './lib/progress';

const HOLD_MS = 1500;

export function App() {
  const [progress, setProgress] = useState<Progress | null>(null);
  const [playing, setPlaying] = useState<string | null>(null);
  const [justWiped, setJustWiped] = useState<string | null>(null);
  const [celebrate, setCelebrate] = useState<{ id: string; first: boolean } | null>(null);
  const [parentOpen, setParentOpen] = useState(false);
  const [hint, setHint] = useState('');
  const holdTimer = useRef<number | null>(null);
  const unlocked = useRef(false);

  useEffect(() => {
    let alive = true;
    void loadProgress().then((p) => {
      if (!alive) return;
      setSoundEnabled(p.soundOn);
      setMusicEnabled(p.soundOn && p.musicOn);
      setProgress(p);
    });
    void loadAudioManifest();
    setSpeakingListener(duckMusic);
    return () => {
      alive = false;
      setSpeakingListener(null);
    };
  }, []);

  const update = useCallback((p: Progress) => {
    setSoundEnabled(p.soundOn);
    setMusicEnabled(p.soundOn && p.musicOn);
    setProgress(p);
    void saveProgress(p);
  }, []);

  const firstTap = () => {
    if (unlocked.current) return;
    unlocked.current = true;
    unlockAudio();
    startMusic();
  };

  const finish = (lessonId: string) => {
    if (!progress) return;
    const already = lessonId in progress.completed;
    const next = already ? progress : markComplete(progress, lessonId);
    update(next);
    void requestPersistence();
    setPlaying(null);
    setCelebrate({ id: lessonId, first: !already });
    sfx('win');
    if (!already) {
      const all = doneCount(WORLD1_IDS, next) === WORLD1_IDS.length;
      void speak(all ? PHRASES.worldDone : PHRASES.lessonDone);
    }
  };

  const openLesson = (id: string) => {
    setJustWiped(null);
    setCelebrate(null);
    setPlaying(id);
  };

  const closeCelebration = () => {
    // the mud wipe is played on the map, after the celebration
    if (celebrate?.first) setJustWiped(celebrate.id);
    setCelebrate(null);
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
        <LessonPlayer lesson={lesson} index={WORLD1.indexOf(lesson)} onFinish={() => finish(lesson.id)} onExit={() => setPlaying(null)} />
      ) : (
        <main className="map">
          <header className="map-bar">
            <h1 className="title">Xe Học Chữ</h1>
            <span className="count" aria-label={`Đã lau ${done} trên ${WORLD1_IDS.length} mảnh bùn`}>
              <Pic emoji="🧽" className="pic-ui" /> {done}/{WORLD1_IDS.length}
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
              <Pic emoji="⚙️" className="pic-ui" />
            </button>
          </header>
          <TruckScene
            lessons={WORLD1}
            progress={progress}
            justWiped={justWiped}
            onOpen={openLesson}
            onLocked={() => showHint(PHRASES.notYet)}
          />
          <p className="banner" role="status" aria-live="polite">
            {hint || (allDone ? PHRASES.worldDone : 'Chạm vào ngôi sao để lau bùn!')}
          </p>
          {!allDone && (
            <button
              type="button"
              className="btn btn-go glow play-next"
              aria-label="Học bài tiếp theo"
              onClick={() => {
                const next = WORLD1.find((_, i) => tileState(WORLD1_IDS, progress, i) === 'current');
                if (next) openLesson(next.id);
              }}
            >
              <span className="play-tri" aria-hidden="true">▶</span>
            </button>
          )}
        </main>
      )}
      {celebrate && (() => {
        const idx = WORLD1.findIndex((l) => l.id === celebrate.id);
        return (
          <Celebration
            title={WORLD1[idx].title}
            label={WORLD1[idx].label}
            hasPrev={idx > 0}
            hasNext={idx < WORLD1.length - 1}
            onPrev={() => openLesson(WORLD1[idx - 1].id)}
            onNext={() => openLesson(WORLD1[idx + 1].id)}
            onMap={closeCelebration}
          />
        );
      })()}
      {parentOpen && (
        <Settings
          progress={progress}
          onChange={update}
          onReset={() => {
            update({ ...emptyProgress(), soundOn: progress.soundOn, musicOn: progress.musicOn });
            setJustWiped(null);
          }}
          onClose={() => setParentOpen(false)}
        />
      )}
    </div>
  );
}
