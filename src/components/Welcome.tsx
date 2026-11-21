import { Mascot } from './Mascot';

/** First screen ever: one big button. The tap also unlocks sound on iPhone. */
export function Welcome({ onStart }: { onStart: () => void }) {
  return (
    <main className="welcome">
      <h1 className="title welcome-title">Xe Học Chữ</h1>
      <div className="welcome-mascot"><Mascot big forceMood="win" /></div>
      <button type="button" className="btn btn-go glow welcome-play" aria-label="Bắt đầu chơi" onClick={onStart}>
        <span className="play-tri" aria-hidden="true">▶</span>
      </button>
    </main>
  );
}
