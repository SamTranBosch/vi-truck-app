import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { PHRASES } from '../../content/phrases';
import { traceSay } from '../../content/speech';
import { sfx, speak } from '../../lib/audio';
import { evaluateTrace } from '../../lib/tracing';
import { Dots, NextButton, SpeakButton, cheer, useLater } from '../shared';
import type { ActivityProps } from './types';

const FONT = "'Andika', system-ui, sans-serif";
const MAX_SPILL = 0.45;
const CHECK_DELAY_MS = 900;
const SAMPLE = 4; // compare on a grid 4x coarser than the screen: fast and forgiving

function canvasSupported(): boolean {
  try {
    return !!document.createElement('canvas').getContext('2d');
  } catch {
    return false;
  }
}

function fontSizeFor(text: string, w: number, h: number): number {
  return Math.min(h * 0.78, w / (Math.max(text.length, 1) * 0.6));
}

function toMask(src: HTMLCanvasElement, w: number, h: number): Uint8Array {
  const sw = Math.ceil(w / SAMPLE);
  const sh = Math.ceil(h / SAMPLE);
  const small = document.createElement('canvas');
  small.width = sw;
  small.height = sh;
  const ctx = small.getContext('2d')!;
  ctx.drawImage(src, 0, 0, sw, sh);
  const data = ctx.getImageData(0, 0, sw, sh).data;
  const mask = new Uint8Array(sw * sh);
  for (let i = 0; i < mask.length; i++) mask[i] = data[i * 4 + 3] > 40 ? 1 : 0;
  return mask;
}

