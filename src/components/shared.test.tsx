import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useIdleHint } from './shared';

describe('useIdleHint', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it('names one of the remaining answers after a quiet moment', () => {
    const { result } = renderHook(() => useIdleHint('a', ['cá', 'cờ'], 5000));
    expect(result.current).toBeNull();
    act(() => void vi.advanceTimersByTime(5000));
    expect(['cá', 'cờ']).toContain(result.current);
  });

  it('starts waiting again after the child taps (reset key changes) and clears the hint', () => {
    const { result, rerender } = renderHook(({ k }) => useIdleHint(k, ['cá'], 5000), { initialProps: { k: 1 } });
    act(() => void vi.advanceTimersByTime(5000));
    expect(result.current).toBe('cá');
    rerender({ k: 2 });
    expect(result.current).toBeNull();
    act(() => void vi.advanceTimersByTime(4000));
    expect(result.current).toBeNull();
    act(() => void vi.advanceTimersByTime(1000));
    expect(result.current).toBe('cá');
  });

  it('never hints when nothing is left to find', () => {
    const { result } = renderHook(() => useIdleHint('a', [], 1000));
    act(() => void vi.advanceTimersByTime(5000));
    expect(result.current).toBeNull();
  });
});
