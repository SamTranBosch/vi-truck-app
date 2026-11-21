import { SvgPic, emojiParts, picUrl } from './Pic';
import type { Lesson, TruckKind } from '../content/types';
import { CELL_H, CELL_W, COLS, ROWS, SCENE_H, SCENE_W, UNLOCK_CELLS, cellRect, mudPath } from '../lib/mud';
import { tileState, type Progress } from '../lib/progress';
import { SceneDefs } from './TruckArt';
import { TruckArtFor } from './TruckArts';

interface Props {
  lessons: Lesson[];
  /** which truck is under the mud */
  truck?: TruckKind;
  /** Vietnamese name of the truck, for screen readers */
  name?: string;
  progress: Progress;
  /** Lesson that was just finished: its mud is drawn once more and wiped away with an animation. */
  justWiped?: string | null;
  onOpen: (lessonId: string) => void;
  onLocked: () => void;
}

/**
 * Optional pictures dropped into src/assets/hero (see README there): truck.webp is the fire truck,
 * truck-<kind>.webp (e.g. truck-cement.webp) the others. Falls back to the built-in drawing.
 */
const HERO_FILES = import.meta.glob('../assets/hero/truck*.{png,jpg,jpeg,webp}', { eager: true, query: '?url', import: 'default' }) as Record<string, string>;
const HERO = new Map<string, string>();
for (const [path, url] of Object.entries(HERO_FILES)) {
  const base = path.slice(path.lastIndexOf('/') + 1).replace(/\.[a-z]+$/, '');
  HERO.set(base === 'truck' ? 'fire' : base.replace(/^truck-/, ''), url);
}

const MUD = '#8B6B4A';
const MUD_DARK = '#6B4F34';
const MUD_LIGHT = '#A98763';

export function TruckScene({ lessons, truck = 'fire', name = 'Xe cứu hỏa', progress, justWiped, onOpen, onLocked }: Props) {
  const hero = HERO.get(truck);
  const ids = lessons.map((l) => l.id);
  const cells = Array.from({ length: COLS * ROWS }, (_, cell) => {
    const index = UNLOCK_CELLS.indexOf(cell);
    return { cell, index, lesson: lessons[index] };
  });

  return (
    <div className="scene" role="group" aria-label={`${name} dưới lớp bùn`}>
      <svg className="scene-svg" viewBox={`0 0 ${SCENE_W} ${SCENE_H}`} preserveAspectRatio="none" aria-hidden="true" focusable="false">
        <SceneDefs />
        {hero ? <image href={hero} x={0} y={0} width={SCENE_W} height={SCENE_H} preserveAspectRatio="xMidYMid slice" /> : <TruckArtFor kind={truck} />}
        {cells.map(({ cell, index, lesson }) => {
          if (!lesson) return null;
          const state = tileState(ids, progress, index);
          const wiping = state === 'done' && justWiped === lesson.id;
          if (state === 'done' && !wiping) return null;
          const r = cellRect(cell);
          return (
            <g key={lesson.id} className={`mud mud-${state}${wiping ? ' wiping' : ''}`} data-cell={cell}>
              <path d={mudPath(index + 1, cell)} fill={MUD} stroke={MUD_DARK} strokeWidth={3} strokeLinejoin="round" />
              <path d={mudPath(index + 40, cell, -14, 9)} fill={MUD_LIGHT} opacity={0.5} />
              <circle cx={r.x + 20} cy={r.y + 26} r={5} fill={MUD_DARK} opacity={0.5} />
              <circle cx={r.x + CELL_W - 22} cy={r.y + CELL_H - 30} r={7} fill={MUD_DARK} opacity={0.45} />
              <circle cx={r.x + CELL_W - 28} cy={r.y + 30} r={3.5} fill={MUD_LIGHT} />
              {state === 'current' && (
                <SvgPic emoji="⭐" x={r.cx} y={r.cy - 42} size={34} className="mud-star" />
              )}
              {state === 'locked' && (
                <SvgPic emoji="🔒" x={r.cx} y={r.cy - 24} size={20} className="mud-lock" opacity={0.6} />
              )}
              {emojiParts(lesson.label).every((p) => picUrl(p)) ? (
                <SvgPic emoji={lesson.label} x={r.cx} y={r.cy + (state === 'current' ? -2 : 0)} size={38} />
              ) : (
                <text x={r.cx} y={r.cy + (state === 'current' ? 26 : 28)} textAnchor="middle" className="mud-label" fontSize={lesson.label.length > 3 ? 15 : 20}>
                  {lesson.label}
                </text>
              )}
            </g>
          );
        })}
      </svg>
      {/* Real buttons on top of the picture: big touch targets that screen readers and tests can find. */}
      <div className="scene-hit">
        {cells.map(({ cell, index, lesson }) => {
          if (!lesson) return <span key={cell} />;
          const state = tileState(ids, progress, index);
          const name = lesson.title;
          const text = state === 'done' ? `${name} — đã xong, chơi lại` : state === 'current' ? `${name} — bắt đầu` : `${name} — chưa mở`;
          return (
            <button
              key={lesson.id}
              type="button"
              className={`hit hit-${state}`}
              aria-label={text}
              data-lesson={lesson.id}
              onClick={() => (state === 'locked' ? onLocked() : onOpen(lesson.id))}
            />
          );
        })}
      </div>
    </div>
  );
}
