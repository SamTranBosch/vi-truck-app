import { Pic } from './components/Pic';
import { useCallback, useEffect, useRef, useState } from 'react';
import { PHRASES } from './content/phrases';
import { ALL_LESSONS, WORLDS, worldOpen } from './content/worlds';
import { Celebration } from './components/Celebration';
import { LessonPlayer } from './components/LessonPlayer';
import { Settings } from './components/Settings';
import { TruckScene } from './components/TruckScene';
import { Welcome } from './components/Welcome';
import { loadAudioManifest, setSoundEnabled, setSpeakingListener, sfx, speak, unlockAudio } from './lib/audio';
import { currentEnv, needsInstallHint } from './lib/install';
import { setMissListener } from './lib/misses';
import { duckMusic, setMusicEnabled, startMusic } from './lib/music';
import {
  doneCount,
  emptyProgress,
  loadProgress,
  markComplete,
  recordMiss,
  requestPersistence,
  resumeStep,
  setResume,
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
  const [worldPick, setWorldPick] = useState<number | null>(null);
  const holdTimer = useRef<number | null>(null);
  const unlocked = useRef(false);
  const latest = useRef<Progress | null>(null);
  const playingRef = useRef<string | null>(null);
  playingRef.current = playing;

  useEffect(() => {
    let alive = true;
    void loadProgress().then((p) => {
      if (!alive) return;
      setSoundEnabled(p.soundOn);
      setMusicEnabled(p.soundOn && p.musicOn);
      latest.current = p;
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
    latest.current = p;
    setSoundEnabled(p.soundOn);
    setMusicEnabled(p.soundOn && p.musicOn);
    setProgress(p);
    void saveProgress(p);
  }, []);

  /** Change progress from the newest state, also from callbacks that were created earlier. */
  const change = useCallback(
    (fn: (p: Progress) => Progress) => {
      const cur = latest.current;
      if (!cur) return;
      const next = fn(cur);
      if (next !== cur) update(next);
    },
    [update],
  );

  // wrong answers are counted per lesson for the parent view
  useEffect(() => {
    setMissListener(() => {
      const id = playingRef.current;
      if (id) change((p) => recordMiss(p, id));
    });
    return () => setMissListener(null);
  }, [change]);

  const firstTap = () => {
    if (unlocked.current) return;
    unlocked.current = true;
    unlockAudio();
    startMusic();
  };

  const finish = (lessonId: string) => {
    if (!progress) return;
    const already = lessonId in progress.completed;
    const next = setResume(already ? progress : markComplete(progress, lessonId), lessonId, 0);
    update(next);
    void requestPersistence();
    setPlaying(null);
    setCelebrate({ id: lessonId, first: !already });
    sfx('win');
    if (!already) {
      const all = world.lessons.every((l) => next.completed[l.id]);
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

  // the world on screen: the one picked, else the first that is not finished
  const firstOpen = WORLDS.findIndex((w) => !w.lessons.every((l) => progress.completed[l.id]));
  const worldIdx = Math.min(worldPick ?? (firstOpen < 0 ? WORLDS.length - 1 : firstOpen), WORLDS.length - 1);
  const world = WORLDS[worldIdx];
  const WORLD = world.lessons;
  const ids = WORLD.map((l) => l.id);
  const nextWorld = worldIdx < WORLDS.length - 1 ? WORLDS[worldIdx + 1] : undefined;

  const lesson = playing ? WORLD.find((l) => l.id === playing) : undefined;
  const done = doneCount(ids, progress);
  const allDone = done === ids.length;
  const nextOpen = !!nextWorld && worldOpen(WORLDS, worldIdx + 1, progress.completed);

  if (!progress.welcomed) {
    return (
      <div className="app" onPointerDownCapture={firstTap}>
        <Welcome
          onStart={() => {
            update({ ...progress, welcomed: true });
            void speak(PHRASES.welcome);
          }}
        />
      </div>
    );
  }

  return (
    <div className="app" onPointerDownCapture={firstTap}>
      {lesson ? (
        <LessonPlayer
          key={lesson.id}
          lesson={lesson}
          index={WORLD.indexOf(lesson)}
          startStep={resumeStep(progress, lesson.id)}
          onStep={(step) => change((p) => (p.completed[lesson.id] ? p : setResume(p, lesson.id, step)))}
          onFinish={() => finish(lesson.id)}
          onExit={() => setPlaying(null)}
        />
      ) : (
        <main className="map">
          <header className="map-bar">
            <h1 className="title">Xe Học Chữ</h1>
            <span className="count" aria-label={`Đã lau ${done} trên ${ids.length} mảnh bùn`}>
              <Pic emoji="🧽" className="pic-ui" /> {done}/{ids.length}
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
          {WORLDS.length > 1 && (
            <nav className="worlds" aria-label="Chọn xe">
              {WORLDS.map((w, i) => {
                const open = worldOpen(WORLDS, i, progress.completed);
                const clean = w.lessons.every((l) => progress.completed[l.id]);
                return (
                  <button
                    key={w.id}
                    type="button"
                    className={`world-chip${i === worldIdx ? ' on' : ''}${open ? '' : ' locked'}`}
                    aria-label={`${w.name}${open ? (clean ? ' — đã sạch' : '') : ' — chưa mở'}`}
                    aria-current={i === worldIdx ? 'true' : undefined}
                    onClick={() => {
                      if (!open) return showHint(PHRASES.notYet);
                      setJustWiped(null);
                      setWorldPick(i);
                    }}
                  >
                    <Pic emoji={open ? w.icon : '🔒'} className="pic-ui" />
                  </button>
                );
              })}
            </nav>
          )}
          <TruckScene
            lessons={WORLD}
            truck={world.truck}
            name={world.name}
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
                const next = WORLD.find((_, i) => tileState(ids, progress, i) === 'current');
                if (next) openLesson(next.id);
              }}
            >
              <span className="play-tri" aria-hidden="true">▶</span>
            </button>
          )}
          {allDone && nextWorld && nextOpen && (
            <button
              type="button"
              className="btn btn-go glow play-next"
              aria-label="Sang xe tiếp theo"
              onClick={() => {
                setJustWiped(null);
                setWorldPick(worldIdx + 1);
                void speak(PHRASES.nextTruck);
              }}
            >
              <Pic emoji={nextWorld.icon} className="pic-ui" /> <span className="play-tri" aria-hidden="true">▶</span>
            </button>
          )}
        </main>
      )}
      {celebrate && (() => {
        const idx = WORLD.findIndex((l) => l.id === celebrate.id);
        if (idx < 0) return null;
        return (
          <Celebration
            title={WORLD[idx].title}
            label={WORLD[idx].label}
            hasPrev={idx > 0}
            hasNext={idx < WORLD.length - 1}
            onPrev={() => openLesson(WORLD[idx - 1].id)}
            onNext={() => openLesson(WORLD[idx + 1].id)}
            onMap={closeCelebration}
          />
        );
      })()}
      {parentOpen && (
        <Settings
          progress={progress}
          lessons={ALL_LESSONS}
          installHint={needsInstallHint(currentEnv())}
          onChange={update}
          onReset={() => {
            update({ ...emptyProgress(), welcomed: true, soundOn: progress.soundOn, musicOn: progress.musicOn });
            setJustWiped(null);
            setWorldPick(null);
          }}
          onClose={() => setParentOpen(false)}
        />
      )}
    </div>
  );
}
