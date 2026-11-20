import { Pic } from './Pic';
import { useEffect, useRef, useState } from 'react';

/** Optional Canva picture of the mascot (src/assets/hero/mascot.png|jpg|webp); the drawn SVG is used when absent. */
const MASCOT_IMG = Object.values(import.meta.glob('../assets/hero/mascot.{png,jpg,jpeg,webp}', { eager: true, query: '?url', import: 'default' }) as Record<string, string>)[0];

type Mood = 'idle' | 'good' | 'oops' | 'win';

/**
 * "Bé Xe", the little fire truck friend. Reacts to the sound events (right / wrong / lesson won):
 * jumps and sparkles when the child is right, tilts its head when wrong.
 */
export function Mascot({ big = false, forceMood }: { big?: boolean; forceMood?: Mood }) {
  const [mood, setMood] = useState<Mood>('idle');
  const timer = useRef<number | null>(null);

  useEffect(() => {
    const onMood = (e: Event) => {
      const kind = (e as CustomEvent<string>).detail;
      if (kind === 'good' || kind === 'bad' || kind === 'win') {
        setMood(kind === 'bad' ? 'oops' : kind);
        if (timer.current) window.clearTimeout(timer.current);
        timer.current = window.setTimeout(() => setMood('idle'), kind === 'win' ? 2500 : 900);
      }
    };
    window.addEventListener('mascot', onMood);
    return () => {
      window.removeEventListener('mascot', onMood);
      if (timer.current) window.clearTimeout(timer.current);
    };
  }, []);

  const m = forceMood ?? mood;
  const happy = m === 'good' || m === 'win';
  return (
    <div className={`mascot mood-${m}${big ? ' big' : ''}`} aria-hidden="true" data-mood={m}>
      {MASCOT_IMG ? (
        <img className="mascot-img" src={MASCOT_IMG} alt="" draggable={false} />
      ) : (
      <svg viewBox="0 0 120 120" width="100%" height="100%">
        {/* flashing siren */}
        <g stroke="#1F2B47" strokeWidth="3" strokeLinejoin="round">
          <path d="M34 34 a10 10 0 0 1 20 0 z" fill="#FF4D3D" className="siren siren-a" />
          <path d="M66 34 a10 10 0 0 1 20 0 z" fill="#3B82F6" className="siren siren-b" />
          <rect x="30" y="34" width="60" height="7" rx="3" fill="#E5E9F0" />
        </g>
        {/* body */}
        <g stroke="#1F2B47" strokeWidth="4" strokeLinejoin="round">
          <rect x="16" y="40" width="88" height="62" rx="16" fill="#E8412F" />
          <rect x="26" y="48" width="68" height="34" rx="12" fill="#CFEFFB" />
          <rect x="30" y="88" width="60" height="10" rx="5" fill="#fff" />
          <circle cx="34" cy="104" r="11" fill="#1F2B47" />
          <circle cx="86" cy="104" r="11" fill="#1F2B47" />
        </g>
        {/* eyes */}
        <g>
          <circle cx="46" cy="63" r="10" fill="#fff" stroke="#1F2B47" strokeWidth="3" />
          <circle cx="74" cy="63" r="10" fill="#fff" stroke="#1F2B47" strokeWidth="3" />
          <circle className="pupil" cx={happy ? 46 : 47} cy={happy ? 62 : 65} r="5" fill="#1F2B47" />
          <circle className="pupil" cx={happy ? 74 : 75} cy={happy ? 62 : 65} r="5" fill="#1F2B47" />
          <circle cx="44" cy="60" r="1.8" fill="#fff" />
          <circle cx="72" cy="60" r="1.8" fill="#fff" />
        </g>
        {/* cheeks + mouth */}
        <circle cx="28" cy="78" r="5" fill="#FF8FA3" opacity=".8" />
        <circle cx="92" cy="78" r="5" fill="#FF8FA3" opacity=".8" />
        {happy ? (
          <path d="M48 76 Q60 94 72 76 Z" fill="#8B1E1E" stroke="#1F2B47" strokeWidth="3" strokeLinejoin="round" />
        ) : m === 'oops' ? (
          <ellipse cx="60" cy="82" rx="5" ry="4" fill="#8B1E1E" stroke="#1F2B47" strokeWidth="2.5" />
        ) : (
          <path d="M50 78 Q60 87 70 78" fill="none" stroke="#1F2B47" strokeWidth="3.5" strokeLinecap="round" />
        )}
      </svg>
      )}
      {happy && (
        <>
          <span className="spark s1"><Pic emoji="⭐" /></span>
          <span className="spark s2"><Pic emoji="✨" /></span>
          <span className="spark s3"><Pic emoji="⭐" /></span>
        </>
      )}
    </div>
  );
}
