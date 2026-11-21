import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { Settings } from './Settings';
import { emptyProgress } from '../lib/progress';

describe('Settings: teacher voice', () => {
  it('always offers the device voice and saves the choice', () => {
    const onChange = vi.fn();
    render(<Settings progress={emptyProgress()} onChange={onChange} onReset={() => {}} onClose={() => {}} />);
    const group = screen.getByRole('region', { name: 'Giọng cô giáo' });
    expect(group).toBeInTheDocument();
    fireEvent.click(screen.getByRole('radio', { name: /Giọng đọc của thiết bị/ }));
    expect(onChange).toHaveBeenCalledWith(expect.objectContaining({ voice: 'device' }));
    expect(screen.getByRole('button', { name: 'Nghe thử' })).toBeInTheDocument();
  });
});