/** Tập viết: trace the guide with a finger. Falls back to a plain "next" button when canvas is missing. */
export function Trace({ activity, onDone }: ActivityProps<'trace'>) {
  const [i, setI] = useState(0);
  const [fails, setFails] = useState(0);
  const [ok, setOk] = useState(false);
  const [shake, setShake] = useState(false);
  const item = activity.items[i];
  const later = useLater();
  const hasCanvas = useMemo(canvasSupported, []);

  const wrapRef = useRef<HTMLDivElement>(null);
  const guideRef = useRef<HTMLCanvasElement>(null);
  const inkRef = useRef<HTMLCanvasElement>(null);
  const size = useRef({ w: 0, h: 0, font: 0 });
  const drawing = useRef(false);
  const last = useRef<{ x: number; y: number } | null>(null);

  const setup = useCallback(() => {
    const wrap = wrapRef.current;
    const guide = guideRef.current;
    const ink = inkRef.current;
    if (!wrap || !guide || !ink) return;
    const rect = wrap.getBoundingClientRect();
    const w = Math.max(rect.width, 200);
    const h = Math.max(rect.height, 140);
    const dpr = Math.min(window.devicePixelRatio || 1, 3);
    for (const c of [guide, ink]) {
      c.width = Math.round(w * dpr);
      c.height = Math.round(h * dpr);
      c.getContext('2d')!.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    const font = fontSizeFor(item, w, h);
    size.current = { w, h, font };
    const g = guide.getContext('2d')!;
    g.clearRect(0, 0, w, h);
    g.font = `700 ${font}px ${FONT}`;
    g.textAlign = 'center';
    g.textBaseline = 'alphabetic';
    const y = h / 2 + font * 0.3;
    g.fillStyle = '#DCEAF1';
    g.fillText(item, w / 2, y);
    g.setLineDash([7, 7]);
    g.lineWidth = 2;
    g.strokeStyle = '#7FA3B8';
    g.strokeText(item, w / 2, y);
  }, [item]);

  useEffect(() => {
    if (!hasCanvas) return;
    setup();
    setOk(false);
    setFails(0);
    void speak(traceSay(item));
  }, [item, hasCanvas, setup]);

  const point = (e: React.PointerEvent) => {
    const r = inkRef.current!.getBoundingClientRect();
    return { x: e.clientX - r.left, y: e.clientY - r.top };
  };

  const onDown = (e: React.PointerEvent) => {
    if (ok) return;
    cancelCheck();
    e.currentTarget.setPointerCapture?.(e.pointerId);
    drawing.current = true;
    last.current = point(e);
    const ctx = inkRef.current!.getContext('2d')!;
    const { font } = size.current;
    ctx.fillStyle = '#D9382B';
    ctx.beginPath();
    ctx.arc(last.current.x, last.current.y, Math.max(8, Math.min(14, font * 0.07)), 0, Math.PI * 2);
    ctx.fill();
  };

  const onMove = (e: React.PointerEvent) => {
    if (!drawing.current || !last.current) return;
    const p = point(e);
    const ctx = inkRef.current!.getContext('2d')!;
    ctx.strokeStyle = '#D9382B';
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.lineWidth = Math.max(16, Math.min(28, size.current.font * 0.14));
    ctx.beginPath();
    ctx.moveTo(last.current.x, last.current.y);
    ctx.lineTo(p.x, p.y);
    ctx.stroke();
    last.current = p;
  };

  const check = () => {
    const { w, h, font } = size.current;
    const target = document.createElement('canvas');
    target.width = Math.round(w);
    target.height = Math.round(h);
    const t = target.getContext('2d')!;
    t.font = `700 ${font}px ${FONT}`;
    t.textAlign = 'center';
    t.textBaseline = 'alphabetic';
    t.lineWidth = font * 0.05;
    t.fillStyle = '#000';
    t.strokeStyle = '#000';
    const y = h / 2 + font * 0.3;
    t.fillText(item, w / 2, y);
    t.strokeText(item, w / 2, y);
    const sw = Math.ceil(w / SAMPLE);
    const sh = Math.ceil(h / SAMPLE);
    const result = evaluateTrace(toMask(target, w, h), toMask(inkRef.current!, w, h), sw, sh, { maxSpill: MAX_SPILL });
    if (result.passed) finishItem();
    else {
      setFails((f) => f + 1);
      // Only scold when the ink is mostly off the letter. An unfinished drawing is just "keep going".
      if (result.spill > MAX_SPILL) {
        sfx('bad');
        setShake(true);
        later(() => setShake(false), 400);
      }
    }
  };

  // Letters like "ô" or words like "ga" need several strokes, so the drawing is judged after the
  // finger has been off the screen for a moment, not at every lift.
  const checkTimer = useRef<number | null>(null);
  const cancelCheck = () => {
    if (checkTimer.current !== null) window.clearTimeout(checkTimer.current);
    checkTimer.current = null;
  };
  useEffect(() => cancelCheck, []);

  const onUp = () => {
    if (!drawing.current) return;
    drawing.current = false;
    last.current = null;
    if (ok) return;
    cancelCheck();
    checkTimer.current = window.setTimeout(check, CHECK_DELAY_MS);
  };

  const finishItem = () => {
    setOk(true);
    cheer();
    later(() => advance(), 1000);
  };

  const advance = () => {
    if (i === activity.items.length - 1) onDone();
    else setI(i + 1);
  };

  const clear = () => {
    const ink = inkRef.current;
    if (!ink) return;
    cancelCheck();
    ink.getContext('2d')!.clearRect(0, 0, size.current.w, size.current.h);
  };

  if (!hasCanvas) {
    return (
      <div className="act act-trace">
        <div className="card card-xl"><span className="word word-xl">{item}</span></div>
        <div className="act-actions">
          <SpeakButton text={traceSay(item)} />
          <NextButton onClick={advance} />
        </div>
      </div>
    );
  }

  return (
    <div className="act act-trace">
      <p className="hint">{PHRASES.traceIt}</p>
      <div ref={wrapRef} className={`trace-pad${ok ? ' ok' : ''}${shake ? ' shake' : ''}`}>
        <canvas ref={guideRef} className="trace-layer" aria-hidden="true" />
        <canvas
          ref={inkRef}
          className="trace-layer trace-ink"
          role="img"
          aria-label={`Tô chữ ${item}`}
          onPointerDown={onDown}
          onPointerMove={onMove}
          onPointerUp={onUp}
          onPointerCancel={onUp}
        />
      </div>
      <Dots count={activity.items.length} index={i} />
      <div className="act-actions">
        <SpeakButton text={traceSay(item)} />
        <button type="button" className="btn btn-round btn-sky" aria-label="Xoá, tô lại" onClick={clear}>🧽</button>
        {fails >= 2 && !ok && <NextButton onClick={advance} glow={false} />}
      </div>
    </div>
  );
}
