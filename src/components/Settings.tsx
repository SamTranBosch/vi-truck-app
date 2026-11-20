import { useRef, useState } from 'react';
import { audioClipCount } from '../lib/audio';
import { exportProgress, parseProgress, type Progress } from '../lib/progress';

interface Props {
  progress: Progress;
  onChange: (p: Progress) => void;
  onReset: () => void;
  onClose: () => void;
}

/** Parent area: sound on/off, back up / restore progress, start over. */
export function Settings({ progress, onChange, onReset, onClose }: Props) {
  const [text, setText] = useState('');
  const [msg, setMsg] = useState('');
  const [confirmReset, setConfirmReset] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

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
        <p className="small">
          {clips > 0 ? `Giọng cô giáo: ${clips} đoạn âm thanh có sẵn trong máy.` : 'Đang dùng giọng đọc của thiết bị (chưa có âm thanh cô giáo).'}
        </p>
        <p className="small">Đã xong {Object.keys(progress.completed).length} bài.</p>
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
