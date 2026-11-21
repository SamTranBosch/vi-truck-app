import { act, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { App } from './App';
import { Capital } from './components/activities/Capital';
import { Combine } from './components/activities/Combine';
import { FindLetter } from './components/activities/FindLetter';
import { Hunt } from './components/activities/Hunt';
import { Meet } from './components/activities/Meet';
import { Read } from './components/activities/Read';
import { Pick } from './components/activities/Pick';
import { Spell } from './components/activities/Spell';
import { Story } from './components/activities/Story';
import { Trace } from './components/activities/Trace';
import type { Activity } from './content/types';
import { WORLD1 } from './content/world1';
import { WORLD3 } from './content/world3';
import { WORLD4 } from './content/world4';
import { WORLD5 } from './content/world5';
import { WORLD6 } from './content/world6';
import { setAudioBackend, type AudioBackend } from './lib/audio';
import { STORAGE_KEY } from './lib/progress';

function ActivityView({ activity, onDone }: { activity: Activity; onDone: () => void }) {
  switch (activity.type) {
    case 'meet': return <Meet activity={activity} onDone={onDone} />;
    case 'spell': return <Spell activity={activity} onDone={onDone} />;
    case 'hunt': return <Hunt activity={activity} onDone={onDone} />;
    case 'findLetter': return <FindLetter activity={activity} onDone={onDone} />;
    case 'trace': return <Trace activity={activity} onDone={onDone} />;
    case 'pick': return <Pick activity={activity} onDone={onDone} />;
    case 'read': return <Read activity={activity} onDone={onDone} />;
    case 'story': return <Story activity={activity} onDone={onDone} />;
    case 'combine': return <Combine activity={activity} onDone={onDone} />;
    case 'capital': return <Capital activity={activity} onDone={onDone} />;
  }
}

const spoken: string[] = [];
const fake: AudioBackend = {
  play: async (t: string) => {
    spoken.push(t);
  },
  stop: () => {},
};

async function boot(opts: { fresh?: boolean } = {}) {
  // most tests are about the map, so skip the welcome screen unless asked
  if (!opts.fresh && !localStorage.getItem(STORAGE_KEY)) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ version: 1, completed: {}, welcomed: true }));
  }
  render(<App />);
  await act(async () => {
    await vi.advanceTimersByTimeAsync(50);
  });
}
const tick = (ms: number) => act(async () => { await vi.advanceTimersByTimeAsync(ms); });
const tile = (id: string) => document.querySelector<HTMLButtonElement>(`[data-lesson="${id}"]`)!;

