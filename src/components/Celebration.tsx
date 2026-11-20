import { useEffect, useMemo } from 'react';
import { mulberry32 } from '../lib/rng';
import { Mascot } from './Mascot';
import { Pic } from './Pic';

interface Props {
  title: string;
  label: string;
  hasPrev: boolean;
  hasNext: boolean;
  onPrev: () => void;
  onNext: () => void;
  onMap: () => void;
}

const PIECES = ['⭐', '🎉', '✨', '🌟', '🎈', '💛'];

/** After each lesson: confetti, a happy truck, three stars, and where to go next. */
export function Celebration({ title, label, hasPrev, hasNext, onPrev, onNext, onMap }: Props) {
  const confetti = useMemo(() => {
    const r = mulberry32(label.length * 97 + title.length);
    return Array.from({ length: 22 }, (_, i) => ({
      ch: PIECES[i % PIECES.length],
      left: Math.round(r() * 96),
      delay: +(r() * 1.6).toFixed(2),
      dur: +(2.6 + r() * 2).toFixed(2),
      size: Math.round(22 + r() * 20),
    }));
  }, [label, title]);

  useEffect(() => {
    // nothing to clean up; confetti is pure CSS and stops with the overlay
  }, []);

  return (
    <div className="celebrate" role="dialog" aria-modal="true" aria-label={`Hoàn thành ${title}`}>
      <div className="confetti" aria-hidden="true">
        {confetti.map((c, i) => (
          <span key={i} style={{ left: `${c.left}%`, animationDelay: `${c.delay}s`, animationDuration: `${c.dur}s`, fontSize: c.size }}>
            <Pic emoji={c.ch} />
          </span>
        ))}
      </div>
      <div className="celebrate-card">
        <div className="celebrate-mascot"><Mascot big forceMood="win" /></div>
        <h2 className="celebrate-title">Giỏi quá!</h2>
        <div className="stars" aria-label="3 sao">
          <span style={{ animationDelay: '0.2s' }}><Pic emoji="⭐" /></span>
          <span style={{ animationDelay: '0.5s' }}><Pic emoji="⭐" /></span>
          <span style={{ animationDelay: '0.8s' }}><Pic emoji="⭐" /></span>
        </div>
        <p className="celebrate-sub" lang="vi">{title}</p>
        <div className="celebrate-actions">
          <button type="button" className="btn btn-round btn-light" aria-label="Bài trước" disabled={!hasPrev} onClick={onPrev}>◀</button>
          <button type="button" className="btn btn-round btn-sky" aria-label="Về bản đồ" onClick={onMap}><Pic emoji="🗺️" className="pic-ui" /></button>
          <button type="button" className="btn btn-round btn-go glow" aria-label="Bài tiếp" disabled={!hasNext} onClick={onNext}>▶</button>
        </div>
      </div>
    </div>
  );
}
