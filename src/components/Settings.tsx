import { useEffect, useRef, useState } from 'react';
import { DEVICE_VOICE, activeVoice, audioClipCount, previewVoice, voiceSets, type VoiceSet } from '../lib/audio';
import type { Lesson, World } from '../content/types';
import { exportProgress, parseProgress, shakyLessons, type Progress } from '../lib/progress';

interface Props {
  progress: Progress;
  onChange: (p: Progress) => void;
  onReset: () => void;
  onClose: () => void;
  /** every lesson of every world, to name the ones the child finds hard */
  lessons?: Lesson[];
  /** show the iPhone "Add to Home Screen" tip */
  installHint?: boolean;
  /** parent mode: jump to any truck, open every lesson */
  worlds?: World[];
  openAll?: boolean;
  onOpenAll?: (on: boolean) => void;
  onJump?: (worldIndex: number) => void;
}

/** Parent area: sound on/off, back up / restore progress, start over. */
export function Settings({ progress, onChange, onReset, onClose, lessons = [], installHint = false, worlds = [], openAll = false, onOpenAll, onJump }: Props) {
  const [text, setText] = useState('');
  const [msg, setMsg] = useState('');
  const [confirmReset, setConfirmReset] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const [sets, setSets] = useState<VoiceSet[]>(() => voiceSets());
  useEffect(() => {
    // the list may still be loading when the parent opens this screen
    const t = window.setTimeout(() => setSets(voiceSets()), 400);
    return () => window.clearTimeout(t);
  }, []);
  const inUse = activeVoice();

  const doExport = () => {
    const json = exportProgress(progress);
    try {
      const url = URL.createObjectURL(new Blob([json], { type: 'application/json' }));
      const a = document.createElement('a');
      a.href = url;
      a.download = 'xe-hoc-chu-tien-do.json';
      a.click();
      window.setTimeout(() => URL.revokeObjectURL(url), 2000);
      setMsg('Đã tải tệp tiến độ.');
    } catch {
      setText(json);
      setMsg('Hãy sao chép đoạn văn bản bên dưới và cất đi.');
    }
  };

  const doImport = (raw: string) => {
    const p = parseProgress(raw);
    if (!p) {
      setMsg('Tệp không đúng định dạng.');
      return;
    }
    onChange(p);
    setMsg(`Đã khôi phục ${Object.keys(p.completed).length} bài.`);
  };

  const onFile = async (f: File | undefined) => {
    if (f) doImport(await f.text());
  };

  const clips = audioClipCount();
  const shaky = shakyLessons(progress).map((s) => ({ ...s, lesson: lessons.find((l) => l.id === s.id) }));

  return (
    <div className="modal" role="dialog" aria-modal="true" aria-label="Dành cho phụ huynh">
      <div className="modal-card">
        <h2>Dành cho phụ huynh</h2>
        <label className="row-check">
          <input
            type="checkbox"
            checked={progress.soundOn}
            onChange={(e) => onChange({ ...progress, soundOn: e.target.checked })}
          />
          Bật âm thanh
        </label>
        <label className="row-check">
          <input
            type="checkbox"
            checked={progress.musicOn}
            disabled={!progress.soundOn}
            onChange={(e) => onChange({ ...progress, musicOn: e.target.checked })}
          />
          Nhạc nền (nhỏ, tự giảm khi cô nói)
        </label>
        <section className="voices" aria-label="Giọng cô giáo">
          <h3>Giọng cô giáo</h3>
          <p className="small">
            {clips > 0 ? `Đang dùng ${clips} đoạn âm thanh có sẵn.` : 'Đang dùng giọng đọc của thiết bị (chưa có âm thanh cô giáo).'} Bấm “Nghe thử” để so sánh các giọng, rồi chọn giọng bé nghe rõ nhất.
          </p>
          {[...sets, { id: DEVICE_VOICE, label: 'Giọng đọc của thiết bị', note: 'Dự phòng, không cần tải' }].map((v) => {
            const chosen = (progress.voice ?? '') === v.id || (progress.voice === null && v.id === inUse && v.id !== DEVICE_VOICE);
            return (
              <div key={v.id} className={`voice-row${chosen ? ' chosen' : ''}`}>
                <label className="row-check">
                  <input type="radio" name="teacher-voice" checked={chosen} onChange={() => onChange({ ...progress, voice: v.id })} />
                  <span>
                    {v.label}
                    {v.note ? <small className="voice-note"> {v.note}</small> : null}
                  </span>
                </label>
                <button type="button" className="btn btn-sky voice-test" onClick={() => void previewVoice(v.id)}>
                  Nghe thử
                </button>
              </div>
            );
          })}
        </section>
        <p className="small">Đã xong {Object.keys(progress.completed).length} bài.</p>
        {worlds.length > 1 && (
          <section className="jump" aria-label="Chế độ phụ huynh: chọn xe">
            <h3>Chọn xe nhanh</h3>
            <p className="small">Bé vẫn thấy các xe sau bị khóa. Chọn xe ở đây sẽ mở khóa tất cả xe và bài cho đến khi đóng ứng dụng.</p>
            <div className="jump-list">
              {worlds.map((w, i) => (
                <button key={w.id} type="button" className="btn btn-sky jump-btn" onClick={() => onJump?.(i)}>
                  {i + 1}. {w.name}
                </button>
              ))}
            </div>
            <label className="row-check">
              <input type="checkbox" checked={openAll} onChange={(e) => onOpenAll?.(e.target.checked)} />
              Mở tất cả xe và bài (chế độ phụ huynh)
            </label>
          </section>
        )}
        <section className="shaky" aria-label="Bài bé hay nhầm">
          <h3>Bài bé hay nhầm</h3>
          {shaky.length === 0 ? (
            <p className="small">Chưa có bài nào bé nhầm nhiều. Bé đang làm tốt!</p>
          ) : (
            <>
              <ul>
                {shaky.map((s) => (
                  <li key={s.id}>
                    <strong>{s.lesson?.title ?? s.id}</strong> — nhầm {s.misses} lần
                  </li>
                ))}
              </ul>
              <p className="small">Gợi ý: cho bé chơi lại các bài này (chạm vào mảnh bùn đã lau).</p>
            </>
          )}
        </section>
        {installHint && (
          <section className="install" aria-label="Thêm vào màn hình chính">
            <h3>Cài thành ứng dụng trên iPhone / iPad</h3>
            <p className="small">
              Trong Safari, chạm nút Chia sẻ (hình vuông có mũi tên lên), chọn “Thêm vào Màn hình chính”. Lần sau bé mở thẳng từ màn hình chính, không có thanh địa chỉ và chạy được cả khi không có mạng.
            </p>
          </section>
        )}
        <div className="modal-actions">
          <button type="button" className="btn btn-sky" onClick={doExport}>Lưu tiến độ</button>
          <button type="button" className="btn btn-sky" onClick={() => fileRef.current?.click()}>Khôi phục từ tệp</button>
          <input ref={fileRef} type="file" accept="application/json,.json" hidden onChange={(e) => void onFile(e.target.files?.[0])} />
        </div>
        <textarea
          aria-label="Dán nội dung tiến độ"
          className="paste"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Hoặc dán nội dung tiến độ vào đây"
          rows={3}
        />
        {text.trim() && (
          <button type="button" className="btn btn-sky" onClick={() => doImport(text)}>Khôi phục từ văn bản</button>
        )}
        {msg && <p className="small" role="status">{msg}</p>}
        <div className="modal-actions">
          {confirmReset ? (
            <button type="button" className="btn btn-danger" onClick={() => { onReset(); setConfirmReset(false); setMsg('Đã xoá tiến độ.'); }}>
              Chắc chắn xoá hết?
            </button>
          ) : (
            <button type="button" className="btn btn-light" onClick={() => setConfirmReset(true)}>Chơi lại từ đầu</button>
          )}
          <button type="button" className="btn btn-go" onClick={onClose}>Xong</button>
        </div>
      </div>
    </div>
  );
}