describe('welcome, resume and parent view', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    localStorage.clear();
    spoken.length = 0;
    setAudioBackend(fake);
  });
  afterEach(() => vi.useRealTimers());

  it('a brand-new install opens on the welcome screen with one big play button', async () => {
    await boot({ fresh: true });
    expect(screen.queryByRole('group', { name: /dưới lớp bùn/ })).toBeNull();
    fireEvent.click(screen.getByRole('button', { name: 'Bắt đầu chơi' }));
    await tick(50);
    expect(screen.getByRole('group', { name: /dưới lớp bùn/ })).toBeInTheDocument();
    expect(spoken.some((t) => t.includes('Chào bé'))).toBe(true);
    expect(JSON.parse(localStorage.getItem(STORAGE_KEY)!).welcomed).toBe(true);
  });

  it('someone who already finished a lesson never sees the welcome screen', async () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ version: 1, completed: { 'mo-dau': 1 } }));
    await boot({ fresh: true });
    expect(screen.queryByRole('button', { name: 'Bắt đầu chơi' })).toBeNull();
    expect(screen.getByRole('group', { name: /dưới lớp bùn/ })).toBeInTheDocument();
  });

  it('opens a lesson at the step where the child left it, and remembers the step as it changes', async () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ version: 1, completed: {}, welcomed: true, resume: { id: 'mo-dau', step: 1 } }));
    await boot();
    fireEvent.click(screen.getByRole('button', { name: 'Học bài tiếp theo' }));
    expect(screen.getByRole('list', { name: new RegExp(`^Bước 2 trên ${WORLD1[0].activities.length}`) })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Quay lại bước trước' }));
    await tick(50);
    expect(JSON.parse(localStorage.getItem(STORAGE_KEY)!).resume).toBeNull();
  });

  it('the parent view lists lessons with many wrong taps, and nothing when there are none', async () => {
    await boot();
    fireEvent.pointerDown(screen.getByRole('button', { name: /Dành cho phụ huynh/ }));
    await tick(1600);
    expect(screen.getByText(/Chưa có bài nào bé nhầm nhiều/)).toBeInTheDocument();
  });

  it('shows the shaky lesson by name', async () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ version: 1, completed: { 'mo-dau': 1 }, misses: { 'bai-1': 5, 'bai-2': 1 } }));
    await boot();
    fireEvent.pointerDown(screen.getByRole('button', { name: /Dành cho phụ huynh/ }));
    await tick(1600);
    const shaky = screen.getByRole('region', { name: 'Bài bé hay nhầm' });
    expect(shaky).toHaveTextContent('Bài 1: a – c');
    expect(shaky).toHaveTextContent('nhầm 5 lần');
    expect(shaky).not.toHaveTextContent('Bài 2');
  });
});

describe('nudges and miss counting', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    localStorage.clear();
    spoken.length = 0;
    setAudioBackend(fake);
  });
  afterEach(() => vi.useRealTimers());

  it('FindLetter: after a quiet moment a letter still to find wiggles', async () => {
    render(<FindLetter activity={{ type: 'findLetter', targets: ['a'], others: ['e', 'o', 's'] }} onDone={() => {}} />);
    await tick(100);
    expect(document.querySelector('.letter-btn.hint')).toBeNull();
    await tick(9500);
    const hinted = document.querySelector('.letter-btn.hint');
    expect(hinted).not.toBeNull();
    expect(hinted).toHaveAttribute('aria-label', 'chữ a');
  });

  it('a wrong tap reaches whoever is counting', async () => {
    const { setMissListener } = await import('./lib/misses');
    let n = 0;
    setMissListener(() => n++);
    render(<FindLetter activity={{ type: 'findLetter', targets: ['a'], others: ['e', 'o', 's'] }} onDone={() => {}} />);
    await tick(100);
    fireEvent.click(screen.getAllByRole('button', { name: 'chữ e' })[0]);
    expect(n).toBe(1);
    setMissListener(null);
  });
});

describe('Capital letters', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    spoken.length = 0;
    setAudioBackend(fake);
  });
  afterEach(() => vi.useRealTimers());

  it('asks for the capital of each small letter and finishes after the last one', async () => {
    const done = vi.fn();
    render(<Capital activity={{ type: 'capital', letters: ['a', 'đ', 'h'] }} onDone={done} />);
    await tick(100);
    expect(screen.getAllByRole('button', { name: /^chữ hoa / })).toHaveLength(3);
    fireEvent.click(screen.getByRole('button', { name: 'chữ hoa A' }));
    await tick(1000);
    // second round: a wrong capital does not move on
    fireEvent.click(screen.getByRole('button', { name: 'chữ hoa H' }));
    await tick(1000);
    expect(screen.getByText('đ', { selector: '.target-badge' })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'chữ hoa Đ' }));
    await tick(1000);
    fireEvent.click(screen.getByRole('button', { name: 'chữ hoa H' }));
    await tick(3000);
    expect(done).toHaveBeenCalledTimes(1);
  });
});

