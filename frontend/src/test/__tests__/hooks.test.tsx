import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useDebounce } from '../../hooks/useDebounce';

describe('useDebounce', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  it('should return initial value immediately', () => {
    const { result } = renderHook(() => useDebounce('test', 100));
    expect(result.current).toBe('test');
  });

  it('should debounce value changes', () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      { initialProps: { value: 'initial', delay: 100 } }
    );

    expect(result.current).toBe('initial');

    // Change value
    rerender({ value: 'updated', delay: 100 });
    expect(result.current).toBe('initial'); // Should still be old value

    // Fast forward time
    act(() => {
      vi.advanceTimersByTime(100);
    });

    expect(result.current).toBe('updated');
  });

  it('should reset timer on value change', () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      { initialProps: { value: 'initial', delay: 100 } }
    );

    // Change value multiple times quickly
    rerender({ value: 'first', delay: 100 });
    act(() => {
      vi.advanceTimersByTime(50);
    });

    rerender({ value: 'second', delay: 100 });
    act(() => {
      vi.advanceTimersByTime(50);
    });

    rerender({ value: 'final', delay: 100 });
    act(() => {
      vi.advanceTimersByTime(50);
    });

    expect(result.current).toBe('initial'); // Should still be initial

    // Complete the debounce
    act(() => {
      vi.advanceTimersByTime(100);
    });

    expect(result.current).toBe('final');
  });
});