describe('App flow', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    localStorage.clear();
    spoken.length = 0;
    setAudioBackend(fake);
  });
  afterEach(() => vi.useRealTimers());

  it('starts with only the first tile open and the other 15 locked', async () => {
    await boot();
    expect(document.querySelectorAll('.hit-current')).toHaveLength(1);
    expect(document.querySelectorAll('.hit-locked')).toHaveLength(15);
    expect(tile('mo-dau')).toHaveClass('hit-current');
    expect(screen.getByLabelText('Đã lau 0 trên 16 mảnh bùn')).toBeInTheDocument();
  });

  it('the big play button opens the current lesson', async () => {
    await boot();
    fireEvent.click(screen.getByRole('button', { name: 'Học bài tiếp theo' }));
    expect(screen.getByRole('region', { name: WORLD1[0].title })).toBeInTheDocument();
  });

  it('a locked tile does not open a lesson; it says it is not its turn yet', async () => {
    await boot();
    fireEvent.click(tile('bai-1'));
    expect(screen.queryByRole('region')).toBeNull();
    expect(document.querySelector('.banner')).toHaveTextContent('Chưa đến lượt bài này.');
    expect(spoken).toContain('Chưa đến lượt bài này.');
  });

  it('finishing the first lesson saves progress, wipes its mud and opens the next tile', async () => {
    await boot();
    fireEvent.click(tile('mo-dau'));
    const meet = WORLD1[0].activities[0];
    if (meet.type !== 'meet') throw new Error('mo-dau must start with meet');
    // Meet: one "Tiếp" per word
    for (let i = 0; i < meet.words.length; i++) fireEvent.click(screen.getByRole('button', { name: 'Tiếp' }));
    // Pick (hear): choose the right picture each round
    const pick = WORLD1[0].activities[1];
    if (pick.type !== 'pick') throw new Error('mo-dau second activity must be pick');
    for (const w of pick.words) {
      // a wrong choice first: must not advance
      const wrong = screen.getAllByRole('button').filter((b) => /^hình /.test(b.getAttribute('aria-label') ?? '') && b.getAttribute('aria-label') !== `hình ${w}`)[0];
      fireEvent.click(wrong);
      fireEvent.click(screen.getByRole('button', { name: `hình ${w}` }));
      await tick(1300);
    }
    await tick(1000);
    // celebration screen first, with a way back to the map and to the next lesson
    expect(screen.getByRole('dialog', { name: /Hoàn thành/ })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Bài trước' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Bài tiếp' })).toBeEnabled();
    fireEvent.click(screen.getByRole('button', { name: 'Về bản đồ' }));
    // back on the map
    expect(screen.getByLabelText('Đã lau 1 trên 16 mảnh bùn')).toBeInTheDocument();
    expect(tile('mo-dau')).toHaveClass('hit-done');
    expect(tile('bai-1')).toHaveClass('hit-current');
    expect(document.querySelector('.mud.wiping')).not.toBeNull();
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? 'null');
    expect(Object.keys(saved.completed)).toEqual(['mo-dau']);
    expect(spoken).toContain('Bé đã lau xong một mảnh bùn!');
  });

  it('the lesson bar can step back to the previous activity, and celebration can open the next lesson', async () => {
    await boot();
    fireEvent.click(tile('mo-dau'));
    const back = screen.getByRole('button', { name: 'Quay lại bước trước' });
    expect(back).toBeDisabled();
    const meet = WORLD1[0].activities[0];
    if (meet.type !== 'meet') throw new Error('mo-dau must start with meet');
    // Meet has its own back-to-previous-card button after the first card
    expect(screen.queryByRole('button', { name: 'Quay lại' })).toBeNull();
    fireEvent.click(screen.getByRole('button', { name: 'Tiếp' }));
    expect(screen.getByRole('button', { name: 'Quay lại' })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Quay lại' }));
    expect(screen.queryByRole('button', { name: 'Quay lại' })).toBeNull();
    for (let i = 0; i < meet.words.length; i++) fireEvent.click(screen.getByRole('button', { name: 'Tiếp' }));
    expect(document.querySelector('.act-pick')).not.toBeNull();
    fireEvent.click(screen.getByRole('button', { name: 'Quay lại bước trước' }));
    expect(document.querySelector('.act-meet')).not.toBeNull();
  });

  it('restores saved progress on start', async () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ version: 1, completed: { 'mo-dau': 1, 'bai-1': 2 }, soundOn: true }));
    await boot();
    expect(screen.getByLabelText('Đã lau 2 trên 16 mảnh bùn')).toBeInTheDocument();
    expect(tile('bai-2')).toHaveClass('hit-current');
    expect(document.querySelector('.mud.wiping')).toBeNull();
  });

  it('parent area needs a 1.5 second hold, then can reset progress', async () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ version: 1, completed: { 'mo-dau': 1 }, soundOn: true }));
    await boot();
    const gear = screen.getByRole('button', { name: /phụ huynh/ });
    fireEvent.pointerDown(gear);
    await tick(500);
    fireEvent.pointerUp(gear);
    expect(screen.queryByRole('dialog')).toBeNull(); // a short tap (a child) opens nothing
    expect(screen.getByRole('status')).toHaveTextContent(/giữ nút/); // but tells the parent how
    fireEvent.pointerDown(gear);
    await tick(1600);
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Chơi lại từ đầu' }));
    fireEvent.click(screen.getByRole('button', { name: 'Chắc chắn xoá hết?' }));
    await tick(50);
    fireEvent.click(screen.getByRole('button', { name: 'Xong' }));
    expect(screen.getByLabelText('Đã lau 0 trên 16 mảnh bùn')).toBeInTheDocument();
  });

  it('parent mode can jump to any truck and open any lesson; the child sees them locked until then', async () => {
    await boot();
    const chips = screen.getAllByRole('button', { name: /chưa mở/ });
    expect(chips.length).toBeGreaterThanOrEqual(5); // trucks 2..6 are locked
    expect(tile('bai-5')).toHaveClass('hit-locked');
    const gear = screen.getByRole('button', { name: /phụ huynh/ });
    fireEvent.pointerDown(gear);
    await tick(1600);
    fireEvent.click(screen.getByRole('button', { name: /6\. Xe cần cẩu/ }));
    expect(screen.queryByRole('dialog')).toBeNull();
    expect(screen.getByRole('group', { name: /Xe cần cẩu/ })).toBeInTheDocument();
    expect(tile('bai-80')).not.toHaveClass('hit-locked');
    expect(screen.queryAllByRole('button', { name: /chưa mở/ })).toHaveLength(0);
  });

  it('every lesson opens and every activity of every lesson renders content', async () => {
    const all: Record<string, number> = {};
    WORLD1.forEach((l, i) => { if (i < WORLD1.length - 1) all[l.id] = 1; });
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ version: 1, completed: all, soundOn: true }));
    await boot();
    for (const l of WORLD1) {
      fireEvent.click(tile(l.id));
      expect(screen.getByRole('region', { name: l.title })).toBeInTheDocument();
      expect(document.querySelector('.lesson-body')?.children.length).toBeGreaterThan(0);
      fireEvent.click(screen.getByRole('button', { name: 'Thoát bài học' }));
    }
  });
});

describe('every activity renders on its own', () => {
  beforeEach(() => { setAudioBackend(fake); });
  const cases = [...WORLD1, ...WORLD3, ...WORLD4, ...WORLD5, ...WORLD6].flatMap((l) => l.activities.map((a, i) => [`${l.id}#${i} ${a.type}`, a] as const));
  it.each(cases)('%s', (_name, a) => {
    const done = vi.fn();
    const { container, unmount } = render(<ActivityView activity={a} onDone={done} />);
    expect(container.querySelector('.act')).not.toBeNull();
    expect(container.querySelectorAll('button').length).toBeGreaterThan(0);
    unmount();
  });
});
